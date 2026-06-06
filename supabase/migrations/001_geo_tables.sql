-- ==========================================
-- PEDIRCOTACAO — MIGRATION 001: GEO TABLES
-- Tabelas geográficas para SEO programático
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ESTADOS
-- ==========================================
CREATE TABLE IF NOT EXISTS estados (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla CHAR(2) NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE estados IS 'Estados brasileiros para rotas SEO programático: /[slug]';
CREATE INDEX idx_estados_slug ON estados(slug);

-- ==========================================
-- 2. CIDADES
-- ==========================================
CREATE TABLE IF NOT EXISTS cidades (
  id SERIAL PRIMARY KEY,
  estado_id INT NOT NULL REFERENCES estados(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  ibge_id INT,
  populacao INT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(estado_id, slug)
);

COMMENT ON TABLE cidades IS 'Cidades para rotas SEO: /[estado]/[slug]';
CREATE INDEX idx_cidades_slug ON cidades(slug);
CREATE INDEX idx_cidades_estado_id ON cidades(estado_id);
CREATE INDEX idx_cidades_ativo ON cidades(ativo) WHERE ativo = TRUE;

-- ==========================================
-- 3. BAIRROS
-- ==========================================
CREATE TABLE IF NOT EXISTS bairros (
  id SERIAL PRIMARY KEY,
  cidade_id INT NOT NULL REFERENCES cidades(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cidade_id, slug)
);

COMMENT ON TABLE bairros IS 'Bairros para rotas SEO: /[estado]/[cidade]/[slug]';
CREATE INDEX idx_bairros_slug ON bairros(slug);
CREATE INDEX idx_bairros_cidade_id ON bairros(cidade_id);
CREATE INDEX idx_bairros_ativo ON bairros(ativo) WHERE ativo = TRUE;
