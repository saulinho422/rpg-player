# 🔐 Configuração de Login Social (Google + GitHub)

## ✅ Funcionalidades Adicionadas:

- **Login com Google** ✨
- **Login com GitHub** ✨
- **Interface moderna** com botões sociais
- **Redirecionamento automático** após autenticação

---

## 🚀 Como configurar no Supabase:

### 1. **Google OAuth Setup:**

#### No Google Cloud Console:
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure:
   - **Application type:** Web application
   - **Name:** RPG Player
   - **Authorized JavaScript origins:** 
     - `http://localhost:3000`
     - `https://bifiatkpfmrrnfhvgrpb.supabase.co`
   - **Authorized redirect URIs:**
     - `https://bifiatkpfmrrnfhvgrpb.supabase.co/auth/v1/callback`

6. Copie o **Client ID** e **Client Secret**

#### No Supabase Dashboard:
1. Vá em **Authentication** > **Providers**
2. Habilite **Google**
3. Cole o **Client ID** e **Client Secret**
4. Salve as configurações

---

### 2. **GitHub OAuth Setup:**

#### No GitHub:
1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em **New OAuth App**
3. Configure:
   - **Application name:** RPG Player
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `https://bifiatkpfmrrnfhvgrpb.supabase.co/auth/v1/callback`

4. Copie o **Client ID** e **Client Secret**

#### No Supabase Dashboard:
1. Vá em **Authentication** > **Providers**
2. Habilite **GitHub**
3. Cole o **Client ID** e **Client Secret**
4. Salve as configurações

---

## 🎯 **URLs importantes para configuração:**

### **Supabase Project URL:**
```
https://bifiatkpfmrrnfhvgrpb.supabase.co
```

### **Callback URL para OAuth:**
```
https://bifiatkpfmrrnfhvgrpb.supabase.co/auth/v1/callback
```

### **Site URL (Local Development):**
```
http://localhost:3000
```

---

## 📱 **Como testar:**

1. **Execute o projeto:** `npm run dev`
2. **Acesse:** `http://localhost:3000`
3. **Clique em "Entrar com Google"** ou **"Entrar com GitHub"**
4. **Autorize a aplicação**
5. **Seja redirecionado automaticamente**

---

## 🔧 **Configurações adicionais no Supabase:**

### **Site URL e Redirect URLs:**
No painel **Authentication > URL Configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** 
  - `http://localhost:3000/**`
  - `http://localhost:3000`

### **Para produção, adicione também:**
- Seu domínio de produção
- URLs de callback de produção

---

## 🎨 **Recursos implementados:**

✅ **Botões sociais** com ícones do Google e GitHub  
✅ **Design responsivo** e moderno  
✅ **Feedback visual** durante o processo  
✅ **Fallback para login tradicional**  
✅ **Mesma experiência** para login e cadastro  
✅ **Redirecionamento automático** após autenticação  

---

## 🚀 **Próximos passos:**

1. Configure as credenciais OAuth
2. Teste o login social
3. Personalize a experiência do usuário
4. Adicione mais provedores se desejar (Discord, Twitter, etc.)

**O sistema está pronto para uso assim que você configurar as credenciais OAuth! 🎮**