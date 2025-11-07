-- ==================================================
-- SCRIPT SQL: POPULAR VÍNCULOS DE PERÍCIAS E SALVAGUARDAS
-- ==================================================
-- IMPORTANTE: Execute este script DEPOIS de executar 04_game_skills_saves.sql
-- ==================================================
-- NOTA: Como as colunas estão em formato TEXT incompatível, 
--       vou popular manualmente baseado nos dados do CSV
-- ==================================================

-- ===========================
-- POPULAR SALVAGUARDAS POR CLASSE
-- ===========================

-- Todas as classes (baseado no CSV - todas têm 2 salvaguardas)
INSERT INTO class_saving_throws (class_id, saving_throw_id)
SELECT c.id, gst.id
FROM classes c, game_saving_throws gst
WHERE (c.name = 'Paladin' AND gst.name_pt IN ('Sabedoria', 'Carisma'))
   OR (c.name = 'Warlock' AND gst.name_pt IN ('Sabedoria', 'Carisma'))
   OR (c.name = 'Druid' AND gst.name_pt IN ('Inteligência', 'Sabedoria'))
   OR (c.name = 'Bard' AND gst.name_pt IN ('Destreza', 'Carisma'))
   OR (c.name = 'Ranger' AND gst.name_pt IN ('Força', 'Destreza'))
   OR (c.name = 'Wizard' AND gst.name_pt IN ('Inteligência', 'Sabedoria'))
   OR (c.name = 'Monk' AND gst.name_pt IN ('Força', 'Destreza'))
   OR (c.name = 'Rogue' AND gst.name_pt IN ('Destreza', 'Inteligência'))
   OR (c.name = 'Cleric' AND gst.name_pt IN ('Sabedoria', 'Carisma'))
   OR (c.name = 'Sorcerer' AND gst.name_pt IN ('Constituição', 'Carisma'))
   OR (c.name = 'Fighter' AND gst.name_pt IN ('Força', 'Constituição'))
   OR (c.name = 'Barbarian' AND gst.name_pt IN ('Força', 'Constituição'))
   OR (c.name = 'Artificer' AND gst.name_pt IN ('Constituição', 'Inteligência'))
ON CONFLICT DO NOTHING;

-- ===========================
-- POPULAR PERÍCIAS POR CLASSE
-- ===========================

-- Paladino
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Paladin' AND gs.name_pt IN ('Atletismo', 'Intuição', 'Intimidação', 'Medicina', 'Persuasão', 'Religião')
ON CONFLICT DO NOTHING;

-- Bruxo
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Warlock' AND gs.name_pt IN ('Arcanismo', 'Enganação', 'História', 'Intimidação', 'Investigação', 'Natureza', 'Religião')
ON CONFLICT DO NOTHING;

-- Druida
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Druid' AND gs.name_pt IN ('Arcanismo', 'Lidar com Animais', 'Intuição', 'Medicina', 'Natureza', 'Percepção', 'Religião', 'Sobrevivência')
ON CONFLICT DO NOTHING;

-- Bardo (todas as 18 perícias!)
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Bard'
ON CONFLICT DO NOTHING;

-- Patrulheiro
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Ranger' AND gs.name_pt IN ('Lidar com Animais', 'Atletismo', 'Intuição', 'Investigação', 'Natureza', 'Percepção', 'Furtividade', 'Sobrevivência')
ON CONFLICT DO NOTHING;

-- Mago
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Wizard' AND gs.name_pt IN ('Arcanismo', 'História', 'Intuição', 'Investigação', 'Medicina', 'Religião')
ON CONFLICT DO NOTHING;

-- Monge
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Monk' AND gs.name_pt IN ('Acrobacia', 'Atletismo', 'História', 'Intuição', 'Religião', 'Furtividade')
ON CONFLICT DO NOTHING;

-- Ladino
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Rogue' AND gs.name_pt IN ('Acrobacia', 'Atletismo', 'Enganação', 'Intuição', 'Intimidação', 'Investigação', 'Percepção', 'Atuação', 'Persuasão', 'Prestidigitação', 'Furtividade')
ON CONFLICT DO NOTHING;

-- Clérigo
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Cleric' AND gs.name_pt IN ('História', 'Intuição', 'Medicina', 'Persuasão', 'Religião')
ON CONFLICT DO NOTHING;

-- Feiticeiro
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Sorcerer' AND gs.name_pt IN ('Arcanismo', 'Enganação', 'Intuição', 'Intimidação', 'Persuasão', 'Religião')
ON CONFLICT DO NOTHING;

-- Guerreiro
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Fighter' AND gs.name_pt IN ('Acrobacia', 'Lidar com Animais', 'Atletismo', 'História', 'Intuição', 'Intimidação', 'Percepção', 'Sobrevivência')
ON CONFLICT DO NOTHING;

-- Bárbaro
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Barbarian' AND gs.name_pt IN ('Lidar com Animais', 'Atletismo', 'Intimidação', 'Natureza', 'Percepção', 'Sobrevivência')
ON CONFLICT DO NOTHING;

