# 📧 Templates de Email - RPG Player

Este diretório contém templates de email personalizados no tema RPG para o Supabase.

## 📁 Templates Disponíveis

### 1. `confirm-signup.html` - Confirmação de Cadastro
- **Uso:** Email enviado quando usuário cria uma conta
- **Tema:** Pergaminho de missão 📜
- **CTA:** Confirmar Minha Conta
- **Variáveis:** `{{ .ConfirmationURL }}`

### 2. `recovery.html` - Recuperação de Senha
- **Uso:** Email enviado para redefinir senha
- **Tema:** Chave mágica 🗝️
- **CTA:** Redefinir Minha Senha
- **Variáveis:** `{{ .ConfirmationURL }}`

### 3. `welcome.html` - Boas-vindas
- **Uso:** Email após confirmar conta com sucesso
- **Tema:** Castelo e aventura 🏰
- **CTA:** Começar Minha Jornada
- **Variáveis:** `{{ .UserName }}`, `{{ .SiteURL }}`

## 🎨 Características dos Templates

- ✅ **Design responsivo** - Funciona em desktop e mobile
- ✅ **Tema RPG medieval** - Consistente com o site
- ✅ **Cores do site** - Gradientes escuros com dourado
- ✅ **Emojis temáticos** - ⚔️ 🛡️ 🏰 🗡️ 📿 🔮
- ✅ **Call-to-actions destacados** - Botões grandes e atrativos
- ✅ **Informações de segurança** - Alertas sobre validade e proteção
- ✅ **HTML inline** - CSS inline para máxima compatibilidade

## 🚀 Como Configurar no Supabase

### Passo 1: Acesse o Dashboard

1. Vá para: https://app.supabase.com
2. Selecione seu projeto: **rpgplayer**
3. No menu lateral, clique em: **Authentication**

### Passo 2: Configure Email Templates

1. Clique em **Email Templates** (ou **Templates**)
2. Você verá três templates principais:
   - Confirm signup
   - Invite user
   - Magic Link
   - Reset Password

### Passo 3: Template de Confirmação (Confirm Signup)

1. Clique em **"Confirm signup"**
2. **Subject:** `🎮 Confirme sua conta - RPG Player`
3. **Body:** Copie todo o conteúdo de `confirm-signup.html`
4. Clique em **Save**

### Passo 4: Template de Recuperação (Reset Password)

1. Volte para Email Templates
2. Clique em **"Reset Password"** ou **"Recovery"**
3. **Subject:** `🔮 Recuperação de senha - RPG Player`
4. **Body:** Copie todo o conteúdo de `recovery.html`
5. Clique em **Save**

### Passo 5: Configure URL de Redirecionamento

No painel de **Authentication**, vá em **URL Configuration**:

- **Site URL:** `http://localhost:5500` (desenvolvimento) ou seu domínio
- **Redirect URLs:** Adicione:
  - `http://localhost:5500/onboarding.html`
  - `http://localhost:5500/dashboard.html`
  - Seu domínio de produção

## 📝 Variáveis do Supabase

Os templates do Supabase usam sintaxe Go template. Variáveis disponíveis:

### Todas os templates:
- `{{ .SiteURL }}` - URL do seu site
- `{{ .ConfirmationURL }}` - URL com token de confirmação/recuperação

### Template de Convite/Boas-vindas:
- `{{ .Email }}` - Email do usuário
- `{{ .Token }}` - Token de acesso
- `{{ .TokenHash }}` - Hash do token
- `{{ .Data }}` - Dados customizados

## 🧪 Testando os Templates

### Teste 1: Confirmação de Cadastro

```javascript
// Crie uma nova conta
const { data, error } = await supabase.auth.signUp({
  email: 'teste@exemplo.com',
  password: 'senha123'
})

// Verifique seu email!
```

### Teste 2: Recuperação de Senha

```javascript
// Solicite recuperação
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'teste@exemplo.com',
  { redirectTo: 'http://localhost:5500/reset-password.html' }
)

// Verifique seu email!
```

