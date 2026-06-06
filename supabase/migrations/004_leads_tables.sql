-- ==========================================
-- PEDIRCOTACAO — MIGRATION 004: LEADS TABLES
-- Sistema de leads e distribuição
-- ==========================================

-- ==========================================
-- 1. LEADS (Solicitações de orçamento)
-- ==========================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Localização (SEO route context)
  servico_id INT NOT NULL REFERENCES servicos(id),
  estado_id INT NOT NULL REFERENCES estados(id),
  cidade_id INT NOT NULL REFERENCES cidades(id),
  bairro_id INT REFERENCES bairros(id),
  -- Dados do solicitante
  nome_cliente TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  mensagem TEXT,
  -- Qualificação
  score INT DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  tipo_pessoa TEXT DEFAULT 'fisica' CHECK (tipo_pessoa IN ('fisica', 'juridica')),
  urgencia TEXT DEFAULT 'normal' CHECK (urgencia IN ('urgente', 'normal', 'sem_pressa')),
  -- Tracking
  status TEXT NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo', 'distribuido', 'expirado', 'invalido')),
  distribuido_para INT DEFAULT 0, -- Quantas empresas receberam
  -- Anti-fraude
  ip_address INET,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  pagina_origem TEXT, -- URL de onde submeteu
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE leads IS 'Solicitações de orçamento enviadas por visitantes das páginas de conversão';
COMMENT ON COLUMN leads.score IS 'Score de qualificação automático (0-100). Baseado em completude dos dados, urgência, etc.';
CREATE INDEX idx_leads_servico_id ON leads(servico_id);
CREATE INDEX idx_leads_cidade_id ON leads(cidade_id);
CREATE INDEX idx_leads_bairro_id ON leads(bairro_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_score ON leads(score DESC);

-- ==========================================
-- 2. LEAD DISTRIBUIÇÕES
-- Cada lead pode ser distribuído para N empresas
-- ==========================================
CREATE TABLE IF NOT EXISTS lead_distribuicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  -- Financeiro
  creditos_cobrados INT NOT NULL DEFAULT 1,
  -- Status do prestador
  status TEXT NOT NULL DEFAULT 'enviado'
    CHECK (status IN ('enviado', 'visualizado', 'respondido', 'convertido', 'reembolsado')),
  -- Timestamps de interação
  visualizado_em TIMESTAMPTZ,
  respondido_em TIMESTAMPTZ,
  convertido_em TIMESTAMPTZ,
  reembolsado_em TIMESTAMPTZ,
  motivo_reembolso TEXT,
  -- Feedback do prestador sobre o lead
  feedback_nota INT CHECK (feedback_nota >= 1 AND feedback_nota <= 5),
  feedback_texto TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, empresa_id)
);

COMMENT ON TABLE lead_distribuicoes IS 'Registro de distribuição de lead para cada empresa. Controla ciclo de vida do lead por prestador.';
CREATE INDEX idx_lead_dist_lead_id ON lead_distribuicoes(lead_id);
CREATE INDEX idx_lead_dist_empresa_id ON lead_distribuicoes(empresa_id);
CREATE INDEX idx_lead_dist_status ON lead_distribuicoes(status);
CREATE INDEX idx_lead_dist_created_at ON lead_distribuicoes(created_at DESC);
