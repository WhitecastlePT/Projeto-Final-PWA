import bcrypt from 'bcrypt';
import { gerarToken } from '../middlewares/autenticacao.js';
import {
    criarUtilizador,
    buscarUtilizadorPorEmail,
    buscarUtilizadorPorId,
    listarUtilizadores,
    listarPendentes,
    listarDocentes,
    listarAlunos,
    atualizarUtilizador,
    aprovarUtilizador,
    rejeitarUtilizador,
    alterarTipoUtilizador,
    eliminarUtilizador,
    emailExiste,
    numeroAlunoExiste,
    obterEstatisticas
} from '../modelos/utilizadorModelo.js';

/**
 * Controlador para operações com Utilizadores
 */

// ==========================================
// AUTENTICAÇÃO
// ==========================================

/**
 * Registar novo utilizador (docente ou aluno)
 * POST /api/auth/registar
 */
export const registar = async (req, res, next) => {
    try {
        const { nome, email, palavra_passe, tipo, gabinete, departamento, numero_aluno, curso } = req.body;

        // Validações básicas
        if (!nome || !email || !palavra_passe || !tipo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, email, palavra-passe e tipo são obrigatórios'
            });
        }

        // Validar tipo (não permitir registo de admin)
        if (!['docente', 'aluno'].includes(tipo)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Tipo de utilizador inválido. Use "docente" ou "aluno"'
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
        if (await emailExiste(email)) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Email já registado no sistema'
            });
        }

        // Validações específicas para aluno
        if (tipo === 'aluno') {
            if (!numero_aluno) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Número de aluno é obrigatório'
                });
            }

            if (await numeroAlunoExiste(numero_aluno)) {
                return res.status(409).json({
                    sucesso: false,
                    mensagem: 'Número de aluno já registado no sistema'
                });
            }
        }

        // Encriptar palavra-passe
        const saltRounds = 10;
        const palavraPasseEncriptada = await bcrypt.hash(palavra_passe, saltRounds);

        // Criar utilizador (não aprovado por defeito)
        const novoUtilizador = await criarUtilizador({
            nome,
            email,
            palavra_passe: palavraPasseEncriptada,
            tipo,
            aprovado: false,
            gabinete: tipo === 'docente' ? gabinete : null,
            departamento: tipo === 'docente' ? departamento : null,
            numero_aluno: tipo === 'aluno' ? numero_aluno : null,
            curso: tipo === 'aluno' ? curso : null
        });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Registo realizado com sucesso. Aguarde aprovação do administrador.',
            dados: {
                utilizador: novoUtilizador
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Autenticar utilizador (login)
 * POST /api/auth/login
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

        // Buscar utilizador por email
        const utilizador = await buscarUtilizadorPorEmail(email);
        if (!utilizador) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Credenciais inválidas'
            });
        }

        // Verificar palavra-passe
        const palavraPasseValida = await bcrypt.compare(palavra_passe, utilizador.palavra_passe);
        if (!palavraPasseValida) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Credenciais inválidas'
            });
        }

        // Verificar se está aprovado
        if (!utilizador.aprovado) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Utilizador não verificado'
            });
        }

        // Remover palavra-passe do objeto
        const { palavra_passe: _, ...utilizadorSemPassword } = utilizador;

        // Gerar token JWT (inclui tipo e aprovado)
        const token = gerarToken(utilizadorSemPassword);

        res.json({
            sucesso: true,
            mensagem: 'Login realizado com sucesso',
            dados: {
                utilizador: utilizadorSemPassword,
                token
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Obter perfil do utilizador autenticado
 * GET /api/auth/perfil
 */
export const obterPerfil = async (req, res, next) => {
    try {
        const estatisticas = await obterEstatisticas(req.utilizadorId);

        if (!estatisticas) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Utilizador não encontrado'
            });
        }

        res.json({
            sucesso: true,
            dados: estatisticas
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Atualizar perfil do utilizador autenticado
 * PUT /api/auth/perfil
 */
export const atualizarPerfil = async (req, res, next) => {
    try {
        const {
            nome, email, palavra_passe_atual, palavra_passe_nova,
            gabinete, departamento, numero_aluno, curso
        } = req.body;

        const utilizador = await buscarUtilizadorPorEmail(req.utilizadorEmail);
        const dadosAtualizar = {};

        // Atualizar nome
        if (nome) {
            dadosAtualizar.nome = nome;
        }

        // Atualizar email
        if (email && email !== utilizador.email) {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Formato de email inválido'
                });
            }

            if (await emailExiste(email, req.utilizadorId)) {
                return res.status(409).json({
                    sucesso: false,
                    mensagem: 'Email já está em uso por outro utilizador'
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

            const palavraPasseValida = await bcrypt.compare(palavra_passe_atual, utilizador.palavra_passe);
            if (!palavraPasseValida) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Palavra-passe atual incorreta'
                });
            }

            if (palavra_passe_nova.length < 6) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'A nova palavra-passe deve ter no mínimo 6 caracteres'
                });
            }

            const saltRounds = 10;
            dadosAtualizar.palavra_passe = await bcrypt.hash(palavra_passe_nova, saltRounds);
        }

        // Campos específicos de docente
        if (utilizador.tipo === 'docente') {
            if (gabinete !== undefined) dadosAtualizar.gabinete = gabinete;
            if (departamento !== undefined) dadosAtualizar.departamento = departamento;
        }

        // Campos específicos de aluno
        if (utilizador.tipo === 'aluno') {
            if (numero_aluno && numero_aluno !== utilizador.numero_aluno) {
                if (await numeroAlunoExiste(numero_aluno, req.utilizadorId)) {
                    return res.status(409).json({
                        sucesso: false,
                        mensagem: 'Número de aluno já está em uso'
                    });
                }
                dadosAtualizar.numero_aluno = numero_aluno;
            }
            if (curso !== undefined) dadosAtualizar.curso = curso;
        }

        if (Object.keys(dadosAtualizar).length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhum campo para atualizar'
            });
        }

        const utilizadorAtualizado = await atualizarUtilizador(req.utilizadorId, dadosAtualizar);

        res.json({
            sucesso: true,
            mensagem: 'Perfil atualizado com sucesso',
            dados: {
                utilizador: utilizadorAtualizado
            }
        });
    } catch (erro) {
        next(erro);
    }
};

