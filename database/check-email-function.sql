-- ======================================================
-- FUNÇÃO PARA VERIFICAR SE EMAIL JÁ EXISTE
-- ======================================================

-- Esta função verifica se um email já está em uso
-- por outro usuário no sistema de autenticação

CREATE OR REPLACE FUNCTION check_email_exists(search_email text)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM auth.users
  WHERE email = search_email;
$$;

-- Comentários para documentação:
-- Esta função é segura porque:
-- 1. Usa SECURITY DEFINER para acessar auth.users
-- 2. Apenas retorna um COUNT, nunca dados sensíveis
-- 3. É necessária para evitar tentativas de registro duplicado