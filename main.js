// Configuração do Supabase
const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

// Importar Supabase (será carregado via CDN no HTML)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Elementos do DOM
const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')
const forgotPasswordForm = document.getElementById('forgotPasswordForm')
const emailVerification = document.getElementById('emailVerification')
const userDashboard = document.getElementById('userDashboard')
const messageDiv = document.getElementById('message')

// Função para mostrar mensagens
function showMessage(text, type = 'info') {
    messageDiv.textContent = text
    messageDiv.className = `message ${type}`
    messageDiv.classList.remove('hidden')
    
    setTimeout(() => {
        messageDiv.classList.add('hidden')
    }, 5000)
}

// Função para alternar entre formulários
function showForm(formToShow) {
    const forms = [loginForm, registerForm, forgotPasswordForm, emailVerification, userDashboard]
    forms.forEach(form => form.classList.add('hidden'))
    formToShow.classList.remove('hidden')
}

// Event listeners para navegação
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

document.getElementById('backToLoginFromVerification').addEventListener('click', (e) => {
    e.preventDefault()
    showForm(loginForm)
})

// Função de cadastro
document.getElementById('register').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const name = document.getElementById('registerName').value
    const email = document.getElementById('registerEmail').value
    const password = document.getElementById('registerPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value
    
    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem!', 'error')
        return
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name
                }
            }
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
            updateUserDashboard(data.user)
        }
        
    } catch (error) {
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
})

// Função de login
document.getElementById('login').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('loginEmail').value
    const password = document.getElementById('loginPassword').value
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        
        if (error) {
            showMessage(`Erro no login: ${error.message}`, 'error')
            return
        }
        
        showMessage('Login realizado com sucesso!', 'success')
        updateUserDashboard(data.user)
        
    } catch (error) {
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
})

// Função de recuperação de senha
document.getElementById('forgotPassword').addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = document.getElementById('resetEmail').value
    
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        })
        
        if (error) {
            showMessage(`Erro: ${error.message}`, 'error')
            return
        }
        
        showMessage('Email de recuperação enviado! Verifique sua caixa de entrada.', 'success')
        showForm(loginForm)
        
    } catch (error) {
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
})

// Reenviar verificação de email
document.getElementById('resendVerification').addEventListener('click', async () => {
    const email = document.getElementById('registerEmail').value
    
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
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
})

// Função de logout
document.getElementById('logout').addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut()
        
        if (error) {
            showMessage(`Erro no logout: ${error.message}`, 'error')
            return
        }
        
        showMessage('Logout realizado com sucesso!', 'success')
        showForm(loginForm)
        
    } catch (error) {
        showMessage(`Erro inesperado: ${error.message}`, 'error')
    }
})

// Função para atualizar o dashboard do usuário
function updateUserDashboard(user) {
    const userInfo = document.getElementById('userInfo')
    const emailStatus = document.getElementById('emailStatus')
    
    userInfo.innerHTML = `
        <h3>Informações do Usuário</h3>
        <p><strong>Nome:</strong> ${user.user_metadata?.name || 'Não informado'}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.id}</p>
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

// Verificar se o usuário já está logado
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        updateUserDashboard(session.user)
    } else if (event === 'SIGNED_OUT') {
        showForm(loginForm)
    }
})

// Verificar sessão inicial
async function checkInitialSession() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
        updateUserDashboard(session.user)
    } else {
        showForm(loginForm)
    }
}

// Inicializar a aplicação
checkInitialSession()