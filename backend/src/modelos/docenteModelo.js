import { executarQuery } from '../config/baseDados.js';

/**
 * Modelo para operações relacionadas com Docentes
 */

/**
 * Criar novo docente
 * @param {Object} dados - Dados do docente (nome, email, palavra_passe)
 * @returns {Promise<Object>} Docente criado
 */
export const criarDocente = async (dados) => {
    const query = `
        INSERT INTO docente (nome, email, palavra_passe)
        VALUES ($1, $2, $3)
        RETURNING id, nome, email, data_criacao
    `;

    const valores = [dados.nome, dados.email, dados.palavra_passe];
    const resultado = await executarQuery(query, valores);

    return resultado.rows[0];
};

/**
 * Buscar docente por email
 * @param {string} email - Email do docente
 * @returns {Promise<Object|null>} Docente ou null se não encontrado
 */
export const buscarDocentePorEmail = async (email) => {
    const query = 'SELECT * FROM docente WHERE email = $1';
    const resultado = await executarQuery(query, [email]);

    return resultado.rows[0] || null;
};

/**
 * Buscar docente por ID
 * @param {number} id - ID do docente
 * @returns {Promise<Object|null>} Docente ou null se não encontrado
 */
export const buscarDocentePorId = async (id) => {
    const query = `
        SELECT id, nome, email, data_criacao
        FROM docente
        WHERE id = $1
    `;

    const resultado = await executarQuery(query, [id]);
    return resultado.rows[0] || null;
};

/**
 * Listar todos os docentes (sem palavra-passe)
 * @returns {Promise<Array>} Lista de docentes
 */
export const listarDocentes = async () => {
    const query = `
        SELECT id, nome, email, data_criacao
        FROM docente
        ORDER BY nome ASC
    `;

    const resultado = await executarQuery(query);
    return resultado.rows;
};

/**
 * Atualizar dados do docente
 * @param {number} id - ID do docente
 * @param {Object} dados - Dados a atualizar
 * @returns {Promise<Object>} Docente atualizado
 */
export const atualizarDocente = async (id, dados) => {
    const campos = [];
    const valores = [];
    let contador = 1;

    if (dados.nome) {
        campos.push(`nome = $${contador}`);
        valores.push(dados.nome);
        contador++;
    }

    if (dados.email) {
        campos.push(`email = $${contador}`);
        valores.push(dados.email);
        contador++;
    }

    if (dados.palavra_passe) {
        campos.push(`palavra_passe = $${contador}`);
        valores.push(dados.palavra_passe);
        contador++;
    }

    if (campos.length === 0) {
        throw new Error('Nenhum campo para atualizar');
    }

    valores.push(id);

    const query = `
        UPDATE docente
        SET ${campos.join(', ')}
        WHERE id = $${contador}
        RETURNING id, nome, email, data_criacao
    `;

    const resultado = await executarQuery(query, valores);
    return resultado.rows[0];
};

/**
 * Eliminar docente
 * @param {number} id - ID do docente
 * @returns {Promise<boolean>} True se eliminado com sucesso
 */
export const eliminarDocente = async (id) => {
    const query = 'DELETE FROM docente WHERE id = $1';
    const resultado = await executarQuery(query, [id]);

    return resultado.rowCount > 0;
};

/**
 * Contar propostas do docente como orientador
 * @param {number} docenteId - ID do docente
 * @returns {Promise<number>} Número de propostas
 */
export const contarPropostasOrientador = async (docenteId) => {
    const query = `
        SELECT COUNT(*) as total
        FROM proposta
        WHERE orientador_id = $1
    `;

    const resultado = await executarQuery(query, [docenteId]);
    return parseInt(resultado.rows[0].total);
};

/**
 * Contar propostas do docente como coorientador
 * @param {number} docenteId - ID do docente
 * @returns {Promise<number>} Número de propostas
 */
export const contarPropostasCoorientador = async (docenteId) => {
    const query = `
        SELECT COUNT(*) as total
        FROM proposta_coorientador
        WHERE coorientador_id = $1
    `;

    const resultado = await executarQuery(query, [docenteId]);
    return parseInt(resultado.rows[0].total);
};
