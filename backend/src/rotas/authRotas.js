import { Router } from 'express';
import { verificarAutenticacao, gerarToken } from '../middlewares/autenticacao.js';
import {
    registar,
    login,
    obterPerfil,
    atualizarPerfil
} from '../controladores/utilizadorControlador.js';
import passport from '../config/passport.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

/**
 * Rotas de Autenticação
 * Base: /api/auth
 */

// Rotas públicas
router.post('/registar', registar);
router.post('/login', login);

// Rotas protegidas
router.get('/perfil', verificarAutenticacao, obterPerfil);
router.put('/perfil', verificarAutenticacao, atualizarPerfil);

/**
 * Rotas de Autenticação Google OAuth2
 */

// Iniciar fluxo OAuth - redireciona para Google
router.get('/google', (req, res, next) => {
    // Receber tipo de utilizador (aluno ou docente) e passar via state
    const tipo = req.query.tipo || 'docente';
    const tiposValidos = ['aluno', 'docente'];
    const tipoValido = tiposValidos.includes(tipo) ? tipo : 'docente';

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state: tipoValido // Passa o tipo através do OAuth state
    })(req, res, next);
});

// Callback do Google após autenticação
router.get('/google/callback',
    (req, res, next) => {
        const tipo = req.query.state || 'docente';
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';

        passport.authenticate('google', {
            session: false,
            failureRedirect: `${frontendUrl}/login/${tipo}?erro=google`
        })(req, res, next);
    },
    (req, res) => {
        const utilizador = req.user;
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
        const tipo = req.query.state || utilizador.tipo || 'docente';

        // Verificar se utilizador está aprovado
        if (!utilizador.aprovado) {
            return res.redirect(`${frontendUrl}/login/${tipo}?pendente=true`);
        }

        // Gerar token JWT
        const token = gerarToken(utilizador);

        // Redirecionar para frontend com token
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
);

export default router;
