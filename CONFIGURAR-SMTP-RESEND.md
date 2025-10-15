# 🚀 CONFIGURAR SMTP - RESEND (PRODUÇÃO)

## ⏰ Tempo Total: 15 minutos

---

## 📍 PASSO 1: Criar Conta no Resend (3 min)

### 1.1 Acessar Site

```
🌐 URL: https://resend.com
```

### 1.2 Criar Conta

**Clique em:** `Sign Up` (canto superior direito)

**Preencha:**
```
Email:    seu-email@gmail.com (ou qualquer)
Password: ********** (crie uma senha forte)
```

**Ou use:** Sign up with GitHub (mais rápido)

### 1.3 Verificar Email

```
1. Verifique sua caixa de entrada
2. Procure email de: team@resend.com
3. Clique no link de confirmação
4. Volte para o dashboard
```

---

## 📍 PASSO 2: Obter API Key (2 min)

### 2.1 No Dashboard do Resend

```
Dashboard (página inicial)
└─ Menu lateral: "API Keys"  ← CLICAR
   └─ Botão: "Create API Key"  ← CLICAR
```

### 2.2 Criar API Key

**Formulário:**
```
Name: RPG Player (ou qualquer nome)
Permission: Sending access ✅ (já vem marcado)

[Create] ← CLICAR
```

### 2.3 COPIAR A CHAVE

⚠️ **IMPORTANTE:** A chave aparece **UMA VEZ SÓ**!

```
re_abc123def456ghi789...  ← COPIAR TUDO
```

**Salve em algum lugar seguro!**
- ✅ Bloco de notas temporário
- ✅ Gerenciador de senhas
- ❌ NÃO compartilhe publicamente

---

## 📍 PASSO 3: Configurar no Supabase (5 min)

### 3.1 Abrir Supabase Dashboard

```
🌐 URL: https://supabase.com/dashboard
```

### 3.2 Selecionar Projeto

```
Projetos → rpgplayer (bifiatkpfmrrnfhvgrpb)
```

### 3.3 Navegar até SMTP Settings

```
Menu Lateral:
└─ Authentication  ← CLICAR
   └─ Settings     ← CLICAR
      └─ Rolar até: "SMTP Settings"
```

### 3.4 Habilitar Custom SMTP

```
┌─────────────────────────────────────┐
│ SMTP Settings                       │
│ ─────────────────────────────       │
│                                     │
│ ☑️ Enable Custom SMTP Server        │ ← MARCAR AQUI
└─────────────────────────────────────┘
```

### 3.5 Preencher Configurações

**Campos:**

```
Sender email:
[noreply@seudominio.com]  ← Pode usar: noreply@resend.dev (temporário)

Sender name:
[RPG Player]

Host:
[smtp.resend.com]

Port number:
[587]

Username:
[resend]  ← Exatamente isso: "resend"

Password:
[re_abc123def456...]  ← COLAR sua API Key aqui
```

**Visual:**
```
┌──────────────────────────────────────────┐
│ Sender email:    noreply@resend.dev     │
│ Sender name:     RPG Player              │
│ Host:            smtp.resend.com         │
│ Port:            587                     │
│ Username:        resend                  │
│ Password:        re_abc123...            │
└──────────────────────────────────────────┘
```

### 3.6 Salvar

```
Rolar até o final da página
└─ Botão: [Save]  ← CLICAR
```

**Confirmação:**
```
✅ Settings updated successfully
```

---

## 📍 PASSO 4: Habilitar Confirmação de Email (2 min)

### Na mesma página (Settings):

```
Rolar até: "Email Settings"

┌─────────────────────────────────────┐
│ Email Settings                      │
│ ─────────────────────────────────   │
│                                     │
│ ☑️ Enable email confirmations       │ ← MARCAR
└─────────────────────────────────────┘

[Save] ← CLICAR
```

---

## 📍 PASSO 5: Testar (5 min)

### 5.1 Abrir Aplicação

```
🌐 http://localhost:XXXX/login.html
```

### 5.2 Criar Nova Conta

**⚠️ Use um EMAIL REAL que você tem acesso!**

```
┌──────────────────────────────┐
│ Criar Conta                  │
│                              │
│ Email: seu-email@gmail.com   │
│ Senha: teste123              │
│                              │
│ [Registrar]                  │
└──────────────────────────────┘
```

### 5.3 Verificar Redirecionamento

**Você deve ir para:** `aguarde-confirmacao.html`

```
✅ Página mostra:
   "📧 Confirme seu Email"
   "Enviamos um email para: seu-email@gmail.com"
```

### 5.4 Verificar Email

**Abra seu email:**

```
De:      RPG Player <noreply@resend.dev>  ← SEU REMETENTE!
Assunto: Confirme sua conta - RPG Player
Status:  ✅ NÃO cai em SPAM (Resend tem boa reputação)
```

**Email deve ter:**
- Template RPG temático (se configurou)
- OU template padrão Supabase
- Botão: "Confirmar Minha Conta"

### 5.5 Confirmar Conta

