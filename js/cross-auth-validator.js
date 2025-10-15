// =====================================
// VERIFICAÇÃO CRUZADA - FIREBASE + SUPABASE
// =====================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm'

// Configuração
const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =====================================
// CLASSE PARA VERIFICAÇÃO CRUZADA
// =====================================

export class CrossAuthValidator {
    
    // Verifica se email existe no Supabase
    static async checkEmailInSupabase(email) {
        try {
            console.log('🔍 Verificando email no Supabase:', email)
            
            const { data, error } = await supabase.rpc('check_email_exists', {
                search_email: email
            })
            
            if (error) {
                console.log('⚠️ Erro ao verificar Supabase:', error.message)
                return false
            }
            
            const exists = data > 0
            console.log(exists ? '✅ Email encontrado no Supabase' : '❌ Email não existe no Supabase')
            return exists
            
        } catch (error) {
            console.error('❌ Erro na verificação Supabase:', error)
            return false
        }
    }
    
    // Verifica se email existe no Firebase (indiretamente)
    static async checkEmailInFirebase(email) {
        try {
            console.log('🔍 Verificando email no Firebase:', email)
            
            // Verifica se existe algum perfil com esse email que veio do Firebase
            // (Firebase users têm um padrão diferente no localStorage ou podem ser identificados de outra forma)
            
            // Método 1: Verificar localStorage histórico
            const existingProfiles = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && key.startsWith('firebase:')) {
                    const value = localStorage.getItem(key)
                    if (value && value.includes(email)) {
                        existingProfiles.push(key)
                    }
                }
            }
            
            // Método 2: Verificar se há perfis no Supabase com metadata do Firebase
            const { data: firebaseProfiles } = await supabase
                .from('profiles')
                .select('*')
                .or(`display_name.ilike.%${email.split('@')[0]}%`)
                .limit(5)
            
            const hasFirebaseProfile = firebaseProfiles && firebaseProfiles.some(profile => 
                profile.avatar_type === 'google' || 
                profile.display_name?.includes('Google') ||
                existingProfiles.length > 0
            )
            
            console.log(hasFirebaseProfile ? '✅ Possível conta Firebase encontrada' : '❌ Nenhuma conta Firebase detectada')
            
            return {
                exists: hasFirebaseProfile,
                profiles: firebaseProfiles || [],
                localStorageKeys: existingProfiles
            }
            
        } catch (error) {
            console.error('❌ Erro na verificação Firebase:', error)
            return { exists: false, profiles: [], localStorageKeys: [] }
        }
    }
    
    // Verificação completa nos dois sistemas
    static async checkEmailInBothSystems(email) {
        try {
            console.log('🔍 Iniciando verificação cruzada para:', email)
            
            // Executa verificações em paralelo
            const [supabaseExists, firebaseCheck] = await Promise.all([
                this.checkEmailInSupabase(email),
                this.checkEmailInFirebase(email)
            ])
            
            const result = {
                email: email,
                existsInSupabase: supabaseExists,
                existsInFirebase: firebaseCheck.exists,
                firebaseProfiles: firebaseCheck.profiles,
                existsAnywhere: supabaseExists || firebaseCheck.exists,
                conflict: supabaseExists && firebaseCheck.exists, // Existe nos dois!
                recommendation: ''
            }
            
            // Define recomendação
            if (result.conflict) {
                result.recommendation = 'CONFLICT: Email existe nos dois sistemas! Usuário deve escolher qual conta usar.'
            } else if (result.existsInSupabase) {
                result.recommendation = 'USE_LOGIN: Email já registrado no Supabase. Use "Entrar" com email/senha.'
            } else if (result.existsInFirebase) {
                result.recommendation = 'USE_GOOGLE: Email já usado com Google. Use "Entrar com Google".'
            } else {
                result.recommendation = 'ALLOW_REGISTER: Email disponível para novo registro.'
            }
            
            console.log('📊 Resultado da verificação cruzada:', result)
            return result
            
        } catch (error) {
            console.error('❌ Erro na verificação cruzada:', error)
            return {
                email: email,
                existsInSupabase: false,
                existsInFirebase: false,
                existsAnywhere: false,
                conflict: false,
                recommendation: 'ERROR: Erro na verificação. Permitir registro.',
                error: error.message
            }
        }
    }
    
    // Função para mostrar mensagem amigável ao usuário
    static getMessageForUser(verificationResult) {
        const { recommendation, email } = verificationResult
        
        switch (recommendation) {
            case 'CONFLICT':
                return {
                    type: 'warning',
                    title: '⚠️ Duas contas encontradas!',
                    message: `O email ${email} já está sendo usado tanto no login com Google quanto no login por email/senha. Escolha como deseja entrar:`,
                    actions: [
                        { text: '🔐 Entrar com Email/Senha', action: 'login-email' },
                        { text: '🌐 Entrar com Google', action: 'login-google' }
                    ]
                }
            
            case 'USE_LOGIN':
                return {
                    type: 'info',
                    title: '📧 Conta já existe!',
                    message: `O email ${email} já possui uma conta criada com email/senha.`,
                    actions: [
                        { text: '🔐 Fazer Login', action: 'login-email' }
                    ]
                }
            
            case 'USE_GOOGLE':
                return {
                    type: 'info',
                    title: '🌐 Conta Google encontrada!',
                    message: `O email ${email} já foi usado para login com Google.`,
                    actions: [
                        { text: '🌐 Entrar com Google', action: 'login-google' }
                    ]
                }
            
            case 'ALLOW_REGISTER':
                return {
                    type: 'success',
                    title: '✅ Email disponível!',
                    message: `O email ${email} está livre para criar uma nova conta.`,
                    actions: [
                        { text: '➡️ Continuar Registro', action: 'continue-register' }
                    ]
                }
            
            default:
                return {
                    type: 'error',
                    title: '❌ Erro na verificação',
                    message: 'Não foi possível verificar o email. Tente novamente.',
                    actions: [
                        { text: '🔄 Tentar Novamente', action: 'retry' }
                    ]
                }
        }
    }
}

// Função global para usar na interface
window.CrossAuthValidator = CrossAuthValidator