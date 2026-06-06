-- ==========================================
-- PEDIRCOTACAO — MIGRATION 003: EMPRESAS (PRESTADORES)
-- Cadastro de empresas prestadoras de serviço
-- ==========================================

-- ==========================================
-- 1. EMPRESAS
-- ==========================================
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  website TEXT,
  endereco TEXT,
  cidade_id INT REFERENCES cidades(id),
  -- Moderação
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'aprovada', 'suspensa', 'rejeitada')),
  motivo_rejeicao TEXT,
  aprovada_em TIMESTAMPTZ,
  -- Config de notificação
  notificar_email BOOLEAN DEFAULT TRUE,
  notificar_whatsapp BOOLEAN DEFAULT TRUE,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE empresas IS 'Empresas prestadoras que recebem leads e pagam por créditos';
CREATE INDEX idx_empresas_user_id ON empresas(user_id);
CREATE INDEX idx_empresas_slug ON empresas(slug);
CREATE INDEX idx_empresas_status ON empresas(status);
CREATE INDEX idx_empresas_cidade_id ON empresas(cidade_id);

-- ==========================================
-- 2. ÁREAS DE ATENDIMENTO
-- Onde a empresa atende (N:N com cidades e bairros)
-- ==========================================
CREATE TABLE IF NOT EXISTS empresa_areas_atendimento (
  id SERIAL PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  cidade_id INT NOT NULL REFERENCES cidades(id) ON DELETE CASCADE,
  bairro_id INT REFERENCES bairros(id) ON DELETE CASCADE, -- NULL = atende toda a cidade
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, cidade_id, bairro_id)
);

COMMENT ON TABLE empresa_areas_atendimento IS 'Define onde cada empresa atende. bairro_id NULL = atende cidade inteira.';
CREATE INDEX idx_empresa_areas_empresa_id ON empresa_areas_atendimento(empresa_id);
CREATE INDEX idx_empresa_areas_cidade_id ON empresa_areas_atendimento(cidade_id);
CREATE INDEX idx_empresa_areas_bairro_id ON empresa_areas_atendimento(bairro_id);

-- ==========================================
-- 3. SERVIÇOS DA EMPRESA
-- Quais serviços a empresa oferece (N:N)
-- ==========================================
CREATE TABLE IF NOT EXISTS empresa_servicos (
  id SERIAL PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  servico_id INT NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  preco_lead INT, -- Override do preço base (centavos). NULL = usa base.
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, servico_id)
);

COMMENT ON TABLE empresa_servicos IS 'Relaciona empresa ↔ serviço. Permite override de preço por lead.';
CREATE INDEX idx_empresa_servicos_empresa_id ON empresa_servicos(empresa_id);
CREATE INDEX idx_empresa_servicos_servico_id ON empresa_servicos(servico_id);
