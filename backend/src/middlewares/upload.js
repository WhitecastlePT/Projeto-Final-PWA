import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tipos de ficheiro permitidos
const TIPOS_PERMITIDOS = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt'
};

// Tamanho máximo do ficheiro (5MB por padrão)
const TAMANHO_MAXIMO = parseInt(process.env.MAX_FILE_SIZE) || 5242880;

/**
 * Configuração de armazenamento do Multer
 */
const armazenamento = multer.diskStorage({
    destination: (req, file, callback) => {
        // Criar pasta específica para a proposta
        const pastaUpload = path.join(__dirname, '../../uploads', req.params.id || 'temp');

        // Criar pasta se não existir
        if (!fs.existsSync(pastaUpload)) {
            fs.mkdirSync(pastaUpload, { recursive: true });
        }

        callback(null, pastaUpload);
    },

    filename: (req, file, callback) => {
        // Gerar nome único para o ficheiro
        const nomeUnico = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extensao = path.extname(file.originalname);
        const nomeFicheiro = nomeUnico + extensao;

        callback(null, nomeFicheiro);
    }
});

/**
 * Filtro de ficheiros
 */
const filtroFicheiros = (req, file, callback) => {
    // Verificar tipo de ficheiro
    if (!TIPOS_PERMITIDOS[file.mimetype]) {
        return callback(
            new Error('Tipo de ficheiro não permitido. Apenas PDF, DOC, DOCX e TXT são aceites.'),
            false
        );
    }

    callback(null, true);
};

/**
 * Configuração do Multer
 */
export const upload = multer({
    storage: armazenamento,
    limits: {
        fileSize: TAMANHO_MAXIMO
    },
    fileFilter: filtroFicheiros
});

/**
 * Middleware para validar upload de anexo
 */
export const validarUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Nenhum ficheiro foi enviado'
        });
    }

    // Adicionar informações do ficheiro ao request
    req.ficheiro = {
        nome_original: req.file.originalname,
        nome_ficheiro: req.file.filename,
        caminho: req.file.path,
        tipo: TIPOS_PERMITIDOS[req.file.mimetype],
        tamanho_bytes: req.file.size,
        mimetype: req.file.mimetype
    };

    next();
};

/**
 * Função auxiliar para eliminar ficheiro do sistema
 * @param {string} caminho - Caminho do ficheiro
 * @returns {Promise<boolean>} True se eliminado com sucesso
 */
export const eliminarFicheiro = (caminho) => {
    return new Promise((resolve, reject) => {
        fs.unlink(caminho, (erro) => {
            if (erro) {
                console.error('Erro ao eliminar ficheiro:', erro);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};

/**
 * Função auxiliar para verificar se ficheiro existe
 * @param {string} caminho - Caminho do ficheiro
 * @returns {Promise<boolean>} True se existe
 */
export const ficheiroExiste = (caminho) => {
    return new Promise((resolve) => {
        fs.access(caminho, fs.constants.F_OK, (erro) => {
            resolve(!erro);
        });
    });
};

/**
 * Obter extensão do tipo de ficheiro
 * @param {string} tipo - Tipo de ficheiro (pdf, doc, docx, txt)
 * @returns {string} Extensão com ponto
 */
export const obterExtensao = (tipo) => {
    const extensoes = {
        pdf: '.pdf',
        doc: '.doc',
        docx: '.docx',
        txt: '.txt'
    };

    return extensoes[tipo] || '';
};
