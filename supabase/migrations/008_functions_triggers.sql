-- ==========================================
-- PEDIRCOTACAO — MIGRATION 008: FUNCTIONS & TRIGGERS
-- Lógica de negócio no banco de dados
-- ==========================================

-- ==========================================
-- 1. AUTO-UPDATE updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_pagamentos_updated_at
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conteudo_seo_updated_at
  BEFORE UPDATE ON conteudo_seo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- 2. AUTO-CREATE CREDITOS QUANDO EMPRESA É CRIADA
-- ==========================================
CREATE OR REPLACE FUNCTION create_creditos_for_empresa()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO creditos (empresa_id, saldo, total_comprado, total_consumido, total_reembolsado)
  VALUES (NEW.id, 0, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_empresa_create_creditos
  AFTER INSERT ON empresas
  FOR EACH ROW EXECUTE FUNCTION create_creditos_for_empresa();

-- ==========================================
-- 3. DEDUZIR CRÉDITO AO DISTRIBUIR LEAD
-- Chamada via service role ao distribuir lead
-- ==========================================
CREATE OR REPLACE FUNCTION deduzir_credito(
  p_empresa_id UUID,
  p_lead_distribuicao_id UUID,
  p_quantidade INT DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_saldo_atual INT;
  v_novo_saldo INT;
BEGIN
  -- Lock row para evitar race condition
  SELECT saldo INTO v_saldo_atual
  FROM creditos
  WHERE empresa_id = p_empresa_id
  FOR UPDATE;

  IF v_saldo_atual IS NULL OR v_saldo_atual < p_quantidade THEN
    RETURN FALSE; -- Saldo insuficiente
  END IF;

  v_novo_saldo := v_saldo_atual - p_quantidade;

  -- Atualizar saldo
  UPDATE creditos
  SET saldo = v_novo_saldo,
      total_consumido = total_consumido + p_quantidade,
      updated_at = NOW()
  WHERE empresa_id = p_empresa_id;

  -- Registrar transação
  INSERT INTO creditos_transacoes (empresa_id, tipo, quantidade, saldo_apos, lead_distribuicao_id, descricao)
  VALUES (p_empresa_id, 'consumo', -p_quantidade, v_novo_saldo, p_lead_distribuicao_id, 'Lead recebido — débito automático');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. CREDITAR APÓS PAGAMENTO CONFIRMADO
-- Chamada pelo webhook do Pagar.me
-- ==========================================
CREATE OR REPLACE FUNCTION creditar_por_pagamento(
  p_empresa_id UUID,
  p_pagamento_id UUID,
  p_pacote_id INT,
  p_quantidade INT
)
RETURNS VOID AS $$
DECLARE
  v_novo_saldo INT;
BEGIN
  -- Atualizar saldo
  UPDATE creditos
  SET saldo = saldo + p_quantidade,
      total_comprado = total_comprado + p_quantidade,
      updated_at = NOW()
  WHERE empresa_id = p_empresa_id
  RETURNING saldo INTO v_novo_saldo;

  -- Registrar transação
  INSERT INTO creditos_transacoes (empresa_id, tipo, quantidade, saldo_apos, pacote_id, pagamento_id, descricao)
  VALUES (p_empresa_id, 'compra', p_quantidade, v_novo_saldo, p_pacote_id, p_pagamento_id, 'Créditos adicionados via pagamento');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. REEMBOLSAR CRÉDITO (Lead inválido)
-- ==========================================
CREATE OR REPLACE FUNCTION reembolsar_credito(
  p_lead_distribuicao_id UUID,
  p_motivo TEXT DEFAULT 'Lead inválido'
)
RETURNS VOID AS $$
DECLARE
  v_empresa_id UUID;
  v_creditos INT;
  v_novo_saldo INT;
BEGIN
  -- Buscar dados da distribuição
  SELECT empresa_id, creditos_cobrados INTO v_empresa_id, v_creditos
  FROM lead_distribuicoes
  WHERE id = p_lead_distribuicao_id AND status != 'reembolsado';

  IF v_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Distribuição não encontrada ou já reembolsada';
  END IF;

  -- Marcar como reembolsado
  UPDATE lead_distribuicoes
  SET status = 'reembolsado',
      reembolsado_em = NOW(),
      motivo_reembolso = p_motivo
  WHERE id = p_lead_distribuicao_id;

  -- Devolver créditos
  UPDATE creditos
  SET saldo = saldo + v_creditos,
      total_reembolsado = total_reembolsado + v_creditos,
      updated_at = NOW()
  WHERE empresa_id = v_empresa_id
  RETURNING saldo INTO v_novo_saldo;

  -- Registrar transação
  INSERT INTO creditos_transacoes (empresa_id, tipo, quantidade, saldo_apos, lead_distribuicao_id, descricao)
  VALUES (v_empresa_id, 'reembolso', v_creditos, v_novo_saldo, p_lead_distribuicao_id, 'Reembolso: ' || p_motivo);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. SCORING DE LEAD (Qualificação automática)
-- ==========================================
CREATE OR REPLACE FUNCTION calcular_score_lead()
RETURNS TRIGGER AS $$
DECLARE
  v_score INT := 0;
BEGIN
  -- +30 se tem telefone
  IF NEW.telefone IS NOT NULL AND NEW.telefone != '' THEN
    v_score := v_score + 30;
  END IF;

  -- +15 se tem email
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    v_score := v_score + 15;
  END IF;

  -- +20 se tem mensagem com mais de 20 chars
  IF NEW.mensagem IS NOT NULL AND LENGTH(NEW.mensagem) > 20 THEN
    v_score := v_score + 20;
  END IF;

  -- +10 se pessoa jurídica
  IF NEW.tipo_pessoa = 'juridica' THEN
    v_score := v_score + 10;
  END IF;

  -- +15 se urgente
  IF NEW.urgencia = 'urgente' THEN
    v_score := v_score + 15;
  ELSIF NEW.urgencia = 'normal' THEN
    v_score := v_score + 5;
  END IF;

  -- +10 se tem bairro específico
  IF NEW.bairro_id IS NOT NULL THEN
    v_score := v_score + 10;
  END IF;

  NEW.score := LEAST(v_score, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lead_score
  BEFORE INSERT ON leads
  FOR EACH ROW EXECUTE FUNCTION calcular_score_lead();
