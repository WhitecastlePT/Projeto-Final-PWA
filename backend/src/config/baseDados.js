import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuração do pool de conexões PostgreSQL
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sgp_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20, // Número máximo de clientes no pool
    idleTimeoutMillis: 30000, // Tempo antes de fechar conexão inativa
    connectionTimeoutMillis: 5000, // Tempo de espera para obter conexão
};

// Adicionar SSL se configurado (necessário para Neon e outros serviços cloud)
if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(poolConfig);

// Testar conexão ao iniciar
pool.on('connect', () => {
    console.log('✓ Conectado à base de dados PostgreSQL');
});

pool.on('error', (erro) => {
    console.error('Erro inesperado na base de dados:', erro);
    process.exit(-1);
});

/**
 * Executa uma query na base de dados
 * @param {string} texto - Query SQL
 * @param {Array} parametros - Parâmetros da query
 * @returns {Promise} Resultado da query
 */
export const executarQuery = async (texto, parametros = []) => {
    const inicio = Date.now();
    try {
        const resultado = await pool.query(texto, parametros);
        const duracao = Date.now() - inicio;

        if (process.env.NODE_ENV === 'development') {
            console.log('Query executada:', {
                texto,
                duracao: `${duracao}ms`,
                linhas: resultado.rowCount
            });
        }

        return resultado;
    } catch (erro) {
        console.error('Erro ao executar query:', erro);
        throw erro;
    }
};

/**
 * Obtém um cliente do pool para transações
 * @returns {Promise} Cliente do pool
 */
export const obterCliente = async () => {
    const cliente = await pool.connect();

    const executarQuery = cliente.query.bind(cliente);
    const libertar = cliente.release.bind(cliente);

    // Timeout para libertar cliente automaticamente
    const timeout = setTimeout(() => {
        console.warn('Cliente do pool não foi libertado após 5 segundos');
        cliente.release();
    }, 5000);

    cliente.query = (...args) => {
        return executarQuery(...args);
    };

    cliente.release = () => {
        clearTimeout(timeout);
        libertar();
    };

    return cliente;
};

/**
 * Encerra o pool de conexões
 */
export const fecharPool = async () => {
    await pool.end();
    console.log('Pool de conexões encerrado');
};

export default pool;
