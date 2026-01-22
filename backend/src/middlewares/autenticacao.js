import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware para verificar autenticação JWT
 * Valida o token e adiciona os dados do utilizador ao objeto request
 */
export const verificarAutenticacao = (req, res, next) => {
    try {
        // Obter token do header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token de autenticação não fornecido'
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const partes = authHeader.split(' ');

        if (partes.length !== 2) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Formato de token inválido'
            });
        }

        const [esquema, token] = partes;

        if (!/^Bearer$/i.test(esquema)) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Token mal formatado'
            });
        }

        // Verificar e decodificar token
        jwt.verify(token, process.env.JWT_SECRET, (erro, decodificado) => {
            if (erro) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: 'Token inválido ou expirado'
                });
            }

            // Adicionar dados do utilizador ao request
            req.utilizadorId = decodificado.id;
            req.utilizadorEmail = decodificado.email;
            req.utilizadorTipo = decodificado.tipo;
            req.utilizadorAprovado = decodificado.aprovado;

            // Objeto utilizador completo para controladores
            req.utilizador = {
                id: decodificado.id,
                email: decodificado.email,
                nome: decodificado.nome,
                tipo: decodificado.tipo,
                aprovado: decodificado.aprovado
            };

            // Manter compatibilidade com código antigo (docente)
            req.docenteId = decodificado.id;
            req.docenteEmail = decodificado.email;

            return next();
        });
    } catch (erro) {
        console.error('Erro na verificação de autenticação:', erro);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao verificar autenticação'
        });
    }
};

/**
 * Gera um token JWT para o utilizador
 * @param {Object} utilizador - Dados do utilizador
 * @returns {string} Token JWT
 */
export const gerarToken = (utilizador) => {
    const payload = {
        id: utilizador.id,
        email: utilizador.email,
        nome: utilizador.nome,
        tipo: utilizador.tipo,
        aprovado: utilizador.aprovado
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

/**
 * Middleware para verificar tipo de utilizador
 * @param {Array<string>} tiposPermitidos - Tipos permitidos (ex: ['administrador', 'docente'])
 * @returns {Function} Middleware
 */
export const verificarTipo = (tiposPermitidos) => {
    return (req, res, next) => {
        if (!req.utilizadorTipo) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'Não autenticado'
            });
        }

        if (!tiposPermitidos.includes(req.utilizadorTipo)) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para aceder a este recurso'
            });
        }

        return next();
    };
};

/**
 * Middleware para verificar se utilizador é administrador
 */
export const verificarAdmin = (req, res, next) => {
    if (req.utilizadorTipo !== 'administrador') {
        return res.status(403).json({
            sucesso: false,
            mensagem: 'Acesso restrito a administradores'
        });
    }
    return next();
};

/**
 * Middleware para verificar se utilizador é docente
 */
export const verificarDocente = (req, res, next) => {
    if (req.utilizadorTipo !== 'docente') {
        return res.status(403).json({
            sucesso: false,
            mensagem: 'Acesso restrito a docentes'
        });
    }
    return next();
};

/**
 * Middleware para verificar se utilizador é aluno
 */
export const verificarAluno = (req, res, next) => {
    if (req.utilizadorTipo !== 'aluno') {
        return res.status(403).json({
            sucesso: false,
            mensagem: 'Acesso restrito a alunos'
        });
    }
    return next();
};

/**
 * Middleware para verificar se conta está aprovada
 */
export const verificarAprovado = (req, res, next) => {
    if (!req.utilizadorAprovado) {
        return res.status(403).json({
            sucesso: false,
            mensagem: 'Utilizador não verificado'
        });
    }
    return next();
};

/**
 * Middleware opcional de autenticação
 * Adiciona dados do utilizador se o token for válido, mas não bloqueia a requisição
 */
export const autenticacaoOpcional = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        const partes = authHeader.split(' ');

        if (partes.length !== 2) {
            return next();
        }

        const [esquema, token] = partes;

        if (!/^Bearer$/i.test(esquema)) {
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET, (erro, decodificado) => {
            if (!erro) {
                req.utilizadorId = decodificado.id;
                req.utilizadorEmail = decodificado.email;
                req.utilizadorTipo = decodificado.tipo;
                req.utilizadorAprovado = decodificado.aprovado;

                // Objeto utilizador completo para controladores
                req.utilizador = {
                    id: decodificado.id,
                    email: decodificado.email,
                    nome: decodificado.nome,
                    tipo: decodificado.tipo,
                    aprovado: decodificado.aprovado
                };

                // Manter compatibilidade
                req.docenteId = decodificado.id;
                req.docenteEmail = decodificado.email;
            }
            return next();
        });
    } catch (erro) {
        console.error('Erro na autenticação opcional:', erro);
        return next();
    }
};
