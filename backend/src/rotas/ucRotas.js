import express from 'express';
import {
    listarUCs,
    listarUCsDisponiveis,
    listarMinhasUCs,
    obterUC,
    listarPropostasUC,
    criarUC,
    atualizarUC,
    eliminarUC
} from '../controladores/ucControlador.js';
import { verificarAutenticacao, verificarDocente, verificarAluno } from '../middlewares/autenticacao.js';

const router = express.Router();

/**
 * Rotas de Unidades Curriculares
 * Base: /api/ucs
 */

// Rotas públicas / autenticadas
router.get('/', verificarAutenticacao, listarUCs);
router.get('/disponiveis', verificarAutenticacao, verificarAluno, listarUCsDisponiveis);
router.get('/minhas', verificarAutenticacao, verificarDocente, listarMinhasUCs);
router.get('/:id', verificarAutenticacao, obterUC);
router.get('/:id/propostas', verificarAutenticacao, listarPropostasUC);

// Rotas de docente
router.post('/', verificarAutenticacao, verificarDocente, criarUC);
router.put('/:id', verificarAutenticacao, verificarDocente, atualizarUC);
router.delete('/:id', verificarAutenticacao, verificarDocente, eliminarUC);

export default router;