## 🎨 Customização

### Cores Principais

```css
/* Gradientes de fundo */
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);

/* Dourado (CTA) */
color: #f1c40f;

/* Verde (Sucesso) */
color: #2ecc71;

/* Vermelho (Alerta) */
color: #e74c3c;

/* Roxo (Mágico) */
color: #9b59b6;

/* Azul (Info) */
color: #3498db;
```

### Modificando Textos

Edite os arquivos HTML e substitua:
- Títulos (`<h1>`, `<h2>`, etc.)
- Parágrafos (`<p>`)
- Textos dos botões
- Mensagens de rodapé

### Adicionando Novas Seções

Os templates são construídos com tabelas HTML. Para adicionar uma seção:

```html
<tr>
    <td style="padding: 30px 40px; color: #ffffff;">
        <!-- Seu conteúdo aqui -->
        <h3>Novo Título</h3>
        <p>Novo conteúdo...</p>
    </td>
</tr>
```

## 📧 Configuração de Email Provider

### Opção 1: Email do Supabase (Padrão)

O Supabase fornece um serviço de email gratuito, mas com limitações:
- ⚠️ Pode ir para spam
- ⚠️ Limite de envios
- ✅ Fácil de configurar
- ✅ Grátis

### Opção 2: SMTP Customizado (Recomendado)

Configure seu próprio SMTP em **Settings** → **Auth** → **SMTP Settings**:

**Provedores recomendados:**
- **SendGrid** - 100 emails/dia grátis
- **Mailgun** - 5000 emails/mês grátis (primeiro mês)
- **AWS SES** - Muito barato, ~$0.10 por 1000 emails
- **Gmail SMTP** - Para desenvolvimento

#### Exemplo de configuração (Gmail):

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: seu-email@gmail.com
SMTP Password: sua-senha-de-app
Sender Email: seu-email@gmail.com
Sender Name: RPG Player
```

**Nota:** Para Gmail, você precisa criar uma "Senha de App" nas configurações de segurança.

## 🔧 Troubleshooting

### Emails não chegam

1. ✅ Verifique a caixa de spam
2. ✅ Confirme que o email está correto
3. ✅ Verifique logs em **Authentication** → **Logs**
4. ✅ Teste com diferentes provedores de email (Gmail, Outlook, etc.)

### Templates não aparecem formatados

1. ✅ Certifique-se de copiar TODO o HTML
2. ✅ Não remova os estilos inline
3. ✅ Verifique se salvou no Supabase
4. ✅ Limpe cache e teste novamente

### Variáveis não funcionam

1. ✅ Use sintaxe correta: `{{ .VariableName }}`
2. ✅ Letras maiúsculas importam
3. ✅ Verifique documentação do Supabase para variáveis disponíveis

## 📚 Recursos Adicionais

- [Documentação do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Go Template Syntax](https://pkg.go.dev/text/template)

## 🎯 Checklist de Configuração

- [ ] Acessei o dashboard do Supabase
- [ ] Configurei template de confirmação (`confirm-signup.html`)
- [ ] Configurei template de recuperação (`recovery.html`)
- [ ] Configurei URLs de redirecionamento
- [ ] Testei criando uma nova conta
- [ ] Recebi o email e está formatado corretamente
- [ ] Email não foi para spam
- [ ] Links funcionam e redirecionam corretamente

## 💡 Dicas

1. **Teste primeiro em desenvolvimento** antes de usar em produção
2. **Use emails reais** para testar (crie uma conta de teste)
3. **Verifique em diferentes clientes de email** (Gmail, Outlook, etc.)
4. **Considere usar SMTP customizado** para evitar spam
5. **Monitore os logs** do Supabase para ver se os emails estão sendo enviados

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs no Supabase Dashboard
2. Teste com `test-auth.html` 
3. Use `help-email-confirmation.html` para diagnóstico
4. Consulte `FIX-EMAIL-CONFIRMATION.md` para soluções comuns

---

**Feito com ⚔️ para RPG Player**
