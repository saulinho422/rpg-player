// ====================================
// FIREBASE + SUPABASE - INTEGRAÇÃO COMPLETA
// (Para usar APÓS configurar Third Party Auth)
// ====================================

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

// ====================================
// CONFIGURAÇÃO
// ====================================

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

// ====================================
// INICIALIZAÇÃO
// ====================================

// Firebase v9+
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

googleProvider.setCustomParameters({
    'prompt': 'select_account'
})

// Supabase com Firebase Token Integration
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Usar Firebase como provedor de auth
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      // Headers personalizados quando necessário
    }
  }
})

// ====================================
// ELEMENTOS DOM
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
// NAVEGAÇÃO
// ====================================

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

// ====================================
// FIREBASE + SUPABASE INTEGRATION
// ====================================

// Função para sincronizar token Firebase com Supabase
async function syncFirebaseWithSupabase(user) {
    try {
        // Obter token Firebase com custom claims
        const token = await user.getIdToken(true) // Force refresh
        
        console.log('🔑 Firebase Token obtido')
        
        // Com Third Party Auth configurado, o Supabase reconhecerá automaticamente
        // o token Firebase através do header Authorization
        
        // Teste se a integração está funcionando
        const { data, error } = await supabase.auth.getUser()
        
        if (error) {
            console.log('⚠️ Third Party Auth ainda não configurado:', error.message)
            return {
                status: 'pending',
                message: 'Third Party Auth precisa ser configurado no Supabase'
            }
        }
        
        console.log('✅ Integração Firebase → Supabase funcionando!')
        return {
            status: 'success',
            message: 'Firebase e Supabase integrados com sucesso',
            supabaseUser: data.user
        }
        
    } catch (error) {
        console.error('❌ Erro na integração:', error)
        return {
            status: 'error',
            message: error.message
        }
    }
}

// ====================================
// AUTENTICAÇÃO FIREBASE
// ====================================

// Login com Google
async function handleGoogleLogin() {
    try {
        showMessage('🔄 Conectando com Google...', 'info')
        
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        
        console.log('✅ Login Google sucesso:', user)
        showMessage('✅ Login com Google realizado!', 'success')
        
        // Sincronizar com Supabase
        const syncResult = await syncFirebaseWithSupabase(user)
        
        updateUserDashboard(user, syncResult)
        
    } catch (error) {
        console.error('❌ Erro login Google:', error)
        
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
                errorMessage = `Erro: ${error.message}`
        }
        
        showMessage(`❌ ${errorMessage}`, 'error')
    }
}

// Login com email
async function handleEmailLogin(email, password) {
    try {
        showMessage('🔄 Fazendo login...', 'info')
        
        const result = await signInWithEmailAndPassword(auth, email, password)
        const user = result.user
        
        console.log('✅ Login email sucesso:', user)
        showMessage('✅ Login realizado!', 'success')
        
        // Sincronizar com Supabase
        const syncResult = await syncFirebaseWithSupabase(user)
        
        updateUserDashboard(user, syncResult)
        
    } catch (error) {
        console.error('❌ Erro login email:', error)
        
        let errorMessage = 'Erro no login'
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuário não encontrado.'
                break
            case 'auth/wrong-password':
                errorMessage = 'Senha incorreta.'
                break
            case 'auth/invalid-email':
                errorMessage = 'Email inválido.'
                break
            case 'auth/too-many-requests':
                errorMessage = 'Muitas tentativas. Tente novamente mais tarde.'
                break
            default:
                errorMessage = error.message
        }
        
        showMessage(`❌ ${errorMessage}`, 'error')
    }
}

// Cadastro com email
async function handleEmailRegister(email, password) {
    try {
        showMessage('🔄 Criando conta...', 'info')
        
        const result = await createUserWithEmailAndPassword(auth, email, password)
        const user = result.user
        
        // Enviar verificação
        await sendEmailVerification(user)
        
        console.log('✅ Cadastro sucesso:', user)
        showMessage('✅ Conta criada! Verifique seu email.', 'success')
        
        // Sincronizar com Supabase
        const syncResult = await syncFirebaseWithSupabase(user)
        
        updateUserDashboard(user, syncResult)
        
    } catch (error) {
        console.error('❌ Erro cadastro:', error)
        
        let errorMessage = 'Erro no cadastro'
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este email já está em uso.'
                break
            case 'auth/weak-password':
                errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.'
                break
            case 'auth/invalid-email':
                errorMessage = 'Email inválido.'
                break
            default:
                errorMessage = error.message
        }
        
        showMessage(`❌ ${errorMessage}`, 'error')
    }
}

