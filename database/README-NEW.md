# 🗄️ Database - Estrutura do Banco de Dados

## 📋 Arquivos Disponíveis

### 1. `schema.sql` - Schema Principal ✅
Estrutura completa do banco de dados com:
- Tabelas de usuários e personagens
- Tabelas de campanhas e sessões  
- Índices e triggers
- Políticas RLS (Row Level Security)

**Status:** ✅ Já executado no Supabase

### 2. `create-game-tables.sql` - Tabelas de Dados do Jogo ⚠️
Cria as 9 tabelas para dados D&D 5e:
- `game_races` - Raças
- `game_classes` - Classes
- `game_backgrounds` - Antecedentes
- `game_feats` - Talentos
- `game_languages` - Idiomas
- `game_alignments` - Tendências
- `game_equipment` - Equipamentos
- `game_weapons` - Armas
- `game_armor` - Armaduras

**Status:** ⚠️ Precisa executar

### 3. `fix-profiles-rls.sql` - Correção de Segurança ⚠️
Corrige as políticas RLS da tabela `profiles` que está marcada como "Unrestricted".

**Status:** ⚠️ Precisa executar URGENTE

### 4. `SETUP-GUIDE.md` - Guia de Configuração 📖
Passo a passo completo de como configurar tudo.

---

## 🚀 Como Usar (Ordem Correta)

### Passo 1: Corrigir Segurança 🔐
```sql
-- Execute no Supabase → SQL Editor
-- Arquivo: fix-profiles-rls.sql
```
Isso corrige o problema "Unrestricted" na tabela profiles.

### Passo 2: Criar Tabelas de Jogo 📦
```sql
-- Execute no Supabase → SQL Editor  
-- Arquivo: create-game-tables.sql
```
Cria as 9 tabelas game_* necessárias.

### Passo 3: Migrar Dados 🚀
```
Abra no navegador: ../migrate-data.html
Clique em: 🚀 Iniciar Migração
```
Popula as tabelas com dados dos arquivos JSON.

---

## 📊 Estrutura Atual do Banco

### ✅ Tabelas Existentes (conforme imagem):
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

## 🎯 Diagrama de Relacionamentos

```
auth.users (Supabase Auth)
    ↓
profiles (1:1) ⚠️ Unrestricted
    ↓
    ├─→ characters (1:N) ✅
    ├─→ campaigns (1:N - como DM) ✅
    └─→ campaign_players (1:N - como jogador) ✅
           ↓
           └─→ sessions (N:N) ✅

game_races ❌ Não existe
game_classes ❌ Não existe
game_backgrounds ❌ Não existe
... (outras tabelas game_*)
```

---

## 🔐 Segurança (RLS)

### Status Atual:

| Tabela | RLS | Status |
|--------|-----|--------|
| profiles | ⚠️ | **Unrestricted** (CORRIGIR!) |
| characters | ✅ | Protegido |
| campaigns | ✅ | Protegido |
| campaign_players | ✅ | Protegido |
| sessions | ✅ | Protegido |
| activity_log | ✅ | Protegido |

### Depois da Correção:

| Tabela | RLS | Políticas |
|--------|-----|-----------|
| profiles | ✅ | 4 políticas |
| characters | ✅ | 4 políticas |
| campaigns | ✅ | 3 políticas |
| game_* (todas) | ✅ | 1 política (leitura pública) |

---

## 📖 Documentação Completa

- 📘 [SETUP-GUIDE.md](./SETUP-GUIDE.md) - Guia completo de setup passo a passo
- 📗 [../MIGRATION-GUIDE.md](../MIGRATION-GUIDE.md) - Guia de migração de dados
- 📙 [check-email-function.sql](./check-email-function.sql) - Função de validação de email

---

## ⚡ Quick Start

```bash
# 1. Execute no Supabase SQL Editor:
fix-profiles-rls.sql

# 2. Execute no Supabase SQL Editor:
create-game-tables.sql

# 3. Abra no navegador:
migrate-data.html

# 4. Teste:
character-creation.html
```

---

## 🆘 Problemas Comuns

### ❌ Tabela "Unrestricted"
**Solução:** Execute `fix-profiles-rls.sql`

### ❌ "Table game_races does not exist"
**Solução:** Execute `create-game-tables.sql`

### ❌ Migração falha
**Solução:** Verifique se as tabelas game_* existem primeiro

---

**Última atualização:** 16/10/2025  
**Versão:** 2.0 - Supabase Migration
