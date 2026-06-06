-- ==========================================
-- PEDIRCOTACAO — MIGRATION 005: CREDITS & PAYMENTS
-- Sistema de créditos e pagamentos via Pagar.me
-- ==========================================

-- ==========================================
-- 1. PACOTES DE CRÉDITO (Produtos à venda)
-- ==========================================
CREATE TABLE IF NOT EXISTS pacotes_credito (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  quantidade INT NOT NULL, -- Quantidade de créditos
  preco_centavos INT NOT NULL, -- Preço em centavos (R$)
  economia_percentual INT DEFAULT 0, -- "Economize X%"
  destaque BOOLEAN DEFAULT FALSE, -- Pacote destacado na UI
  ativo BOOLEAN DEFAULT TRUE,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pacotes_credito IS 'Pacotes de créditos à venda. Cada crédito = 1 lead recebido.';

-- ==========================================
-- 2. SALDO DE CRÉDITOS (por empresa)
-- ==========================================
CREATE TABLE IF NOT EXISTS creditos (
  empresa_id UUID PRIMARY KEY REFERENCES empresas(id) ON DELETE CASCADE,
  saldo INT NOT NULL DEFAULT 0 CHECK (saldo >= 0),
  total_comprado INT NOT NULL DEFAULT 0,
  total_consumido INT NOT NULL DEFAULT 0,
  total_reembolsado INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE creditos IS 'Saldo consolidado de créditos por empresa. Atualizado via triggers.';

-- ==========================================
-- 3. TRANSAÇÕES DE CRÉDITO (Histórico)
-- ==========================================
CREATE TABLE IF NOT EXISTS creditos_transacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('compra', 'consumo', 'reembolso', 'bonus', 'trial', 'ajuste_admin')),
  quantidade INT NOT NULL, -- Positivo = crédito, Negativo = débito
  saldo_apos INT NOT NULL, -- Saldo após esta transação
  -- Referências opcionais
  lead_distribuicao_id UUID REFERENCES lead_distribuicoes(id),
  pacote_id INT REFERENCES pacotes_credito(id),
  pagamento_id UUID, -- FK para pagamentos (será criada depois)
  -- Metadata
  descricao TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE creditos_transacoes IS 'Log imutável de todas as movimentações de crédito. Auditoria financeira.';
CREATE INDEX idx_cred_trans_empresa_id ON creditos_transacoes(empresa_id);
CREATE INDEX idx_cred_trans_tipo ON creditos_transacoes(tipo);
CREATE INDEX idx_cred_trans_created_at ON creditos_transacoes(created_at DESC);

-- ==========================================
-- 4. PAGAMENTOS (Pagar.me)
-- ==========================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  pacote_id INT NOT NULL REFERENCES pacotes_credito(id),
  -- Pagar.me references
  pagarme_order_id TEXT,
  pagarme_charge_id TEXT,
  -- Detalhes
  metodo TEXT NOT NULL CHECK (metodo IN ('pix', 'boleto', 'credit_card')),
  valor_centavos INT NOT NULL,
  creditos_quantidade INT NOT NULL,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'expired')),
  -- Dados do pagamento
  pix_qrcode TEXT,
  pix_qrcode_url TEXT,
  boleto_url TEXT,
  boleto_barcode TEXT,
  -- Timestamps
  pago_em TIMESTAMPTZ,
  expira_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE pagamentos IS 'Pagamentos via Pagar.me. Webhook atualiza status e dispara créditos.';
CREATE INDEX idx_pagamentos_empresa_id ON pagamentos(empresa_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_pagarme_order_id ON pagamentos(pagarme_order_id);
CREATE INDEX idx_pagamentos_created_at ON pagamentos(created_at DESC);

-- Adicionar FK de creditos_transacoes → pagamentos (agora que existe)
ALTER TABLE creditos_transacoes 
  ADD CONSTRAINT fk_cred_trans_pagamento 
  FOREIGN KEY (pagamento_id) REFERENCES pagamentos(id);
