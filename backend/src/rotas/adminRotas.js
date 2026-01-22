import { Router } from 'express';
import { verificarAutenticacao, verificarAdmin } from '../middlewares/autenticacao.js';
import {
    listarTodos,
    listarUtilizadoresPendentes,
    obterUtilizadorPorId,
    aprovar,
    rejeitar,
    alterarTipo,
    eliminar,
    criarPorAdmin,
    atualizarPorAdmin
} from '../controladores/utilizadorControlador.js';

const router = Router();

/**
 * Rotas de Administração
 * Base: /api/admin
 * Todas as rotas requerem autenticação e tipo administrador
 */

// Aplicar middleware de autenticação e verificação de admin a todas as rotas
router.use(verificarAutenticacao);
router.use(verificarAdmin);

// Listar utilizadores
router.get('/utilizadores', listarTodos);
router.get('/utilizadores/pendentes', listarUtilizadoresPendentes);

// Obter utilizador específico
router.get('/utilizadores/:id', obterUtilizadorPorId);

// Criar utilizador (admin pode criar qualquer tipo)
router.post('/utilizadores', criarPorAdmin);

// Atualizar utilizador
router.put('/utilizadores/:id', atualizarPorAdmin);

// Aprovar/rejeitar utilizador
router.put('/utilizadores/:id/aprovar', aprovar);
router.put('/utilizadores/:id/rejeitar', rejeitar);

// Alterar tipo de utilizador
router.put('/utilizadores/:id/tipo', alterarTipo);

// Eliminar utilizador
router.delete('/utilizadores/:id', eliminar);

export default router;
