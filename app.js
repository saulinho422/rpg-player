// =====================================
// RPG PLAYER - SISTEMA DE AUTENTICAÇÃO
// =====================================

// Importações Firebase v9+
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js'
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js'

// Importação Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// =====================================
// CONFIGURAÇÃO
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyDBQ7WocaMQ-f3NMEDZjUM0ro4seE0RyFk",
  authDomain: "player-7a871.firebaseapp.com",
  projectId: "player-7a871",
  storageBucket: "player-7a871.firebasestorage.app",
  messagingSenderId: "526885048287",
  appId: "1:526885048287:web:229cd7035138439a60be6a",
  measurementId: "G-T7P89TVQWK"
}

const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

// =====================================
// INICIALIZAÇÃO
// =====================================

// Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
    'prompt': 'select_account'
})

// Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =====================================
// ELEMENTOS DOM
// =====================================

const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')
const forgotPasswordForm = document.getElementById('forgotPasswordForm')
const emailVerification = document.getElementById('emailVerification')
const userDashboard = document.getElementById('userDashboard')
const messageDiv = document.getElementById('message')

// =====================================
// FUNÇÕES UTILITÁRIAS
// =====================================

function showMessage(text, type = 'info') {
    messageDiv.textContent = text
    messageDiv.className = `message ${type}`
    messageDiv.classList.remove('hidden')
    
    setTimeout(() => {
        messageDiv.classList.add('hidden')
    }, 5000)
}

function showForm(formToShow) {
    const forms = [loginForm, registerForm, forgotPasswordForm, emailVerification, userDashboard]
    forms.forEach(form => form.classList.add('hidden'))
    formToShow.classList.remove('hidden')
}

// =====================================
// NAVEGAÇÃO
// =====================================

document.getElementById('showRegister')?.addEventListener('click', (e) => {
    e.preventDefault()
    showForm(registerForm)
})

document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault()
    showForm(loginForm)
})

document.getElementById('showForgotPassword')?.addEventListener('click', (e) => {
    e.preventDefault()
    showForm(forgotPasswordForm)
})

document.getElementById('backToLogin')?.addEventListener('click', (e) => {
    e.preventDefault()
    showForm(loginForm)
})

document.getElementById('backToLoginFromVerification')?.addEventListener('click', (e) => {
    e.preventDefault()
    showForm(loginForm)
})

// =====================================
// AUTENTICAÇÃO - GOOGLE (FIREBASE)
// =====================================

async function signInWithGoogle() {
    try {
        showMessage('Conectando...', 'info')
        
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        
        showMessage('Login realizado com sucesso!', 'success')
        updateFirebaseDashboard(user)
        
    } catch (error) {
        console.error('Erro no login:', error)
        
        let errorMessage = 'Erro no login com Google'
        
        switch (error.code) {
            case 'auth/popup-blocked':
                errorMessage = 'Pop-up bloqueado! Permita pop-ups e tente novamente.'
                break
            case 'auth/popup-closed-by-user':
                errorMessage = 'Login cancelado pelo usuário.'
                break
            case 'auth/cancelled-popup-request':
                errorMessage = 'Apenas um pop-up por vez.'
                break
            default:
                errorMessage = error.message
        }
        
        showMessage(errorMessage, 'error')
    }
}

function updateFirebaseDashboard(user) {
    const userInfo = document.getElementById('userInfo')
    const emailStatus = document.getElementById('emailStatus')
    
    userInfo.innerHTML = `
        <h3>Informações do Usuário</h3>
        <p><strong>Nome:</strong> ${user.displayName || 'Não informado'}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Provedor:</strong> Google</p>
        <p><strong>Último login:</strong> ${new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR')}</p>
    `
    
    emailStatus.innerHTML = '✅ Conta verificada pelo Google'
    emailStatus.className = 'verified'
    
    showForm(userDashboard)
}

// =====================================
// AUTENTICAÇÃO - EMAIL (SUPABASE)
// =====================================

async function signInWithEmail(email, password) {
    try {
        showMessage('Fazendo login...', 'info')
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) {
            showMessage(`Erro no login: ${error.message}`, 'error')
            return
        }
        
        showMessage('Login realizado com sucesso!', 'success')
        updateSupabaseDashboard(data.user)
        
    } catch (error) {
        console.error('Erro no login:', error)
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
}

