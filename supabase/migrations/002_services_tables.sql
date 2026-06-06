-- ==========================================
-- PEDIRCOTACAO — MIGRATION 002: SERVICES TABLES
-- Categorias e serviços para rotas de conversão
-- ==========================================

-- ==========================================
-- 1. CATEGORIAS DE SERVIÇO
-- ==========================================
CREATE TABLE IF NOT EXISTS categorias_servico (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  icone TEXT, -- nome do ícone ou URL
  ativo BOOLEAN DEFAULT TRUE,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE categorias_servico IS 'Categorias de nicho: Análises Laboratoriais, Serviços Ambientais, etc.';
CREATE INDEX idx_categorias_slug ON categorias_servico(slug);

-- ==========================================
-- 2. SERVIÇOS
-- ==========================================
CREATE TABLE IF NOT EXISTS servicos (
  id SERIAL PRIMARY KEY,
  categoria_id INT NOT NULL REFERENCES categorias_servico(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  descricao_curta TEXT, -- Para meta description base
  preco_lead_base INT DEFAULT 500, -- Preço base do lead em centavos (R$5,00)
  ativo BOOLEAN DEFAULT TRUE,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE servicos IS 'Serviços específicos: analise-de-solo, licenciamento-ambiental, etc.';
COMMENT ON COLUMN servicos.preco_lead_base IS 'Preço base do lead em centavos. Pode variar por região.';
CREATE INDEX idx_servicos_slug ON servicos(slug);
CREATE INDEX idx_servicos_categoria_id ON servicos(categoria_id);
CREATE INDEX idx_servicos_ativo ON servicos(ativo) WHERE ativo = TRUE;
