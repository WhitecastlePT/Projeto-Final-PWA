/**
 * Middleware para tratamento de erros globais
 */
export const tratarErros = (erro, req, res, next) => {
    console.error('Erro capturado:', erro);

    // Erro de validação
    if (erro.name === 'ValidationError') {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Erro de validação',
            erros: erro.errors
        });
    }

    // Erro de JWT
    if (erro.name === 'JsonWebTokenError') {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token inválido'
        });
    }

    if (erro.name === 'TokenExpiredError') {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Token expirado'
        });
    }

    // Erro de base de dados
    if (erro.code === '23505') { // Violação de constraint unique
        return res.status(409).json({
            sucesso: false,
            mensagem: 'Registo duplicado. Este valor já existe na base de dados.'
        });
    }

    if (erro.code === '23503') { // Violação de foreign key
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Referência inválida. O registo referenciado não existe.'
        });
    }

    if (erro.code === '23502') { // Violação de NOT NULL
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Campo obrigatório não fornecido.'
        });
    }

    // Erro de Multer (upload de ficheiros)
    if (erro.name === 'MulterError') {
        if (erro.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Ficheiro excede o tamanho máximo permitido'
            });
        }

        if (erro.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Campo de ficheiro inesperado'
            });
        }

        return res.status(400).json({
            sucesso: false,
            mensagem: 'Erro ao processar upload de ficheiro'
        });
    }

    // Erro genérico
    res.status(erro.status || 500).json({
        sucesso: false,
        mensagem: erro.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: erro.stack })
    });
};

/**
 * Middleware para rotas não encontradas
 */
export const rotaNaoEncontrada = (req, res) => {
    res.status(404).json({
        sucesso: false,
        mensagem: `Rota ${req.originalUrl} não encontrada`
    });
};
