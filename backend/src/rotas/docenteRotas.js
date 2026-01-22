import express from 'express';
import {
    listarDocentesPublico,
    obterDocentePorId
} from '../controladores/utilizadorControlador.js';

const router = express.Router();

/**
 * Rotas de Docentes (públicas)
 * Base: /api/docentes
 *
 * Nota: Login e registo foram movidos para /api/auth
 */

// Listar todos os docentes (aprovados)
router.get('/', listarDocentesPublico);

// Obter docente por ID
router.get('/:id', obterDocentePorId);

export default router;