// Recuperar senha
async function handlePasswordReset(email) {
    try {
        showMessage('🔄 Enviando email...', 'info')
        
        await sendPasswordResetEmail(auth, email)
        
        console.log('✅ Email de recuperação enviado')
        showMessage('✅ Email de recuperação enviado!', 'success')
        
        showForm(loginForm)
        
    } catch (error) {
        console.error('❌ Erro recuperação:', error)
        
        let errorMessage = 'Erro ao enviar email'
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuário não encontrado.'
                break
            case 'auth/invalid-email':
                errorMessage = 'Email inválido.'
                break
            default:
                errorMessage = error.message
        }
        
        showMessage(`❌ ${errorMessage}`, 'error')
    }
}

// Logout
async function handleLogout() {
    try {
        await signOut(auth)
        
        console.log('✅ Logout realizado')
        showMessage('✅ Logout realizado!', 'success')
        
        showForm(loginForm)
        
    } catch (error) {
        console.error('❌ Erro logout:', error)
        showMessage(`❌ Erro no logout: ${error.message}`, 'error')
    }
}

// ====================================
// DASHBOARD
// ====================================

async function updateUserDashboard(user, syncResult) {
    const userInfo = document.getElementById('userInfo')
    const supabaseStatus = document.getElementById('supabaseStatus')
    
    // Info do Firebase
    userInfo.innerHTML = `
        <h3>🔥 Firebase Auth - Sucesso!</h3>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>Nome:</strong> ${user.displayName || 'Não informado'}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>ID:</strong> ${user.uid}</p>
            <p><strong>Provedor:</strong> ${user.providerData[0]?.providerId || 'email'}</p>
            <p><strong>Email verificado:</strong> ${user.emailVerified ? '✅ Sim' : '⚠️ Não'}</p>
            <p><strong>Último login:</strong> ${new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR')}</p>
        </div>
    `
    
    // Status da integração
    let statusColor = '#f0f9ff'
    let statusIcon = '🔄'
    let statusText = 'Testando...'
    
    if (syncResult.status === 'success') {
        statusColor = '#f0fdf4'
        statusIcon = '✅'
        statusText = 'Integração completa funcionando!'
    } else if (syncResult.status === 'pending') {
        statusColor = '#fffbeb'
        statusIcon = '⚠️'
        statusText = 'Aguardando configuração Third Party Auth'
    } else {
        statusColor = '#fef2f2'
        statusIcon = '❌'
        statusText = 'Erro na integração'
    }
    
    supabaseStatus.innerHTML = `
        <h3>🗄️ Status da Integração Firebase → Supabase</h3>
        <div style="background: ${statusColor}; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>${statusIcon} Status:</strong> ${statusText}</p>
            <p><strong>Mensagem:</strong> ${syncResult.message}</p>
            ${syncResult.supabaseUser ? `<p><strong>Supabase User ID:</strong> ${syncResult.supabaseUser.id}</p>` : ''}
        </div>
        
        ${syncResult.status === 'pending' ? `
        <details style="margin-top: 15px;">
            <summary style="cursor: pointer; font-weight: bold;">🔧 Como configurar Third Party Auth</summary>
            <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin-top: 10px; text-align: left;">
                <h4>Passos para completar:</h4>
                <ol>
                    <li>Acesse: https://supabase.com/dashboard/project/bifiatkpfmrrnfhvgrpb</li>
                    <li>Vá em Authentication > Third-party Auth</li>
                    <li>Clique em "Add Integration"</li>
                    <li>Selecione "Firebase"</li>
                    <li>Digite: <code>player-7a871</code> (Project ID)</li>
                    <li>Salve e teste novamente</li>
                </ol>
            </div>
        </details>
        ` : ''}
    `
    
    showForm(userDashboard)
}

// ====================================
// EVENT LISTENERS
// ====================================

// Google
document.getElementById('googleLogin')?.addEventListener('click', handleGoogleLogin)
document.getElementById('googleRegister')?.addEventListener('click', handleGoogleLogin)

// Email login
document.getElementById('login')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    await handleEmailLogin(email, password)
})

// Email register
document.getElementById('register')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value
    
    if (password !== confirmPassword) {
        showMessage('❌ As senhas não coincidem!', 'error')
        return
    }
    
    await handleEmailRegister(email, password)
})

// Password reset
document.getElementById('forgotPassword')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('resetEmail').value
    await handlePasswordReset(email)
})

// Logout
document.getElementById('logout')?.addEventListener('click', handleLogout)

// ====================================
// AUTH STATE MONITORING
// ====================================

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('🔥 Usuário logado:', user.email)
        const syncResult = await syncFirebaseWithSupabase(user)
        await updateUserDashboard(user, syncResult)
    } else {
        console.log('👤 Usuário deslogado')
        showForm(loginForm)
    }
})

// ====================================
// INICIALIZAÇÃO
// ====================================

console.log('🚀 Firebase + Supabase Integration Ready')
console.log('🔥 Firebase Project:', firebaseConfig.projectId)
console.log('🗄️ Supabase URL:', SUPABASE_URL)
console.log('⚡ Aguardando configuração Third Party Auth')