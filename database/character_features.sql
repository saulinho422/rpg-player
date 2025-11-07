-- Tabela para armazenar características e habilidades dos personagens
CREATE TABLE IF NOT EXISTS character_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('class', 'feat', 'racial', 'background')),
    source TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para performance
CREATE INDEX idx_character_features_character_id ON character_features(character_id);
CREATE INDEX idx_character_features_display_order ON character_features(character_id, display_order);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_character_features_updated_at 
    BEFORE UPDATE ON character_features 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários
COMMENT ON TABLE character_features IS 'Armazena características, habilidades e talentos dos personagens';
COMMENT ON COLUMN character_features.type IS 'Tipo: class (habilidade de classe), feat (talento), racial (racial), background (antecedente)';
COMMENT ON COLUMN character_features.source IS 'Fonte/detalhe do tipo (ex: Elfo, Guerreiro Nível 3)';
COMMENT ON COLUMN character_features.display_order IS 'Ordem de exibição definida pelo usuário';
