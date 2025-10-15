// =====================================
// AUTENTICAÇÃO - LOGIN E REGISTRO
// =====================================

// Firebase v9+ imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js'
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js'

// Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm'
import { UserService } from './database.js'

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDBQ7WocaMQ-f3NMEDZjUM0ro4seE0RyFk",
    authDomain: "player-7a871.firebaseapp.com",
    projectId: "player-7a871",
    storageBucket: "player-7a871.firebasestorage.app",
    messagingSenderId: "526885048287",
    appId: "1:526885048287:web:229cd7035138439a60be6a",
    measurementId: "G-T7P89TVQWK"
}

// Supabase config
const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Initialize Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =====================================
// CONTROLE DE ABAS
// =====================================

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn')
    const tabContents = document.querySelectorAll('.tab-content')
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab
            
            // Remove active de todas as abas
            tabBtns.forEach(b => b.classList.remove('active'))
            tabContents.forEach(content => content.classList.remove('active'))
            
            // Ativa a aba clicada
            btn.classList.add('active')
            document.getElementById(`${targetTab}-tab`).classList.add('active')
        })
    })
}

// =====================================
// SISTEMA DE MENSAGENS
// =====================================

function showMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('messages')
    
    const messageElement = document.createElement('div')
    messageElement.className = `message ${type}`
    messageElement.textContent = message
    
    messagesContainer.appendChild(messageElement)
    
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement)
        }
    }, 5000)
}

// =====================================
// AUTENTICAÇÃO - GOOGLE (FIREBASE)
// =====================================

async function signInWithGoogle() {
    try {
        showMessage('Conectando...', 'info')
        
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user
        
        showMessage('Login realizado com sucesso!', 'success')
        
        // Redireciona para onboarding ou dashboard
        checkUserProfile(user)
        
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

// =====================================
// AUTENTICAÇÃO - EMAIL (SUPABASE)
// =====================================

async function signInWithEmail(email, password) {
    try {
        showMessage('Conectando...', 'info')
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) throw error
        
        // Define localStorage imediatamente
        if (data.user) {
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('currentUserId', data.user.id)
            
            console.log('✅ Usuário logado com ID:', data.user.id)
        }
        
        showMessage('Login realizado com sucesso!', 'success')
        
        // Redireciona para onboarding ou dashboard
        checkUserProfile(data.user)
        
    } catch (error) {
        console.error('Erro no login:', error)
        showMessage(error.message || 'Erro no login', 'error')
    }
}

async function registerWithEmail(email, password) {
    try {
        showMessage('Verificando disponibilidade do email...', 'info')
        
        // 1. VERIFICAÇÃO CRÍTICA: Verifica se email já existe no banco
        const { data: existingUsers, error: searchError } = await supabase.rpc('check_email_exists', {
            search_email: email
        })
        
        if (existingUsers && existingUsers > 0) {
            showMessage('❌ Este email já possui uma conta! Use "Entrar" para fazer login.', 'error')
            return
        }
        
        showMessage('Criando conta...', 'info')
        
        // 2. Só tenta registrar se email não existe
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        })
        
        if (error) {
            // Trata erros específicos do Supabase
            if (error.message.includes('User already registered') || 
                error.message.includes('already been registered') ||
                error.message.includes('Email address is already registered')) {
                showMessage('❌ Este email já possui uma conta! Use "Entrar" ao invés de "Registrar".', 'error')
                return
            }
            throw error
        }
        
        // 3. Verifica se o usuário foi realmente criado
        if (!data.user) {
            showMessage('Erro: Não foi possível criar a conta.', 'error')
            return
        }
        
        // 4. Dupla verificação: se já está confirmado, significa que existia
        if (data.user.email_confirmed_at) {
            showMessage('❌ Esta conta já existe e está ativa! Use "Entrar" para fazer login.', 'warning')
            return
        }
        
        // Define localStorage imediatamente após registro
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', data.user.id)
        localStorage.setItem('onboardingCompleted', 'false')
        
        console.log('✅ Usuário registrado com ID:', data.user.id)
        
        showMessage('✅ Conta criada com sucesso! Redirecionando...', 'success')
        
        // Redireciona para onboarding
        setTimeout(() => {
            window.location.href = 'onboarding.html'
        }, 1500)
        
    } catch (error) {
        console.error('Erro no registro:', error)
        
        // Mensagens de erro específicas
        let errorMessage = 'Erro ao criar conta'
        
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            errorMessage = '❌ Este email já tem uma conta! Clique em "Entrar" para fazer login.'
        } else if (error.message.includes('invalid email') || error.message.includes('Invalid email')) {
            errorMessage = '❌ Email inválido. Verifique o formato (exemplo@email.com).'
        } else if (error.message.includes('weak password') || error.message.includes('Password')) {
            errorMessage = '❌ Senha muito fraca. Use pelo menos 6 caracteres com números e letras.'
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
        // Busca perfil real do banco de dados
        const profile = await UserService.getProfile(user.id || user.uid)
        
        // Marca usuário como logado
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', user.id || user.uid)
        
        // Atualiza último login
        await UserService.updateLastLogin(user.id || user.uid)
        
        if (profile && profile.onboarding_completed) {
            // Usuário já tem perfil completo, vai para dashboard
            localStorage.setItem('userName', profile.display_name)
            localStorage.setItem('userAvatar', profile.avatar_url || '')
            localStorage.setItem('onboardingCompleted', 'true')
            
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1500)
        } else {
            // Usuário novo ou onboarding incompleto
            localStorage.setItem('onboardingCompleted', 'false')
            
            setTimeout(() => {
                window.location.href = 'onboarding.html'
            }, 1500)
        }
    } catch (error) {
        console.error('Erro ao verificar perfil:', error)
        
        // Fallback: vai para onboarding em caso de erro
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('currentUserId', user.id || user.uid)
        localStorage.setItem('onboardingCompleted', 'false')
        
        setTimeout(() => {
            window.location.href = 'onboarding.html'
        }, 1500)
    }
}

