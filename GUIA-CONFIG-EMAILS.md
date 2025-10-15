# 🎮 GUIA RÁPIDO: Configurar Templates de Email no Supabase

## 📋 Resumo Executivo

Você tem 3 templates de email prontos e personalizados para o RPG Player:
1. ✉️ **Confirmação de Cadastro** - Quando usuário cria conta
2. 🔑 **Recuperação de Senha** - Para redefinir senha
3. 🎉 **Boas-vindas** - Após confirmar email (opcional)

## 🚀 Configuração em 5 Minutos

### PASSO 1: Acesse o Supabase
```
1. Abra: https://app.supabase.com
2. Faça login
3. Selecione projeto: rpgplayer
```

### PASSO 2: Vá para Email Templates
```
No menu lateral esquerdo:
Authentication → Email Templates
```

### PASSO 3: Configure Confirmação de Cadastro

**a) Clique em "Confirm signup"**

**b) Configure:**
- **Subject (Assunto):**
  ```
  🎮 Confirme sua conta - RPG Player
  ```

- **Body (Corpo):**
  - Abra o arquivo: `email-templates/confirm-signup.html`
  - Selecione TODO o conteúdo (Ctrl+A)
  - Copie (Ctrl+C)
  - Cole no campo "Body" do Supabase
  - Clique em **"Save"**

### PASSO 4: Configure Recuperação de Senha

**a) Volte para "Email Templates"**

**b) Clique em "Reset Password" ou "Recovery"**

**c) Configure:**
- **Subject (Assunto):**
  ```
  🔮 Recuperação de senha - RPG Player
  ```

- **Body (Corpo):**
  - Abra o arquivo: `email-templates/recovery.html`
  - Selecione TODO o conteúdo (Ctrl+A)
  - Copie (Ctrl+C)
  - Cole no campo "Body"
  - Clique em **"Save"**

### PASSO 5: Configure URLs de Redirecionamento

**a) Vá para: Authentication → URL Configuration**

**b) Configure:**
- **Site URL:**
  ```
  http://localhost:5500
  ```
  (ou seu domínio se já estiver em produção)

- **Redirect URLs:** Adicione estas URLs (uma por linha):
  ```
  http://localhost:5500/onboarding.html
  http://localhost:5500/dashboard.html
  http://localhost:5500/login.html
  ```

**c) Clique em "Save"**

## 🧪 PASSO 6: Testar!

### Teste de Confirmação:
1. Abra `login.html` no navegador
2. Clique em "Criar Conta"
3. Digite um email REAL (você vai receber o email)
4. Digite uma senha
5. Clique em "Criar Conta"
6. **Verifique sua caixa de entrada!** 📧

### O que você deve ver:
- ✅ Email com design RPG medieval
- ✅ Botão "Confirmar Minha Conta" grande e dourado
- ✅ Tema escuro com gradientes
- ✅ Emojis de RPG (⚔️ 🛡️ 📜)

## 🎨 Preview dos Templates

### Template de Confirmação:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ⚔️ RPG PLAYER ⚔️
      Sua Jornada Começa Aqui
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

           📜
    
  🗡️ Nova Missão: 
     Confirme Sua Identidade

Saudações, Aventureiro!

As Guildas do Reino registraram 
sua chegada...

  ┌─────────────────────────┐
  │ ✨ Confirmar Conta ✨  │
  └─────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Template de Recuperação:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🔮 RPG PLAYER 🔮
      Recuperação de Acesso
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

           🗝️
    
  🛡️ Recuperação de Senha

Olá, Aventureiro!

Recebemos uma solicitação para
redefinir sua senha...

  ┌─────────────────────────┐
  │ 🔑 Redefinir Senha 🔑 │
  └─────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ⚙️ Configurações Opcionais

### Desabilitar Confirmação de Email (Para Desenvolvimento)

Se você quiser que usuários entrem IMEDIATAMENTE após cadastro:

1. **Authentication → Providers → Email**
2. **DESMARQUE:** `☐ Enable email confirmations`
3. **Clique em "Save"**

⚠️ **Atenção:** Isso é recomendado apenas para desenvolvimento!

### Configurar SMTP Customizado (Recomendado)

Para evitar emails irem para spam:

1. **Settings → Auth → SMTP Settings**
2. **Configure seu provedor de email:**
   - SendGrid (grátis até 100/dia)
   - Mailgun (grátis primeiro mês)
   - Gmail (para testes)

## 🔍 Variáveis Disponíveis

Seus templates já usam essas variáveis automaticamente:

- `{{ .ConfirmationURL }}` - Link de confirmação/recuperação
- `{{ .SiteURL }}` - URL do seu site
- `{{ .Token }}` - Token de acesso
- `{{ .Email }}` - Email do usuário

**Não mexa nisso!** O Supabase substitui automaticamente.

## ✅ Checklist Final

Antes de começar a usar:

- [ ] Templates configurados no Supabase
- [ ] URLs de redirecionamento configuradas
- [ ] Testei criando uma nova conta
- [ ] Recebi o email
- [ ] Email está bonito e formatado
- [ ] Botão funciona e redireciona
- [ ] Não foi para spam

## 🆘 Problemas Comuns

### Email não chega
- ✅ Verifique spam/lixo eletrônico
- ✅ Aguarde alguns minutos
- ✅ Use email real (Gmail, Outlook, etc.)
- ✅ Verifique logs: Authentication → Logs

### Email sem formatação
- ✅ Certifique-se de copiar TODO o HTML
- ✅ Não edite o código ao colar
- ✅ Clique em "Save" após colar

### Link não funciona
- ✅ Verifique URLs de redirecionamento
- ✅ Certifique-se que `{{ .ConfirmationURL }}` está no template
- ✅ Teste em navegador anônimo

### Email vai para spam
- ✅ Configure SMTP customizado
- ✅ Use SendGrid ou Mailgun
- ✅ Adicione SPF/DKIM records (produção)

## 🎯 Próximos Passos

Depois de configurar os emails:

1. ✅ Teste o fluxo completo de cadastro
2. ✅ Teste recuperação de senha
3. ✅ Ajuste textos se necessário
4. ✅ Configure SMTP para produção
5. ✅ Monitore taxa de entrega

## 📱 Contato e Suporte

Se tiver dúvidas:
- 📖 Leia: `email-templates/README.md`
- 🔧 Use: `test-auth.html` para testar
- 📧 Consulte: Documentação do Supabase

---

## 🎮 Resumo Visual

```
┌─────────────────────────────────────────────┐
│  1. Acesse Supabase Dashboard               │
│  2. Authentication → Email Templates        │
│  3. Configure "Confirm signup"              │
│  4. Configure "Reset Password"              │
│  5. Configure URLs                          │
│  6. Teste criando uma conta                 │
│  7. Verifique seu email                     │
│  8. ✅ PRONTO!                              │
└─────────────────────────────────────────────┘
```

**Tempo estimado:** 5-10 minutos
**Dificuldade:** Fácil
**Resultado:** Emails lindos e temáticos! 🎉

---

**Feito com ⚔️ para RPG Player**
