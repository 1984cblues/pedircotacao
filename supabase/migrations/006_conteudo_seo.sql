-- ==========================================
-- PEDIRCOTACAO — MIGRATION 006: CONTEUDO SEO
-- Conteúdo programático único por página
-- ==========================================

-- ==========================================
-- 1. CONTEÚDO SEO POR PÁGINA
-- Armazena variações de copy geradas por IA
-- ==========================================
CREATE TABLE IF NOT EXISTS conteudo_seo (
  id SERIAL PRIMARY KEY,
  -- Chaves compostas da rota
  servico_id INT NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  cidade_id INT NOT NULL REFERENCES cidades(id) ON DELETE CASCADE,
  bairro_id INT REFERENCES bairros(id) ON DELETE CASCADE,
  -- Conteúdo da página
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1 TEXT NOT NULL,
  h2 TEXT,
  intro_paragraph TEXT NOT NULL, -- Parágrafo único anti-duplicate
  cta_text TEXT,
  -- FAQ programática (JSON array)
  faqs JSONB DEFAULT '[]', -- [{pergunta: "...", resposta: "..."}]
  -- Controle
  gerado_por TEXT DEFAULT 'gemini-3-flash', -- Modelo que gerou
  revisado BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(servico_id, cidade_id, bairro_id)
);

COMMENT ON TABLE conteudo_seo IS 'Conteúdo SEO único por combinação serviço+cidade+bairro. Evita duplicate content.';
CREATE INDEX idx_conteudo_seo_servico ON conteudo_seo(servico_id);
CREATE INDEX idx_conteudo_seo_cidade ON conteudo_seo(cidade_id);
CREATE INDEX idx_conteudo_seo_bairro ON conteudo_seo(bairro_id);
CREATE INDEX idx_conteudo_seo_lookup ON conteudo_seo(servico_id, cidade_id, bairro_id);

-- ==========================================
-- 2. AUDIT LOG (Segurança OWASP A09)
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  evento TEXT NOT NULL, -- 'login', 'lead_submit', 'credito_compra', etc.
  detalhes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE audit_log IS 'Log de auditoria para eventos de segurança (OWASP A09).';
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_evento ON audit_log(evento);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
