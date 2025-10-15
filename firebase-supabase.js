// ====================================
// CONFIGURAÇÃO FIREBASE + SUPABASE
// ====================================

// 🔥 CONFIGURAÇÃO DO FIREBASE
// Substitua pelos dados do seu projeto Firebase
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_FIREBASE_APP_ID"
}

// 🗄️ CONFIGURAÇÃO DO SUPABASE  
const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

// ====================================
// INICIALIZAÇÃO
// ====================================

// Inicializar Firebase
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const googleProvider = new firebase.auth.GoogleAuthProvider()

// Inicializar Supabase com Firebase Token
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  accessToken: async () => {
    const user = auth.currentUser
    if (user) {
      try {
        const token = await user.getIdToken(/* forceRefresh */ false)
        console.log('🔑 Firebase Token obtido para Supabase')
        return token
      } catch (error) {
        console.error('❌ Erro ao obter Firebase token:', error)
        return null
      }
    }
    return null
  }
})

// ====================================
// ELEMENTOS DO DOM
// ====================================

const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')
const forgotPasswordForm = document.getElementById('forgotPasswordForm')
const userDashboard = document.getElementById('userDashboard')
const messageDiv = document.getElementById('message')

// ====================================
// FUNÇÕES UTILITÁRIAS
// ====================================

function showMessage(text, type = 'info') {
    messageDiv.textContent = text
    messageDiv.className = `message ${type}`
    messageDiv.classList.remove('hidden')
    
    setTimeout(() => {
        messageDiv.classList.add('hidden')
    }, 5000)
}

function showForm(formToShow) {
    const forms = [loginForm, registerForm, forgotPasswordForm, userDashboard]
    forms.forEach(form => form.classList.add('hidden'))
    formToShow.classList.remove('hidden')
}

// ====================================
// NAVEGAÇÃO ENTRE FORMULÁRIOS
// ====================================

document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault()
    showForm(registerForm)
})

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault()
    showForm(loginForm)
})

document.getElementById('showForgotPassword').addEventListener('click', (e) => {
    e.preventDefault()
    showForm(forgotPasswordForm)
})

document.getElementById('backToLogin').addEventListener('click', (e) => {
    e.preventDefault()
    showForm(loginForm)
})

// ====================================
// AUTENTICAÇÃO FIREBASE
// ====================================

// Login com Google
async function signInWithGoogle() {
    try {
        showMessage('Redirecionando para Google...', 'info')
        const result = await auth.signInWithPopup(googleProvider)
        const user = result.user
        
        // Forçar refresh do token para incluir custom claims
        await user.getIdToken(/* forceRefresh */ true)
        
        showMessage('Login com Google realizado com sucesso!', 'success')
        await updateUserDashboard(user)
        
    } catch (error) {
        console.error('❌ Erro no login com Google:', error)
        showMessage(`Erro no login com Google: ${error.message}`, 'error')
    }
}

// Login com email/senha
async function signInWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password)
        const user = result.user
        
        // Forçar refresh do token para incluir custom claims
        await user.getIdToken(/* forceRefresh */ true)
        
        showMessage('Login realizado com sucesso!', 'success')
        await updateUserDashboard(user)
        
    } catch (error) {
        console.error('❌ Erro no login:', error)
        showMessage(`Erro no login: ${error.message}`, 'error')
    }
}

// Cadastro com email/senha
async function registerWithEmail(email, password) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password)
        const user = result.user
        
        // Enviar email de verificação
        await user.sendEmailVerification()
        
        // Forçar refresh do token para incluir custom claims
        await user.getIdToken(/* forceRefresh */ true)
        
        showMessage('Cadastro realizado! Verifique seu email para ativar a conta.', 'success')
        await updateUserDashboard(user)
        
    } catch (error) {
        console.error('❌ Erro no cadastro:', error)
        showMessage(`Erro no cadastro: ${error.message}`, 'error')
    }
}

