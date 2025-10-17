-- =====================================
-- CORRIGIR LIMITES DE VARCHAR NAS TABELAS DE JOGO
-- Execute este script no Supabase SQL Editor
-- =====================================

-- Aumentar limites de VARCHAR nas tabelas game_armor, game_weapons e game_equipment
-- O problema é que estamos enviando JSON stringificado que excede VARCHAR(20)

-- GAME_ARMOR
ALTER TABLE public.game_armor 
    ALTER COLUMN custo TYPE VARCHAR(100),
    ALTER COLUMN ca TYPE VARCHAR(50),
    ALTER COLUMN peso TYPE VARCHAR(30);

-- GAME_WEAPONS
ALTER TABLE public.game_weapons 
    ALTER COLUMN custo TYPE VARCHAR(100),
    ALTER COLUMN dano TYPE VARCHAR(50),
    ALTER COLUMN peso TYPE VARCHAR(30);

-- GAME_EQUIPMENT
ALTER TABLE public.game_equipment 
    ALTER COLUMN custo TYPE VARCHAR(100),
    ALTER COLUMN peso TYPE VARCHAR(30);

-- GAME_RACES (caso deslocamento precise ser maior)
ALTER TABLE public.game_races 
    ALTER COLUMN deslocamento TYPE VARCHAR(30);

-- Verificar as alterações
SELECT 
    table_name, 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns
WHERE table_name IN ('game_armor', 'game_weapons', 'game_equipment', 'game_races')
    AND column_name IN ('custo', 'ca', 'peso', 'dano', 'deslocamento')
ORDER BY table_name, column_name;
