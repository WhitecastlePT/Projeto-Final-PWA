import express from 'express';
import {
    criar,
    listar,
    obterPorId,
    listarMinhas,
    listarAtribuidas,
    atualizar,
    eliminar,
    adicionarCoorientador,
    removerCoorientadorProposta,
    adicionarAluno,
    removerAlunoProposta,
    adicionarPalavraChave,
    removerPalavraChaveProposta
} from '../controladores/propostaControlador.js';
import { verificarAutenticacao } from '../middlewares/autenticacao.js';

const router = express.Router();

/**
 * Rotas Protegidas (requerem autenticação)
 */

// Criar nova proposta
router.post('/', verificarAutenticacao, criar);

// Listar propostas do docente autenticado
router.get('/minhas', verificarAutenticacao, listarMinhas);

// Listar propostas atribuídas ao aluno autenticado
router.get('/atribuidas', verificarAutenticacao, listarAtribuidas);

// Atualizar proposta
router.put('/:id', verificarAutenticacao, atualizar);

// Eliminar proposta
router.delete('/:id', verificarAutenticacao, eliminar);

// Gestão de coorientadores
router.post('/:id/coorientadores', verificarAutenticacao, adicionarCoorientador);
router.delete('/:id/coorientadores/:coorientadorId', verificarAutenticacao, removerCoorientadorProposta);

// Gestão de alunos
router.post('/:id/alunos', verificarAutenticacao, adicionarAluno);
router.delete('/:id/alunos/:alunoId', verificarAutenticacao, removerAlunoProposta);

// Gestão de palavras-chave
router.post('/:id/palavras-chave', verificarAutenticacao, adicionarPalavraChave);
router.delete('/:id/palavras-chave/:palavraChaveId', verificarAutenticacao, removerPalavraChaveProposta);

/**
 * Rotas Públicas
 */

// Listar todas as propostas (com filtros opcionais)
router.get('/', listar);

// Obter proposta por ID
router.get('/:id', obterPorId);

export default router;
