// =====================================
// NOVA AUTENTICAÇÃO - SÓ SUPABASE
// =====================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm'
import { UserService } from './database.js'

// Configuração do Supabase
const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =====================================
// SISTEMA DE MENSAGENS
// =====================================

function showMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('messages')
    if (!messagesContainer) return

    const messageElement = document.createElement('div')
    messageElement.className = `message ${type}`
    messageElement.textContent = message

    messagesContainer.appendChild(messageElement)

    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement)
        }
    }, 5000)
}

// =====================================
// AUTENTICAÇÃO COM GOOGLE (SUPABASE)
// =====================================

async function signInWithGoogle() {
    try {
        showMessage('Conectando com Google...', 'info')

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Redireciona para a página atual para processar o callback
                redirectTo: `${window.location.origin}/login.html`
            }
        })

        if (error) throw error

        showMessage('Redirecionando para Google...', 'info')

        // O Supabase vai redirecionar automaticamente

    } catch (error) {
        console.error('Erro no login com Google:', error)

        let errorMessage = 'Erro no login com Google'

        if (error.message.includes('popup')) {
            errorMessage = 'Pop-up bloqueado! Permita pop-ups e tente novamente.'
        } else if (error.message.includes('OAuth')) {
            errorMessage = 'Erro na configuração do Google. Tente novamente mais tarde.'
        } else {
            errorMessage = error.message
        }

        showMessage(errorMessage, 'error')
    }
}

// =====================================
// AUTENTICAÇÃO COM EMAIL (SUPABASE)
// =====================================

async function signInWithEmail(email, password) {
    try {
        showMessage('Conectando...', 'info')

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })

        if (error) throw error

        if (data.user) {
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('currentUserId', data.user.id)

            console.log('✅ Usuário logado com ID:', data.user.id)
        }

        showMessage('Login realizado com sucesso!', 'success')

        // Verifica perfil e redireciona
        await checkUserProfile(data.user)

    } catch (error) {
        console.error('Erro no login:', error)
        showMessage(error.message || 'Erro no login', 'error')
    }
}

// =====================================
// REGISTRO COM EMAIL (SUPABASE)
// =====================================

async function registerWithEmail(email, password) {
    try {
        showMessage('Verificando disponibilidade...', 'info')

        // Verifica se email já existe
        const { data: existingUsers } = await supabase.rpc('check_email_exists', {
            search_email: email
        })

        if (existingUsers && existingUsers > 0) {
            showMessage('❌ Este email já possui uma conta! Use "Entrar" para fazer login.', 'error')
            return
        }

        showMessage('Criando conta...', 'info')

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                // Redireciona para onboarding após confirmar email
                emailRedirectTo: `${window.location.origin}/onboarding.html`,
                data: {
                    email: email
                }
            }
        })

        if (error) {
            if (error.message.includes('User already registered')) {
                showMessage('❌ Este email já possui uma conta! Use "Entrar" para fazer login.', 'error')
                return
            }
            throw error
        }

        if (!data.user) {
            showMessage('Erro: Não foi possível criar a conta.', 'error')
            return
        }

        console.log('🔍 Dados do registro:', {
            user: data.user.id,
            session: data.session ? 'Sessão ativa' : 'Sem sessão',
            email: email,
            identities: data.user.identities?.length || 0
        })

        // ⚠️ Com CONFIRMAÇÃO DE EMAIL HABILITADA:
        // - Usuário recebe email de confirmação
        // - Não há sessão até confirmar
        // - Precisa clicar no link do email

        if (data.session) {
            // Sessão criada imediatamente (confirmação desabilitada no Supabase) ✅
            console.log('✅ Sessão criada imediatamente - Email já confirmado ou confirmação desabilitada')

            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('currentUserId', data.user.id)
            localStorage.setItem('userEmail', email)
            localStorage.setItem('onboardingCompleted', 'false')

            showMessage('✅ Conta criada com sucesso! Redirecionando...', 'success')

            setTimeout(() => {
                window.location.href = 'onboarding.html'
            }, 1500)

        } else {
            // Sem sessão = precisa confirmar email 📧
            console.log('📧 Email de confirmação enviado para:', email)

            // Salva email temporariamente para a página de espera
            localStorage.setItem('pendingEmail', email)
            localStorage.setItem('registrationTime', new Date().toISOString())

            showMessage('📧 Conta criada! Verifique seu email para confirmar.', 'success')

            setTimeout(() => {
                window.location.href = 'aguarde-confirmacao.html'
            }, 2000)
        }

    } catch (error) {
        console.error('Erro no registro:', error)

        let errorMessage = 'Erro ao criar conta'

        if (error.message.includes('already registered')) {
            errorMessage = '❌ Este email já tem uma conta! Use "Entrar" para fazer login.'
        } else if (error.message.includes('invalid email')) {
            errorMessage = '❌ Email inválido. Verifique o formato.'
        } else if (error.message.includes('weak password')) {
            errorMessage = '❌ Senha muito fraca. Use pelo menos 6 caracteres.'
        } else if (error.message) {
            errorMessage = `❌ ${error.message}`
        }

        showMessage(errorMessage, 'error')
    }
}

