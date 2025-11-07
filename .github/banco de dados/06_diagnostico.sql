-- ==================================================
-- DIAGNÓSTICO: Verificar nomes exatos das classes e perícias
-- ==================================================

-- Ver nomes exatos das classes no banco
SELECT id, name, name_pt FROM classes ORDER BY name;

-- Ver nomes exatos das perícias no banco
SELECT id, name_pt FROM game_skills ORDER BY name_pt;

-- Ver quantos registros existem nas tabelas de vínculo
SELECT 'class_skills' as tabela, COUNT(*) as registros FROM class_skills
UNION ALL
SELECT 'class_saving_throws', COUNT(*) FROM class_saving_throws
UNION ALL
SELECT 'background_skills', COUNT(*) FROM background_skills;
