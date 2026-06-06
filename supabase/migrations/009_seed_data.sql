-- ==========================================
-- PEDIRCOTACAO — MIGRATION 009: SEED DATA
-- Dados iniciais: SP, 6 cidades P1, 42 bairros, 12 serviços
-- ==========================================

-- ==========================================
-- 1. ESTADO: São Paulo
-- ==========================================
INSERT INTO estados (nome, sigla, slug) VALUES
  ('São Paulo', 'SP', 'sp');

-- ==========================================
-- 2. CIDADES (Alto Tietê — P1)
-- ==========================================
INSERT INTO cidades (estado_id, nome, slug, ibge_id, ativo) VALUES
  (1, 'Arujá',                 'aruja',                3503901, TRUE),
  (1, 'Santa Isabel',          'santa-isabel',         3546801, TRUE),
  (1, 'Guararema',             'guararema',            3518305, TRUE),
  (1, 'Itaquaquecetuba',       'itaquaquecetuba',      3523107, TRUE),
  (1, 'Poá',                   'poa',                  3539806, TRUE),
  (1, 'Ferraz de Vasconcelos', 'ferraz-de-vasconcelos', 3515707, TRUE);

-- ==========================================
-- 3. BAIRROS POR CIDADE
-- ==========================================

-- Arujá (cidade_id = 1)
INSERT INTO bairros (cidade_id, nome, slug) VALUES
  (1, 'Centro',              'centro'),
  (1, 'Jardim Caguassu',     'jardim-caguassu'),
  (1, 'Jardim São Francisco','jardim-sao-francisco'),
  (1, 'Jardim Adriana',      'jardim-adriana'),
  (1, 'Nova Arujá',          'nova-aruja'),
  (1, 'Bairro dos Pires',    'bairro-dos-pires');

-- Santa Isabel (cidade_id = 2)
INSERT INTO bairros (cidade_id, nome, slug) VALUES
  (2, 'Centro',              'centro'),
  (2, 'Jardim Panorama',     'jardim-panorama'),
  (2, 'Bairro da Aparecida', 'bairro-da-aparecida'),
  (2, 'Vila Nova',           'vila-nova'),
  (2, 'Recanto dos Pássaros','recanto-dos-passaros');

-- Guararema (cidade_id = 3)
INSERT INTO bairros (cidade_id, nome, slug) VALUES
  (3, 'Centro',              'centro'),
  (3, 'Bairro da Estação',   'bairro-da-estacao'),
  (3, 'Vila São João',       'vila-sao-joao'),
  (3, 'Chácaras',            'chacaras'),
  (3, 'Itapema',             'itapema');

-- Itaquaquecetuba (cidade_id = 4)
INSERT INTO bairros (cidade_id, nome, slug) VALUES
  (4, 'Centro',              'centro'),
  (4, 'Campo Limpo',         'campo-limpo'),
  (4, 'Cidade Kemel',        'cidade-kemel'),
  (4, 'Jardim Bom Clima',    'jardim-bom-clima'),
  (4, 'Jardim Luciana',      'jardim-luciana'),
  (4, 'Jardim Nova Itaquá',  'jardim-nova-itaqua'),
  (4, 'Morro Grande',        'morro-grande'),
  (4, 'Paço Itaquá',         'paco-itaqua'),
  (4, 'Rio Verde',           'rio-verde'),
  (4, 'Tanque Grande',       'tanque-grande');

-- Poá (cidade_id = 5)
INSERT INTO bairros (cidade_id, nome, slug) VALUES
  (5, 'Centro',              'centro'),
  (5, 'Jardim Conquista',    'jardim-conquista'),
  (5, 'Jardim Itamarati',    'jardim-itamarati'),
  (5, 'Vila Pindorama',      'vila-pindorama'),
  (5, 'Jardim Belvedere',    'jardim-belvedere'),
  (5, 'Estância Japonesa',   'estancia-japonesa');

