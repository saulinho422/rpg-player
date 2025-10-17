-- =====================================
-- CORREÇÃO DE RLS PARA PROFILES
-- Execute este script para corrigir o problema "Unrestricted"
-- =====================================

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 2. Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas corretas
-- Permite ver perfil próprio
CREATE POLICY "Users can view own profile" 
ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

-- Permite ver perfis de outros usuários (necessário para campanhas/grupos)
CREATE POLICY "Users can view other profiles" 
ON public.profiles
FOR SELECT 
USING (true);

-- Permite atualizar apenas perfil próprio
CREATE POLICY "Users can update own profile" 
ON public.profiles
FOR UPDATE 
USING (auth.uid() = id);

-- Permite inserir apenas perfil próprio
CREATE POLICY "Users can insert own profile" 
ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Verificar se funcionou
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';
