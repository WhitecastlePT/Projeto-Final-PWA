-- =====================================================
-- Script de Criação da Base de Dados
-- Sistema de Gestão de Propostas de Projeto
-- =====================================================

-- Criar a base de dados (executar como superuser)
-- DROP DATABASE IF EXISTS sgp_db;
-- CREATE DATABASE sgp_db
--     WITH
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'Portuguese_Portugal.1252'
--     LC_CTYPE = 'Portuguese_Portugal.1252'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

-- Conectar à base de dados antes de executar o resto do script
-- \c sgp_db;

-- =====================================================
-- Limpar objetos existentes (permite re-executar o script)
-- =====================================================

DROP TABLE IF EXISTS anexo_candidatura CASCADE;
DROP TABLE IF EXISTS candidatura CASCADE;
DROP TABLE IF EXISTS proposta_palavra_chave CASCADE;
DROP TABLE IF EXISTS proposta_aluno CASCADE;
DROP TABLE IF EXISTS proposta_coorientador CASCADE;
DROP TABLE IF EXISTS anexo CASCADE;
DROP TABLE IF EXISTS proposta CASCADE;
DROP TABLE IF EXISTS unidade_curricular CASCADE;
DROP TABLE IF EXISTS palavra_chave CASCADE;
DROP TABLE IF EXISTS utilizador CASCADE;
DROP TYPE IF EXISTS estado_proposta CASCADE;
DROP TYPE IF EXISTS tipo_ficheiro CASCADE;
DROP TYPE IF EXISTS tipo_utilizador CASCADE;
DROP TYPE IF EXISTS estado_candidatura CASCADE;

-- =====================================================
-- Tipos Enumerados
-- =====================================================

-- Tipos de utilizador do sistema
CREATE TYPE tipo_utilizador AS ENUM (
    'administrador',
    'docente',
    'aluno'
);

-- Estados possíveis para uma proposta
CREATE TYPE estado_proposta AS ENUM (
    'rascunho',
    'publicada',
    'aprovada',
    'arquivada'
);

-- Estados possíveis para uma candidatura
CREATE TYPE estado_candidatura AS ENUM (
    'pendente',
    'aceite',
    'rejeitada'
);

-- Tipos de ficheiro permitidos para anexos
CREATE TYPE tipo_ficheiro AS ENUM (
    'pdf',
    'doc',
    'docx',
    'txt',
    'zip'
);

-- =====================================================
-- Tabelas Principais
-- =====================================================

