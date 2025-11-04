-- =====================================================
-- CORRIGIR POLÍTICAS RLS DA TABELA PROFILES
-- =====================================================
-- Este script corrige o erro: "NEW ROW VIOLATES ROW-LEVEL SECURITY POLICY"
-- Permite que usuários criem e atualizem seus próprios perfis

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- =====================================================
-- POLÍTICAS DE SELECT (Visualização)
-- =====================================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Perfis públicos podem ser vistos por todos (para listagem de jogadores)
CREATE POLICY "Public profiles viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- =====================================================
-- POLÍTICA DE INSERT (Criação)
-- =====================================================

-- Usuários podem criar seu próprio perfil
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLÍTICA DE UPDATE (Atualização)
-- =====================================================

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- VERIFICAR POLÍTICAS CRIADAS
-- =====================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- =====================================================
-- TESTAR PERMISSÕES
-- =====================================================

-- Esta query deve retornar as 4 políticas criadas acima
SELECT COUNT(*) as "Total de Políticas" 
FROM pg_policies 
WHERE tablename = 'profiles';
