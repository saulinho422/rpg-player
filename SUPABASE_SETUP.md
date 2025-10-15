# Configuração do Supabase para RPG Player

## Passos para configurar o Supabase:

### 1. Criar conta no Supabase
1. Acesse https://supabase.com
2. Crie uma conta gratuita
3. Crie um novo projeto

### 2. Obter as credenciais
1. No dashboard do seu projeto, vá em **Settings** > **API**
2. Copie a **URL** e a **anon public key**

### 3. Configurar as variáveis no projeto
No arquivo `main.js`, substitua:
```javascript
const SUPABASE_URL = 'sua_url_aqui'
const SUPABASE_ANON_KEY = 'sua_chave_aqui'
```

### 4. Configurar autenticação por email
1. No Supabase, vá em **Authentication** > **Settings**
2. Em **Site URL**, adicione: `http://localhost:3000`
3. Em **Redirect URLs**, adicione: `http://localhost:3000/**`
4. Habilite **Email confirmations** se desejar verificação obrigatória

### 5. Configurar políticas RLS (Row Level Security) - Opcional
Se quiser armazenar dados dos usuários:
```sql
-- Criar tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus dados
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seus dados
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## Funcionalidades implementadas:

✅ **Cadastro de usuário** com verificação de email
✅ **Login/Logout** 
✅ **Recuperação de senha** por email
✅ **Verificação de status do email**
✅ **Reenvio de email de verificação**
✅ **Interface responsiva** e moderna
✅ **Feedback visual** para todas as ações

## Como usar:

1. Configure as credenciais do Supabase
2. Execute `npm install` para instalar dependências
3. Execute `npm run dev` para iniciar o servidor
4. Acesse http://localhost:3000

## Estrutura do projeto:

- `index.html` - Página principal com formulários
- `style.css` - Estilos da aplicação
- `main.js` - Lógica de autenticação com Supabase
- `package.json` - Dependências do projeto
- `vite.config.js` - Configuração do Vite