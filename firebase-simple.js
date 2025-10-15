// ====================================
// VERSÃO SIMPLIFICADA PARA TESTE
// Firebase Auth independente + Supabase básico
// ====================================

// 🔥 CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDBQ7WocaMQ-f3NMEDZjUM0ro4seE0RyFk",
  authDomain: "player-7a871.firebaseapp.com",
  projectId: "player-7a871",
  storageBucket: "player-7a871.firebasestorage.app",
  messagingSenderId: "526885048287",
  appId: "1:526885048287:web:229cd7035138439a60be6a",
  measurementId: "G-T7P89TVQWK"
}

// 🗄️ CONFIGURAÇÃO DO SUPABASE  
const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

// ====================================
// INICIALIZAÇÃO BÁSICA
// ====================================

// Firebase
firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()
const googleProvider = new firebase.auth.GoogleAuthProvider()

// Supabase (modo básico, sem Third Party Auth por enquanto)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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
// AUTENTICAÇÃO FIREBASE
// ====================================

// Login com Google
async function signInWithGoogle() {
    try {
        showMessage('Redirecionando para Google...', 'info')
        
        // Configurar popup para evitar problemas de CORS
        googleProvider.setCustomParameters({
            'prompt': 'select_account'
        })
        
        const result = await auth.signInWithPopup(googleProvider)
        const user = result.user
        
        showMessage('✅ Login com Google realizado com sucesso!', 'success')
        console.log('🔥 Usuário Firebase:', user)
        
        await updateUserDashboard(user)
        
    } catch (error) {
        console.error('❌ Erro no login com Google:', error)
        
        if (error.code === 'auth/popup-blocked') {
            showMessage('❌ Pop-up bloqueado! Permita pop-ups e tente novamente.', 'error')
        } else if (error.code === 'auth/popup-closed-by-user') {
            showMessage('⚠️ Login cancelado pelo usuário.', 'info')
        } else {
            showMessage(`❌ Erro no login: ${error.message}`, 'error')
        }
    }
}

// Login com email/senha
async function signInWithEmail(email, password) {
    try {
        const result = await auth.signInWithEmailAndPassword(email, password)
        const user = result.user
        
        showMessage('✅ Login realizado com sucesso!', 'success')
        await updateUserDashboard(user)
        
    } catch (error) {
        console.error('❌ Erro no login:', error)
        showMessage(`❌ Erro no login: ${error.message}`, 'error')
    }
}

// Cadastro com email/senha
async function registerWithEmail(email, password) {
    try {
        const result = await auth.createUserWithEmailAndPassword(email, password)
        const user = result.user
        
        // Enviar email de verificação
        await user.sendEmailVerification()
        
        showMessage('✅ Cadastro realizado! Verifique seu email.', 'success')
        await updateUserDashboard(user)
        
    } catch (error) {
        console.error('❌ Erro no cadastro:', error)
        showMessage(`❌ Erro no cadastro: ${error.message}`, 'error')
    }
}

// Recuperação de senha
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email)
        showMessage('✅ Email de recuperação enviado!', 'success')
        showForm(loginForm)
        
    } catch (error) {
        console.error('❌ Erro na recuperação:', error)
        showMessage(`❌ Erro: ${error.message}`, 'error')
    }
}

// Logout
async function signOut() {
    try {
        await auth.signOut()
        showMessage('✅ Logout realizado com sucesso!', 'success')
        showForm(loginForm)
        
    } catch (error) {
        console.error('❌ Erro no logout:', error)
        showMessage(`❌ Erro no logout: ${error.message}`, 'error')
    }
}

// ====================================
// TESTE BÁSICO SUPABASE
// ====================================

async function testSupabaseBasic() {
    try {
        // Teste simples - apenas verificar se o Supabase responde
        const { data, error } = await supabase
            .from('_health') // Endpoint que sempre existe
            .select('*')
            .limit(1)
        
        console.log('🗄️ Teste Supabase:', { data, error })
        
        if (error && error.code === 'PGRST116') {
            // Tabela não existe, mas conexão OK
            return '✅ Supabase conectado (sem Third Party Auth)'
        } else if (error) {
            return `⚠️ Supabase: ${error.message}`
        } else {
            return '✅ Supabase funcionando perfeitamente'
        }
        
    } catch (error) {
        console.error('❌ Erro Supabase:', error)
        return `❌ Erro na conexão: ${error.message}`
    }
}

// ====================================
// DASHBOARD DO USUÁRIO
// ====================================

async function updateUserDashboard(user) {
    const userInfo = document.getElementById('userInfo')
    const supabaseStatus = document.getElementById('supabaseStatus')
    
    // Informações do Firebase
    userInfo.innerHTML = `
        <h3>✅ Firebase Auth Funcionando</h3>
        <p><strong>Nome:</strong> ${user.displayName || 'Não informado'}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.uid}</p>
        <p><strong>Provedor:</strong> ${user.providerData[0]?.providerId || 'email'}</p>
        <p><strong>Email verificado:</strong> ${user.emailVerified ? '✅ Sim' : '⚠️ Não'}</p>
        <p><strong>Último login:</strong> ${new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR')}</p>
    `
    
    // Teste do Supabase
    supabaseStatus.innerHTML = '<p>🔄 Testando Supabase...</p>'
    const supabaseResult = await testSupabaseBasic()
    
    supabaseStatus.innerHTML = `
        <h3>Status dos Sistemas</h3>
        <p><strong>Firebase:</strong> ✅ Funcionando</p>
        <p><strong>Supabase:</strong> ${supabaseResult}</p>
        <p><strong>Integração:</strong> 🔧 Em configuração</p>
        
        <details style="margin-top: 15px;">
            <summary>🔧 Próximos passos</summary>
            <ul style="text-align: left; margin-top: 10px;">
                <li>✅ Firebase Auth configurado</li>
                <li>✅ Supabase conectado</li>
                <li>🔧 Configurar Third Party Auth</li>
                <li>🔧 Adicionar Custom Claims</li>
                <li>🔧 Deploy Cloud Functions</li>
            </ul>
        </details>
    `
    
    showForm(userDashboard)
}

// ====================================
// EVENT LISTENERS
// ====================================

// Botões de Google
document.getElementById('googleLogin')?.addEventListener('click', signInWithGoogle)
document.getElementById('googleRegister')?.addEventListener('click', signInWithGoogle)

// Formulário de login
document.getElementById('login')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    await signInWithEmail(email, password)
})

// Formulário de cadastro
document.getElementById('register')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value
    
    if (password !== confirmPassword) {
        showMessage('❌ As senhas não coincidem!', 'error')
        return
    }
    
    await registerWithEmail(email, password)
})

// Formulário de recuperação
document.getElementById('forgotPassword')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = document.getElementById('resetEmail').value
    await resetPassword(email)
})

// Logout
document.getElementById('logout')?.addEventListener('click', signOut)

// ====================================
// MONITORAMENTO DE ESTADO
// ====================================

auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('🔥 Usuário logado:', user.email)
        await updateUserDashboard(user)
    } else {
        console.log('👤 Usuário deslogado')
        showForm(loginForm)
    }
})

// ====================================
// INICIALIZAÇÃO
// ====================================

console.log('🚀 Sistema inicializado (modo de teste)')
console.log('🔥 Firebase Project:', firebaseConfig.projectId)
console.log('🗄️ Supabase URL:', SUPABASE_URL)
console.log('💡 Esta é uma versão simplificada para teste')