-- Artífice
INSERT INTO class_skills (class_id, skill_id)
SELECT c.id, gs.id FROM classes c, game_skills gs
WHERE c.name = 'Artificer' AND gs.name_pt IN ('Arcanismo', 'História', 'Investigação', 'Medicina', 'Natureza', 'Percepção', 'Prestidigitação')
ON CONFLICT DO NOTHING;

-- ===========================
-- POPULAR PERÍCIAS DE BACKGROUNDS (apenas as fixas)
-- ===========================

-- Acólito
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'acolito' AND gs.name_pt IN ('Intuição', 'Religião')
ON CONFLICT DO NOTHING;

-- Artesão do Clã
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'artesao-cla' AND gs.name_pt IN ('História', 'Intuição')
ON CONFLICT DO NOTHING;

-- Artista
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'artista' AND gs.name_pt IN ('Acrobacia', 'Atuação')
ON CONFLICT DO NOTHING;

-- Charlatão
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'charlatao' AND gs.name_pt IN ('Enganação', 'Prestidigitação')
ON CONFLICT DO NOTHING;

-- Criminoso
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'criminoso' AND gs.name_pt IN ('Enganação', 'Furtividade')
ON CONFLICT DO NOTHING;

-- Eremita
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'eremita' AND gs.name_pt IN ('Medicina', 'Religião')
ON CONFLICT DO NOTHING;

-- Forasteiro
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'forasteiro' AND gs.name_pt IN ('Atletismo', 'Sobrevivência')
ON CONFLICT DO NOTHING;

-- Herói do Povo
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'heroi-povo' AND gs.name_pt IN ('Lidar com Animais', 'Sobrevivência')
ON CONFLICT DO NOTHING;

-- Marinheiro
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'marinheiro' AND gs.name_pt IN ('Atletismo', 'Percepção')
ON CONFLICT DO NOTHING;

-- Nobre
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'nobre' AND gs.name_pt IN ('História', 'Persuasão')
ON CONFLICT DO NOTHING;

-- Sábio
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'sabio' AND gs.name_pt IN ('Arcanismo', 'História')
ON CONFLICT DO NOTHING;

-- Soldado
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'soldado' AND gs.name_pt IN ('Atletismo', 'Intimidação')
ON CONFLICT DO NOTHING;

-- Órfão
INSERT INTO background_skills (background_id, skill_id)
SELECT bg.id, gs.id FROM game_backgrounds bg, game_skills gs
WHERE bg.id = 'orfao' AND gs.name_pt IN ('Furtividade', 'Prestidigitação')
ON CONFLICT DO NOTHING;

-- ===========================
-- QUERIES DE VERIFICAÇÃO
-- ===========================

-- Verificar quantas perícias foram vinculadas por classe
SELECT 
    c.name AS classe,
    COUNT(cs.skill_id) AS total_pericias
FROM classes c
LEFT JOIN class_skills cs ON c.id = cs.class_id
GROUP BY c.name
ORDER BY c.name;

-- Verificar quantas salvaguardas foram vinculadas por classe
SELECT 
    c.name AS classe,
    COUNT(cst.saving_throw_id) AS total_salvaguardas
FROM classes c
LEFT JOIN class_saving_throws cst ON c.id = cst.class_id
GROUP BY c.name
ORDER BY c.name;

-- Verificar backgrounds com perícias
SELECT 
    bg.id AS background,
    COUNT(bs.skill_id) AS total_pericias
FROM game_backgrounds bg
LEFT JOIN background_skills bs ON bg.id = bs.background_id
GROUP BY bg.id
ORDER BY bg.id;

-- ===========================
-- VERIFICAÇÕES
-- ===========================

-- Contar vínculos criados
SELECT 'Vínculos classe→skill' as tipo, COUNT(*) as total FROM class_skills
UNION ALL
SELECT 'Vínculos classe→save', COUNT(*) FROM class_saving_throws
UNION ALL
SELECT 'Vínculos background→skill', COUNT(*) FROM background_skills;

-- Mostrar perícias por classe
SELECT 
    c.name_pt as classe,
    COUNT(cs.skill_id) as pericias_disponiveis,
    string_agg(gs.name_pt, ', ' ORDER BY gs.name_pt) as pericias
FROM classes c
JOIN class_skills cs ON c.id = cs.class_id
JOIN game_skills gs ON cs.skill_id = gs.id
GROUP BY c.name_pt
ORDER BY c.name_pt;

-- Mostrar salvaguardas por classe
SELECT 
    c.name_pt as classe,
    string_agg(gst.name_pt, ', ') as salvaguardas
FROM classes c
JOIN class_saving_throws cst ON c.id = cst.class_id
JOIN game_saving_throws gst ON cst.saving_throw_id = gst.id
GROUP BY c.name_pt
ORDER BY c.name_pt;

-- ==================================================
-- FIM DO SCRIPT
-- ==================================================
