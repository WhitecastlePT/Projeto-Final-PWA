import { executarQuery } from '../config/baseDados.js';

/**
 * Modelo para operações relacionadas com Utilizadores
 * Suporta três tipos: administrador, docente, aluno
 */

/**
 * Criar novo utilizador
 * @param {Object} dados - Dados do utilizador
 * @returns {Promise<Object>} Utilizador criado (sem palavra_passe)
 */
export const criarUtilizador = async (dados) => {
    const query = `
        INSERT INTO utilizador (
            nome, email, palavra_passe, tipo, aprovado,
            gabinete, departamento, numero_aluno, curso
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, nome, email, tipo, aprovado, gabinete, departamento,
                  numero_aluno, curso, data_criacao
    `;

    const valores = [
        dados.nome,
        dados.email,
        dados.palavra_passe,
        dados.tipo,
        dados.aprovado || false,
        dados.gabinete || null,
        dados.departamento || null,
        dados.numero_aluno || null,
        dados.curso || null
    ];

    const resultado = await executarQuery(query, valores);
    return resultado.rows[0];
};

/**
 * Buscar utilizador por email (inclui palavra_passe para autenticação)
 * @param {string} email - Email do utilizador
 * @returns {Promise<Object|null>} Utilizador ou null
 */
export const buscarUtilizadorPorEmail = async (email) => {
    const query = 'SELECT * FROM utilizador WHERE email = $1';
    const resultado = await executarQuery(query, [email]);
    return resultado.rows[0] || null;
};

/**
 * Buscar utilizador por ID (sem palavra_passe)
 * @param {number} id - ID do utilizador
 * @returns {Promise<Object|null>} Utilizador ou null
 */
export const buscarUtilizadorPorId = async (id) => {
    const query = `
        SELECT id, nome, email, tipo, aprovado, gabinete, departamento,
               numero_aluno, curso, data_criacao
        FROM utilizador
        WHERE id = $1
    `;
    const resultado = await executarQuery(query, [id]);
    return resultado.rows[0] || null;
};

/**
 * Listar todos os utilizadores (sem palavra_passe)
 * @param {Object} filtros - Filtros opcionais (tipo, aprovado)
 * @returns {Promise<Array>} Lista de utilizadores
 */
export const listarUtilizadores = async (filtros = {}) => {
    let query = `
        SELECT id, nome, email, tipo, aprovado, gabinete, departamento,
               numero_aluno, curso, data_criacao
        FROM utilizador
    `;

    const condicoes = [];
    const valores = [];
    let contador = 1;

    if (filtros.tipo) {
        condicoes.push(`tipo = $${contador}`);
        valores.push(filtros.tipo);
        contador++;
    }

    if (filtros.aprovado !== undefined) {
        condicoes.push(`aprovado = $${contador}`);
        valores.push(filtros.aprovado);
        contador++;
    }

    if (condicoes.length > 0) {
        query += ' WHERE ' + condicoes.join(' AND ');
    }

    query += ' ORDER BY data_criacao DESC';

    const resultado = await executarQuery(query, valores);
    return resultado.rows;
};

/**
 * Listar utilizadores pendentes de aprovação
 * @returns {Promise<Array>} Lista de utilizadores pendentes
 */
export const listarPendentes = async () => {
    const query = `
        SELECT id, nome, email, tipo, gabinete, departamento,
               numero_aluno, curso, data_criacao
        FROM utilizador
        WHERE aprovado = FALSE
        ORDER BY data_criacao ASC
    `;
    const resultado = await executarQuery(query);
    return resultado.rows;
};

/**
 * Listar docentes aprovados (para seleção de coorientadores, etc.)
 * @returns {Promise<Array>} Lista de docentes
 */
export const listarDocentes = async () => {
    const query = `
        SELECT id, nome, email, gabinete, departamento, data_criacao
        FROM utilizador
        WHERE tipo = 'docente' AND aprovado = TRUE
        ORDER BY nome ASC
    `;
    const resultado = await executarQuery(query);
    return resultado.rows;
};

/**
 * Listar alunos aprovados
 * @returns {Promise<Array>} Lista de alunos
 */
