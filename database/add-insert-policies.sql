-- =====================================
-- ADICIONAR POLÍTICAS DE INSERT PARA TABELAS DE DADOS DO JOGO
-- Execute este script no Supabase SQL Editor
-- =====================================

-- Política de INSERT para game_races
CREATE POLICY "Permitir insert público em races"
ON public.game_races
FOR INSERT
TO public
WITH CHECK (true);

-- Política de INSERT para game_classes
CREATE POLICY "Permitir insert público em classes"
ON public.game_classes
FOR INSERT
TO public
WITH CHECK (true);

-- Política de INSERT para game_backgrounds
CREATE POLICY "Permitir insert público em backgrounds"
ON public.game_backgrounds
FOR INSERT
TO public
WITH CHECK (true);

-- Política de INSERT para game_feats
CREATE POLICY "Permitir insert público em feats"
ON public.game_feats
FOR INSERT
TO public
WITH CHECK (true);

-- Política de INSERT para game_languages
CREATE POLICY "Permitir insert público em languages"
ON public.game_languages
FOR INSERT
TO public
WITH CHECK (true);

-- Política de INSERT para game_alignments
CREATE POLICY "Permitir insert público em alignments"
ON public.game_alignments
FOR INSERT
TO public
WITH CHECK (true);

-- Política de INSERT para game_equipment
CREATE POLICY "Permitir insert público em equipment"
ON public.game_equipment
FOR INSERT
TO public
WITH CHECK (true);

-- Política de INSERT para game_weapons
CREATE POLICY "Permitir insert público em weapons"
ON public.game_weapons
FOR INSERT
TO public
WITH CHECK (true);

-- Política de INSERT para game_armor
CREATE POLICY "Permitir insert público em armor"
ON public.game_armor
FOR INSERT
TO public
WITH CHECK (true);

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename LIKE 'game_%'
ORDER BY tablename, cmd;
