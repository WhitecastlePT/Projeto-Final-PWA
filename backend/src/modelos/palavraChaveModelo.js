import { executarQuery } from '../config/baseDados.js';

/**
 * Modelo para operações relacionadas com Palavras-chave
 */

/**
 * Criar nova palavra-chave
 * @param {string} termo - Termo da palavra-chave
 * @returns {Promise<Object>} Palavra-chave criada
 */
export const criarPalavraChave = async (termo) => {
    const query = `
        INSERT INTO palavra_chave (termo)
        VALUES ($1)
        RETURNING *
    `;

    const resultado = await executarQuery(query, [termo]);
    return resultado.rows[0];
};

/**
 * Buscar palavra-chave por ID
 * @param {number} id - ID da palavra-chave
 * @returns {Promise<Object|null>} Palavra-chave ou null
 */
export const buscarPalavraChavePorId = async (id) => {
    const query = 'SELECT * FROM palavra_chave WHERE id = $1';
    const resultado = await executarQuery(query, [id]);

    return resultado.rows[0] || null;
};

/**
 * Buscar palavra-chave por termo
 * @param {string} termo - Termo da palavra-chave
 * @returns {Promise<Object|null>} Palavra-chave ou null
 */
export const buscarPalavraChavePorTermo = async (termo) => {
    const query = 'SELECT * FROM palavra_chave WHERE LOWER(termo) = LOWER($1)';
    const resultado = await executarQuery(query, [termo]);

    return resultado.rows[0] || null;
};

/**
 * Listar todas as palavras-chave
 * @returns {Promise<Array>} Lista de palavras-chave
 */
export const listarPalavrasChave = async () => {
    const query = `
        SELECT
            pc.*,
            COUNT(ppc.proposta_id) as total_propostas
        FROM palavra_chave pc
        LEFT JOIN proposta_palavra_chave ppc ON pc.id = ppc.palavra_chave_id
        GROUP BY pc.id
        ORDER BY pc.termo ASC
    `;

    const resultado = await executarQuery(query);
    return resultado.rows;
};

/**
 * Atualizar palavra-chave
 * @param {number} id - ID da palavra-chave
 * @param {string} termo - Novo termo
 * @returns {Promise<Object>} Palavra-chave atualizada
 */
export const atualizarPalavraChave = async (id, termo) => {
    const query = `
        UPDATE palavra_chave
        SET termo = $1
        WHERE id = $2
        RETURNING *
    `;

    const resultado = await executarQuery(query, [termo, id]);
    return resultado.rows[0];
};

/**
 * Eliminar palavra-chave
 * @param {number} id - ID da palavra-chave
 * @returns {Promise<boolean>} True se eliminada
 */
export const eliminarPalavraChave = async (id) => {
    const query = 'DELETE FROM palavra_chave WHERE id = $1';
    const resultado = await executarQuery(query, [id]);

    return resultado.rowCount > 0;
};

/**
 * Buscar ou criar palavra-chave
 * @param {string} termo - Termo da palavra-chave
 * @returns {Promise<Object>} Palavra-chave encontrada ou criada
 */
export const buscarOuCriarPalavraChave = async (termo) => {
    const existente = await buscarPalavraChavePorTermo(termo);

    if (existente) {
        return existente;
    }

    return await criarPalavraChave(termo);
};
