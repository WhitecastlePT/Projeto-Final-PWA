import { Router } from 'express';
import { verificarAutenticacao } from '../middlewares/autenticacao.js';
import {
    registar,
    login,
    obterPerfil,
    atualizarPerfil
} from '../controladores/utilizadorControlador.js';

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

export default router;
