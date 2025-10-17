# 🗄️ Migração de Dados para Supabase

## 📋 Resumo

Este guia explica como migrar todos os dados JSON do sistema RPG Player para o Supabase, permitindo que os personagens sejam salvos permanentemente na nuvem e acessíveis de qualquer dispositivo.

---

## 🎯 O que foi alterado?

### ✅ ANTES (localStorage):
- ❌ Dados presos a um navegador/dispositivo
- ❌ Perde tudo se limpar cache
- ❌ Não sincroniza entre dispositivos
- ✅ Funciona offline

### ✅ AGORA (Supabase):
- ✅ Dados salvos na nuvem
- ✅ Acessa de qualquer dispositivo
- ✅ Nunca perde os dados
- ✅ Sistema multiusuário
- ✅ Cada usuário vê apenas seus personagens

---

## 🚀 Passo a Passo da Migração

### 1️⃣ Atualizar o Schema do Supabase

Acesse o **Supabase Dashboard** → **SQL Editor** e execute o arquivo:
```
database/schema.sql
```

Isso criará as seguintes tabelas:
- `game_races` - Raças
- `game_classes` - Classes
- `game_backgrounds` - Antecedentes
- `game_feats` - Talentos
- `game_languages` - Idiomas
- `game_alignments` - Tendências
- `game_equipment` - Equipamentos
- `game_weapons` - Armas
- `game_armor` - Armaduras

---

### 2️⃣ Executar a Migração dos Dados

1. **Abra o arquivo no navegador:**
   ```
   migrate-data.html
   ```

2. **Clique no botão "🚀 Iniciar Migração"**

3. **Aguarde o processo** (pode levar alguns segundos)

4. **Verifique o relatório** no console da página

Você verá algo assim:
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
TOTAL:          ✅ XXX | ❌ 0
Tempo:          X.XXs
==================================================

✅ Migração concluída com sucesso!
```

---

### 3️⃣ Verificar no Supabase

1. Acesse **Supabase Dashboard**
2. Vá em **Table Editor**
3. Verifique se as tabelas `game_*` foram populadas
4. Cada tabela deve ter dados

---

## 📂 Estrutura de Arquivos

```
rpgplayer/
├── database/
│   ├── schema.sql (ATUALIZADO ✅)
│   └── README.md
├── js/
│   ├── character-creation.js (ATUALIZADO ✅)
│   ├── character-sheet.js (ATUALIZADO ✅)
│   └── data/
│       ├── races.json
│       ├── classes.json
│       ├── backgrounds.json
│       ├── feats.json
│       ├── languages.json
│       ├── alignments.json
│       ├── equipment.json
│       ├── weapons.json
│       └── armor.json
├── migrate-data.html (NOVO ✅)
└── MIGRATION-GUIDE.md (ESTE ARQUIVO)
```

---

## 🔄 Como Funciona Agora?

### **Criação de Personagem:**
1. Usuário faz login
2. Acessa `character-creation.html`
3. Dados são carregados **do Supabase**
4. Personagem é salvo **no Supabase** (vinculado ao usuário)
5. Redireciona para ficha do personagem

### **Visualização de Personagem:**
1. Usuário faz login
2. Acessa `character-sheet.html?id=XXX`
3. Sistema verifica se o personagem pertence ao usuário
4. Carrega dados **do Supabase**
5. Permite edição/exclusão

### **Dashboard:**
```javascript
// Exemplo de como listar personagens do usuário
const { data: characters } = await supabase
    .from('characters')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });
```

---

## 🔐 Segurança (RLS - Row Level Security)

### Dados do Jogo (game_*):
- ✅ **Leitura pública** - Todos podem ler
- ❌ **Sem escrita** - Apenas admin pode inserir/editar

### Personagens (characters):
- ✅ **Usuário vê apenas seus personagens**
- ✅ **Usuário só edita seus personagens**
- ❌ **Não vê personagens de outros usuários**

Políticas RLS já configuradas no `schema.sql`!

---

## ⚠️ IMPORTANTE

### Execute a migração APENAS UMA VEZ!
- Se executar novamente, os dados serão atualizados (upsert)
- Não duplica dados
- Use para atualizar informações se necessário

### Mantenha os arquivos JSON!
- São úteis para backup
- Podem ser usados offline no futuro
- Facilitam updates do sistema

---

## 🛠️ Solução de Problemas

### ❌ Erro: "Tabelas não encontradas"
**Solução:** Execute o `schema.sql` no Supabase primeiro

### ❌ Erro: "Unauthorized"
**Solução:** Verifique se o `SUPABASE_ANON_KEY` está correto

### ❌ Erro: "Failed to fetch"
**Solução:** Verifique sua conexão com a internet

### ❌ Alguns dados não migraram
**Solução:** Verifique o console para ver quais falharam e execute novamente

---

## 📊 Monitoramento

### Ver logs no Supabase:
1. Dashboard → **Logs**
2. Filtre por tabela
3. Veja inserções/atualizações em tempo real

### Ver dados inseridos:
```sql
-- No SQL Editor do Supabase
SELECT COUNT(*) FROM game_races;
SELECT COUNT(*) FROM game_classes;
SELECT COUNT(*) FROM game_backgrounds;
-- etc...
```

---

## 🎉 Pronto!

Após seguir estes passos:

✅ Dados do jogo salvos no Supabase  
✅ Sistema de criação usando Supabase  
✅ Personagens salvos permanentemente  
✅ Sincronização entre dispositivos  
✅ Sistema multiusuário funcionando  

**Agora os personagens nunca serão perdidos!** 🚀

---

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Revise este guia passo a passo
4. Execute a migração novamente se necessário

**Boa sorte com seu RPG Player! 🎲✨**
