import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    submeterCandidatura,
    listarMinhasCandidaturas,
    listarCandidaturasProposta,
    alterarEstadoCandidatura,
    adicionarAnexo,
    listarAnexos,
    downloadAnexo,
    eliminarAnexo
} from '../controladores/candidaturaControlador.js';
import { verificarAutenticacao, verificarAluno, verificarDocente } from '../middlewares/autenticacao.js';

const router = express.Router();

// Configuração do diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Multer para upload de anexos de candidaturas
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/candidaturas');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.pdf', '.zip', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de ficheiro não permitido. Use: PDF, ZIP, DOC, DOCX ou TXT'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

/**
 * Rotas de Candidaturas
 * Base: /api/candidaturas
 */

// Rotas de aluno
router.post('/', verificarAutenticacao, verificarAluno, submeterCandidatura);
router.get('/minhas', verificarAutenticacao, verificarAluno, listarMinhasCandidaturas);
router.post('/:id/anexos', verificarAutenticacao, verificarAluno, upload.single('ficheiro'), adicionarAnexo);
router.delete('/:candidaturaId/anexos/:anexoId', verificarAutenticacao, verificarAluno, eliminarAnexo);

// Rotas de docente
router.get('/proposta/:propostaId', verificarAutenticacao, verificarDocente, listarCandidaturasProposta);
router.put('/:id/estado', verificarAutenticacao, verificarDocente, alterarEstadoCandidatura);

// Rotas comuns (aluno/docente)
router.get('/:id/anexos', verificarAutenticacao, listarAnexos);
router.get('/anexos/:anexoId/download', verificarAutenticacao, downloadAnexo);

export default router;