-- Tabela: Utilizador (unificada para Admin, Docente e Aluno)
CREATE TABLE utilizador (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    palavra_passe VARCHAR(255),  -- Nullable para utilizadores OAuth (Google)
    tipo tipo_utilizador NOT NULL,
    aprovado BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Campos específicos para Docente (nullable)
    gabinete VARCHAR(50),
    departamento VARCHAR(255),
    -- Campos específicos para Aluno (nullable)
    numero_aluno VARCHAR(50) UNIQUE,
    curso VARCHAR(255),
    -- Campo para autenticação OAuth (Google)
    google_id VARCHAR(255) UNIQUE,
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Tabela: Unidade Curricular (UC)
CREATE TABLE unidade_curricular (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT,
    docente_id INTEGER NOT NULL,
    ano_letivo VARCHAR(20),
    semestre VARCHAR(20),
    ativa BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_uc_docente
        FOREIGN KEY (docente_id)
        REFERENCES utilizador(id)
        ON DELETE CASCADE
);

-- Tabela: Palavra-chave
CREATE TABLE palavra_chave (
    id SERIAL PRIMARY KEY,
    termo VARCHAR(100) UNIQUE NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Proposta
CREATE TABLE proposta (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(500) NOT NULL,
    descricao_objetivos TEXT NOT NULL,
    orientador_id INTEGER NOT NULL,
    uc_id INTEGER,
    estado estado_proposta DEFAULT 'rascunho',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_modificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orientador
        FOREIGN KEY (orientador_id)
        REFERENCES utilizador(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_proposta_uc
        FOREIGN KEY (uc_id)
        REFERENCES unidade_curricular(id)
        ON DELETE SET NULL
);

-- Tabela: Anexo (anexos das propostas)
CREATE TABLE anexo (
    id SERIAL PRIMARY KEY,
    nome_ficheiro VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tipo tipo_ficheiro NOT NULL,
    tamanho_bytes INTEGER NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    proposta_id INTEGER NOT NULL,
    CONSTRAINT fk_proposta_anexo
        FOREIGN KEY (proposta_id)
        REFERENCES proposta(id)
        ON DELETE CASCADE
);

-- Tabela: Candidatura (aluno candidata-se a proposta)
CREATE TABLE candidatura (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER NOT NULL,
    proposta_id INTEGER NOT NULL,
    estado estado_candidatura DEFAULT 'pendente',
    observacoes TEXT,
    feedback_docente TEXT,
    data_submissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidatura_aluno
        FOREIGN KEY (aluno_id)
        REFERENCES utilizador(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_candidatura_proposta
        FOREIGN KEY (proposta_id)
        REFERENCES proposta(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_candidatura UNIQUE (aluno_id, proposta_id)
);

-- Tabela: Anexo de Candidatura (ficheiros submetidos pelo aluno)
CREATE TABLE anexo_candidatura (
    id SERIAL PRIMARY KEY,
    candidatura_id INTEGER NOT NULL,
    nome_ficheiro VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tipo tipo_ficheiro NOT NULL,
    tamanho_bytes INTEGER NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_anexo_candidatura
        FOREIGN KEY (candidatura_id)
        REFERENCES candidatura(id)
        ON DELETE CASCADE
);

-- =====================================================
-- Tabelas de Associação (Relações N:M)
-- =====================================================

-- Tabela: Proposta - Coorientador (muitos-para-muitos)
CREATE TABLE proposta_coorientador (
    proposta_id INTEGER NOT NULL,
    coorientador_id INTEGER NOT NULL,
    data_associacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (proposta_id, coorientador_id),
    CONSTRAINT fk_proposta_coorientador
        FOREIGN KEY (proposta_id)
        REFERENCES proposta(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_coorientador
        FOREIGN KEY (coorientador_id)
        REFERENCES utilizador(id)
        ON DELETE CASCADE
);

-- Tabela: Proposta - Aluno (muitos-para-muitos, para associação direta)
CREATE TABLE proposta_aluno (
    proposta_id INTEGER NOT NULL,
    aluno_id INTEGER NOT NULL,
    data_associacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (proposta_id, aluno_id),
    CONSTRAINT fk_proposta_aluno
        FOREIGN KEY (proposta_id)
        REFERENCES proposta(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_aluno
        FOREIGN KEY (aluno_id)
        REFERENCES utilizador(id)
        ON DELETE CASCADE
);

-- Tabela: Proposta - Palavra-chave (muitos-para-muitos)
CREATE TABLE proposta_palavra_chave (
    proposta_id INTEGER NOT NULL,
    palavra_chave_id INTEGER NOT NULL,
    data_associacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (proposta_id, palavra_chave_id),
    CONSTRAINT fk_proposta_palavra_chave
        FOREIGN KEY (proposta_id)
        REFERENCES proposta(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_palavra_chave
        FOREIGN KEY (palavra_chave_id)
        REFERENCES palavra_chave(id)
        ON DELETE CASCADE
);

-- =====================================================
-- Índices para Otimização
-- =====================================================

-- Índices para utilizador
CREATE INDEX idx_utilizador_email ON utilizador(email);
CREATE INDEX idx_utilizador_tipo ON utilizador(tipo);
CREATE INDEX idx_utilizador_aprovado ON utilizador(aprovado);
CREATE INDEX idx_utilizador_numero_aluno ON utilizador(numero_aluno);
CREATE INDEX idx_utilizador_google_id ON utilizador(google_id);

-- Índices para unidade curricular
CREATE INDEX idx_uc_docente ON unidade_curricular(docente_id);
CREATE INDEX idx_uc_codigo ON unidade_curricular(codigo);
CREATE INDEX idx_uc_ativa ON unidade_curricular(ativa);

-- Índices para palavra-chave
CREATE INDEX idx_palavra_chave_termo ON palavra_chave(termo);

-- Índices para proposta
CREATE INDEX idx_proposta_orientador ON proposta(orientador_id);
CREATE INDEX idx_proposta_uc ON proposta(uc_id);
CREATE INDEX idx_proposta_estado ON proposta(estado);
CREATE INDEX idx_proposta_data_criacao ON proposta(data_criacao DESC);

-- Índices para anexo
CREATE INDEX idx_anexo_proposta ON anexo(proposta_id);

-- Índices para candidatura
CREATE INDEX idx_candidatura_aluno ON candidatura(aluno_id);
CREATE INDEX idx_candidatura_proposta ON candidatura(proposta_id);
CREATE INDEX idx_candidatura_estado ON candidatura(estado);

-- Índices para anexo_candidatura
CREATE INDEX idx_anexo_candidatura_candidatura ON anexo_candidatura(candidatura_id);

-- Índices para tabelas de associação
CREATE INDEX idx_proposta_coorientador_coorientador ON proposta_coorientador(coorientador_id);
CREATE INDEX idx_proposta_aluno_aluno ON proposta_aluno(aluno_id);
CREATE INDEX idx_proposta_palavra_chave_palavra ON proposta_palavra_chave(palavra_chave_id);

-- =====================================================
-- Triggers
-- =====================================================

-- Função para atualizar automaticamente data_modificacao
CREATE OR REPLACE FUNCTION atualizar_data_modificacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_modificacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar data_modificacao em proposta
CREATE TRIGGER trigger_atualizar_data_modificacao
    BEFORE UPDATE ON proposta
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_modificacao();

-- Função para atualizar automaticamente data_atualizacao em candidatura
CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar data_atualizacao em candidatura
CREATE TRIGGER trigger_atualizar_candidatura
    BEFORE UPDATE ON candidatura
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

-- =====================================================
-- Comentários nas Tabelas
-- =====================================================

COMMENT ON TABLE utilizador IS 'Armazena informação de todos os utilizadores (admin, docentes e alunos). Suporta autenticação tradicional e OAuth (Google)';
COMMENT ON COLUMN utilizador.google_id IS 'ID do utilizador no Google para autenticação OAuth2';
COMMENT ON TABLE unidade_curricular IS 'Armazena as unidades curriculares criadas pelos docentes';
COMMENT ON TABLE palavra_chave IS 'Armazena palavras-chave que podem ser associadas a propostas';
COMMENT ON TABLE proposta IS 'Armazena as propostas de projeto criadas pelos docentes';
COMMENT ON TABLE anexo IS 'Armazena os ficheiros anexados às propostas';
COMMENT ON TABLE candidatura IS 'Armazena as candidaturas dos alunos às propostas';
COMMENT ON TABLE anexo_candidatura IS 'Armazena os ficheiros anexados às candidaturas dos alunos';
COMMENT ON TABLE proposta_coorientador IS 'Associação N:M entre propostas e coorientadores';
COMMENT ON TABLE proposta_aluno IS 'Associação N:M entre propostas e alunos';
COMMENT ON TABLE proposta_palavra_chave IS 'Associação N:M entre propostas e palavras-chave';

-- =====================================================
-- Administrador Inicial
-- =====================================================

-- Inserir administrador inicial (senha: senha123)
-- Hash bcrypt: $2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2
INSERT INTO utilizador (nome, email, palavra_passe, tipo, aprovado)
VALUES ('Administrador', 'admin@sgp.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'administrador', TRUE)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- Fim do Script
-- =====================================================
