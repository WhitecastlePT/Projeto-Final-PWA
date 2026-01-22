import { executarQuery } from '../config/baseDados.js';

/**
 * Criar nova candidatura
 */
export const criarCandidatura = async (dados) => {
    const sql = `
        INSERT INTO candidatura (aluno_id, proposta_id, observacoes)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const valores = [dados.aluno_id, dados.proposta_id, dados.observacoes];
    const resultado = await executarQuery(sql, valores);
    return resultado.rows[0];
};

/**
 * Verificar se aluno já tem candidatura numa proposta
 */
export const verificarCandidaturaExistente = async (alunoId, propostaId) => {
    const sql = `SELECT id FROM candidatura WHERE aluno_id = $1 AND proposta_id = $2`;
    const resultado = await executarQuery(sql, [alunoId, propostaId]);
    return resultado.rows.length > 0;
};

/**
 * Listar candidaturas de um aluno
 */
export const listarCandidaturasPorAluno = async (alunoId) => {
    const sql = `
        SELECT c.id, c.aluno_id, c.proposta_id, c.estado, c.observacoes, c.feedback_docente,
               c.data_submissao, c.data_atualizacao,
               p.titulo as proposta_titulo, p.descricao_objetivos as proposta_descricao, p.estado as proposta_estado,
               uc.nome as uc_nome, uc.codigo as uc_codigo,
               u.nome as orientador_nome
        FROM candidatura c
        JOIN proposta p ON c.proposta_id = p.id
        LEFT JOIN unidade_curricular uc ON p.uc_id = uc.id
        JOIN utilizador u ON p.orientador_id = u.id
        WHERE c.aluno_id = $1
        ORDER BY c.data_submissao DESC
    `;
    const resultado = await executarQuery(sql, [alunoId]);
    return resultado.rows;
};

/**
 * Listar candidaturas de uma proposta (para docente)
 */
export const listarCandidaturasPorProposta = async (propostaId) => {
    const sql = `
        SELECT c.*,
               u.nome as aluno_nome, u.email as aluno_email, u.numero_aluno, u.curso
        FROM candidatura c
        JOIN utilizador u ON c.aluno_id = u.id
        WHERE c.proposta_id = $1
        ORDER BY c.data_submissao DESC
    `;
    const resultado = await executarQuery(sql, [propostaId]);
    return resultado.rows;
};

/**
 * Obter candidatura por ID
 */
export const obterCandidaturaPorId = async (id) => {
    const sql = `
        SELECT c.*,
               p.titulo as proposta_titulo, p.orientador_id,
               u.nome as aluno_nome, u.email as aluno_email, u.numero_aluno
        FROM candidatura c
        JOIN proposta p ON c.proposta_id = p.id
        JOIN utilizador u ON c.aluno_id = u.id
        WHERE c.id = $1
    `;
    const resultado = await executarQuery(sql, [id]);
    return resultado.rows[0];
};

/**
 * Atualizar estado da candidatura
 * @param {number} id - ID da candidatura
 * @param {string} estado - Novo estado
 * @param {string} feedbackDocente - Feedback do docente (opcional)
 */
export const atualizarEstadoCandidatura = async (id, estado, feedbackDocente) => {
    let sql, valores;

    if (feedbackDocente !== undefined && feedbackDocente !== null && feedbackDocente !== '') {
        sql = `
            UPDATE candidatura
            SET estado = $1, feedback_docente = $2
            WHERE id = $3
            RETURNING *
        `;
        valores = [estado, feedbackDocente, id];
    } else {
        sql = `
            UPDATE candidatura
            SET estado = $1
            WHERE id = $2
            RETURNING *
        `;
        valores = [estado, id];
    }

    const resultado = await executarQuery(sql, valores);
    return resultado.rows[0];
};

/**
 * Eliminar candidatura
 */
export const eliminarCandidatura = async (id) => {
    const sql = `DELETE FROM candidatura WHERE id = $1 RETURNING *`;
    const resultado = await executarQuery(sql, [id]);
    return resultado.rows[0];
};

/**
 * Listar anexos de uma candidatura
 */
export const listarAnexosCandidatura = async (candidaturaId) => {
    const sql = `
        SELECT * FROM anexo_candidatura
        WHERE candidatura_id = $1
        ORDER BY data_upload DESC
    `;
    const resultado = await executarQuery(sql, [candidaturaId]);
    return resultado.rows;
};

/**
 * Adicionar anexo à candidatura
 */
export const adicionarAnexoCandidatura = async (dados) => {
    const sql = `
        INSERT INTO anexo_candidatura (candidatura_id, nome_ficheiro, caminho, tipo, tamanho_bytes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const valores = [dados.candidatura_id, dados.nome_ficheiro, dados.caminho, dados.tipo, dados.tamanho_bytes];
    const resultado = await executarQuery(sql, valores);
    return resultado.rows[0];
};

/**
 * Obter anexo por ID
 */
export const obterAnexoPorId = async (id) => {
    const sql = `
        SELECT ac.*, c.aluno_id
        FROM anexo_candidatura ac
        JOIN candidatura c ON ac.candidatura_id = c.id
        WHERE ac.id = $1
    `;
    const resultado = await executarQuery(sql, [id]);
    return resultado.rows[0];
};

/**
 * Eliminar anexo
 */
export const eliminarAnexo = async (id) => {
    const sql = `DELETE FROM anexo_candidatura WHERE id = $1 RETURNING *`;
    const resultado = await executarQuery(sql, [id]);
    return resultado.rows[0];
};