// =====================================
// VERIFICAÇÃO DE PERFIL
// =====================================

async function checkUserProfile(user) {
    try {
        console.log('🔍 Verificando perfil do usuário:', user.id)

        const profile = await UserService.getProfile(user.id)
        console.log('📋 Perfil encontrado:', profile)

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', user.id)

        await UserService.updateLastLogin(user.id)

        // DEBUG: Verificações detalhadas
        console.log('🔍 profile existe:', !!profile)
        console.log('🔍 onboarding_completed:', profile?.onboarding_completed)
        console.log('🔍 display_name:', profile?.display_name)
        console.log('🔍 is_owner:', profile?.is_owner)
        console.log('🔍 is_admin:', profile?.is_admin)

        // ⚡ VERIFICAÇÃO DE PERMISSÕES ADMIN/OWNER
        if (profile && (profile.is_owner || profile.is_admin)) {
            console.log('👑 Usuário é ADMIN/OWNER - redirecionando para admin dashboard')

            localStorage.setItem('userName', profile.display_name || profile.email || 'Admin')
            localStorage.setItem('userAvatar', profile.avatar_url || '')
            localStorage.setItem('isAdmin', 'true')
            localStorage.setItem('isOwner', profile.is_owner ? 'true' : 'false')

            showMessage('🛡️ Bem-vindo, Administrador!', 'success')

            setTimeout(() => {
                window.location.href = 'admin-dashboard.html'
            }, 1500)
            return
        }

        if (profile && profile.onboarding_completed === true) {
            console.log('✅ Usuário já completou onboarding, indo para dashboard')

            localStorage.setItem('userName', profile.display_name || profile.email || 'Usuário')
            localStorage.setItem('userAvatar', profile.avatar_url || '')
            localStorage.setItem('onboardingCompleted', 'true')

            showMessage('Bem-vindo de volta! Carregando dashboard...', 'success')

            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1500)
        } else {
            console.log('⚠️ Usuário precisa completar onboarding')

            localStorage.setItem('onboardingCompleted', 'false')

            showMessage('Vamos configurar seu perfil!', 'info')

            setTimeout(() => {
                window.location.href = 'onboarding.html'
            }, 1500)
        }
    } catch (error) {
        console.error('Erro ao verificar perfil:', error)

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', user.id)
        localStorage.setItem('onboardingCompleted', 'false')

        setTimeout(() => {
            window.location.href = 'onboarding.html'
        }, 1500)
    }
}

// =====================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =====================================

export async function checkAuth() {
    try {
        console.log('🔐 checkAuth() - Verificando sessão...')

        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            console.error('❌ Erro ao obter sessão:', error)
            throw error
        }

        console.log('📊 Sessão obtida:', session ? {
            user_id: session.user.id,
            email: session.user.email,
            confirmed_at: session.user.confirmed_at
        } : 'Nenhuma sessão')

        if (session && session.user) {
            // Verifica se o email foi confirmado
            if (!session.user.confirmed_at && !session.user.email_confirmed_at) {
                console.log('⚠️ Email ainda não confirmado')
                // Mesmo assim permite acesso (para desenvolvimento)
            }

            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('currentUserId', session.user.id)
            console.log('✅ Usuário autenticado:', session.user.id)
            return session.user
        }

        // Se não há sessão, limpa localStorage
        console.log('❌ Nenhuma sessão ativa, limpando localStorage')
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('currentUserId')
        return null

    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error)
        return null
    }
}

