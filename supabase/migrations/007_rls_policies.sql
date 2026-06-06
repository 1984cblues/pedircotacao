-- ==========================================
-- PEDIRCOTACAO — MIGRATION 007: RLS POLICIES
-- Row Level Security para todas as tabelas
-- ==========================================

-- ==========================================
-- GEO TABLES — Leitura pública
-- ==========================================
ALTER TABLE estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE cidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE bairros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Geo tables are publicly readable"
  ON estados FOR SELECT USING (true);
CREATE POLICY "Cidades are publicly readable"
  ON cidades FOR SELECT USING (true);
CREATE POLICY "Bairros are publicly readable"
  ON bairros FOR SELECT USING (true);

-- ==========================================
-- SERVIÇOS — Leitura pública
-- ==========================================
ALTER TABLE categorias_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias are publicly readable"
  ON categorias_servico FOR SELECT USING (true);
CREATE POLICY "Servicos are publicly readable"
  ON servicos FOR SELECT USING (true);

-- ==========================================
-- EMPRESAS — Owner CRUD + Público para aprovadas
-- ==========================================
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_areas_atendimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_servicos ENABLE ROW LEVEL SECURITY;

-- Empresa: owner pode ver/editar
CREATE POLICY "Owner can view own empresa"
  ON empresas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Approved empresas are publicly viewable"
  ON empresas FOR SELECT
  USING (status = 'aprovada');

CREATE POLICY "Owner can update own empresa"
  ON empresas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create empresa"
  ON empresas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Áreas de atendimento
CREATE POLICY "Owner can manage own areas"
  ON empresa_areas_atendimento FOR ALL
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()));

CREATE POLICY "Areas of approved empresas are public"
  ON empresa_areas_atendimento FOR SELECT
  USING (empresa_id IN (SELECT id FROM empresas WHERE status = 'aprovada'));

-- Serviços da empresa
CREATE POLICY "Owner can manage own servicos"
  ON empresa_servicos FOR ALL
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()));

CREATE POLICY "Servicos of approved empresas are public"
  ON empresa_servicos FOR SELECT
  USING (empresa_id IN (SELECT id FROM empresas WHERE status = 'aprovada'));

-- ==========================================
-- LEADS — Insert público + Distribuição para empresa
-- ==========================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_distribuicoes ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode submeter lead (insert via anon)
CREATE POLICY "Anyone can submit leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Leads são gerenciados via service role (distribuição, scoring)
-- Empresas só veem leads via lead_distribuicoes

-- Distribuições: empresa vê apenas suas
CREATE POLICY "Empresa can view own lead distributions"
  ON lead_distribuicoes FOR SELECT
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()));

CREATE POLICY "Empresa can update own distribution status"
  ON lead_distribuicoes FOR UPDATE
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()));

-- ==========================================
-- CRÉDITOS — Apenas owner
-- ==========================================
ALTER TABLE creditos ENABLE ROW LEVEL SECURITY;
ALTER TABLE creditos_transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacotes_credito ENABLE ROW LEVEL SECURITY;

-- Pacotes são públicos (página de preços)
CREATE POLICY "Pacotes are publicly readable"
  ON pacotes_credito FOR SELECT USING (true);

-- Saldo: apenas owner
CREATE POLICY "Owner can view own creditos"
  ON creditos FOR SELECT
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()));

-- Transações: apenas owner
CREATE POLICY "Owner can view own transactions"
  ON creditos_transacoes FOR SELECT
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()));

-- Pagamentos: apenas owner
CREATE POLICY "Owner can view own payments"
  ON pagamentos FOR SELECT
  USING (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()));

CREATE POLICY "Owner can create payments"
  ON pagamentos FOR INSERT
  WITH CHECK (empresa_id IN (SELECT id FROM empresas WHERE user_id = auth.uid()));

-- ==========================================
-- CONTEÚDO SEO — Leitura pública
-- ==========================================
ALTER TABLE conteudo_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SEO content is publicly readable"
  ON conteudo_seo FOR SELECT USING (true);

-- ==========================================
-- AUDIT LOG — Apenas service role
-- ==========================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
-- Sem policies para anon/authenticated — apenas service_role acessa

-- ==========================================
-- GRANTS
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Anon: leitura geo + serviços + empresas aprovadas + inserir leads
GRANT SELECT ON estados, cidades, bairros, categorias_servico, servicos, conteudo_seo, pacotes_credito TO anon;
GRANT SELECT ON empresas, empresa_areas_atendimento, empresa_servicos TO anon;
GRANT INSERT ON leads TO anon;

-- Authenticated: tudo que anon + CRUD empresa + ver leads/créditos
GRANT SELECT ON estados, cidades, bairros, categorias_servico, servicos, conteudo_seo, pacotes_credito TO authenticated;
GRANT SELECT, INSERT, UPDATE ON empresas TO authenticated;
GRANT ALL ON empresa_areas_atendimento, empresa_servicos TO authenticated;
GRANT SELECT, UPDATE ON lead_distribuicoes TO authenticated;
GRANT SELECT ON creditos, creditos_transacoes TO authenticated;
GRANT SELECT, INSERT ON pagamentos TO authenticated;
GRANT INSERT ON leads TO authenticated;

-- Sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
