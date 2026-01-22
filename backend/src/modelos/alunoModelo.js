import { executarQuery } from '../config/baseDados.js';

/**
 * Modelo para operações relacionadas com Alunos
 */

/**
 * Criar novo aluno
 * @param {Object} dados - Dados do aluno
 * @returns {Promise<Object>} Aluno criado
 */
export const criarAluno = async (dados) => {
    const query = `
        INSERT INTO aluno (nome, numero, email)
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const valores = [dados.nome, dados.numero, dados.email];
    const resultado = await executarQuery(query, valores);

    return resultado.rows[0];
};

/**
 * Buscar aluno por ID
 * @param {number} id - ID do aluno
 * @returns {Promise<Object|null>} Aluno ou null
 */
export const buscarAlunoPorId = async (id) => {
    const query = 'SELECT * FROM aluno WHERE id = $1';
    const resultado = await executarQuery(query, [id]);

    return resultado.rows[0] || null;
};

/**
 * Buscar aluno por número
 * @param {string} numero - Número do aluno
 * @returns {Promise<Object|null>} Aluno ou null
 */
export const buscarAlunoPorNumero = async (numero) => {
    const query = 'SELECT * FROM aluno WHERE numero = $1';
    const resultado = await executarQuery(query, [numero]);

    return resultado.rows[0] || null;
};

/**
 * Listar todos os alunos
 * @returns {Promise<Array>} Lista de alunos
 */
export const listarAlunos = async () => {
    const query = `
        SELECT * FROM aluno
        ORDER BY nome ASC
    `;

    const resultado = await executarQuery(query);
    return resultado.rows;
};

/**
 * Atualizar aluno
 * @param {number} id - ID do aluno
 * @param {Object} dados - Dados a atualizar
 * @returns {Promise<Object>} Aluno atualizado
 */
export const atualizarAluno = async (id, dados) => {
    const campos = [];
    const valores = [];
    let contador = 1;

    if (dados.nome) {
        campos.push(`nome = $${contador}`);
        valores.push(dados.nome);
        contador++;
    }

    if (dados.numero) {
        campos.push(`numero = $${contador}`);
        valores.push(dados.numero);
        contador++;
    }

    if (dados.email) {
        campos.push(`email = $${contador}`);
        valores.push(dados.email);
        contador++;
    }

    if (campos.length === 0) {
        throw new Error('Nenhum campo para atualizar');
    }

    valores.push(id);

    const query = `
        UPDATE aluno
        SET ${campos.join(', ')}
        WHERE id = $${contador}
        RETURNING *
    `;

    const resultado = await executarQuery(query, valores);
    return resultado.rows[0];
};

/**
 * Eliminar aluno
 * @param {number} id - ID do aluno
 * @returns {Promise<boolean>} True se eliminado
 */
export const eliminarAluno = async (id) => {
    const query = 'DELETE FROM aluno WHERE id = $1';
    const resultado = await executarQuery(query, [id]);

    return resultado.rowCount > 0;
};
