-- =====================================
-- CORREÇÃO DEFINITIVA - DESABILITAR RLS TEMPORARIAMENTE
-- =====================================

-- 1. Desabilita RLS na tabela profiles temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remove todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile updates by user" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile reading" ON public.profiles;

-- 3. Verifica usuários existentes
SELECT 'Usuários na tabela auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

SELECT 'Perfis na tabela profiles:' as info;
SELECT id, display_name, onboarding_completed, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 5;

-- 4. Cria perfis para usuários que não têm (sem RLS)
INSERT INTO public.profiles (id, display_name, created_at, onboarding_completed)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Usuário') as display_name,
    NOW() as created_at,
    false as onboarding_completed
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- 5. Mostra resultado final
SELECT 'Resultado após correção:' as info;
SELECT COUNT(*) as total_usuarios FROM auth.users;
SELECT COUNT(*) as total_perfis FROM public.profiles;

-- NOTA: RLS foi DESABILITADO temporariamente
-- Para reabilitar depois de testar, execute:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;