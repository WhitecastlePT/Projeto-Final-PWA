import express from 'express';
import {
    criar,
    listar,
    obterPorId,
    atualizar,
    eliminar
} from '../controladores/palavraChaveControlador.js';
import { verificarAutenticacao } from '../middlewares/autenticacao.js';

const router = express.Router();

/**
 * Rotas Públicas
 */

// Listar todas as palavras-chave
router.get('/', listar);

// Obter palavra-chave por ID
router.get('/:id', obterPorId);

/**
 * Rotas Protegidas (requerem autenticação)
 */

// Criar nova palavra-chave
router.post('/', verificarAutenticacao, criar);

// Atualizar palavra-chave
router.put('/:id', verificarAutenticacao, atualizar);

// Eliminar palavra-chave
router.delete('/:id', verificarAutenticacao, eliminar);

export default router;
