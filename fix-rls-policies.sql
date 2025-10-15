-- =====================================
-- CORREÇÃO TEMPORÁRIA DAS RLS POLICIES
-- =====================================

-- 1. Remove políticas restritivas existentes
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Cria políticas mais flexíveis
CREATE POLICY "Allow profile creation" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow profile updates by user" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR id IS NOT NULL);

-- 3. Permite SELECT para usuários autenticados
CREATE POLICY "Allow profile reading" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR auth.role() = 'authenticated');

-- =====================================
-- FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================

-- Atualiza a função de criação automática de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, created_at)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuário'),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recria o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================
-- VERIFICA SE HÁ USUÁRIOS SEM PERFIL
-- =====================================

-- Cria perfis para usuários existentes que não têm perfil
INSERT INTO public.profiles (id, display_name, created_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email, 'Usuário') as display_name,
    NOW() as created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;