export const listarAlunos = async () => {
    const query = `
        SELECT id, nome, email, numero_aluno, curso, data_criacao
        FROM utilizador
        WHERE tipo = 'aluno' AND aprovado = TRUE
        ORDER BY nome ASC
    `;
    const resultado = await executarQuery(query);
    return resultado.rows;
};

/**
 * Atualizar dados do utilizador
 * @param {number} id - ID do utilizador
 * @param {Object} dados - Dados a atualizar
 * @returns {Promise<Object>} Utilizador atualizado
 */
export const atualizarUtilizador = async (id, dados) => {
    const camposPermitidos = [
        'nome', 'email', 'palavra_passe',
        'gabinete', 'departamento', 'numero_aluno', 'curso'
    ];

    const campos = [];
    const valores = [];
    let contador = 1;

    for (const campo of camposPermitidos) {
        if (dados[campo] !== undefined) {
            campos.push(`${campo} = $${contador}`);
            valores.push(dados[campo]);
            contador++;
        }
    }

    if (campos.length === 0) {
        throw new Error('Nenhum campo para atualizar');
    }

    valores.push(id);

    const query = `
        UPDATE utilizador
        SET ${campos.join(', ')}
        WHERE id = $${contador}
        RETURNING id, nome, email, tipo, aprovado, gabinete, departamento,
                  numero_aluno, curso, data_criacao
    `;

    const resultado = await executarQuery(query, valores);
    return resultado.rows[0];
};

/**
 * Aprovar utilizador
 * @param {number} id - ID do utilizador
 * @returns {Promise<Object>} Utilizador aprovado
 */
export const aprovarUtilizador = async (id) => {
    const query = `
        UPDATE utilizador
        SET aprovado = TRUE
        WHERE id = $1
        RETURNING id, nome, email, tipo, aprovado, data_criacao
    `;
    const resultado = await executarQuery(query, [id]);
    return resultado.rows[0];
};

/**
 * Rejeitar/remover aprovação de utilizador
 * @param {number} id - ID do utilizador
 * @returns {Promise<Object>} Utilizador atualizado
 */
export const rejeitarUtilizador = async (id) => {
    const query = `
        UPDATE utilizador
        SET aprovado = FALSE
        WHERE id = $1
        RETURNING id, nome, email, tipo, aprovado, data_criacao
    `;
    const resultado = await executarQuery(query, [id]);
    return resultado.rows[0];
};

/**
 * Alterar tipo de utilizador
 * @param {number} id - ID do utilizador
 * @param {string} novoTipo - Novo tipo (administrador, docente, aluno)
 * @returns {Promise<Object>} Utilizador atualizado
 */
export const alterarTipoUtilizador = async (id, novoTipo) => {
    const query = `
        UPDATE utilizador
        SET tipo = $1
        WHERE id = $2
        RETURNING id, nome, email, tipo, aprovado, data_criacao
    `;
    const resultado = await executarQuery(query, [novoTipo, id]);
    return resultado.rows[0];
};

/**
 * Eliminar utilizador
 * @param {number} id - ID do utilizador
 * @returns {Promise<boolean>} True se eliminado
 */
export const eliminarUtilizador = async (id) => {
    const query = 'DELETE FROM utilizador WHERE id = $1';
    const resultado = await executarQuery(query, [id]);
    return resultado.rowCount > 0;
};

/**
 * Verificar se email já existe
 * @param {string} email - Email a verificar
 * @param {number} excluirId - ID a excluir da verificação (para updates)
 * @returns {Promise<boolean>} True se existe
 */
export const emailExiste = async (email, excluirId = null) => {
    let query = 'SELECT id FROM utilizador WHERE email = $1';
    const valores = [email];

    if (excluirId) {
        query += ' AND id != $2';
        valores.push(excluirId);
    }

    const resultado = await executarQuery(query, valores);
    return resultado.rows.length > 0;
};

/**
 * Verificar se número de aluno já existe
 * @param {string} numeroAluno - Número a verificar
 * @param {number} excluirId - ID a excluir da verificação
 * @returns {Promise<boolean>} True se existe
 */
export const numeroAlunoExiste = async (numeroAluno, excluirId = null) => {
    let query = 'SELECT id FROM utilizador WHERE numero_aluno = $1';
    const valores = [numeroAluno];

    if (excluirId) {
        query += ' AND id != $2';
        valores.push(excluirId);
    }

    const resultado = await executarQuery(query, valores);
    return resultado.rows.length > 0;
};

