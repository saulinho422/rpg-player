# 📚 Instruções e Soluções - RPG Player

Este arquivo documenta todos os erros encontrados durante o desenvolvimento e suas soluções para evitar que aconteçam novamente.

---

## 🎨 Imagens e Assets Estáticos

### ❌ Problema: Avatar padrão não carrega no Vercel (404)

**Erro encontrado:**
```
Failed to load resource: the server responded with a status of 404 ()
https://rpg-player-vercel.app/img/perfil_empty_user.png
```

**Causa raiz:**
- O Vite (build tool do Vercel) adiciona **hash** aos nomes dos arquivos estáticos para cache-busting
- `perfil_empty_user.png` → `perfil_empty_user-18074395.png` no build
- Caminhos hardcoded como string (`'img/perfil_empty_user.png'` ou `'/img/perfil_empty_user.png'`) não funcionam porque o Vite não consegue rastrear a referência

**✅ Solução correta:**
```javascript
// ❌ ERRADO - String hardcoded
this.userData.avatar = '/img/perfil_empty_user.png'

// ✅ CORRETO - Import do módulo
import defaultAvatar from '../img/perfil_empty_user.png'
this.userData.avatar = defaultAvatar
```

**Por que funciona:**
- O Vite rastreia imports e resolve automaticamente o caminho com hash
- No dev: `/img/perfil_empty_user.png`
- No build: `/assets/perfil_empty_user-18074395.png`

**Arquivos afetados:**
- `js/onboarding.js` - Validação step 1 e completeOnboarding
- `js/dashboard-real.js` - Fallback do avatar

**Commit de correção:** `c405d2e`

---

## 🔐 Validação de Nome Único

### ❌ Problema: Mensagem de validação dentro da caixa de texto

**Erro visual:**
- A mensagem "❌ Nome já existe!" aparecia sobreposta ao input
- Difícil de ler e pouca usabilidade

**✅ Solução:**
```css
.input-validation {
    position: absolute;
    top: calc(100% + 13px);  /* 13px abaixo da caixa */
    left: 0;
    right: 0;
    text-align: center;
}
```

