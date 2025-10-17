-- =====================================
-- RPG PLAYER - ESTRUTURA DO BANCO DE DADOS
-- Supabase (PostgreSQL)
-- =====================================

-- EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================
-- TABELA: PROFILES (PERFIS DE USUÁRIO)
-- =====================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dados do Onboarding
    display_name VARCHAR(100),
    avatar_url TEXT,
    avatar_type VARCHAR(20) DEFAULT 'preset', -- 'upload' ou 'preset'
    age INTEGER,
    experience_level VARCHAR(20), -- 'iniciante', 'intermediario', 'avancado'
    preferred_role VARCHAR(20), -- 'jogador', 'mestre', 'ambos'
    
    -- Status e Configurações
    onboarding_completed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Estatísticas
    total_characters INTEGER DEFAULT 0,
    total_campaigns INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    player_level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    
    -- Metadados
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    
    CONSTRAINT valid_experience_level CHECK (experience_level IN ('iniciante', 'intermediario', 'avancado')),
    CONSTRAINT valid_role CHECK (preferred_role IN ('jogador', 'mestre', 'ambos')),
    CONSTRAINT valid_age CHECK (age >= 13 AND age <= 120)
);

-- =====================================
-- TABELA: CHARACTERS (PERSONAGENS)
-- =====================================
CREATE TABLE public.characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relacionamentos
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID, -- Referência para campanhas (será criada depois)
    
    -- Dados Básicos
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    character_class VARCHAR(50),
    race VARCHAR(50),
    background VARCHAR(100),
    alignment VARCHAR(50),
    
    -- Atributos Básicos (D&D 5e style)
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    hit_points_max INTEGER DEFAULT 8,
    hit_points_current INTEGER DEFAULT 8,
    armor_class INTEGER DEFAULT 10,
    speed INTEGER DEFAULT 30,
    
    -- Atributos Principais
    strength INTEGER DEFAULT 10,
    dexterity INTEGER DEFAULT 10,
    constitution INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    wisdom INTEGER DEFAULT 10,
    charisma INTEGER DEFAULT 10,
    
    -- Proficiências e Habilidades
    proficiency_bonus INTEGER DEFAULT 2,
    saving_throws JSONB DEFAULT '{}',
    skills JSONB DEFAULT '{}',
    
    -- Equipamentos e Inventário
    equipment JSONB DEFAULT '[]',
    weapons JSONB DEFAULT '[]',
    armor JSONB DEFAULT '{}',
    inventory JSONB DEFAULT '[]',
    currency JSONB DEFAULT '{"copper": 0, "silver": 0, "gold": 0, "platinum": 0}',
    
    -- Magias (se aplicável)
    spells JSONB DEFAULT '[]',
    spell_slots JSONB DEFAULT '{}',
    
    -- História e Personalidade
    backstory TEXT,
    personality_traits TEXT,
    ideals TEXT,
    bonds TEXT,
    flaws TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Metadados
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    CONSTRAINT valid_level CHECK (level >= 1 AND level <= 20),
    CONSTRAINT valid_attributes CHECK (
        strength >= 1 AND strength <= 30 AND
        dexterity >= 1 AND dexterity <= 30 AND
        constitution >= 1 AND constitution <= 30 AND
        intelligence >= 1 AND intelligence <= 30 AND
        wisdom >= 1 AND wisdom <= 30 AND
        charisma >= 1 AND charisma <= 30
    )
);

-- =====================================
-- TABELA: CAMPAIGNS (CAMPANHAS/MESAS)
-- =====================================
CREATE TABLE public.campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dados Básicos
    name VARCHAR(200) NOT NULL,
    description TEXT,
    system VARCHAR(50) DEFAULT 'D&D 5e', -- Sistema de RPG
    setting TEXT, -- Ambientação
    
    -- Organização
    dm_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL, -- Dungeon Master
    max_players INTEGER DEFAULT 6,
    current_players INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'recruiting', -- 'recruiting', 'active', 'paused', 'completed'
    is_public BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT TRUE,
    
    -- Configurações
    session_frequency VARCHAR(50), -- 'weekly', 'biweekly', 'monthly', 'irregular'
    session_duration INTEGER DEFAULT 240, -- em minutos
    time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    preferred_days JSONB DEFAULT '[]', -- ['monday', 'wednesday', 'friday']
    preferred_times JSONB DEFAULT '{}', -- {'start': '19:00', 'end': '23:00'}
    
    -- Conteúdo
    current_level_range VARCHAR(20) DEFAULT '1-3', -- '1-5', '6-10', etc
    content_rating VARCHAR(10) DEFAULT 'teen', -- 'family', 'teen', 'mature'
    themes JSONB DEFAULT '[]', -- ['adventure', 'mystery', 'combat', 'roleplay']
    
    -- Metadados
    house_rules TEXT,
    additional_info TEXT,
    image_url TEXT,
    
    CONSTRAINT valid_status CHECK (status IN ('recruiting', 'active', 'paused', 'completed')),
    CONSTRAINT valid_max_players CHECK (max_players >= 1 AND max_players <= 12),
    CONSTRAINT valid_rating CHECK (content_rating IN ('family', 'teen', 'mature'))
);

-- =====================================
-- TABELA: CAMPAIGN_PLAYERS (JOGADORES DA CAMPANHA)
-- =====================================
CREATE TABLE public.campaign_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relacionamentos
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'active', 'inactive', 'removed'
    role VARCHAR(20) DEFAULT 'player', -- 'player', 'co-dm', 'observer'
    
    -- Metadados
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    application_message TEXT,
    notes TEXT,
    
    CONSTRAINT valid_player_status CHECK (status IN ('pending', 'approved', 'active', 'inactive', 'removed')),
    CONSTRAINT valid_player_role CHECK (role IN ('player', 'co-dm', 'observer')),
    CONSTRAINT unique_user_per_campaign UNIQUE(campaign_id, user_id)
);

