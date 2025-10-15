-- =====================================
-- LIMPA USUÁRIOS DUPLICADOS E CONFIGURA VALIDAÇÃO
-- =====================================

-- 1. Mostra usuários duplicados (se houver)
SELECT email, COUNT(*) as total, string_agg(id::text, ', ') as user_ids
FROM auth.users 
GROUP BY email 
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- 2. Remove perfis órfãos (sem usuário correspondente)
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 3. Mostra estatísticas atuais
SELECT 
    'Total de usuários únicos:' as info,
    COUNT(DISTINCT email) as total
FROM auth.users;

SELECT 
    'Total de perfis:' as info,
    COUNT(*) as total
FROM public.profiles;

-- 4. Se quiser remover duplicatas (CUIDADO!)
-- Descomente apenas se tiver certeza:
/*
DELETE FROM auth.users 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM auth.users 
    GROUP BY email
);
*/

-- IMPORTANTE: Após executar, teste o registro novamente!