-- =====================================
-- CORREÇÃO URGENTE - IMPEDIR SUBSTITUIÇÃO DE PERFIS
-- =====================================

-- 1. Cria função para verificar se email já existe
CREATE OR REPLACE FUNCTION check_email_exists(search_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Conta quantos usuários têm este email
    RETURN (
        SELECT COUNT(*)::integer 
        FROM auth.users 
        WHERE email = search_email
    );
END;
$$;

-- 2. Remove trigger problemático que pode estar causando substituições
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Cria trigger mais seguro que só insere se não existe
CREATE OR REPLACE FUNCTION public.handle_new_user_safe()
RETURNS TRIGGER AS $$
BEGIN
    -- Só insere perfil se realmente não existe
    INSERT INTO public.profiles (id, display_name, created_at, onboarding_completed)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'),
        NOW(),
        false
    )
    ON CONFLICT (id) DO NOTHING; -- CRITICAL: Não substitui se já existe!
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recria o trigger com a função segura
CREATE TRIGGER on_auth_user_created_safe
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_safe();

-- 5. Adiciona constraint para evitar problemas futuros
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_unique UNIQUE (id);

-- 6. Mostra usuários atuais para verificação
SELECT 'Verificação de usuários existentes:' as info;
SELECT 
    au.email,
    au.created_at as user_created,
    p.display_name,
    p.created_at as profile_created,
    p.onboarding_completed
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- IMPORTANTE: Agora o sistema não vai mais substituir perfis existentes!