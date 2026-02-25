// =====================================
// NOVA AUTENTICAÇÃO - FIREBASE
// =====================================

import { auth, googleProvider } from './firebase-config.js'
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'
import { UserService } from './database.js'

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
// AUTENTICAÇÃO COM GOOGLE (FIREBASE)
// =====================================

async function signInWithGoogle() {
    try {
        showMessage('Conectando com Google...', 'info')

        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', user.uid)

        showMessage('Login com Google realizado!', 'success')

        // Verifica perfil e redireciona
        await checkUserProfile(user)

    } catch (error) {
        console.error('Erro no login com Google:', error)

        let errorMessage = 'Erro no login com Google'

        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Pop-up fechado. Tente novamente.'
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Pop-up bloqueado! Permita pop-ups e tente novamente.'
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Requisição cancelada. Tente novamente.'
        } else {
            errorMessage = error.message
        }

        showMessage(errorMessage, 'error')
    }
}

// =====================================
// AUTENTICAÇÃO COM EMAIL (FIREBASE)
// =====================================

async function signInWithEmail(email, password) {
    try {
        showMessage('Conectando...', 'info')

        const result = await signInWithEmailAndPassword(auth, email, password)
        const user = result.user

        if (user) {
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('currentUserId', user.uid)

        }

        showMessage('Login realizado com sucesso!', 'success')

        // Verifica perfil e redireciona
        await checkUserProfile(user)

    } catch (error) {
        console.error('Erro no login:', error)

        let errorMessage = 'Erro no login'

        if (error.code === 'auth/user-not-found') {
            errorMessage = '❌ Usuário não encontrado. Verifique o email.'
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = '❌ Senha incorreta.'
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ Email inválido.'
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = '❌ Muitas tentativas. Aguarde um momento.'
        } else {
            errorMessage = error.message || 'Erro no login'
        }

        showMessage(errorMessage, 'error')
    }
}

// =====================================
// REGISTRO COM EMAIL (FIREBASE)
// =====================================

async function registerWithEmail(email, password) {
    try {
        showMessage('Criando conta...', 'info')

        const result = await createUserWithEmailAndPassword(auth, email, password)
        const user = result.user

        if (!user) {
            showMessage('Erro: Não foi possível criar a conta.', 'error')
            return
        }

        // Firebase cria sessão imediatamente ✅
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', user.uid)
        localStorage.setItem('userEmail', email)
        localStorage.setItem('onboardingCompleted', 'false')

        showMessage('✅ Conta criada com sucesso! Redirecionando...', 'success')

        setTimeout(() => {
            window.location.href = 'onboarding.html'
        }, 1500)

    } catch (error) {
        console.error('Erro no registro:', error)

        let errorMessage = 'Erro ao criar conta'

        if (error.code === 'auth/email-already-in-use') {
            errorMessage = '❌ Este email já possui uma conta! Use "Entrar" para fazer login.'
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ Email inválido. Verifique o formato.'
        } else if (error.code === 'auth/weak-password') {
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
        const profile = await UserService.getProfile(user.uid)

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', user.uid)

        await UserService.updateLastLogin(user.uid)

        // Verificação de permissões admin/owner
        if (profile && (profile.is_owner || profile.is_admin)) {

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
            localStorage.setItem('userName', profile.display_name || profile.email || 'Usuário')
            localStorage.setItem('userAvatar', profile.avatar_url || '')
            localStorage.setItem('onboardingCompleted', 'true')

            showMessage('Bem-vindo de volta! Carregando dashboard...', 'success')

            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1500)
        } else {
            localStorage.setItem('onboardingCompleted', 'false')

            showMessage('Vamos configurar seu perfil!', 'info')

            setTimeout(() => {
                window.location.href = 'onboarding.html'
            }, 1500)
        }
    } catch (error) {
        console.error('Erro ao verificar perfil:', error)

        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', user.uid)
        localStorage.setItem('onboardingCompleted', 'false')

        setTimeout(() => {
            window.location.href = 'onboarding.html'
        }, 1500)
    }
}

// =====================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =====================================

export function checkAuth() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe()

            if (user) {
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('currentUserId', user.uid)
                resolve(user)
            } else {
                localStorage.removeItem('isLoggedIn')
                localStorage.removeItem('currentUserId')
                resolve(null)
            }
        })
    })
}

// =====================================
// LOGOUT
// =====================================

async function logout() {
    try {
        showMessage('Fazendo logout...', 'info')

        await signOut(auth)

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

    // Verifica sessão ao carregar via Firebase onAuthStateChanged
    const user = await checkAuth()
    if (user) {
        if (window.location.pathname.includes('onboarding.html')) {
            const profile = await UserService.getProfile(user.uid)
            if (profile && profile.onboarding_completed === true) {
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
window.firebaseAuth = {
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    logout,
    checkAuth
}