-- Ferraz de Vasconcelos (cidade_id = 6)
INSERT INTO bairros (cidade_id, nome, slug) VALUES
  (6, 'Centro',              'centro'),
  (6, 'Jardim São Francisco',    'jardim-sao-francisco'),
  (6, 'Jardim Santa Terezinha',  'jardim-santa-terezinha'),
  (6, 'Vila Nova Ferraz',        'vila-nova-ferraz'),
  (6, 'Parque Interlagos',       'parque-interlagos'),
  (6, 'Jardim Presidente Dutra', 'jardim-presidente-dutra'),
  (6, 'Vila Brasil',             'vila-brasil'),
  (6, 'Cidade Kemel',            'cidade-kemel'),
  (6, 'Parque Daslu',            'parque-daslu'),
  (6, 'Jardim das Orquídeas',    'jardim-das-orquideas');

-- ==========================================
-- 4. CATEGORIAS DE SERVIÇO
-- ==========================================
INSERT INTO categorias_servico (nome, slug, descricao, ordem) VALUES
  ('Análises Laboratoriais', 'analises-laboratoriais', 'Serviços de análise e ensaios laboratoriais para solo, água, ar e efluentes', 1),
  ('Serviços Ambientais',    'servicos-ambientais',    'Licenciamento, estudos de impacto, remediação e gestão ambiental', 2),
  ('Geotecnia',              'geotecnia',              'Sondagem, análise geotécnica e fundações', 3);

-- ==========================================
-- 5. SERVIÇOS
-- ==========================================
INSERT INTO servicos (categoria_id, nome, slug, descricao_curta, preco_lead_base, ordem) VALUES
  -- Análises Laboratoriais (categoria_id = 1)
  (1, 'Análise de Solo',       'analise-de-solo',       'Análise laboratorial de solo para construção, agricultura e meio ambiente', 500, 1),
  (1, 'Análise de Água',       'analise-de-agua',       'Análise de potabilidade, qualidade e contaminantes em água', 500, 2),
  (1, 'Análise de Efluentes',  'analise-de-efluentes',  'Análise e monitoramento de efluentes industriais e domésticos', 600, 3),
  (1, 'Análise de Ar',         'analise-de-ar',         'Monitoramento de qualidade do ar e emissões atmosféricas', 700, 4),

  -- Serviços Ambientais (categoria_id = 2)
  (2, 'Licenciamento Ambiental',       'licenciamento-ambiental',       'Obtenção de licenças ambientais (LP, LI, LO) junto aos órgãos competentes', 1000, 5),
  (2, 'Estudo de Impacto Ambiental',   'estudo-de-impacto-ambiental',   'Elaboração de EIA/RIMA para empreendimentos', 1500, 6),
  (2, 'Outorga de Água',               'outorga-de-agua',               'Obtenção de outorga para uso de recursos hídricos', 800, 7),
  (2, 'Remediação de Solo',            'remediacao-de-solo',            'Descontaminação e remediação de áreas contaminadas', 1200, 8),
  (2, 'Gerenciamento de Resíduos',     'gerenciamento-de-residuos',     'Plano de gerenciamento de resíduos sólidos (PGRS)', 600, 9),
  (2, 'Laudo Técnico Ambiental',       'laudo-tecnico-ambiental',       'Elaboração de laudos e relatórios técnicos ambientais', 800, 10),

  -- Geotecnia (categoria_id = 3)
  (3, 'Piso Industrial',       'piso-industrial',       'Execução e consultoria para pisos industriais de alto desempenho', 800, 11),
  (3, 'Sondagem de Solo (SPT)','sondagem-de-solo',      'Sondagem a percussão (SPT) para investigação geotécnica', 700, 12);

-- ==========================================
-- 6. PACOTES DE CRÉDITO
-- ==========================================
INSERT INTO pacotes_credito (nome, descricao, quantidade, preco_centavos, economia_percentual, destaque, ordem) VALUES
  ('Starter',     'Ideal para testar o serviço',                10,   4900,  0,  FALSE, 1),
  ('Profissional','O mais popular entre prestadores',           30,  12900, 12,  TRUE,  2),
  ('Business',    'Para empresas com alto volume de atendimento',100, 34900, 30,  FALSE, 3);