// =====================================
// EVENT LISTENERS
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs()
    
    // Google Login
    document.getElementById('googleLogin')?.addEventListener('click', signInWithGoogle)
    document.getElementById('googleRegister')?.addEventListener('click', signInWithGoogle)
    
    // Email Login
    document.getElementById('login')?.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const email = document.getElementById('loginEmail').value
        const password = document.getElementById('loginPassword').value
        
        if (email && password) {
            await signInWithEmail(email, password)
        }
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
        
        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres!', 'error')
            return
        }
        
        if (email && password) {
            await registerWithEmail(email, password)
        }
    })
})

// =====================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =====================================

// Variável para controlar se o usuário está fazendo logout
let isLoggingOut = false

// Verifica se o usuário já está logado (apenas na página de login)
onAuthStateChanged(auth, (user) => {
    // Só redireciona se estiver na página de login e não estiver fazendo logout
    if (user && !isLoggingOut && window.location.pathname.includes('login.html')) {
        checkUserProfile(user)
    }
})

// Verifica autenticação Supabase (apenas na página de login)
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user && !isLoggingOut && window.location.pathname.includes('login.html')) {
        checkUserProfile(session.user)
    }
})

// Função para realizar logout completo
window.performLogout = async function() {
    isLoggingOut = true
    
    try {
        // Logout do Firebase
        await signOut(auth)
        
        // Logout do Supabase  
        await supabase.auth.signOut()
        
        // Limpa todos os dados locais
        localStorage.removeItem('isLoggedIn')
        localStorage.removeItem('userName')
        localStorage.removeItem('userLevel')
        localStorage.removeItem('userAge')
        localStorage.removeItem('userExperience')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userAvatar')
        localStorage.removeItem('userAvatarType')
        localStorage.removeItem('onboardingCompleted')
        localStorage.removeItem('activeTab')
        
        // Limpa dados de perfil
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('profile_')) {
                localStorage.removeItem(key)
            }
        }
        
        // Redireciona para login após 500ms
        setTimeout(() => {
            isLoggingOut = false
            window.location.href = 'login.html'
        }, 500)
        
    } catch (error) {
        console.error('Erro no logout:', error)
        isLoggingOut = false
    }
}