```
Clicar no botão do email
→ Abre: onboarding.html
→ Mensagem: "✅ Email confirmado!"
```

### 5.6 Completar Onboarding

```
1. Escolher avatar
2. Preencher nome
3. Idade, experiência, role
4. Finalizar

→ Deve ir para: dashboard.html ✅
```

---

## ✅ Checklist de Validação

```
☑️ [ ] Criei conta no Resend
☑️ [ ] Copiei API Key
☑️ [ ] Configurei SMTP no Supabase
☑️ [ ] Habilitei Email Confirmation
☑️ [ ] Salvei as configurações
☑️ [ ] Testei registro
☑️ [ ] Fui para aguarde-confirmacao.html
☑️ [ ] Recebi email (inbox, não spam)
☑️ [ ] Email veio de "RPG Player"
☑️ [ ] Confirmei conta
☑️ [ ] Fui para onboarding
☑️ [ ] Completei onboarding
☑️ [ ] Estou no dashboard
```

**Se marcou TODOS:** 🎉 Sistema 100% funcional em PRODUÇÃO!

---

## 🐛 Problemas Comuns

### ❌ Email não chega

**Verificar:**

1. **API Key está correta?**
   ```
   Supabase → Settings → SMTP Settings
   → Password deve ser: re_abc...
   ```

2. **Configurações corretas?**
   ```
   Host:     smtp.resend.com ✅
   Port:     587 ✅
   Username: resend ✅
   ```

3. **Resend Dashboard:**
   ```
   Resend.com → Logs
   → Veja se o email foi enviado
   → Se erro aparece, leia a mensagem
   ```

**Soluções:**

```bash
# Erro "Invalid API Key"
→ Gerar nova API Key no Resend
→ Copiar novamente
→ Colar no Supabase

# Erro "Rate limit exceeded"
→ Aguardar 1 hora
→ Plano gratuito: 3 emails/hora

# Email não aparece no Resend Logs
→ SMTP não está habilitado no Supabase
→ Voltar e marcar "Enable Custom SMTP"
```

---

### ❌ Email vai para SPAM

**Resend raramente cai em spam, mas se acontecer:**

1. **Adicionar domínio verificado:**
   ```
   Resend → Domains → Add Domain
   → seudominio.com
   → Adicionar registros DNS
   → Aguardar verificação
   ```

2. **Usar domínio verificado no Supabase:**
   ```
   Sender email: noreply@seudominio.com
   ```

---

### ❌ "Authentication failed"

**Causa:** Username ou Password incorretos

**Solução:**
```
1. Verificar Username: DEVE ser "resend" (tudo minúsculo)
2. Verificar Password: DEVE ser a API Key completa (re_...)
3. Gerar nova API Key se necessário
```

---

## 🎯 Limites do Resend (Plano Gratuito)

```
📊 Plano Gratuito:
   ├─ 3.000 emails por MÊS
   ├─ 100 emails por DIA
   ├─ Sem limite por hora
   └─ Domínio verificado: 1 grátis

📊 Se crescer muito:
   ├─ Plano pago: $20/mês
   ├─ 50.000 emails/mês
   └─ Domínios ilimitados
```

**Para começar:** 3.000/mês é MUITO! Suficiente para centenas de usuários.

---

## 🆙 Melhorias Futuras (Opcional)

### 1. Adicionar Domínio Próprio

**Se você tem:** `rpgplayer.com`

**No Resend:**
```
Domains → Add Domain
└─ rpgplayer.com
   └─ Adicionar estes registros DNS:
      
      TXT _dmarc.rpgplayer.com
      TXT rpgplayer._domainkey.rpgplayer.com
      
   └─ Aguardar 10-30 min
   └─ Verify
```

**No Supabase:**
```
Sender email: noreply@rpgplayer.com
```

**Benefício:**
- ✅ Mais profissional
- ✅ Menor chance de spam
- ✅ Branding

---

### 2. Personalizar Templates

**Supabase Dashboard:**
```
Authentication → Email Templates
└─ Confirm signup
   └─ Colar conteúdo de: email-templates/confirm-signup.html
   └─ Save template
```

---

### 3. Monitorar Envios

**Resend Dashboard:**
```
Logs → Ver todos os emails enviados
     → Status: Delivered, Bounced, Failed
     → Debugging
```

---

## 📚 Referências

- **Resend Docs:** https://resend.com/docs
- **Supabase SMTP:** https://supabase.com/docs/guides/auth/auth-smtp
- **Resend com Supabase:** https://resend.com/docs/send-with-supabase

---

## 🎉 Pronto!

**Seu sistema agora:**
- ✅ Envia emails profissionais
- ✅ Não tem limites restritivos
- ✅ Não cai em spam
- ✅ Tem logs e monitoramento
- ✅ Pronto para produção! 🚀

---

**⏰ Tempo gasto:** ~15 minutos  
**💰 Custo:** R$ 0,00 (até 3.000 emails/mês)  
**🎯 Resultado:** Sistema profissional de emails

---

*Última atualização: 15/10/2025*  
*Versão: 2.0 - SMTP Customizado*