/**
 * Contar propostas do utilizador como orientador
 * @param {number} utilizadorId - ID do utilizador
 * @returns {Promise<number>} Número de propostas
 */
export const contarPropostasOrientador = async (utilizadorId) => {
    const query = `
        SELECT COUNT(*) as total
        FROM proposta
        WHERE orientador_id = $1
    `;
    const resultado = await executarQuery(query, [utilizadorId]);
    return parseInt(resultado.rows[0].total);
};

/**
 * Contar propostas do utilizador como coorientador
 * @param {number} utilizadorId - ID do utilizador
 * @returns {Promise<number>} Número de propostas
 */
export const contarPropostasCoorientador = async (utilizadorId) => {
    const query = `
        SELECT COUNT(*) as total
        FROM proposta_coorientador
        WHERE coorientador_id = $1
    `;
    const resultado = await executarQuery(query, [utilizadorId]);
    return parseInt(resultado.rows[0].total);
};

/**
 * Contar candidaturas do aluno
 * @param {number} alunoId - ID do aluno
 * @returns {Promise<number>} Número de candidaturas
 */
export const contarCandidaturas = async (alunoId) => {
    const query = `
        SELECT COUNT(*) as total
        FROM candidatura
        WHERE aluno_id = $1
    `;
    const resultado = await executarQuery(query, [alunoId]);
    return parseInt(resultado.rows[0].total);
};

/**
 * Buscar utilizador por Google ID
 * @param {string} googleId - Google ID do utilizador
 * @returns {Promise<Object|null>} Utilizador ou null
 */
export const buscarPorGoogleId = async (googleId) => {
    const query = `
        SELECT id, nome, email, tipo, aprovado, gabinete, departamento,
               numero_aluno, curso, google_id, data_criacao
        FROM utilizador
        WHERE google_id = $1
    `;
    const resultado = await executarQuery(query, [googleId]);
    return resultado.rows[0] || null;
};

/**
 * Vincular conta Google a utilizador existente
 * @param {number} id - ID do utilizador
 * @param {string} googleId - Google ID
 * @returns {Promise<Object>} Utilizador atualizado
 */
export const vincularGoogle = async (id, googleId) => {
    const query = `
        UPDATE utilizador
        SET google_id = $1
        WHERE id = $2
        RETURNING id, nome, email, tipo, aprovado, google_id, data_criacao
    `;
    const resultado = await executarQuery(query, [googleId, id]);
    return resultado.rows[0];
};

/**
 * Criar utilizador via Google OAuth
 * @param {Object} dados - Dados do utilizador
 * @returns {Promise<Object>} Utilizador criado
 */
export const criarUtilizadorGoogle = async (dados) => {
    const query = `
        INSERT INTO utilizador (
            nome, email, google_id, tipo, aprovado,
            gabinete, departamento, numero_aluno, curso
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, nome, email, tipo, aprovado, gabinete, departamento,
                  numero_aluno, curso, google_id, data_criacao
    `;

    const valores = [
        dados.nome,
        dados.email,
        dados.google_id,
        dados.tipo || 'docente',
        dados.aprovado || false,
        dados.gabinete || null,
        dados.departamento || null,
        dados.numero_aluno || null,
        dados.curso || null
    ];

    const resultado = await executarQuery(query, valores);
    return resultado.rows[0];
};

/**
 * Obter estatísticas do utilizador
 * @param {number} id - ID do utilizador
 * @returns {Promise<Object>} Estatísticas
 */
export const obterEstatisticas = async (id) => {
    const utilizador = await buscarUtilizadorPorId(id);

    if (!utilizador) return null;

    const estatisticas = {
        utilizador
    };

    if (utilizador.tipo === 'docente') {
        estatisticas.propostas_orientador = await contarPropostasOrientador(id);
        estatisticas.propostas_coorientador = await contarPropostasCoorientador(id);
    } else if (utilizador.tipo === 'aluno') {
        estatisticas.candidaturas = await contarCandidaturas(id);
    } else if (utilizador.tipo === 'administrador') {
        // Contar utilizadores pendentes
        const pendentes = await listarPendentes();
        estatisticas.utilizadores_pendentes = pendentes.length;
    }

    return estatisticas;
};