**Resultado:**
- Mensagem aparece limpa, 13px abaixo do input
- Sugestões clicáveis em dourado (#d4af37)
- Debounce de 500ms para evitar spam de consultas ao banco

**Commit de correção:** `7589388`

---

## 📝 Nome Único com Sugestões Automáticas

### ✨ Feature implementada:

**Funcionalidade:**
1. Verifica em tempo real se o nome já existe (case-insensitive com `.ilike()`)
2. Gera 3 sugestões automáticas quando duplicado
3. Sugestões clicáveis que preenchem o input automaticamente
4. Bloqueia navegação se nome estiver em uso

**Sufixos de sugestões:**
- `_RPG`, `_###` (número aleatório), ` II`, ` III`, ` Junior`, ` o Valente`, ` Aventureiro`

**Código principal:**
```javascript
async checkNameAvailability(name, validationElement) {
    const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .ilike('display_name', name)
        .limit(1)
    
    if (data && data.length > 0) {
        const suggestions = this.generateNameSuggestions(name)
        // Mostra sugestões clicáveis
    }
}
```

**Commit de implementação:** `51e49cb`

---

## 🖼️ Avatar Opcional no Onboarding

### ✨ Melhorias de UX implementadas:

**Alterações:**
1. **Avatar agora é opcional** - Usuário pode pular sem culpa
2. **Título atualizado:** "Escolha sua Imagem de Perfil (Opcional)"
3. **Removidos:** Avatar presets (6 ícones), sugestões de nomes épicos, botão "Pular configuração"
4. **Imagem padrão:** Aplicada automaticamente se usuário não selecionar foto

**Validação automática:**
```javascript
case 1: // Avatar - OPCIONAL
    if (!this.userData.avatar) {
        this.userData.avatar = defaultAvatar  // Imagem padrão
        this.userData.avatarType = 'default'
    }
    break
```

**Verificação dupla:**
- No `validateCurrentStep()` (ao avançar)
- No `completeOnboarding()` (antes de salvar)

**Commits relacionados:** `c27f752`, `7589388`, `c405d2e`

---

## 🚫 Sistema Anti-Spam de Notificações

### ❌ Problema: Notificações duplicadas

**Erro:**
- Clicar múltiplas vezes em botões criava notificações sobrepostas
- Spam visual ruim para UX

**✅ Solução:**
```javascript
constructor() {
    this.lastNotification = null
    this.notificationTimeout = null
}

showMessage(message, type = 'info') {
    // Bloqueia duplicadas
    if (this.lastNotification === message) {
        return
    }
    
    this.lastNotification = message
    
    // Reset após 1 segundo
    clearTimeout(this.notificationTimeout)
    this.notificationTimeout = setTimeout(() => {
        this.lastNotification = null
    }, 1000)
    
    // Mostra notificação...
}
```

**Resultado:**
- Notificações duplicadas bloqueadas por 1 segundo
- UX mais limpa e profissional

**Commit de correção:** `51e49cb`

---

## 🔄 Git e Versionamento

### 📦 Assets estáticos precisam ser commitados

**Lição aprendida:**
- Arquivos em `img/` precisam ser explicitamente adicionados ao Git
- Mesmo que existam localmente, não estarão no Vercel se não forem commitados

**Comando correto:**
```bash
git add img/logo_vetorizada.png
git add img/perfil_empty_user.png
git commit -m "feat: Adiciona assets necessários"
git push origin main
```

**Verificação:**
```bash
# Ver se arquivo está no Git
git ls-files img/perfil_empty_user.png

# Ver histórico do arquivo
git log --all --oneline -- img/perfil_empty_user.png
```

---

## 🎯 Boas Práticas Estabelecidas

### 1. **Imports de Assets**
- ✅ Sempre usar `import` para imagens que serão processadas pelo Vite
- ❌ Nunca usar strings hardcoded para assets dinâmicos

### 2. **Validação em Tempo Real**
- ✅ Usar debounce (500ms) para evitar spam de consultas
- ✅ Feedback visual imediato (cores, ícones)
- ✅ Sugestões clicáveis quando houver conflito

### 3. **UX e Acessibilidade**
- ✅ Mensagens de erro posicionadas fora do input (13px abaixo)
- ✅ Notificações com anti-spam (1s cooldown)
- ✅ Campos opcionais claramente marcados

### 4. **Banco de Dados**
- ✅ Queries case-insensitive com `.ilike()` para nomes
- ✅ Avatar padrão como fallback sempre
- ✅ Verificação dupla antes de salvar

### 5. **Deploy e Build**
- ✅ Testar localmente com `npm run build` antes de fazer push
- ✅ Verificar assets no `/assets` do build do Vercel
- ✅ Conferir logs do console do navegador para erros 404

---

## 📊 Commits Importantes desta Sessão

| Commit | Descrição | Arquivos |
|--------|-----------|----------|
| `51e49cb` | Validação de nome único + sugestões | `js/onboarding.js` |
| `7589388` | Ajustes na validação (13px abaixo) | `js/onboarding.js`, `styles/onboarding.css` |
| `94ae0c5` | Exibição do avatar padrão no dashboard | `js/dashboard-real.js` |
| `4471aa8` | Logs de debug para investigar avatar | `js/onboarding.js`, `js/dashboard-real.js` |
| `7d15614` | Corrige caminho para absoluto (tentativa) | `js/onboarding.js`, `js/dashboard-real.js` |
| `c405d2e` | **✅ Solução final:** Import do Vite | `js/onboarding.js`, `js/dashboard-real.js` |
| `67d5373` | Substitui emoji por logo vetorizado | `dashboard.html` |
| `0e88e01` | Adiciona logo_vetorizada.png ao Git | `img/logo_vetorizada.png` |

---

## 🔮 Próximos Passos

### Pendente:
1. **Secure RLS Policies** - Políticas atuais muito abertas (WITH CHECK true)
2. **Admin Dashboard CRUD** - Apenas "Add" implementado, falta View/Edit/Delete
3. **Subclass/Subrace Management** - UI para gerenciar subentidades
4. **Testes E2E** - Validar fluxo completo de onboarding → dashboard

### Para investigar:
- Performance de queries com muitos perfis
- Upload de avatar para Supabase Storage (atualmente salva base64)
- Sistema de notificações persistentes (banco de dados)

---

**Última atualização:** 2025-01-10
**Versão do documento:** 1.0
