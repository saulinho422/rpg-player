# 🔧 Guia de Correção e Setup do Banco de Dados

## 📊 Status Atual (conforme imagem)

### ✅ Tabelas Existentes:
- `activity_log`
- `campaign_players`
- `campaigns`
- `characters`
- `profiles` ⚠️ **Unrestricted** (precisa correção)
- `sessions`

### ❌ Tabelas Faltando:
- `game_races`
- `game_classes`
- `game_backgrounds`
- `game_feats`
- `game_languages`
- `game_alignments`
- `game_equipment`
- `game_weapons`
- `game_armor`

---

## 🚀 Passo a Passo de Correção

### 1️⃣ Corrigir RLS da tabela `profiles`

A tabela `profiles` está marcada como **"Unrestricted"**, o que é um problema de segurança.

**Execute no Supabase → SQL Editor:**

```sql
-- Copie todo o conteúdo de:
database/fix-profiles-rls.sql
```

**Resultado esperado:**
- ✅ 4 políticas criadas
- ✅ `profiles` não deve mais aparecer como "Unrestricted"
- ✅ Refresh na página do Table Editor para confirmar

---

### 2️⃣ Criar Tabelas de Dados do Jogo

Estas tabelas armazenarão raças, classes, backgrounds, etc.

**Execute no Supabase → SQL Editor:**

```sql
-- Copie todo o conteúdo de:
database/create-game-tables.sql
```

**Resultado esperado:**
- ✅ 9 novas tabelas criadas
- ✅ Todas com RLS habilitado (leitura pública)
- ✅ Verifique no Table Editor

---

### 3️⃣ Migrar Dados JSON para Supabase

Agora que as tabelas existem, popule com os dados.

**Abra no navegador:**
```
migrate-data.html
```

**Clique em:** 🚀 Iniciar Migração

**Aguarde o relatório:**
```
==================================================
📊 RELATÓRIO DE MIGRAÇÃO
==================================================
races           ✅ 9  | ❌ 0
classes         ✅ 13 | ❌ 0
backgrounds     ✅ 14 | ❌ 0
feats           ✅ 69 | ❌ 0
languages       ✅ 1  | ❌ 0
alignments      ✅ 9  | ❌ 0
equipment       ✅ XX | ❌ 0
weapons         ✅ XX | ❌ 0
armor           ✅ XX | ❌ 0
==================================================
✅ Migração concluída com sucesso!
```

---

### 4️⃣ Verificar no Supabase

**Table Editor → Verifique cada tabela:**

```sql
-- Execute para contar registros:
SELECT 
    'game_races' as tabela, COUNT(*) as total FROM game_races
UNION ALL
SELECT 'game_classes', COUNT(*) FROM game_classes
UNION ALL
SELECT 'game_backgrounds', COUNT(*) FROM game_backgrounds
UNION ALL
SELECT 'game_feats', COUNT(*) FROM game_feats
UNION ALL
SELECT 'game_languages', COUNT(*) FROM game_languages
UNION ALL
SELECT 'game_alignments', COUNT(*) FROM game_alignments
UNION ALL
SELECT 'game_equipment', COUNT(*) FROM game_equipment
UNION ALL
SELECT 'game_weapons', COUNT(*) FROM game_weapons
UNION ALL
SELECT 'game_armor', COUNT(*) FROM game_armor;
```

**Resultado esperado:**
```
tabela              | total
--------------------|-------
game_races          | 9
game_classes        | 13
game_backgrounds    | 14
game_feats          | 69
game_languages      | 1
game_alignments     | 9
game_equipment      | XX
game_weapons        | XX
game_armor          | XX
```

---

## ✅ Checklist Final

### Depois de executar tudo:

- [ ] Tabela `profiles` **NÃO** está mais "Unrestricted"
- [ ] 9 tabelas `game_*` foram criadas
- [ ] Todas as tabelas `game_*` têm dados
- [ ] RLS está habilitado em todas as tabelas
- [ ] Testou criar um personagem no sistema
- [ ] Personagem foi salvo no Supabase

---

## 🔍 Verificação de Segurança RLS

### Executar no SQL Editor:

```sql
-- Listar todas as tabelas com RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Todas devem ter `rls_enabled = true`**

---

### Listar políticas de cada tabela:

```sql
SELECT 
    tablename,
    policyname,
    cmd as operacao,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Deve mostrar:**
- `profiles`: 4 políticas
- `characters`: 4 políticas  
- `campaigns`: 3 políticas
- Cada `game_*`: 1 política (SELECT público)

---

## ⚠️ Problemas Comuns

### Erro: "relation already exists"
**Solução:** A tabela já existe. Pode ignorar ou usar `DROP TABLE IF EXISTS` antes.

### Erro: "policy already exists"
**Solução:** Use `DROP POLICY IF EXISTS` antes de criar.

### Tabela ainda aparece "Unrestricted"
**Solução:** 
1. Refresh da página (F5)
2. Verifique se executou `fix-profiles-rls.sql`
3. Execute novamente se necessário

### Migração falha com "table not found"
**Solução:** Execute `create-game-tables.sql` primeiro.

---

## 📁 Arquivos Criados

```
database/
├── schema.sql                  ✅ Schema principal (ATUALIZADO)
├── create-game-tables.sql      ✅ Criar tabelas game_* (NOVO)
├── fix-profiles-rls.sql        ✅ Corrigir RLS profiles (NOVO)
└── README.md                   📖 Documentação

rpgplayer/
├── migrate-data.html           🚀 Script de migração
└── MIGRATION-GUIDE.md          📖 Guia completo
```

---

## 🎯 Ordem de Execução

```
1. fix-profiles-rls.sql        → Corrige segurança
2. create-game-tables.sql      → Cria tabelas
3. migrate-data.html           → Popula dados
4. Verificar tudo funcionando  → Testar sistema
```

---

## 💡 Dicas

- ✅ Sempre faça backup antes de executar SQL
- ✅ Execute um script por vez
- ✅ Verifique os resultados após cada etapa
- ✅ Use o Table Editor para visualizar os dados
- ✅ Teste com um personagem de teste primeiro

---

## 📞 Verificação Rápida

Depois de tudo configurado, teste:

```javascript
// No console do navegador (character-creation.html)
const { data, error } = await supabase.from('game_races').select('*');
console.log('Raças:', data);
// Deve mostrar array com 9 raças
```

---

**Pronto! Agora seu banco está 100% configurado! 🎉**
