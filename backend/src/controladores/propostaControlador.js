import {
    criarProposta,
    buscarPropostaPorId,
    listarPropostas,
    atualizarProposta,
    eliminarProposta,
    associarCoorientador,
    removerCoorientador,
    associarAluno,
    removerAluno,
    associarPalavraChave,
    removerPalavraChave,
    verificarPermissaoDocente,
    listarPropostasAtribuidas
} from '../modelos/propostaModelo.js';

/**
 * Controlador para operações com Propostas
 */

/**
 * Criar nova proposta
 * POST /api/propostas
 */
export const criar = async (req, res, next) => {
    try {
        const {
            titulo,
            descricao_objetivos,
            estado,
            uc_id,
            coorientadores,
            alunos,
            palavras_chave
        } = req.body;

        // Validações básicas
        if (!titulo || !descricao_objetivos) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Título e descrição dos objetivos são obrigatórios'
            });
        }

        if (titulo.length < 10) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O título deve ter no mínimo 10 caracteres'
            });
        }

        if (descricao_objetivos.length < 50) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A descrição deve ter no mínimo 50 caracteres'
            });
        }

        // Estados válidos
        const estadosValidos = ['rascunho', 'publicada', 'aprovada', 'arquivada'];
        if (estado && !estadosValidos.includes(estado)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Estado inválido. Valores permitidos: ' + estadosValidos.join(', ')
            });
        }

        // Criar proposta
        const novaProposta = await criarProposta({
            titulo,
            descricao_objetivos,
            orientador_id: req.docenteId,
            uc_id: uc_id || null,
            estado: estado || 'rascunho',
            coorientadores: coorientadores || [],
            alunos: alunos || [],
            palavras_chave: palavras_chave || []
        });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Proposta criada com sucesso',
            dados: {
                proposta: novaProposta
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Listar propostas com filtros
 * GET /api/propostas
 */
export const listar = async (req, res, next) => {
    try {
        const {
            orientador_id,
            estado,
            palavra_chave_id,
            pesquisa,
            limite,
            pagina
        } = req.query;

        const filtros = {};

        if (orientador_id) {
            filtros.orientador_id = parseInt(orientador_id);
        }

        if (estado) {
            filtros.estado = estado;
        }

        if (palavra_chave_id) {
            filtros.palavra_chave_id = parseInt(palavra_chave_id);
        }

        if (pesquisa) {
            filtros.pesquisa = pesquisa;
        }

        if (limite) {
            filtros.limite = parseInt(limite);
        }

        if (pagina && limite) {
            filtros.offset = (parseInt(pagina) - 1) * parseInt(limite);
        }

        const propostas = await listarPropostas(filtros);

        res.json({
            sucesso: true,
            dados: {
                total: propostas.length,
                propostas
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Obter proposta por ID
 * GET /api/propostas/:id
 */
export const obterPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const proposta = await buscarPropostaPorId(id);

        if (!proposta) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Proposta não encontrada'
            });
        }

        res.json({
            sucesso: true,
            dados: {
                proposta
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Listar propostas do docente autenticado
 * GET /api/propostas/minhas
 */
export const listarMinhas = async (req, res, next) => {
    try {
        const { estado, pesquisa } = req.query;

        const filtros = {
            orientador_id: req.docenteId
        };

        if (estado) {
            filtros.estado = estado;
        }

        if (pesquisa) {
            filtros.pesquisa = pesquisa;
        }

        const propostas = await listarPropostas(filtros);

        res.json({
            sucesso: true,
            dados: {
                total: propostas.length,
                propostas
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Listar propostas atribuídas ao aluno autenticado
 * GET /api/propostas/atribuidas
 */
export const listarAtribuidas = async (req, res, next) => {
    try {
        const alunoId = req.utilizador.id;

        const propostas = await listarPropostasAtribuidas(alunoId);

        res.json({
            sucesso: true,
            dados: {
                total: propostas.length,
                propostas
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Atualizar proposta
 * PUT /api/propostas/:id
 */
export const atualizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { titulo, descricao_objetivos, estado, uc_id } = req.body;

        // Verificar se proposta existe
        const proposta = await buscarPropostaPorId(id);

        if (!proposta) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Proposta não encontrada'
            });
        }

        // Verificar permissão (orientador ou coorientador)
        const temPermissao = await verificarPermissaoDocente(id, req.docenteId);

        if (!temPermissao) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para editar esta proposta'
            });
        }

        // Validações
        const dadosAtualizar = {};

        if (titulo !== undefined) {
            if (titulo.length < 10) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'O título deve ter no mínimo 10 caracteres'
                });
            }
            dadosAtualizar.titulo = titulo;
        }

        if (descricao_objetivos !== undefined) {
            if (descricao_objetivos.length < 50) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'A descrição deve ter no mínimo 50 caracteres'
                });
            }
            dadosAtualizar.descricao_objetivos = descricao_objetivos;
        }

        if (estado !== undefined) {
            const estadosValidos = ['rascunho', 'publicada', 'aprovada', 'arquivada'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Estado inválido'
                });
            }
            dadosAtualizar.estado = estado;
        }

        if (uc_id !== undefined) {
            dadosAtualizar.uc_id = uc_id || null;
        }

        if (Object.keys(dadosAtualizar).length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhum campo para atualizar'
            });
        }

        await atualizarProposta(id, dadosAtualizar);

        // Buscar proposta atualizada completa
        const propostaAtualizada = await buscarPropostaPorId(id);

        res.json({
            sucesso: true,
            mensagem: 'Proposta atualizada com sucesso',
            dados: {
                proposta: propostaAtualizada
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Eliminar proposta
 * DELETE /api/propostas/:id
 */
export const eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar se proposta existe
        const proposta = await buscarPropostaPorId(id);

        if (!proposta) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Proposta não encontrada'
            });
        }

        // Verificar permissão (apenas orientador pode eliminar)
        if (proposta.orientador_id !== req.docenteId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Apenas o orientador pode eliminar a proposta'
            });
        }

        await eliminarProposta(id);

        res.json({
            sucesso: true,
            mensagem: 'Proposta eliminada com sucesso'
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Adicionar coorientador à proposta
 * POST /api/propostas/:id/coorientadores
 */
export const adicionarCoorientador = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { coorientador_id } = req.body;

        if (!coorientador_id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do coorientador é obrigatório'
            });
        }

        // Verificar permissão
        const temPermissao = await verificarPermissaoDocente(id, req.docenteId);

        if (!temPermissao) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para editar esta proposta'
            });
        }

        await associarCoorientador(id, coorientador_id);

        const propostaAtualizada = await buscarPropostaPorId(id);

        res.json({
            sucesso: true,
            mensagem: 'Coorientador adicionado com sucesso',
            dados: {
                proposta: propostaAtualizada
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Remover coorientador da proposta
 * DELETE /api/propostas/:id/coorientadores/:coorientadorId
 */
export const removerCoorientadorProposta = async (req, res, next) => {
    try {
        const { id, coorientadorId } = req.params;

        // Verificar permissão
        const temPermissao = await verificarPermissaoDocente(id, req.docenteId);

        if (!temPermissao) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para editar esta proposta'
            });
        }

        const removido = await removerCoorientador(id, coorientadorId);

        if (!removido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Associação não encontrada'
            });
        }

        const propostaAtualizada = await buscarPropostaPorId(id);

        res.json({
            sucesso: true,
            mensagem: 'Coorientador removido com sucesso',
            dados: {
                proposta: propostaAtualizada
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Adicionar aluno à proposta
 * POST /api/propostas/:id/alunos
 */
export const adicionarAluno = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { aluno_id } = req.body;

        if (!aluno_id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do aluno é obrigatório'
            });
        }

        // Verificar permissão
        const temPermissao = await verificarPermissaoDocente(id, req.docenteId);

        if (!temPermissao) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para editar esta proposta'
            });
        }

        await associarAluno(id, aluno_id);

        const propostaAtualizada = await buscarPropostaPorId(id);

        res.json({
            sucesso: true,
            mensagem: 'Aluno adicionado com sucesso',
            dados: {
                proposta: propostaAtualizada
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Remover aluno da proposta
 * DELETE /api/propostas/:id/alunos/:alunoId
 */
export const removerAlunoProposta = async (req, res, next) => {
    try {
        const { id, alunoId } = req.params;

        // Verificar permissão
        const temPermissao = await verificarPermissaoDocente(id, req.docenteId);

        if (!temPermissao) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para editar esta proposta'
            });
        }

        const removido = await removerAluno(id, alunoId);

        if (!removido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Associação não encontrada'
            });
        }

        const propostaAtualizada = await buscarPropostaPorId(id);

        res.json({
            sucesso: true,
            mensagem: 'Aluno removido com sucesso',
            dados: {
                proposta: propostaAtualizada
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Adicionar palavra-chave à proposta
 * POST /api/propostas/:id/palavras-chave
 */
export const adicionarPalavraChave = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { palavra_chave_id } = req.body;

        if (!palavra_chave_id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID da palavra-chave é obrigatório'
            });
        }

        // Verificar permissão
        const temPermissao = await verificarPermissaoDocente(id, req.docenteId);

        if (!temPermissao) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para editar esta proposta'
            });
        }

        await associarPalavraChave(id, palavra_chave_id);

        const propostaAtualizada = await buscarPropostaPorId(id);

        res.json({
            sucesso: true,
            mensagem: 'Palavra-chave adicionada com sucesso',
            dados: {
                proposta: propostaAtualizada
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Remover palavra-chave da proposta
 * DELETE /api/propostas/:id/palavras-chave/:palavraChaveId
 */
export const removerPalavraChaveProposta = async (req, res, next) => {
    try {
        const { id, palavraChaveId } = req.params;

        // Verificar permissão
        const temPermissao = await verificarPermissaoDocente(id, req.docenteId);

        if (!temPermissao) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para editar esta proposta'
            });
        }

        const removido = await removerPalavraChave(id, palavraChaveId);

        if (!removido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Associação não encontrada'
            });
        }

        const propostaAtualizada = await buscarPropostaPorId(id);

        res.json({
            sucesso: true,
            mensagem: 'Palavra-chave removida com sucesso',
            dados: {
                proposta: propostaAtualizada
            }
        });
    } catch (erro) {
        next(erro);
    }
};
