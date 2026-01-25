import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from './config/passport.js';

// Importar rotas
import authRotas from './rotas/authRotas.js';
import adminRotas from './rotas/adminRotas.js';
import docenteRotas from './rotas/docenteRotas.js';
import propostaRotas from './rotas/propostaRotas.js';
import anexoRotas from './rotas/anexoRotas.js';
import alunoRotas from './rotas/alunoRotas.js';
import palavraChaveRotas from './rotas/palavraChaveRotas.js';
import ucRotas from './rotas/ucRotas.js';
import candidaturaRotas from './rotas/candidaturaRotas.js';

// Importar middlewares
import { tratarErros, rotaNaoEncontrada } from './middlewares/erros.js';

// Configuração de variáveis de ambiente
dotenv.config();

// Obter diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar aplicação Express
const app = express();

// Configuração de porta
const PORT = process.env.PORT || 3000;

/**
 * Middlewares Globais
 */

// CORS - permitir requisições do frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

// Parser de JSON
app.use(express.json());

// Parser de URL encoded
app.use(express.urlencoded({ extended: true }));

// Inicializar Passport (Google OAuth)
app.use(passport.initialize());

// Servir ficheiros estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * Rota de Verificação de Saúde
 */
app.get('/api/health', (req, res) => {
    res.json({
        sucesso: true,
        mensagem: 'API está a funcionar',
        versao: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

/**
 * Rotas da API
 */
// Novas rotas de autenticação e administração
app.use('/api/auth', authRotas);
app.use('/api/admin', adminRotas);

// Rotas existentes
app.use('/api/docentes', docenteRotas);
app.use('/api/propostas', propostaRotas);
app.use('/api', anexoRotas);
app.use('/api/alunos', alunoRotas);
app.use('/api/palavras-chave', palavraChaveRotas);
app.use('/api/ucs', ucRotas);
app.use('/api/candidaturas', candidaturaRotas);

/**
 * Rota raiz
 */
app.get('/', (req, res) => {
    res.json({
        sucesso: true,
        mensagem: 'Sistema de Gestão de Propostas de Projeto - API',
        versao: '1.0.0',
        documentacao: '/api/health'
    });
});

/**
 * Middleware para rotas não encontradas
 */
app.use(rotaNaoEncontrada);

/**
 * Middleware de tratamento de erros
 */
app.use(tratarErros);

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('Servidor iniciado com sucesso!');
    console.log('='.repeat(50));
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50));
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (erro) => {
    console.error('Erro não tratado:', erro);
    process.exit(1);
});

process.on('uncaughtException', (erro) => {
    console.error('Exceção não capturada:', erro);
    process.exit(1);
});

export default app;