-- =====================================
-- TABELA: SESSIONS (SESSÕES DE JOGO)
-- =====================================
CREATE TABLE public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relacionamentos
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
    
    -- Dados da Sessão
    session_number INTEGER NOT NULL,
    title VARCHAR(200),
    summary TEXT,
    
    -- Agendamento
    scheduled_date TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'active', 'completed', 'cancelled'
    
    -- Conteúdo
    session_notes TEXT,
    dm_notes TEXT,
    experience_awarded INTEGER DEFAULT 0,
    treasure_awarded JSONB DEFAULT '{}',
    
    -- Participação
    players_present JSONB DEFAULT '[]', -- UUIDs dos jogadores presentes
    players_absent JSONB DEFAULT '[]', -- UUIDs dos jogadores ausentes
    
    CONSTRAINT valid_session_status CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    CONSTRAINT unique_session_per_campaign UNIQUE(campaign_id, session_number)
);

-- =====================================
-- TABELA: ACTIVITY_LOG (LOG DE ATIVIDADES)
-- =====================================
CREATE TABLE public.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relacionamentos
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
    
    -- Dados da Atividade
    activity_type VARCHAR(50) NOT NULL, -- 'character_created', 'campaign_joined', 'session_completed', etc
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE
);

-- =====================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================
CREATE INDEX idx_profiles_user_id ON public.profiles(id);
CREATE INDEX idx_characters_user_id ON public.characters(user_id);
CREATE INDEX idx_characters_campaign_id ON public.characters(campaign_id);
CREATE INDEX idx_campaigns_dm_user_id ON public.campaigns(dm_user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaign_players_campaign_id ON public.campaign_players(campaign_id);
CREATE INDEX idx_campaign_players_user_id ON public.campaign_players(user_id);
CREATE INDEX idx_sessions_campaign_id ON public.sessions(campaign_id);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- =====================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================

-- Habilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Policies para PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies para CHARACTERS
CREATE POLICY "Users can view own characters" ON public.characters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own characters" ON public.characters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters" ON public.characters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters" ON public.characters
    FOR DELETE USING (auth.uid() = user_id);

-- Policies para CAMPAIGNS
CREATE POLICY "Everyone can view public campaigns" ON public.campaigns
    FOR SELECT USING (is_public = true);

CREATE POLICY "DMs can manage their campaigns" ON public.campaigns
    FOR ALL USING (auth.uid() = dm_user_id);

CREATE POLICY "Players can view their campaigns" ON public.campaigns
    FOR SELECT USING (
        id IN (
            SELECT campaign_id FROM public.campaign_players 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Policies para CAMPAIGN_PLAYERS
CREATE POLICY "Users can view campaign players for their campaigns" ON public.campaign_players
    FOR SELECT USING (
        user_id = auth.uid() OR 
        campaign_id IN (
            SELECT id FROM public.campaigns WHERE dm_user_id = auth.uid()
        ) OR
        campaign_id IN (
            SELECT campaign_id FROM public.campaign_players 
            WHERE user_id = auth.uid()
        )
    );

-- Policies para SESSIONS
CREATE POLICY "Campaign members can view sessions" ON public.sessions
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM public.campaigns WHERE dm_user_id = auth.uid()
            UNION
            SELECT campaign_id FROM public.campaign_players 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Policies para ACTIVITY_LOG
CREATE POLICY "Users can view own activities" ON public.activity_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view public activities" ON public.activity_log
    FOR SELECT USING (is_public = true);

-- =====================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplica o trigger nas tabelas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================
-- FUNÇÕES UTILITÁRIAS
-- =====================================

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================
-- TABELAS DE DADOS DO JOGO (D&D 5e)
-- =====================================

-- TABELA: RACES (RAÇAS)
CREATE TABLE public.game_races (
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
CREATE TABLE public.game_classes (
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
CREATE TABLE public.game_backgrounds (
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
CREATE TABLE public.game_feats (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source VARCHAR(100),
    prerequisite TEXT,
    description TEXT,
    abilityScoreIncrease JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: LANGUAGES (IDIOMAS)
CREATE TABLE public.game_languages (
    id VARCHAR(50) PRIMARY KEY,
    languages JSONB NOT NULL,
    scripts TEXT[],
    notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: ALIGNMENTS (TENDÊNCIAS)
CREATE TABLE public.game_alignments (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(10),
    descricao TEXT,
    caracteristicas TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA: EQUIPMENT (EQUIPAMENTOS)
CREATE TABLE public.game_equipment (
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
CREATE TABLE public.game_weapons (
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
CREATE TABLE public.game_armor (
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
COMMENT ON TABLE public.profiles IS 'Perfis de usuário com dados do onboarding';
COMMENT ON TABLE public.characters IS 'Personagens criados pelos usuários';
COMMENT ON TABLE public.campaigns IS 'Campanhas/Mesas de RPG';
COMMENT ON TABLE public.campaign_players IS 'Relacionamento entre jogadores e campanhas';
COMMENT ON TABLE public.sessions IS 'Sessões de jogo das campanhas';
COMMENT ON TABLE public.activity_log IS 'Log de atividades dos usuários';
COMMENT ON TABLE public.game_races IS 'Raças disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_classes IS 'Classes disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_backgrounds IS 'Antecedentes disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_feats IS 'Talentos disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_languages IS 'Idiomas disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_alignments IS 'Tendências disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_equipment IS 'Equipamentos disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_weapons IS 'Armas disponíveis (D&D 5e)';
COMMENT ON TABLE public.game_armor IS 'Armaduras disponíveis (D&D 5e)';