// =====================================
// LOGOUT
// =====================================

async function logout() {
    try {
        showMessage('Fazendo logout...', 'info')

        const { error } = await supabase.auth.signOut()

        if (error) throw error

        // Limpa localStorage
        localStorage.clear()

        showMessage('Logout realizado com sucesso!', 'success')

        setTimeout(() => {
            window.location.href = 'login.html'
        }, 1000)

    } catch (error) {
        console.error('Erro no logout:', error)
        showMessage('Erro no logout', 'error')
    }
}

// =====================================
// INICIALIZAÇÃO
// =====================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando auth.js')

    // CORREÇÃO: Verifica se há hash de callback do OAuth/confirmação de email na URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    if (accessToken) {
        console.log('� Callback de autenticação detectado!', { type })

        // Aguarda o Supabase processar a sessão
        setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                console.log('✅ Sessão criada após callback:', session.user.id)

                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('currentUserId', session.user.id)

                // Verifica se é login com Google (signup) ou confirmação de email
                if (type === 'signup') {
                    console.log('📧 Confirmação de email detectada')
                    showMessage('✅ Email confirmado! Configurando sua conta...', 'success')
                } else {
                    console.log('🔐 Login com Google detectado')
                    showMessage('✅ Autenticado com Google! Verificando perfil...', 'success')
                }

                // Verifica o perfil e redireciona adequadamente
                await checkUserProfile(session.user)
            }
        }, 1000)

        return
    }

    // Inicializa sistema de abas se existir
    initTabs()

    // Event listeners para botões
    const googleBtns = document.querySelectorAll('[data-action="google-login"]')
    googleBtns.forEach(btn => {
        btn.addEventListener('click', signInWithGoogle)
    })

    // Forms de login/registro
    const loginForm = document.getElementById('loginForm')
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            const email = formData.get('email')
            const password = formData.get('password')
            await signInWithEmail(email, password)
        })
    }

    const registerForm = document.getElementById('registerForm')
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            const email = formData.get('email')
            const password = formData.get('password')
            await registerWithEmail(email, password)
        })
    }

    // Botões de logout
    const logoutBtns = document.querySelectorAll('#logoutBtn, [data-action="logout"]')
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', logout)
    })

    // Verifica sessão ao carregar
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
        console.log('🔐 Sessão encontrada ao carregar página:', session.user.email)

        if (window.location.pathname.includes('login.html')) {
            // NÃO redireciona automaticamente - deixa usuário fazer logout se quiser
            console.log('ℹ️ Usuário já está logado, mas permanece na página de login')
            // Notificação removida - silencioso
        } else if (window.location.pathname.includes('onboarding.html')) {
            // Se está no onboarding, verifica se realmente precisa estar aqui
            console.log('🔍 Verificando se usuário precisa mesmo do onboarding')
            const profile = await UserService.getProfile(session.user.id)

            if (profile && profile.onboarding_completed === true) {
                console.log('⚠️ Usuário já completou onboarding mas está na página de onboarding!')
                showMessage('Você já completou o onboarding! Redirecionando...', 'info')

                setTimeout(() => {
                    window.location.href = 'dashboard.html'
                }, 2000)
            }
        }
    }
})

// =====================================
// FUNÇÕES AUXILIARES
// =====================================

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn')
    const tabContents = document.querySelectorAll('.tab-content')

    if (tabBtns.length === 0) return

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab

            tabBtns.forEach(b => b.classList.remove('active'))
            tabContents.forEach(content => content.classList.remove('active'))

            btn.classList.add('active')
            const targetContent = document.getElementById(`${targetTab}-tab`)
            if (targetContent) {
                targetContent.classList.add('active')
            }
        })
    })
}

// Exporta funções principais
window.supabaseAuth = {
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logout,
    checkAuth
}