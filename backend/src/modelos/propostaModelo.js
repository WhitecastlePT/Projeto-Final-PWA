import { executarQuery, obterCliente } from '../config/baseDados.js';

/**
 * Modelo para operações relacionadas com Propostas
 */

/**
 * Criar nova proposta com transação
 * @param {Object} dados - Dados da proposta
 * @returns {Promise<Object>} Proposta criada
 */
export const criarProposta = async (dados) => {
    const cliente = await obterCliente();

    try {
        await cliente.query('BEGIN');

        // Inserir proposta
        const queryProposta = `
            INSERT INTO proposta (titulo, descricao_objetivos, orientador_id, uc_id, estado)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const valoresProposta = [
            dados.titulo,
            dados.descricao_objetivos,
            dados.orientador_id,
            dados.uc_id || null,
            dados.estado || 'rascunho'
        ];

        const resultadoProposta = await cliente.query(queryProposta, valoresProposta);
        const proposta = resultadoProposta.rows[0];

        // Associar coorientadores se existirem
        if (dados.coorientadores && dados.coorientadores.length > 0) {
            const queryCoorientador = `
                INSERT INTO proposta_coorientador (proposta_id, coorientador_id)
                VALUES ($1, $2)
            `;

            for (const coorientadorId of dados.coorientadores) {
                await cliente.query(queryCoorientador, [proposta.id, coorientadorId]);
            }
        }

        // Associar alunos se existirem
        if (dados.alunos && dados.alunos.length > 0) {
            const queryAluno = `
                INSERT INTO proposta_aluno (proposta_id, aluno_id)
                VALUES ($1, $2)
            `;

            for (const alunoId of dados.alunos) {
                await cliente.query(queryAluno, [proposta.id, alunoId]);
            }
        }

        // Associar palavras-chave se existirem
        if (dados.palavras_chave && dados.palavras_chave.length > 0) {
            const queryPalavraChave = `
                INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id)
                VALUES ($1, $2)
            `;

            for (const palavraChaveId of dados.palavras_chave) {
                await cliente.query(queryPalavraChave, [proposta.id, palavraChaveId]);
            }
        }

        await cliente.query('COMMIT');

        // Buscar proposta completa
        return await buscarPropostaPorId(proposta.id);
    } catch (erro) {
        await cliente.query('ROLLBACK');
        throw erro;
    } finally {
        cliente.release();
    }
};

/**
 * Buscar proposta por ID com todas as relações
 * @param {number} id - ID da proposta
 * @returns {Promise<Object|null>} Proposta completa ou null
 */
export const buscarPropostaPorId = async (id) => {
    const queryProposta = `
        SELECT
            p.*,
            json_build_object(
                'id', u.id,
                'nome', u.nome,
                'email', u.email
            ) as orientador
        FROM proposta p
        INNER JOIN utilizador u ON p.orientador_id = u.id
        WHERE p.id = $1
    `;

    const resultado = await executarQuery(queryProposta, [id]);

    if (resultado.rows.length === 0) {
        return null;
    }

    const proposta = resultado.rows[0];

    // Buscar coorientadores
    const queryCoorientadores = `
        SELECT
            u.id,
            u.nome,
            u.email,
            pc.data_associacao
        FROM proposta_coorientador pc
        INNER JOIN utilizador u ON pc.coorientador_id = u.id
        WHERE pc.proposta_id = $1
        ORDER BY u.nome
    `;

    const coorientadores = await executarQuery(queryCoorientadores, [id]);
    proposta.coorientadores = coorientadores.rows;

    // Buscar alunos
    const queryAlunos = `
        SELECT
            u.id,
            u.nome,
            u.numero_aluno,
            u.email,
            pa.data_associacao
        FROM proposta_aluno pa
        INNER JOIN utilizador u ON pa.aluno_id = u.id
        WHERE pa.proposta_id = $1
        ORDER BY u.nome
    `;

    const alunos = await executarQuery(queryAlunos, [id]);
    proposta.alunos = alunos.rows;

    // Buscar palavras-chave
    const queryPalavrasChave = `
        SELECT
            pc.id,
            pc.termo,
            ppc.data_associacao
        FROM proposta_palavra_chave ppc
        INNER JOIN palavra_chave pc ON ppc.palavra_chave_id = pc.id
        WHERE ppc.proposta_id = $1
        ORDER BY pc.termo
    `;

    const palavrasChave = await executarQuery(queryPalavrasChave, [id]);
    proposta.palavras_chave = palavrasChave.rows;

    // Buscar anexos
    const queryAnexos = `
        SELECT
            id,
            nome_ficheiro,
            tipo,
            tamanho_bytes,
            data_upload
        FROM anexo
        WHERE proposta_id = $1
        ORDER BY data_upload DESC
    `;

    const anexos = await executarQuery(queryAnexos, [id]);
    proposta.anexos = anexos.rows;

    return proposta;
};

/**
 * Listar propostas com filtros opcionais
 * @param {Object} filtros - Filtros de pesquisa
 * @returns {Promise<Array>} Lista de propostas
 */
export const listarPropostas = async (filtros = {}) => {
    let query = `
        SELECT
            p.*,
            json_build_object(
                'id', u.id,
                'nome', u.nome,
                'email', u.email
            ) as orientador,
            (
                SELECT COUNT(*)
                FROM anexo
                WHERE proposta_id = p.id
            ) as total_anexos,
            (
                SELECT COUNT(*)
                FROM proposta_aluno
                WHERE proposta_id = p.id
            ) as total_alunos
        FROM proposta p
        INNER JOIN utilizador u ON p.orientador_id = u.id
        WHERE 1=1
    `;

    const parametros = [];
    let contador = 1;

    // Filtro por orientador
    if (filtros.orientador_id) {
        query += ` AND p.orientador_id = $${contador}`;
        parametros.push(filtros.orientador_id);
        contador++;
    }

    // Filtro por estado
    if (filtros.estado) {
        query += ` AND p.estado = $${contador}`;
        parametros.push(filtros.estado);
        contador++;
    }

    // Filtro por palavra-chave
    if (filtros.palavra_chave_id) {
        query += ` AND EXISTS (
            SELECT 1 FROM proposta_palavra_chave
            WHERE proposta_id = p.id
            AND palavra_chave_id = $${contador}
        )`;
        parametros.push(filtros.palavra_chave_id);
        contador++;
    }

    // Pesquisa por texto no título ou descrição
    if (filtros.pesquisa) {
        query += ` AND (
            p.titulo ILIKE $${contador}
            OR p.descricao_objetivos ILIKE $${contador}
        )`;
        parametros.push(`%${filtros.pesquisa}%`);
        contador++;
    }

    // Ordenação
    query += ` ORDER BY p.data_criacao DESC`;

    // Paginação
    if (filtros.limite) {
        query += ` LIMIT $${contador}`;
        parametros.push(filtros.limite);
        contador++;
    }

    if (filtros.offset) {
        query += ` OFFSET $${contador}`;
        parametros.push(filtros.offset);
    }

    const resultado = await executarQuery(query, parametros);
    return resultado.rows;
};

/**
 * Atualizar proposta
 * @param {number} id - ID da proposta
 * @param {Object} dados - Dados a atualizar
 * @returns {Promise<Object>} Proposta atualizada
 */
export const atualizarProposta = async (id, dados) => {
    const campos = [];
    const valores = [];
    let contador = 1;

    if (dados.titulo !== undefined) {
        campos.push(`titulo = $${contador}`);
        valores.push(dados.titulo);
        contador++;
    }

    if (dados.descricao_objetivos !== undefined) {
        campos.push(`descricao_objetivos = $${contador}`);
        valores.push(dados.descricao_objetivos);
        contador++;
    }

    if (dados.estado !== undefined) {
        campos.push(`estado = $${contador}`);
        valores.push(dados.estado);
        contador++;
    }

    if (dados.uc_id !== undefined) {
        campos.push(`uc_id = $${contador}`);
        valores.push(dados.uc_id || null);
        contador++;
    }

    if (campos.length === 0) {
        throw new Error('Nenhum campo para atualizar');
    }

    valores.push(id);

    const query = `
        UPDATE proposta
        SET ${campos.join(', ')}
        WHERE id = $${contador}
        RETURNING *
    `;

    const resultado = await executarQuery(query, valores);
    return resultado.rows[0];
};

/**
 * Eliminar proposta
 * @param {number} id - ID da proposta
 * @returns {Promise<boolean>} True se eliminada com sucesso
 */
export const eliminarProposta = async (id) => {
    const query = 'DELETE FROM proposta WHERE id = $1';
    const resultado = await executarQuery(query, [id]);

    return resultado.rowCount > 0;
};

/**
 * Associar coorientador a proposta
 * @param {number} propostaId - ID da proposta
 * @param {number} coorientadorId - ID do coorientador
 * @returns {Promise<Object>} Associação criada
 */
export const associarCoorientador = async (propostaId, coorientadorId) => {
    const query = `
        INSERT INTO proposta_coorientador (proposta_id, coorientador_id)
        VALUES ($1, $2)
        ON CONFLICT (proposta_id, coorientador_id) DO NOTHING
        RETURNING *
    `;

    const resultado = await executarQuery(query, [propostaId, coorientadorId]);
    return resultado.rows[0];
};

/**
 * Remover coorientador de proposta
 * @param {number} propostaId - ID da proposta
 * @param {number} coorientadorId - ID do coorientador
 * @returns {Promise<boolean>} True se removido com sucesso
 */
export const removerCoorientador = async (propostaId, coorientadorId) => {
    const query = `
        DELETE FROM proposta_coorientador
        WHERE proposta_id = $1 AND coorientador_id = $2
    `;

    const resultado = await executarQuery(query, [propostaId, coorientadorId]);
    return resultado.rowCount > 0;
};

/**
 * Associar aluno a proposta
 * @param {number} propostaId - ID da proposta
 * @param {number} alunoId - ID do aluno
 * @returns {Promise<Object>} Associação criada
 */
export const associarAluno = async (propostaId, alunoId) => {
    const query = `
        INSERT INTO proposta_aluno (proposta_id, aluno_id)
        VALUES ($1, $2)
        ON CONFLICT (proposta_id, aluno_id) DO NOTHING
        RETURNING *
    `;

    const resultado = await executarQuery(query, [propostaId, alunoId]);
    return resultado.rows[0];
};

/**
 * Remover aluno de proposta
 * @param {number} propostaId - ID da proposta
 * @param {number} alunoId - ID do aluno
 * @returns {Promise<boolean>} True se removido com sucesso
 */
export const removerAluno = async (propostaId, alunoId) => {
    const query = `
        DELETE FROM proposta_aluno
        WHERE proposta_id = $1 AND aluno_id = $2
    `;

    const resultado = await executarQuery(query, [propostaId, alunoId]);
    return resultado.rowCount > 0;
};

/**
 * Associar palavra-chave a proposta
 * @param {number} propostaId - ID da proposta
 * @param {number} palavraChaveId - ID da palavra-chave
 * @returns {Promise<Object>} Associação criada
 */
export const associarPalavraChave = async (propostaId, palavraChaveId) => {
    const query = `
        INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id)
        VALUES ($1, $2)
        ON CONFLICT (proposta_id, palavra_chave_id) DO NOTHING
        RETURNING *
    `;

    const resultado = await executarQuery(query, [propostaId, palavraChaveId]);
    return resultado.rows[0];
};

/**
 * Remover palavra-chave de proposta
 * @param {number} propostaId - ID da proposta
 * @param {number} palavraChaveId - ID da palavra-chave
 * @returns {Promise<boolean>} True se removida com sucesso
 */
export const removerPalavraChave = async (propostaId, palavraChaveId) => {
    const query = `
        DELETE FROM proposta_palavra_chave
        WHERE proposta_id = $1 AND palavra_chave_id = $2
    `;

    const resultado = await executarQuery(query, [propostaId, palavraChaveId]);
    return resultado.rowCount > 0;
};

/**
 * Listar propostas atribuídas a um aluno (via proposta_aluno)
 * @param {number} alunoId - ID do aluno
 * @returns {Promise<Array>} Lista de propostas
 */
export const listarPropostasAtribuidas = async (alunoId) => {
    const query = `
        SELECT
            p.*,
            u.nome as orientador_nome,
            u.email as orientador_email,
            uc.nome as uc_nome,
            uc.codigo as uc_codigo,
            pa.data_associacao
        FROM proposta_aluno pa
        INNER JOIN proposta p ON pa.proposta_id = p.id
        INNER JOIN utilizador u ON p.orientador_id = u.id
        LEFT JOIN unidade_curricular uc ON p.uc_id = uc.id
        WHERE pa.aluno_id = $1
        ORDER BY pa.data_associacao DESC
    `;

    const resultado = await executarQuery(query, [alunoId]);
    return resultado.rows;
};

/**
 * Verificar se docente é orientador ou coorientador da proposta
 * @param {number} propostaId - ID da proposta
 * @param {number} docenteId - ID do docente
 * @returns {Promise<boolean>} True se tem permissão
 */
export const verificarPermissaoDocente = async (propostaId, docenteId) => {
    const query = `
        SELECT 1 FROM proposta
        WHERE id = $1 AND orientador_id = $2
        UNION
        SELECT 1 FROM proposta_coorientador
        WHERE proposta_id = $1 AND coorientador_id = $2
    `;

    const resultado = await executarQuery(query, [propostaId, docenteId]);
    return resultado.rows.length > 0;
};
