# 🏗️ CONFIGURAÇÃO DO BANCO DE DADOS

## 📋 Passos para Configurar o Supabase

### 1. Acessar o Painel do Supabase
1. Acesse: https://supabase.com/
2. Faça login na sua conta
3. Vá ao projeto: `rpg-player` 

### 2. Executar o Schema SQL
1. No painel do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `database/schema.sql`
3. Cole no editor SQL
4. Clique em **Run** para executar

### 3. Verificar Tabelas Criadas
Após executar, você deve ter estas tabelas:
- ✅ `profiles` - Perfis de usuário
- ✅ `characters` - Personagens
- ✅ `campaigns` - Campanhas/Mesas
- ✅ `campaign_players` - Jogadores nas campanhas
- ✅ `sessions` - Sessões de jogo
- ✅ `activity_log` - Log de atividades

### 4. Configurar Políticas RLS
As políticas de segurança (RLS) já estão incluídas no schema:
- ✅ Row Level Security habilitado
- ✅ Usuários só acessam seus próprios dados
- ✅ Campanhas públicas visíveis para todos
- ✅ Logs de atividade com privacidade

### 5. Verificar Triggers
Triggers automáticos incluídos:
- ✅ Criação automática de perfil ao registrar usuário
- ✅ Atualização automática de `updated_at`
- ✅ Contadores de estatísticas

## 🔧 Como Testar

### Teste de Conexão
1. Abra o console do navegador
2. Execute:
```javascript
import('./js/database.js').then(db => {
    db.DatabaseUtils.testConnection().then(result => {
        console.log('Conexão:', result ? 'OK' : 'FALHOU')
    })
})
```

### Teste de Funcionalidades
1. **Registro de novo usuário** → Deve criar perfil automaticamente
2. **Completar onboarding** → Deve salvar dados reais no banco
3. **Login existente** → Deve carregar perfil salvo
4. **Dashboard** → Deve mostrar dados reais do usuário

## 📊 Estrutura de Dados

### Perfil do Usuário (`profiles`)
```sql
{
    id: UUID,              -- ID do usuário (mesmo do auth.users)
    display_name: string,  -- Nome de exibição
    avatar_url: string,    -- URL do avatar
    age: number,           -- Idade
    experience_level: enum, -- 'iniciante', 'intermediario', 'avancado'
    preferred_role: enum,   -- 'jogador', 'mestre', 'ambos'
    onboarding_completed: boolean,
    total_characters: number,
    total_campaigns: number,
    total_sessions: number
}
```

### Personagem (`characters`)
```sql
{
    id: UUID,
    user_id: UUID,         -- Referência ao dono
    name: string,          -- Nome do personagem
    character_class: string, -- Classe (Guerreiro, Mago, etc)
    level: number,         -- Nível (1-20)
    hit_points_max: number,
    strength: number,      -- Atributos D&D
    dexterity: number,
    constitution: number,
    intelligence: number,
    wisdom: number,
    charisma: number,
    equipment: jsonb,      -- Equipamentos
    spells: jsonb,         -- Magias
    backstory: text        -- História
}
```

### Campanha (`campaigns`)
```sql
{
    id: UUID,
    name: string,          -- Nome da campanha
    dm_user_id: UUID,      -- ID do Dungeon Master
    description: text,     -- Descrição
    system: string,        -- Sistema (D&D 5e, Pathfinder, etc)
    status: enum,          -- 'recruiting', 'active', 'paused', 'completed'
    max_players: number,   -- Máximo de jogadores
    is_public: boolean,    -- Visível publicamente
    session_frequency: string, -- Frequência das sessões
    themes: jsonb          -- Temas da campanha
}
```

## 🚨 Troubleshooting

### Erro: "relation does not exist"
- Execute o schema SQL completo
- Verifique se todas as tabelas foram criadas

### Erro: "RLS policy violation"
- Verifique se o usuário está autenticado
- Confirme se as políticas RLS foram aplicadas

### Erro: "Function not found"
- Execute a parte de TRIGGERS e FUNCTIONS do schema
- Verifique se as funções foram criadas corretamente

### Dados não aparecem no Dashboard
- Confirme se o onboarding foi completado com sucesso
- Verifique se o `user_id` está correto
- Teste as queries diretamente no SQL Editor

## 📝 Próximos Passos

1. ✅ **Banco configurado**
2. 🔄 **Sistema de usuários real** (em andamento)
3. ⏳ **Sistema de personagens dinâmico**
4. ⏳ **Sistema de mesas real** 
5. ⏳ **Dashboard com dados reais**

---

**Importante:** Após executar o schema, teste o registro de um novo usuário para verificar se tudo está funcionando corretamente!