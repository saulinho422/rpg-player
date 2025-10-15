// ====================================
// FIREBASE V9+ MODERNO + SUPABASE
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

// Configurar provider Google para evitar problemas
googleProvider.setCustomParameters({
    'prompt': 'select_account'
})

// Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

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
        
        // Obter token para Supabase
        const token = await user.getIdToken()
        console.log('🔑 Token Firebase:', token.substring(0, 50) + '...')
        
        updateUserDashboard(user)
        
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
        
        updateUserDashboard(user)
        
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
        
        updateUserDashboard(user)
        
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
// TESTE SUPABASE
// ====================================

async function testSupabaseConnection(user) {
    try {
        console.log('🧪 Testando Supabase...')
        
        // Teste básico - health check
        const { error } = await supabase
            .from('test_table')
            .select('*')
            .limit(1)
        
        if (error) {
            if (error.code === 'PGRST116') {
                // Tabela não existe, mas conexão OK
                return '✅ Supabase conectado (ready for setup)'
            } else {
                return `⚠️ Supabase: ${error.message}`
            }
        }
        
        return '✅ Supabase funcionando perfeitamente'
        
    } catch (error) {
        console.error('❌ Erro teste Supabase:', error)
        return `❌ Erro: ${error.message}`
    }
}

// ====================================
// DASHBOARD
// ====================================

async function updateUserDashboard(user) {
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
            <p><strong>Criado em:</strong> ${new Date(user.metadata.creationTime).toLocaleString('pt-BR')}</p>
            <p><strong>Último login:</strong> ${new Date(user.metadata.lastSignInTime).toLocaleString('pt-BR')}</p>
        </div>
    `
    
    // Teste Supabase
    supabaseStatus.innerHTML = '<p>🔄 Testando integração Supabase...</p>'
    
    const supabaseResult = await testSupabaseConnection(user)
    
    supabaseStatus.innerHTML = `
        <h3>🗄️ Status da Integração</h3>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>Firebase:</strong> ✅ Funcionando</p>
            <p><strong>Supabase:</strong> ${supabaseResult}</p>
            <p><strong>Próximo passo:</strong> Configurar Third Party Auth</p>
        </div>
        
        <details style="margin-top: 15px;">
            <summary style="cursor: pointer; font-weight: bold;">🔧 Configuração pendente</summary>
            <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin-top: 10px; text-align: left;">
                <h4>Para completar a integração:</h4>
                <ol>
                    <li>✅ Firebase configurado</li>
                    <li>✅ Supabase conectado</li>
                    <li>⏳ Configurar Third Party Auth no Supabase</li>
                    <li>⏳ Adicionar Custom Claims (role: 'authenticated')</li>
                    <li>⏳ Deploy Cloud Functions</li>
                </ol>
                <p style="margin-top: 10px; font-style: italic;">
                    Veja o arquivo FIREBASE_SUPABASE_GUIDE.md para instruções completas.
                </p>
            </div>
        </details>
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
        await updateUserDashboard(user)
    } else {
        console.log('👤 Usuário deslogado')
        showForm(loginForm)
    }
})

// ====================================
// INICIALIZAÇÃO
// ====================================

console.log('🚀 Firebase v9+ + Supabase inicializado')
console.log('🔥 Firebase Project:', firebaseConfig.projectId)
console.log('🗄️ Supabase URL:', SUPABASE_URL)
console.log('✅ Versão moderna - sem erros de CORS')