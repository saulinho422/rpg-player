# 📋 REGRAS DE DEPLOY - RPG PLAYER

## ⚠️ ATENÇÃO: LEIA ANTES DE CRIAR NOVAS PÁGINAS HTML

Este arquivo contém regras críticas que DEVEM ser seguidas sempre que uma nova página HTML for criada no projeto.

---

## 🚨 REGRA PRINCIPAL: SEMPRE ATUALIZAR 2 ARQUIVOS

Quando criar uma nova página HTML (ex: `nova-pagina.html`), você **DEVE** atualizar:

### 1️⃣ `vercel.json` (Roteamento no Vercel)

Adicione a rota na seção `rewrites`:

```json
{
  "rewrites": [
    {
      "source": "/nova-pagina",
      "destination": "/nova-pagina.html"
    }
  ]
}
```

**Por quê?** Permite acessar a página como `/nova-pagina` ao invés de `/nova-pagina.html`

---

### 2️⃣ `vite.config.js` (Build do Projeto)

Adicione a entrada na seção `rollupOptions.input`:

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // ... entradas existentes
        novaPagina: resolve(__dirname, 'nova-pagina.html')
      }
    }
  }
})
```

**Por quê?** O Vite precisa saber quais arquivos HTML devem ser incluídos no build. Se não estiver aqui, o arquivo **NÃO será deployado** no Vercel!

---

## ❌ ERROS COMUNS

### Erro 1: "404 NOT_FOUND" no Vercel
**Causa:** Arquivo não está listado no `vite.config.js`
**Solução:** Adicionar entrada no `rollupOptions.input`

### Erro 2: "Could not resolve entry module"
**Causa:** Arquivo HTML foi deletado mas ainda está referenciado no `vite.config.js`
**Solução:** Remover entrada do `vite.config.js`

### Erro 3: "No Output Directory named 'dist' found"
**Causa:** `buildCommand` incorreto no `vercel.json`
**Solução:** Remover `buildCommand` (Vercel detecta Vite automaticamente)

---

## ✅ CHECKLIST PARA NOVAS PÁGINAS

Antes de fazer commit de uma nova página HTML:

- [ ] Criei o arquivo `.html` na raiz do projeto
- [ ] Criei o arquivo `.css` correspondente em `styles/`
- [ ] Criei o arquivo `.js` correspondente em `js/` (se necessário)
- [ ] ✅ **Atualizei `vercel.json` com a rota**
- [ ] ✅ **Atualizei `vite.config.js` com a entrada**
- [ ] Testei localmente com `npm run dev`
- [ ] Fiz commit e push para GitHub
- [ ] Aguardei deploy no Vercel (1-2 minutos)
- [ ] Testei a URL no Vercel

---

## 🗑️ CHECKLIST PARA REMOVER PÁGINAS

Antes de deletar uma página HTML:

- [ ] Removi a entrada do `vite.config.js`
- [ ] Removi a rota do `vercel.json` (se existir)
- [ ] Removi o arquivo HTML da raiz
- [ ] Removi arquivos CSS/JS relacionados
- [ ] Verifiquei que nenhum outro arquivo faz referência a ela
- [ ] Fiz commit e push

---

## 📂 ESTRUTURA ATUAL DO PROJETO

### Páginas HTML em Produção:
```
/                           → index.html (loading)
/login                      → login.html
/onboarding                 → onboarding.html
/dashboard                  → dashboard.html
/character-sheet            → character-sheet.html
/attribute-method           → attribute-method.html
/roll-4d6                   → roll-4d6.html
/distribute-attributes      → distribute-attributes.html
/aguarde-confirmacao        → aguarde-confirmacao.html
/test-supabase              → test-supabase.html
```

### Arquivos de Configuração Críticos:
- `vercel.json` - Roteamento e headers
- `vite.config.js` - Build e bundling
- `package.json` - Scripts e dependências

---

## 🎯 COMANDOS ÚTEIS

```bash
# Testar localmente
npm run dev

# Build local (simula Vercel)
npm run build

# Preview do build
npm run preview

# Verificar arquivos no git
git ls-files

# Verificar status
git status

# Forçar rebuild no Vercel
git commit --allow-empty -m "chore: Force rebuild"
git push
```

---

## 🔍 DEBUGGING

### Se a página não aparecer no Vercel:

1. Verifique se o arquivo está no GitHub:
   ```bash
   git ls-tree -r origin/main --name-only | grep "nome-do-arquivo"
   ```

2. Verifique se está no `vite.config.js`:
   ```bash
   cat vite.config.js | grep "nome-do-arquivo"
   ```

3. Verifique os logs de build no Vercel Dashboard

4. Verifique a seção "Static Assets" no deploy do Vercel

---

## 📝 NOTAS IMPORTANTES

- **Sempre** faça commit das alterações em `vite.config.js` e `vercel.json` junto com novos arquivos HTML
- O Vercel demora 1-2 minutos para fazer deploy após o push
- Arquivos HTML devem estar na **raiz** do projeto
- Arquivos CSS devem estar em `styles/`
- Arquivos JS devem estar em `js/`
- Não criar `buildCommand` customizado no `vercel.json` (Vercel detecta Vite automaticamente)

---

**Data de Criação:** 29/10/2025  
**Última Atualização:** 29/10/2025  
**Motivo:** Prevenir erros 404 causados por páginas não configuradas no vite.config.js
