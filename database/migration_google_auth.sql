-- =====================================================
-- Migração: Adicionar suporte a autenticação Google
-- =====================================================

-- Adicionar coluna google_id à tabela utilizador
ALTER TABLE utilizador ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

-- Permitir palavra_passe nula (para utilizadores que só usam Google)
ALTER TABLE utilizador ALTER COLUMN palavra_passe DROP NOT NULL;

-- Índice para busca por google_id
CREATE INDEX IF NOT EXISTS idx_utilizador_google_id ON utilizador(google_id);

-- Comentário
COMMENT ON COLUMN utilizador.google_id IS 'ID do utilizador no Google (para OAuth2)';
