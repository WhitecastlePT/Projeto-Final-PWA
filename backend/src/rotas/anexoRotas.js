import express from 'express';
import {
    fazerUpload,
    listar,
    fazerDownload,
    eliminar,
    obterPorId
} from '../controladores/anexoControlador.js';
import { verificarAutenticacao } from '../middlewares/autenticacao.js';
import { upload, validarUpload } from '../middlewares/upload.js';

const router = express.Router();

/**
 * Rotas relacionadas com anexos de propostas
 */

// Upload de anexo para proposta (protegido)
router.post(
    '/propostas/:id/anexos',
    verificarAutenticacao,
    upload.single('ficheiro'),
    validarUpload,
    fazerUpload
);

// Listar anexos de proposta (público)
router.get('/propostas/:id/anexos', listar);

/**
 * Rotas relacionadas com anexos individuais
 */

// Obter informações de anexo (público)
router.get('/anexos/:id', obterPorId);

// Download de anexo (público)
router.get('/anexos/:id/download', fazerDownload);

// Eliminar anexo (protegido)
router.delete('/anexos/:id', verificarAutenticacao, eliminar);

export default router;
