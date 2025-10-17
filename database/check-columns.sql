-- =====================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- Execute no Supabase para ver os nomes reais das colunas
-- =====================================

-- Ver todas as colunas das tabelas de jogo
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name LIKE 'game_%'
ORDER BY table_name, ordinal_position;
