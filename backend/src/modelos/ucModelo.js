import { executarQuery } from '../config/baseDados.js';

/**
 * Criar uma nova unidade curricular
 */
export const criarUC = async (dados) => {
    const sql = `
        INSERT INTO unidade_curricular (nome, codigo, descricao, docente_id, ano_letivo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const valores = [dados.nome, dados.codigo, dados.descricao, dados.docente_id, dados.ano_letivo];
    const resultado = await executarQuery(sql, valores);
    return resultado.rows[0];
};

/**
 * Listar todas as UCs
 */
export const listarUCs = async () => {
    const sql = `
        SELECT uc.*, u.nome as docente_nome, u.email as docente_email
        FROM unidade_curricular uc
        JOIN utilizador u ON uc.docente_id = u.id
        ORDER BY uc.nome
    `;
    const resultado = await executarQuery(sql);
    return resultado.rows;
};

/**
 * Listar UCs de um docente
 */
export const listarUCsPorDocente = async (docenteId) => {
    const sql = `
        SELECT uc.*,
               (SELECT COUNT(*) FROM proposta p WHERE p.uc_id = uc.id) as total_propostas
        FROM unidade_curricular uc
        WHERE uc.docente_id = $1
        ORDER BY uc.nome
    `;
    const resultado = await executarQuery(sql, [docenteId]);
    return resultado.rows;
};

/**
 * Obter UC por ID
 */
export const obterUCPorId = async (id) => {
    const sql = `
        SELECT uc.*, u.nome as docente_nome, u.email as docente_email
        FROM unidade_curricular uc
        JOIN utilizador u ON uc.docente_id = u.id
        WHERE uc.id = $1
    `;
    const resultado = await executarQuery(sql, [id]);
    return resultado.rows[0];
};

/**
 * Obter UC por código
 */
export const obterUCPorCodigo = async (codigo) => {
    const sql = `SELECT * FROM unidade_curricular WHERE codigo = $1`;
    const resultado = await executarQuery(sql, [codigo]);
    return resultado.rows[0];
};

/**
 * Atualizar UC
 */
export const atualizarUC = async (id, dados) => {
    const sql = `
        UPDATE unidade_curricular
        SET nome = $1, codigo = $2, descricao = $3, ano_letivo = $4
        WHERE id = $5
        RETURNING *
    `;
    const valores = [dados.nome, dados.codigo, dados.descricao, dados.ano_letivo, id];
    const resultado = await executarQuery(sql, valores);
    return resultado.rows[0];
};

/**
 * Eliminar UC
 */
export const eliminarUC = async (id) => {
    const sql = `DELETE FROM unidade_curricular WHERE id = $1 RETURNING *`;
    const resultado = await executarQuery(sql, [id]);
    return resultado.rows[0];
};

/**
 * Verificar se UC pertence a um docente
 */
export const verificarProprietarioUC = async (ucId, docenteId) => {
    const sql = `SELECT id FROM unidade_curricular WHERE id = $1 AND docente_id = $2`;
    const resultado = await executarQuery(sql, [ucId, docenteId]);
    return resultado.rows.length > 0;
};

/**
 * Listar UCs com propostas publicadas (para alunos)
 */
export const listarUCsComPropostas = async () => {
    const sql = `
        SELECT DISTINCT uc.*,
               u.nome as docente_nome,
               (SELECT COUNT(*) FROM proposta p WHERE p.uc_id = uc.id AND p.estado = 'publicada') as total_propostas
        FROM unidade_curricular uc
        JOIN utilizador u ON uc.docente_id = u.id
        WHERE EXISTS (
            SELECT 1 FROM proposta p WHERE p.uc_id = uc.id AND p.estado = 'publicada'
        )
        ORDER BY uc.nome
    `;
    const resultado = await executarQuery(sql);
    return resultado.rows;
};

/**
 * Listar propostas de uma UC (publicadas, para alunos)
 */
export const listarPropostasUC = async (ucId) => {
    const sql = `
        SELECT p.*,
               u.nome as orientador_nome,
               uc.nome as uc_nome, uc.codigo as uc_codigo
        FROM proposta p
        JOIN utilizador u ON p.orientador_id = u.id
        JOIN unidade_curricular uc ON p.uc_id = uc.id
        WHERE p.uc_id = $1 AND p.estado = 'publicada'
        ORDER BY p.data_criacao DESC
    `;
    const resultado = await executarQuery(sql, [ucId]);
    return resultado.rows;
};
