import {
    criarPalavraChave,
    buscarPalavraChavePorId,
    buscarPalavraChavePorTermo,
    listarPalavrasChave,
    atualizarPalavraChave,
    eliminarPalavraChave
} from '../modelos/palavraChaveModelo.js';

/**
 * Controlador para operações com Palavras-chave
 */

/**
 * Criar nova palavra-chave
 * POST /api/palavras-chave
 */
export const criar = async (req, res, next) => {
    try {
        const { termo } = req.body;

        // Validações
        if (!termo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Termo é obrigatório'
            });
        }

        if (termo.length < 2) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Termo deve ter no mínimo 2 caracteres'
            });
        }

        // Verificar se termo já existe
        const existente = await buscarPalavraChavePorTermo(termo);
        if (existente) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Esta palavra-chave já existe',
                dados: {
                    palavra_chave: existente
                }
            });
        }

        const novaPalavraChave = await criarPalavraChave(termo);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Palavra-chave criada com sucesso',
            dados: {
                palavra_chave: novaPalavraChave
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Listar todas as palavras-chave
 * GET /api/palavras-chave
 */
export const listar = async (req, res, next) => {
    try {
        const palavrasChave = await listarPalavrasChave();

        res.json({
            sucesso: true,
            dados: {
                total: palavrasChave.length,
                palavras_chave: palavrasChave
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Obter palavra-chave por ID
 * GET /api/palavras-chave/:id
 */
export const obterPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const palavraChave = await buscarPalavraChavePorId(id);

        if (!palavraChave) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Palavra-chave não encontrada'
            });
        }

        res.json({
            sucesso: true,
            dados: {
                palavra_chave: palavraChave
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Atualizar palavra-chave
 * PUT /api/palavras-chave/:id
 */
export const atualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { termo } = req.body;

        if (!termo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Termo é obrigatório'
            });
        }

        const palavraChave = await buscarPalavraChavePorId(id);

        if (!palavraChave) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Palavra-chave não encontrada'
            });
        }

        // Verificar se novo termo já existe (outro registo)
        const existente = await buscarPalavraChavePorTermo(termo);
        if (existente && existente.id !== parseInt(id)) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este termo já existe noutra palavra-chave'
            });
        }

        const palavraChaveAtualizada = await atualizarPalavraChave(id, termo);

        res.json({
            sucesso: true,
            mensagem: 'Palavra-chave atualizada com sucesso',
            dados: {
                palavra_chave: palavraChaveAtualizada
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Eliminar palavra-chave
 * DELETE /api/palavras-chave/:id
 */
export const eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const palavraChave = await buscarPalavraChavePorId(id);

        if (!palavraChave) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Palavra-chave não encontrada'
            });
        }

        await eliminarPalavraChave(id);

        res.json({
            sucesso: true,
            mensagem: 'Palavra-chave eliminada com sucesso'
        });
    } catch (erro) {
        next(erro);
    }
};