async function signUpWithEmail(email, password) {
    try {
        showMessage('Criando conta...', 'info')
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        })
        
        if (error) {
            showMessage(`Erro no cadastro: ${error.message}`, 'error')
            return
        }
        
        if (data.user && !data.session) {
            showMessage('Cadastro realizado! Verifique seu email para ativar a conta.', 'success')
            showForm(emailVerification)
        } else {
            showMessage('Cadastro realizado com sucesso!', 'success')
            updateSupabaseDashboard(data.user)
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error)
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
}

async function resetPassword(email) {
    try {
        showMessage('Enviando email...', 'info')
        
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        
        if (error) {
            showMessage(`Erro: ${error.message}`, 'error')
            return
        }
        
        showMessage('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success')
        showForm(loginForm)
        
    } catch (error) {
        console.error('Erro na recuperação:', error)
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
}

function updateSupabaseDashboard(user) {
    const userInfo = document.getElementById('userInfo')
    const emailStatus = document.getElementById('emailStatus')
    
    userInfo.innerHTML = `
        <h3>Informações do Usuário</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Provedor:</strong> Email</p>
        <p><strong>Último login:</strong> ${new Date(user.last_sign_in_at).toLocaleString('pt-BR')}</p>
    `
    
    if (user.email_confirmed_at) {
        emailStatus.innerHTML = '✅ Email verificado'
        emailStatus.className = 'verified'
    } else {
        emailStatus.innerHTML = '⚠️ Email não verificado - Verifique sua caixa de entrada'
        emailStatus.className = 'unverified'
    }
    
    showForm(userDashboard)
}

// =====================================
// LOGOUT
// =====================================

async function handleLogout() {
    try {
        // Tentar logout do Firebase primeiro
        if (auth.currentUser) {
            await signOut(auth)
        }
        
        // Tentar logout do Supabase
        const { error } = await supabase.auth.signOut()
        
        if (error) {
            console.error('Erro no logout Supabase:', error)
        }
        
        showMessage('Logout realizado com sucesso!', 'success')
        showForm(loginForm)
        
    } catch (error) {
        console.error('Erro no logout:', error)
        showMessage(`Erro no logout: ${error.message}`, 'error')
    }
}

// =====================================
// REENVIO DE VERIFICAÇÃO
// =====================================

async function resendVerification() {
    const email = document.getElementById('registerEmail').value
    
    if (!email) {
        showMessage('Email não encontrado. Tente fazer o cadastro novamente.', 'error')
        return
    }
    
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email
        })
        
        if (error) {
            showMessage(`Erro: ${error.message}`, 'error')
            return
        }
        
        showMessage('Email de verificação reenviado!', 'success')
        
    } catch (error) {
        console.error('Erro no reenvio:', error)
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
}

// =====================================
// EVENT LISTENERS
// =====================================

// Google Auth
document.getElementById('googleLogin')?.addEventListener('click', signInWithGoogle)
document.getElementById('googleRegister')?.addEventListener('click', signInWithGoogle)

// Email Login
document.getElementById('login')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    await signInWithEmail(email, password)
})

// Email Register
document.getElementById('register')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value
    
    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem!', 'error')
        return
    }
    
    await signUpWithEmail(email, password)
})

// Password Reset
document.getElementById('forgotPassword')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('resetEmail').value
    await resetPassword(email)
})

// Logout
document.getElementById('logout')?.addEventListener('click', handleLogout)

// Resend Verification
document.getElementById('resendVerification')?.addEventListener('click', resendVerification)

// =====================================
// MONITORAMENTO DE ESTADO
// =====================================

// Firebase Auth State
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('Usuário Firebase logado:', user.email)
        updateFirebaseDashboard(user)
    }
})

// Supabase Auth State
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        console.log('Usuário Supabase logado:', session.user.email)
        updateSupabaseDashboard(session.user)
    } else if (event === 'SIGNED_OUT') {
        console.log('Usuário deslogado')
        showForm(loginForm)
    }
})

// Verificar sessão inicial
async function checkInitialSession() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
        updateSupabaseDashboard(session.user)
    } else if (!auth.currentUser) {
        showForm(loginForm)
    }
}

// =====================================
// INICIALIZAÇÃO
// =====================================

checkInitialSession()