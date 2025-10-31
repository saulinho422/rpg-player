-- =====================================
-- ADICIONAR CAMPOS PARA RASCUNHO DE PERSONAGENS
-- Para eliminar necessidade de localStorage
-- =====================================

-- Adicionar campos para indicar se é um rascunho
ALTER TABLE public.characters
ADD COLUMN is_draft BOOLEAN DEFAULT FALSE,
ADD COLUMN draft_step VARCHAR(50) DEFAULT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.characters.is_draft IS 'Indica se o personagem é um rascunho em criação';
COMMENT ON COLUMN public.characters.draft_step IS 'Etapa atual da criação (attributes, class, race, background, etc)';

-- Permitir campos opcionais para rascunhos
ALTER TABLE public.characters ALTER COLUMN name DROP NOT NULL;

-- Criar índice para buscar rascunhos do usuário
CREATE INDEX IF NOT EXISTS idx_characters_draft ON public.characters(user_id, is_draft) WHERE is_draft = true;

-- Função para limpar rascunhos antigos (opcional - executar manualmente se necessário)
-- DELETE FROM public.characters WHERE is_draft = true AND created_at < NOW() - INTERVAL '7 days';