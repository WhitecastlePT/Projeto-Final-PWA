import {
    criarAluno,
    buscarAlunoPorId,
    buscarAlunoPorNumero,
    listarAlunos,
    atualizarAluno,
    eliminarAluno
} from '../modelos/alunoModelo.js';

/**
 * Controlador para operações com Alunos
 */

/**
 * Criar novo aluno
 * POST /api/alunos
 */
export const criar = async (req, res, next) => {
    try {
        const { nome, numero, email } = req.body;

        // Validações
        if (!nome || !numero || !email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, número e email são obrigatórios'
            });
        }

        // Verificar se número já existe
        const alunoExistente = await buscarAlunoPorNumero(numero);
        if (alunoExistente) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Número de aluno já registado'
            });
        }

        const novoAluno = await criarAluno({ nome, numero, email });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Aluno criado com sucesso',
            dados: {
                aluno: novoAluno
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Listar todos os alunos
 * GET /api/alunos
 */
export const listar = async (req, res, next) => {
    try {
        const alunos = await listarAlunos();

        res.json({
            sucesso: true,
            dados: {
                total: alunos.length,
                alunos
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Obter aluno por ID
 * GET /api/alunos/:id
 */
export const obterPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const aluno = await buscarAlunoPorId(id);

        if (!aluno) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Aluno não encontrado'
            });
        }

        res.json({
            sucesso: true,
            dados: {
                aluno
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Atualizar aluno
 * PUT /api/alunos/:id
 */
export const atualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nome, numero, email } = req.body;

        const aluno = await buscarAlunoPorId(id);

        if (!aluno) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Aluno não encontrado'
            });
        }

        const dadosAtualizar = {};

        if (nome) dadosAtualizar.nome = nome;
        if (numero) dadosAtualizar.numero = numero;
        if (email) dadosAtualizar.email = email;

        if (Object.keys(dadosAtualizar).length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhum campo para atualizar'
            });
        }

        const alunoAtualizado = await atualizarAluno(id, dadosAtualizar);

        res.json({
            sucesso: true,
            mensagem: 'Aluno atualizado com sucesso',
            dados: {
                aluno: alunoAtualizado
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Eliminar aluno
 * DELETE /api/alunos/:id
 */
export const eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const aluno = await buscarAlunoPorId(id);

        if (!aluno) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Aluno não encontrado'
            });
        }

        await eliminarAluno(id);

        res.json({
            sucesso: true,
            mensagem: 'Aluno eliminado com sucesso'
        });
    } catch (erro) {
        next(erro);
    }
};