// Recuperação de senha
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email)
        showMessage('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success')
        showForm(loginForm)
        
    } catch (error) {
        console.error('❌ Erro na recuperação:', error)
        showMessage(`Erro: ${error.message}`, 'error')
    }
}

// Logout
async function signOut() {
    try {
        await auth.signOut()
        showMessage('Logout realizado com sucesso!', 'success')
        showForm(loginForm)
        
    } catch (error) {
        console.error('❌ Erro no logout:', error)
        showMessage(`Erro no logout: ${error.message}`, 'error')
    }
}

// ====================================
// INTEGRAÇÃO COM SUPABASE
// ====================================

async function testSupabaseConnection(user) {
    try {
        // Testar conexão com Supabase usando o token do Firebase
        const { data, error } = await supabase.auth.getUser()
        
        if (error) {
            console.error('❌ Erro na conexão Supabase:', error)
            return `❌ Erro: ${error.message}`
        }
        
        console.log('✅ Supabase conectado:', data)
        return '✅ Conectado ao Supabase com token Firebase'
        
    } catch (error) {
        console.error('❌ Erro ao testar Supabase:', error)
        return `❌ Erro na conexão: ${error.message}`
    }
}

// ====================================
// DASHBOARD DO USUÁRIO
// ====================================

async function updateUserDashboard(user) {
    const userInfo = document.getElementById('userInfo')
    const supabaseStatus = document.getElementById('supabaseStatus')
    
    // Obter token com claims
    const token = await user.getIdToken()
    
    userInfo.innerHTML = `
        <h3>Informações do Usuário (Firebase)</h3>
        <p><strong>Nome:</strong> ${user.displayName || 'Não informado'}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.uid}</p>
        <p><strong>Provedor:</strong> ${user.providerData[0]?.providerId || 'email'}</p>
        <p><strong>Email verificado:</strong> ${user.emailVerified ? '✅ Sim' : '⚠️ Não'}</p>
        <p><strong>Último login:</strong> ${new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR')}</p>
    `
    
    // Testar conexão com Supabase
    supabaseStatus.innerHTML = '<p>🔄 Testando conexão com Supabase...</p>'
    const supabaseResult = await testSupabaseConnection(user)
    supabaseStatus.innerHTML = `
        <h3>Status da Integração</h3>
        <p>${supabaseResult}</p>
        <details>
            <summary>Detalhes técnicos (clique para expandir)</summary>
            <p><strong>Firebase Project:</strong> ${firebaseConfig.projectId}</p>
            <p><strong>Supabase URL:</strong> ${SUPABASE_URL}</p>
            <p><strong>Token JWT:</strong> ${token.substring(0, 50)}...</p>
        </details>
    `
    
    showForm(userDashboard)
}

// ====================================
// EVENT LISTENERS
// ====================================

// Botões de Google
document.getElementById('googleLogin').addEventListener('click', signInWithGoogle)
document.getElementById('googleRegister').addEventListener('click', signInWithGoogle)

// Formulário de login
document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    await signInWithEmail(email, password)
})

// Formulário de cadastro
document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value
    
    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem!', 'error')
        return
    }
    
    await registerWithEmail(email, password)
})

// Formulário de recuperação
document.getElementById('forgotPassword').addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('resetEmail').value
    await resetPassword(email)
})

// Logout
document.getElementById('logout').addEventListener('click', signOut)

// ====================================
// MONITORAMENTO DE ESTADO
// ====================================

auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('🔥 Usuário logado no Firebase:', user.email)
        await updateUserDashboard(user)
    } else {
        console.log('👤 Usuário deslogado')
        showForm(loginForm)
    }
})

// ====================================
// INICIALIZAÇÃO
// ====================================

console.log('🚀 Sistema Firebase + Supabase inicializado')
console.log('🔥 Firebase Project:', firebaseConfig.projectId)
console.log('🗄️ Supabase URL:', SUPABASE_URL)