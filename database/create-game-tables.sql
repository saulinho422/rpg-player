-- =====================================
-- TABELAS DE DADOS DO JOGO (D&D 5e)
-- Execute este script APÓS o schema.sql principal
-- =====================================

-- TABELA: RACES (RAÇAS)
CREATE TABLE IF NOT EXISTS public.game_races (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    fonte VARCHAR(100),
    descricao TEXT,
    tamanho VARCHAR(20),
    deslocamento VARCHAR(20),
    aumentoAtributos JSONB,
    habilidades TEXT[],
    idiomas TEXT[],
    idiomasExtras INTEGER DEFAULT 0,
    subracas JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: CLASSES (CLASSES)
CREATE TABLE IF NOT EXISTS public.game_classes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(100),
    hitDice VARCHAR(10),
    proficiencies JSONB,
    equipment JSONB,
    subclasses JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: BACKGROUNDS (ANTECEDENTES)
CREATE TABLE IF NOT EXISTS public.game_backgrounds (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    fonte VARCHAR(100),
    descricao TEXT,
    proficiencias JSONB,
    equipamento TEXT[],
    caracteristica JSONB,
    personalidadesSugeridas JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: FEATS (TALENTOS)
CREATE TABLE IF NOT EXISTS public.game_feats (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(100),
    prerequisite TEXT,
    description TEXT,
    abilityScoreIncrease JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: LANGUAGES (IDIOMAS)
CREATE TABLE IF NOT EXISTS public.game_languages (
    id VARCHAR(50) PRIMARY KEY,
    languages JSONB NOT NULL,
    scripts TEXT[],
    notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: ALIGNMENTS (TENDÊNCIAS)
CREATE TABLE IF NOT EXISTS public.game_alignments (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(10),
    descricao TEXT,
    caracteristicas TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: EQUIPMENT (EQUIPAMENTOS)
CREATE TABLE IF NOT EXISTS public.game_equipment (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    custo VARCHAR(20),
    peso VARCHAR(20),
    descricao TEXT,
    propriedades TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: WEAPONS (ARMAS)
CREATE TABLE IF NOT EXISTS public.game_weapons (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    custo VARCHAR(20),
    dano VARCHAR(20),
    peso VARCHAR(20),
    propriedades TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: ARMOR (ARMADURAS)
CREATE TABLE IF NOT EXISTS public.game_armor (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    custo VARCHAR(20),
    ca VARCHAR(20),
    peso VARCHAR(20),
    furtividade VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- POLÍTICAS RLS (Row Level Security)
-- =====================================

-- Dados do jogo são públicos (apenas leitura)
ALTER TABLE public.game_races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_feats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_alignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_armor ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública para dados do jogo
CREATE POLICY "Dados do jogo são públicos" ON public.game_races FOR SELECT USING (true);
CREATE POLICY "Dados do jogo são públicos" ON public.game_classes FOR SELECT USING (true);
CREATE POLICY "Dados do jogo são públicos" ON public.game_backgrounds FOR SELECT USING (true);
CREATE POLICY "Dados do jogo são públicos" ON public.game_feats FOR SELECT USING (true);
CREATE POLICY "Dados do jogo são públicos" ON public.game_languages FOR SELECT USING (true);
CREATE POLICY "Dados do jogo são públicos" ON public.game_alignments FOR SELECT USING (true);
CREATE POLICY "Dados do jogo são públicos" ON public.game_equipment FOR SELECT USING (true);
CREATE POLICY "Dados do jogo são públicos" ON public.game_weapons FOR SELECT USING (true);
CREATE POLICY "Dados do jogo são públicos" ON public.game_armor FOR SELECT USING (true);

-- =====================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================
COMMENT ON TABLE public.game_races IS 'Raças disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_classes IS 'Classes disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_backgrounds IS 'Antecedentes disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_feats IS 'Talentos disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_languages IS 'Idiomas disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_alignments IS 'Tendências disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_equipment IS 'Equipamentos disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_weapons IS 'Armas disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_armor IS 'Armaduras disponíveis (D&D 5e)';
