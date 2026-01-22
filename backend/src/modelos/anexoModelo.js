import { executarQuery } from '../config/baseDados.js';

/**
 * Modelo para operações relacionadas com Anexos
 */

/**
 * Criar novo anexo
 * @param {Object} dados - Dados do anexo
 * @returns {Promise<Object>} Anexo criado
 */
export const criarAnexo = async (dados) => {
    const query = `
        INSERT INTO anexo (nome_ficheiro, caminho, tipo, tamanho_bytes, proposta_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const valores = [
        dados.nome_ficheiro,
        dados.caminho,
        dados.tipo,
        dados.tamanho_bytes,
        dados.proposta_id
    ];

    const resultado = await executarQuery(query, valores);
    return resultado.rows[0];
};

/**
 * Buscar anexo por ID
 * @param {number} id - ID do anexo
 * @returns {Promise<Object|null>} Anexo ou null
 */
export const buscarAnexoPorId = async (id) => {
    const query = `
        SELECT a.*, p.orientador_id
        FROM anexo a
        INNER JOIN proposta p ON a.proposta_id = p.id
        WHERE a.id = $1
    `;

    const resultado = await executarQuery(query, [id]);
    return resultado.rows[0] || null;
};

/**
 * Listar anexos de uma proposta
 * @param {number} propostaId - ID da proposta
 * @returns {Promise<Array>} Lista de anexos
 */
export const listarAnexosProposta = async (propostaId) => {
    const query = `
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

    const resultado = await executarQuery(query, [propostaId]);
    return resultado.rows;
};

/**
 * Eliminar anexo
 * @param {number} id - ID do anexo
 * @returns {Promise<Object|null>} Anexo eliminado ou null
 */
export const eliminarAnexo = async (id) => {
    const query = `
        DELETE FROM anexo
        WHERE id = $1
        RETURNING *
    `;

    const resultado = await executarQuery(query, [id]);
    return resultado.rows[0] || null;
};

/**
 * Contar anexos de uma proposta
 * @param {number} propostaId - ID da proposta
 * @returns {Promise<number>} Total de anexos
 */
export const contarAnexosProposta = async (propostaId) => {
    const query = `
        SELECT COUNT(*) as total
        FROM anexo
        WHERE proposta_id = $1
    `;

    const resultado = await executarQuery(query, [propostaId]);
    return parseInt(resultado.rows[0].total);
};

/**
 * Obter tamanho total dos anexos de uma proposta
 * @param {number} propostaId - ID da proposta
 * @returns {Promise<number>} Tamanho total em bytes
 */
export const obterTamanhoTotalAnexos = async (propostaId) => {
    const query = `
        SELECT COALESCE(SUM(tamanho_bytes), 0) as total
        FROM anexo
        WHERE proposta_id = $1
    `;

    const resultado = await executarQuery(query, [propostaId]);
    return parseInt(resultado.rows[0].total);
};
