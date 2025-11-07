-- ==================================================
-- SCRIPT SQL: NORMALIZAÇÃO DE PERÍCIAS E SALVAGUARDAS
-- ==================================================
-- Data: 2025-11-07
-- Descrição: Cria tabelas normalizadas de perícias e salvaguardas
--            e vincula com classes, raças e backgrounds
-- ==================================================

-- ===========================
-- ETAPA 1: CRIAR TABELAS BASE
-- ===========================

-- Tabela de Perícias (Skills)
CREATE TABLE IF NOT EXISTS game_skills (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(50) NOT NULL UNIQUE,
    name_pt VARCHAR(50) NOT NULL UNIQUE,
    ability_score VARCHAR(20) NOT NULL CHECK (ability_score IN ('strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma')),
    description_pt TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE game_skills IS 'Perícias oficiais do D&D 5e';

-- Tabela de Testes de Resistência (Saving Throws)
CREATE TABLE IF NOT EXISTS game_saving_throws (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(20) NOT NULL UNIQUE,
    name_pt VARCHAR(20) NOT NULL UNIQUE,
    ability_score VARCHAR(20) NOT NULL CHECK (ability_score IN ('strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma')),
    description_pt TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE game_saving_throws IS 'Testes de Resistência do D&D 5e';

-- ===========================
-- ETAPA 2: POPULAR TABELAS BASE
-- ===========================

-- Inserir as 18 perícias oficiais do D&D 5e
INSERT INTO game_skills (name_en, name_pt, ability_score, description_pt) VALUES
('Acrobatics', 'Acrobacia', 'dexterity', 'Manter equilíbrio, saltar, rolar, fazer acrobacias'),
('Animal Handling', 'Lidar com Animais', 'wisdom', 'Acalmar, controlar ou treinar animais'),
('Arcana', 'Arcanismo', 'intelligence', 'Conhecimento sobre magia, planos, criaturas mágicas'),
('Athletics', 'Atletismo', 'strength', 'Escalar, nadar, saltar, lutar corporalmente'),
('Deception', 'Enganação', 'charisma', 'Enganar, blefar, disfarçar-se'),
('History', 'História', 'intelligence', 'Conhecimento sobre eventos históricos, culturas antigas'),
('Insight', 'Intuição', 'wisdom', 'Detectar mentiras, ler emoções, perceber intenções'),
('Intimidation', 'Intimidação', 'charisma', 'Assustar, ameaçar, coagir'),
('Investigation', 'Investigação', 'intelligence', 'Procurar pistas, deduzir, analisar'),
('Medicine', 'Medicina', 'wisdom', 'Estabilizar feridos, diagnosticar doenças'),
('Nature', 'Natureza', 'intelligence', 'Conhecimento sobre flora, fauna, terrenos'),
('Perception', 'Percepção', 'wisdom', 'Notar detalhes, detectar presença oculta'),
('Performance', 'Atuação', 'charisma', 'Cantar, dançar, atuar, tocar instrumentos'),
('Persuasion', 'Persuasão', 'charisma', 'Influenciar, negociar, convencer diplomaticamente'),
('Religion', 'Religião', 'intelligence', 'Conhecimento sobre deuses, rituais, planos divinos'),
('Sleight of Hand', 'Prestidigitação', 'dexterity', 'Roubar, esconder objetos, truques manuais'),
('Stealth', 'Furtividade', 'dexterity', 'Esconder-se, mover-se silenciosamente'),
('Survival', 'Sobrevivência', 'wisdom', 'Rastrear, caçar, navegar, prever clima')
ON CONFLICT (name_en) DO NOTHING;

-- Inserir os 6 testes de resistência
INSERT INTO game_saving_throws (name_en, name_pt, ability_score, description_pt) VALUES
('Strength', 'Força', 'strength', 'Resistir a forças físicas, evitar ser agarrado'),
('Dexterity', 'Destreza', 'dexterity', 'Esquivar de explosões, armadilhas, feitiços de área'),
('Constitution', 'Constituição', 'constitution', 'Resistir a venenos, doenças, fadiga'),
('Intelligence', 'Inteligência', 'intelligence', 'Resistir a ilusões, efeitos mentais'),
('Wisdom', 'Sabedoria', 'wisdom', 'Resistir a encantamentos, dominação, medo'),
('Charisma', 'Carisma', 'charisma', 'Resistir a banimento, possessão, efeitos planares')
ON CONFLICT (name_en) DO NOTHING;


-- ===========================
-- ETAPA 3: CRIAR TABELAS DE VÍNCULO (many-to-many)
-- ===========================

-- CLASSES: Perícias disponíveis para escolha
CREATE TABLE IF NOT EXISTS class_skills (
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES game_skills(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, skill_id)
);

COMMENT ON TABLE class_skills IS 'Perícias que cada classe pode escolher';

-- CLASSES: Salvaguardas proficientes automáticas
CREATE TABLE IF NOT EXISTS class_saving_throws (
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    saving_throw_id INTEGER NOT NULL REFERENCES game_saving_throws(id) ON DELETE CASCADE,
    PRIMARY KEY (class_id, saving_throw_id)
);

COMMENT ON TABLE class_saving_throws IS 'Salvaguardas proficientes de cada classe';

-- BACKGROUNDS: Perícias concedidas automaticamente
CREATE TABLE IF NOT EXISTS background_skills (
    background_id VARCHAR(100) NOT NULL REFERENCES game_backgrounds(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES game_skills(id) ON DELETE CASCADE,
    PRIMARY KEY (background_id, skill_id)
);

COMMENT ON TABLE background_skills IS 'Perícias concedidas por antecedente';

-- RAÇAS: Perícias especiais (ex: Meio-Elfo versatilidade)
CREATE TABLE IF NOT EXISTS race_skills (
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES game_skills(id) ON DELETE CASCADE,
    PRIMARY KEY (race_id, skill_id)
);

COMMENT ON TABLE race_skills IS 'Perícias especiais de raças';



-- ===========================
-- ETAPA 4: POPULAR VÍNCULOS A PARTIR DAS COLUNAS JSON
-- ===========================

-- NOTA: A migração automática foi removida devido a problemas com o formato dos dados.
-- Popule manualmente as tabelas de vínculo usando queries como:
--
-- INSERT INTO class_skills (class_id, skill_id)
-- SELECT c.id, gs.id
-- FROM classes c, game_skills gs
-- WHERE c.name = 'Barbarian' AND gs.name_pt IN ('Atletismo', 'Intimidação', 'Natureza', 'Percepção', 'Sobrevivência', 'Lidar com Animais');
--
-- Repita para cada classe, background e raça conforme necessário.



-- ===========================
-- ETAPA 5: CONFIGURAR RLS (Row Level Security)
-- ===========================

-- Habilitar RLS nas tabelas base
ALTER TABLE game_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_saving_throws ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS nas tabelas de vínculo
ALTER TABLE class_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_saving_throws ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_skills ENABLE ROW LEVEL SECURITY;

-- Políticas para game_skills (leitura pública)
CREATE POLICY "Permitir leitura pública de skills"
ON game_skills FOR SELECT
USING (true);

-- Políticas para game_saving_throws (leitura pública)
CREATE POLICY "Permitir leitura pública de salvaguardas"
ON game_saving_throws FOR SELECT
USING (true);

-- Políticas para class_skills (leitura pública)
CREATE POLICY "Permitir leitura pública de perícias por classe"
ON class_skills FOR SELECT
USING (true);

-- Políticas para class_saving_throws (leitura pública)
CREATE POLICY "Permitir leitura pública de salvaguardas por classe"
ON class_saving_throws FOR SELECT
USING (true);

-- Políticas para background_skills (leitura pública)
CREATE POLICY "Permitir leitura pública de perícias por background"
ON background_skills FOR SELECT
USING (true);

-- Políticas para race_skills (leitura pública)
CREATE POLICY "Permitir leitura pública de perícias por raça"
ON race_skills FOR SELECT
USING (true);

-- ===========================
-- ETAPA 6: VERIFICAÇÕES
-- ===========================

-- Verificar dados base
SELECT 'Skills cadastradas' as item, COUNT(*) as total FROM game_skills
UNION ALL
SELECT 'Salvaguardas cadastradas', COUNT(*) FROM game_saving_throws
UNION ALL
SELECT 'Vínculos: classe → skills', COUNT(*) FROM class_skills
UNION ALL
SELECT 'Vínculos: classe → saves', COUNT(*) FROM class_saving_throws
UNION ALL
SELECT 'Vínculos: background → skills', COUNT(*) FROM background_skills;

-- Verificar por classe
SELECT 
    c.name_pt as classe,
    COUNT(DISTINCT cs.skill_id) as pericias_disponiveis,
    COUNT(DISTINCT cst.saving_throw_id) as salvaguardas
FROM classes c
LEFT JOIN class_skills cs ON c.id = cs.class_id
LEFT JOIN class_saving_throws cst ON c.id = cst.class_id
GROUP BY c.name_pt
ORDER BY c.name_pt;

-- ==================================================
-- FIM DO SCRIPT
-- ==================================================
