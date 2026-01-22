import express from 'express';
import {
    listarAlunosPublico
} from '../controladores/utilizadorControlador.js';
import { verificarAutenticacao } from '../middlewares/autenticacao.js';

const router = express.Router();

/**
 * Rotas de Alunos
 * Base: /api/alunos
 *
 * Nota: CRUD de alunos é gerido através de /api/admin/utilizadores
 * Aqui apenas listagens públicas
 */

// Listar todos os alunos (aprovados) - requer autenticação
router.get('/', verificarAutenticacao, listarAlunosPublico);

export default router;