// ==========================================
// ADMINISTRAÇÃO
// ==========================================

/**
 * Listar todos os utilizadores (admin)
 * GET /api/admin/utilizadores
 */
export const listarTodos = async (req, res, next) => {
    try {
        const { tipo, aprovado } = req.query;

        const filtros = {};
        if (tipo) filtros.tipo = tipo;
        if (aprovado !== undefined) filtros.aprovado = aprovado === 'true';

        const utilizadores = await listarUtilizadores(filtros);

        res.json({
            sucesso: true,
            dados: {
                total: utilizadores.length,
                utilizadores
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Listar utilizadores pendentes de aprovação (admin)
 * GET /api/admin/utilizadores/pendentes
 */
export const listarUtilizadoresPendentes = async (req, res, next) => {
    try {
        const pendentes = await listarPendentes();

        res.json({
            sucesso: true,
            dados: {
                total: pendentes.length,
                utilizadores: pendentes
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Obter utilizador por ID (admin)
 * GET /api/admin/utilizadores/:id
 */
export const obterUtilizadorPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const estatisticas = await obterEstatisticas(parseInt(id));

        if (!estatisticas) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Utilizador não encontrado'
            });
        }

        res.json({
            sucesso: true,
            dados: estatisticas
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Aprovar utilizador (admin)
 * PUT /api/admin/utilizadores/:id/aprovar
 */
export const aprovar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const utilizador = await buscarUtilizadorPorId(parseInt(id));
        if (!utilizador) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Utilizador não encontrado'
            });
        }

        if (utilizador.aprovado) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Utilizador já está aprovado'
            });
        }

        const utilizadorAprovado = await aprovarUtilizador(parseInt(id));

        res.json({
            sucesso: true,
            mensagem: 'Utilizador aprovado com sucesso',
            dados: {
                utilizador: utilizadorAprovado
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Rejeitar/desaprovar utilizador (admin)
 * PUT /api/admin/utilizadores/:id/rejeitar
 */
export const rejeitar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const utilizador = await buscarUtilizadorPorId(parseInt(id));
        if (!utilizador) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Utilizador não encontrado'
            });
        }

        // Não permitir rejeitar admin próprio
        if (parseInt(id) === req.utilizadorId) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Não pode rejeitar a sua própria conta'
            });
        }

        const utilizadorRejeitado = await rejeitarUtilizador(parseInt(id));

        res.json({
            sucesso: true,
            mensagem: 'Utilizador rejeitado com sucesso',
            dados: {
                utilizador: utilizadorRejeitado
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Alterar tipo de utilizador (admin)
 * PUT /api/admin/utilizadores/:id/tipo
 */
export const alterarTipo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tipo } = req.body;

        if (!tipo || !['administrador', 'docente', 'aluno'].includes(tipo)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Tipo inválido. Use "administrador", "docente" ou "aluno"'
            });
        }

        const utilizador = await buscarUtilizadorPorId(parseInt(id));
        if (!utilizador) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Utilizador não encontrado'
            });
        }

        const utilizadorAlterado = await alterarTipoUtilizador(parseInt(id), tipo);

        res.json({
            sucesso: true,
            mensagem: `Tipo alterado para "${tipo}" com sucesso`,
            dados: {
                utilizador: utilizadorAlterado
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Eliminar utilizador (admin)
 * DELETE /api/admin/utilizadores/:id
 */
export const eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;

        const utilizador = await buscarUtilizadorPorId(parseInt(id));
        if (!utilizador) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Utilizador não encontrado'
            });
        }

        // Não permitir eliminar próprio admin
        if (parseInt(id) === req.utilizadorId) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Não pode eliminar a sua própria conta'
            });
        }

        await eliminarUtilizador(parseInt(id));

        res.json({
            sucesso: true,
            mensagem: 'Utilizador eliminado com sucesso'
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Atualizar utilizador (admin)
 * PUT /api/admin/utilizadores/:id
 */
export const atualizarPorAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            nome, email, palavra_passe,
            gabinete, departamento, numero_aluno, curso
        } = req.body;

        const utilizador = await buscarUtilizadorPorId(parseInt(id));
        if (!utilizador) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Utilizador não encontrado'
            });
        }

        const dadosAtualizar = {};

        // Atualizar nome
        if (nome) {
            dadosAtualizar.nome = nome;
        }

        // Atualizar email
        if (email && email !== utilizador.email) {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Formato de email inválido'
                });
            }

            if (await emailExiste(email, parseInt(id))) {
                return res.status(409).json({
                    sucesso: false,
                    mensagem: 'Email já está em uso por outro utilizador'
                });
            }

            dadosAtualizar.email = email;
        }

        // Atualizar palavra-passe (sem exigir a atual para admin)
        if (palavra_passe) {
            if (palavra_passe.length < 6) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'A palavra-passe deve ter no mínimo 6 caracteres'
                });
            }

            const saltRounds = 10;
            dadosAtualizar.palavra_passe = await bcrypt.hash(palavra_passe, saltRounds);
        }

        // Campos específicos de docente
        if (utilizador.tipo === 'docente') {
            if (gabinete !== undefined) dadosAtualizar.gabinete = gabinete;
            if (departamento !== undefined) dadosAtualizar.departamento = departamento;
        }

        // Campos específicos de aluno
        if (utilizador.tipo === 'aluno') {
            if (numero_aluno && numero_aluno !== utilizador.numero_aluno) {
                if (await numeroAlunoExiste(numero_aluno, parseInt(id))) {
                    return res.status(409).json({
                        sucesso: false,
                        mensagem: 'Número de aluno já está em uso'
                    });
                }
                dadosAtualizar.numero_aluno = numero_aluno;
            }
            if (curso !== undefined) dadosAtualizar.curso = curso;
        }

        if (Object.keys(dadosAtualizar).length === 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhum campo para atualizar'
            });
        }

        const utilizadorAtualizado = await atualizarUtilizador(parseInt(id), dadosAtualizar);

        res.json({
            sucesso: true,
            mensagem: 'Utilizador atualizado com sucesso',
            dados: {
                utilizador: utilizadorAtualizado
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Criar utilizador (admin) - inclui admin
 * POST /api/admin/utilizadores
 */
export const criarPorAdmin = async (req, res, next) => {
    try {
        const { nome, email, palavra_passe, tipo, aprovado, gabinete, departamento, numero_aluno, curso } = req.body;

        // Validações básicas
        if (!nome || !email || !palavra_passe || !tipo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome, email, palavra-passe e tipo são obrigatórios'
            });
        }

        if (!['administrador', 'docente', 'aluno'].includes(tipo)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Tipo inválido'
            });
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Formato de email inválido'
            });
        }

        if (palavra_passe.length < 6) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'A palavra-passe deve ter no mínimo 6 caracteres'
            });
        }

        if (await emailExiste(email)) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Email já registado no sistema'
            });
        }

        if (tipo === 'aluno' && numero_aluno) {
            if (await numeroAlunoExiste(numero_aluno)) {
                return res.status(409).json({
                    sucesso: false,
                    mensagem: 'Número de aluno já registado no sistema'
                });
            }
        }

        const saltRounds = 10;
        const palavraPasseEncriptada = await bcrypt.hash(palavra_passe, saltRounds);

        const novoUtilizador = await criarUtilizador({
            nome,
            email,
            palavra_passe: palavraPasseEncriptada,
            tipo,
            aprovado: aprovado !== undefined ? aprovado : true, // Admin cria já aprovado por defeito
            gabinete: tipo === 'docente' ? gabinete : null,
            departamento: tipo === 'docente' ? departamento : null,
            numero_aluno: tipo === 'aluno' ? numero_aluno : null,
            curso: tipo === 'aluno' ? curso : null
        });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Utilizador criado com sucesso',
            dados: {
                utilizador: novoUtilizador
            }
        });
    } catch (erro) {
        next(erro);
    }
};

// ==========================================
// LISTAGENS PÚBLICAS
// ==========================================

/**
 * Listar docentes (público)
 * GET /api/docentes
 */
export const listarDocentesPublico = async (req, res, next) => {
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
 * Listar alunos (autenticado)
 * GET /api/alunos
 */
export const listarAlunosPublico = async (req, res, next) => {
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
 * Obter docente por ID (público)
 * GET /api/docentes/:id
 */
export const obterDocentePorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const utilizador = await buscarUtilizadorPorId(parseInt(id));

        if (!utilizador || utilizador.tipo !== 'docente') {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Docente não encontrado'
            });
        }

        const estatisticas = await obterEstatisticas(parseInt(id));

        res.json({
            sucesso: true,
            dados: estatisticas
        });
    } catch (erro) {
        next(erro);
    }
};
