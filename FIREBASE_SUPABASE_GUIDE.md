# 🔥 Firebase + Supabase Integration Guide

## 🎯 **Arquitetura da sua configuração:**

```
Firebase Auth (Login Google) → JWT Token → Supabase (Database)
```

### **Vantagens desta abordagem:**
✅ **Firebase Auth** - Melhor OAuth social do mercado  
✅ **Supabase Database** - PostgreSQL poderoso com RLS  
✅ **Third Party Auth** - Integração oficial  
✅ **Custom Claims** - Role `authenticated` automático  

---

## 📋 **Passos para configurar:**

### 1. **Configurar Firebase (você já fez)**
- ✅ Projeto Firebase criado
- ✅ Authentication habilitado  
- ✅ Google OAuth configurado
- ✅ Third Party Auth no Supabase ativado

### 2. **Obter credenciais do Firebase**
No [Firebase Console](https://console.firebase.google.com/):
1. Vá em **Project Settings** (⚙️)
2. Em **General** > **Your apps**
3. Copie o `firebaseConfig` object

### 3. **Configurar custom claims (IMPORTANTE)**
Você precisa adicionar a claim `role: 'authenticated'` nos tokens.

#### Opção A: Cloud Function (Recomendado)
```javascript
// functions/index.js
const { beforeUserCreated, beforeUserSignedIn } = require('firebase-functions/v2/identity')

exports.beforecreated = beforeUserCreated((event) => {
  return {
    customClaims: {
      role: 'authenticated', // ← ESSENCIAL para Supabase
    },
  }
})

exports.beforesignedin = beforeUserSignedIn((event) => {
  return {
    customClaims: {
      role: 'authenticated', // ← ESSENCIAL para Supabase
    },
  }
})
```

#### Opção B: Admin SDK para usuários existentes
```javascript
const admin = require('firebase-admin')
admin.initializeApp()

// Script para atualizar usuários existentes
async function setRoleForAllUsers() {
  let nextPageToken
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken)
    nextPageToken = result.pageToken
    
    await Promise.all(result.users.map(async (user) => {
      await admin.auth().setCustomUserClaims(user.uid, {
        role: 'authenticated'
      })
    }))
  } while (nextPageToken)
}
```

### 4. **Configurar no Supabase Dashboard**
1. Vá em **Authentication** > **Third-party Auth**
2. Adicione **Firebase Integration**
3. Insira seu **Firebase Project ID**

### 5. **Atualizar o código JavaScript**
No arquivo `firebase-supabase.js`, substitua:
```javascript
const firebaseConfig = {
  apiKey: "SEU_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com", 
  projectId: "SEU_FIREBASE_PROJECT_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "123456789",
  appId: "SEU_APP_ID"
}
```

---

## 🔧 **Configurações de segurança (RLS Policies)**

### Política restritiva para Firebase + Supabase:
```sql
-- Função helper para seu projeto específico
CREATE FUNCTION public.is_supabase_or_firebase_project_jwt()
RETURNS BOOL
LANGUAGE SQL
STABLE
RETURNS NULL ON NULL INPUT
RETURN (
  (auth.jwt()->>'iss' = 'https://bifiatkpfmrrnfhvgrpb.supabase.co/auth/v1')
  OR
  (
    auth.jwt()->>'iss' = 'https://securetoken.google.com/player-7a871'
    AND
    auth.jwt()->>'aud' = 'player-7a871'
  )
);

-- Política para suas tabelas
CREATE POLICY "Restrict access to correct projects"
ON sua_tabela
AS RESTRICTIVE  
TO authenticated
USING ((SELECT public.is_supabase_or_firebase_project_jwt()) IS TRUE);
```

---

## 🧪 **Como testar:**

### 1. **Configurar e executar:**
```bash
# Configurar as credenciais Firebase
# Abrir index-firebase.html no navegador
npm run dev
```

### 2. **Fluxo de teste:**
1. **Login com Google** → Deve funcionar via Firebase
2. **Verificar dashboard** → Mostra dados do Firebase
3. **Status Supabase** → Deve mostrar "✅ Conectado"
4. **Console do navegador** → Verificar tokens JWT

### 3. **Debugger checklist:**
- ✅ Firebase auth funcionando
- ✅ Custom claim `role: 'authenticated'` presente
- ✅ Token sendo passado para Supabase
- ✅ Supabase reconhecendo o usuário

---

## 🔍 **Resolução de problemas:**

### **Erro: "JWT não válido"**
- Verifique se custom claims estão configuradas
- Force refresh: `getIdToken(true)`

### **Erro: "Unauthorized"**
- Verifique RLS policies
- Confirme Project ID correto

### **Erro: "Token rejected"**
- Verifique Third Party Auth no Supabase
- Confirme Firebase Project ID

---

## 🚀 **Próximos passos:**

1. **Configure as credenciais Firebase** no código
2. **Configure custom claims** (Cloud Functions)
3. **Teste a integração**
4. **Configure RLS policies** para suas tabelas
5. **Deploy em produção**

**Sua arquitetura é muito avançada e poderosa! 🔥**