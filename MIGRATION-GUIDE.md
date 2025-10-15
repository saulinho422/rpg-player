# =====================================
# MIGRAÇÃO PARA SUPABASE - GUIA COMPLETO
# =====================================

## PASSO 1: CONFIGURAR GOOGLE OAUTH NO SUPABASE

### 1.1 - No Console do Google Cloud:
1. Vá para: https://console.cloud.google.com/
2. Selecione seu projeto Firebase (ou crie um novo)
3. Vá em "APIs & Services" → "Credentials"
4. Clique em "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure:
   - Application type: Web application
   - Name: RPG Player Supabase
   - Authorized JavaScript origins: 
     * http://localhost:3004
     * https://bifiatkpfmrrnfhvgrpb.supabase.co
   - Authorized redirect URIs:
     * https://bifiatkpfmrrnfhvgrpb.supabase.co/auth/v1/callback

### 1.2 - No Painel do Supabase:
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto: bifiatkpfmrrnfhvgrpb
3. Vá em "Authentication" → "Providers"
4. Habilite "Google"
5. Cole:
   - Client ID: (do Google Console)
   - Client Secret: (do Google Console)
6. Clique "Save"

## PASSO 2: CÓDIGO ATUALIZADO (será implementado automaticamente)

## PASSO 3: TESTE E MIGRAÇÃO

### Ordem de implementação:
1. ✅ Configurar Google no Supabase (VOCÊ FAZ)
2. ✅ Atualizar código JavaScript (EU FAÇO)
3. ✅ Testar login Google via Supabase (TESTAMOS JUNTOS)
4. ✅ Migrar usuários existentes (EU FAÇO)
5. ✅ Remover Firebase (EU FAÇO)

=====================================
IMPORTANTE: 
- Guarde este arquivo para referência
- Precisamos do Client ID e Client Secret do Google
- A migração será gradual e segura
=====================================