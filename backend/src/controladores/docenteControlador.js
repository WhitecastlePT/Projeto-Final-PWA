import bcrypt from 'bcrypt';
import { gerarToken } from '../middlewares/autenticacao.js';
import {
    criarDocente,
    buscarDocentePorEmail,
    buscarDocentePorId,
    listarDocentes,
    atualizarDocente,
    contarPropostasOrientador,
    contarPropostasCoorientador
} from '../modelos/docenteModelo.js';

/**
 * Controlador para operações com Docentes
 */

/**
 * Registar novo docente
 * POST /api/docentes/registar
 */
export const registar = async (req, res, next) => {
    try {
        const { nome, email, palavra_passe } = req.body;

        // Validações básicas
        if (!nome || !email || !palavra_passe) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, email e palavra-passe são obrigatórios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Formato de email inválido'
            });
        }

        // Validar comprimento da palavra-passe
        if (palavra_passe.length < 6) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A palavra-passe deve ter no mínimo 6 caracteres'
            });
        }

        // Verificar se email já existe
        const docenteExistente = await buscarDocentePorEmail(email);
        if (docenteExistente) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Email já registado no sistema'
            });
        }

        // Encriptar palavra-passe
        const saltRounds = 10;
        const palavraPasseEncriptada = await bcrypt.hash(palavra_passe, saltRounds);

        // Criar docente
        const novoDocente = await criarDocente({
            nome,
            email,
            palavra_passe: palavraPasseEncriptada
        });

        // Gerar token JWT
        const token = gerarToken(novoDocente);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Docente registado com sucesso',
            dados: {
                docente: novoDocente,
                token
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Autenticar docente (login)
 * POST /api/docentes/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, palavra_passe } = req.body;

        // Validações básicas
        if (!email || !palavra_passe) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email e palavra-passe são obrigatórios'
            });
        }

        // Buscar docente por email
        const docente = await buscarDocentePorEmail(email);
        if (!docente) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Credenciais inválidas'
            });
        }

        // Verificar palavra-passe
        const palavraPasseValida = await bcrypt.compare(palavra_passe, docente.palavra_passe);
        if (!palavraPasseValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Credenciais inválidas'
            });
        }

        // Remover palavra-passe do objeto
        const { palavra_passe: _, ...docenteSemPassword } = docente;

        // Gerar token JWT
        const token = gerarToken(docenteSemPassword);

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            dados: {
                docente: docenteSemPassword,
                token
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Obter perfil do docente autenticado
 * GET /api/docentes/perfil
 */
export const obterPerfil = async (req, res, next) => {
    try {
        const docente = await buscarDocentePorId(req.docenteId);

        if (!docente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Docente não encontrado'
            });
        }

        // Obter estatísticas
        const totalOrientador = await contarPropostasOrientador(req.docenteId);
        const totalCoorientador = await contarPropostasCoorientador(req.docenteId);

        res.json({
            sucesso: true,
            dados: {
                docente,
                estatisticas: {
                    propostas_orientador: totalOrientador,
                    propostas_coorientador: totalCoorientador,
                    total_propostas: totalOrientador + totalCoorientador
                }
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Listar todos os docentes (público)
 * GET /api/docentes
 */
export const listar = async (req, res, next) => {
    try {
        const docentes = await listarDocentes();

        res.json({
            sucesso: true,
            dados: {
                total: docentes.length,
                docentes
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Obter docente por ID
 * GET /api/docentes/:id
 */
export const obterPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const docente = await buscarDocentePorId(id);

        if (!docente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Docente não encontrado'
            });
        }

        // Obter estatísticas
        const totalOrientador = await contarPropostasOrientador(id);
        const totalCoorientador = await contarPropostasCoorientador(id);

        res.json({
            sucesso: true,
            dados: {
                docente,
                estatisticas: {
                    propostas_orientador: totalOrientador,
                    propostas_coorientador: totalCoorientador,
                    total_propostas: totalOrientador + totalCoorientador
                }
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Atualizar perfil do docente autenticado
 * PUT /api/docentes/perfil
 */
export const atualizarPerfil = async (req, res, next) => {
    try {
        const { nome, email, palavra_passe_atual, palavra_passe_nova } = req.body;

        const dadosAtualizar = {};

        // Atualizar nome
        if (nome) {
            dadosAtualizar.nome = nome;
        }

        // Atualizar email
        if (email) {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Formato de email inválido'
                });
            }

            // Verificar se email já existe (outro docente)
            const docenteExistente = await buscarDocentePorEmail(email);
            if (docenteExistente && docenteExistente.id !== req.docenteId) {
                return res.status(409).json({
                    sucesso: false,
                    mensagem: 'Email já está em uso por outro docente'
                });
            }

            dadosAtualizar.email = email;
        }

        // Atualizar palavra-passe
        if (palavra_passe_nova) {
            if (!palavra_passe_atual) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Palavra-passe atual é obrigatória para alterar a palavra-passe'
                });
            }

            // Verificar palavra-passe atual
            const docente = await buscarDocentePorEmail(req.docenteEmail);
            const palavraPasseValida = await bcrypt.compare(palavra_passe_atual, docente.palavra_passe);

            if (!palavraPasseValida) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Palavra-passe atual incorreta'
                });
            }

            // Validar nova palavra-passe
            if (palavra_passe_nova.length < 6) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'A nova palavra-passe deve ter no mínimo 6 caracteres'
                });
            }

            const saltRounds = 10;
            dadosAtualizar.palavra_passe = await bcrypt.hash(palavra_passe_nova, saltRounds);
        }

        if (Object.keys(dadosAtualizar).length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhum campo para atualizar'
            });
        }

        const docenteAtualizado = await atualizarDocente(req.docenteId, dadosAtualizar);

        res.json({
            sucesso: true,
            mensagem: 'Perfil atualizado com sucesso',
            dados: {
                docente: docenteAtualizado
            }
        });
    } catch (erro) {
        next(erro);
    }
};
