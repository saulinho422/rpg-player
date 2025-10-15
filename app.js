// =====================================
// FIREBASE E SUPABASE CONFIG
// =====================================

// Firebase v9+ imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js'
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js'

// Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm'

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
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1Nzg4NjcsImV4cCI6MjA0NjE1NDg2N30.bthKbcYRJoE2sKYGjJu0q5ZjBMOL9oJXkGrPZYzVlXs'

// Initialize
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()
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
            case 'auth/api-key-not-valid':
                errorMessage = 'Configuração do Google temporariamente indisponível.'
                break
            default:
                errorMessage = error.message
        }
        
        showMessage(errorMessage, 'error')
    }
}

function updateFirebaseDashboard(user) {
    // Verificar se o usuário já tem perfil
    const savedProfile = localStorage.getItem(`profile_firebase_${user.uid}`)
    
    if (!savedProfile) {
        // Primeira vez - mostrar onboarding
        showOnboarding()
        return
    }
    
    // Usuário já tem perfil - mostrar dashboard
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

async function updateSupabaseDashboard(user) {
    // Verificar se o usuário já tem perfil no Supabase
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    
    if (error && error.code === 'PGRST116') {
        // Perfil não existe - mostrar onboarding
        showOnboarding()
        return
    }
    
    // Usuário já tem perfil - mostrar dashboard
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
// SISTEMA DE ONBOARDING
// =====================================

let currentStep = 1
let onboardingData = {
    avatar: null,
    avatarType: null,
    name: '',
    age: 18,
    experience: '',
    roles: []
}

// Elementos do onboarding
const onboardingProgress = document.getElementById('onboardingProgress')
const progressFill = document.getElementById('progressFill')
const onboardingSteps = ['onboardingStep1', 'onboardingStep2', 'onboardingStep3', 'onboardingStep4', 'onboardingStep5']
const onboardingComplete = document.getElementById('onboardingComplete')

function showOnboarding() {
    // Esconder todas as telas de auth
    const authForms = [loginForm, registerForm, forgotPasswordForm, emailVerification, userDashboard]
    authForms.forEach(form => form.classList.add('hidden'))
    
    // Mostrar onboarding
    onboardingProgress.classList.remove('hidden')
    showOnboardingStep(1)
}

function showOnboardingStep(step) {
    // Esconder todas as etapas
    onboardingSteps.forEach(stepId => {
        document.getElementById(stepId).classList.add('hidden')
    })
    
    // Mostrar etapa atual
    document.getElementById(`onboardingStep${step}`).classList.remove('hidden')
    
    // Atualizar progresso
    updateProgress(step)
    currentStep = step
}

function updateProgress(step) {
    const progressPercentage = (step / 5) * 100
    progressFill.style.width = `${progressPercentage}%`
    
    // Atualizar steps visuais
    document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed')
        
        if (index + 1 < step) {
            stepEl.classList.add('completed')
        } else if (index + 1 === step) {
            stepEl.classList.add('active')
        }
    })
}

function nextStep() {
    if (currentStep < 5) {
        showOnboardingStep(currentStep + 1)
    } else {
        finishOnboarding()
    }
}

function previousStep() {
    if (currentStep > 1) {
        showOnboardingStep(currentStep - 1)
    }
}

// ===== ETAPA 1: FOTO DE PERFIL =====
function initAvatarStep() {
    const avatarInput = document.getElementById('avatarInput')
    const avatarPreview = document.getElementById('avatarPreview')
    const avatarOptions = document.querySelectorAll('.avatar-option')
    const step1Next = document.getElementById('step1Next')
    
    // Upload de foto
    avatarPreview.addEventListener('click', () => {
        avatarInput.click()
    })
    
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
                onboardingData.avatar = e.target.result
                onboardingData.avatarType = 'upload'
                
                // Desmarcar avatares preset
                avatarOptions.forEach(opt => opt.classList.remove('selected'))
                step1Next.disabled = false
            }
            reader.readAsDataURL(file)
        }
    })
    
    // Avatares preset
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Desmarcar outros
            avatarOptions.forEach(opt => opt.classList.remove('selected'))
            option.classList.add('selected')
            
            // Atualizar preview
            const avatarType = option.dataset.avatar
            const emoji = option.textContent
            avatarPreview.innerHTML = `<div style="font-size: 4em; display: flex; align-items: center; justify-content: center; height: 100%;">${emoji}</div>`
            
            onboardingData.avatar = emoji
            onboardingData.avatarType = 'preset'
            step1Next.disabled = false
        })
    })
    
    step1Next.addEventListener('click', () => {
        if (onboardingData.avatar) {
            nextStep()
        }
    })
}

// ===== ETAPA 2: NOME DE USUÁRIO =====
function initNameStep() {
    const userNameInput = document.getElementById('userName')
    const nameValidation = document.getElementById('nameValidation')
    const step2Next = document.getElementById('step2Next')
    const step2Back = document.getElementById('step2Back')
    
    userNameInput.addEventListener('input', (e) => {
        const name = e.target.value.trim()
        
        if (name.length < 2) {
            nameValidation.textContent = 'Nome deve ter pelo menos 2 caracteres'
            nameValidation.className = 'input-feedback invalid'
            step2Next.disabled = true
        } else if (name.length > 30) {
            nameValidation.textContent = 'Nome muito longo (máximo 30 caracteres)'
            nameValidation.className = 'input-feedback invalid'
            step2Next.disabled = true
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
            nameValidation.textContent = 'Use apenas letras e espaços'
            nameValidation.className = 'input-feedback invalid'
            step2Next.disabled = true
        } else {
            nameValidation.textContent = `Perfeito! "${name}" é um ótimo nome de aventureiro!`
            nameValidation.className = 'input-feedback valid'
            step2Next.disabled = false
            onboardingData.name = name
        }
    })
    
    step2Next.addEventListener('click', () => {
        if (onboardingData.name) {
            nextStep()
        }
    })
    
    step2Back.addEventListener('click', previousStep)
}

// ===== ETAPA 3: IDADE =====
function initAgeStep() {
    const ageSlider = document.getElementById('ageSlider')
    const ageDisplay = document.getElementById('ageDisplay')
    const step3Next = document.getElementById('step3Next')
    const step3Back = document.getElementById('step3Back')
    
    ageSlider.addEventListener('input', (e) => {
        const age = parseInt(e.target.value)
        ageDisplay.textContent = age
        onboardingData.age = age
    })
    
    step3Next.addEventListener('click', nextStep)
    step3Back.addEventListener('click', previousStep)
}

// ===== ETAPA 4: EXPERIÊNCIA =====
function initExperienceStep() {
    const experienceCards = document.querySelectorAll('.experience-card')
    const step4Next = document.getElementById('step4Next')
    const step4Back = document.getElementById('step4Back')
    
    experienceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Desmarcar outros
            experienceCards.forEach(c => c.classList.remove('selected'))
            card.classList.add('selected')
            
            onboardingData.experience = card.dataset.experience
            step4Next.disabled = false
        })
    })
    
    step4Next.addEventListener('click', () => {
        if (onboardingData.experience) {
            nextStep()
        }
    })
    
    step4Back.addEventListener('click', previousStep)
}

// ===== ETAPA 5: FUNÇÃO NO RPG =====
function initRoleStep() {
    const roleCards = document.querySelectorAll('.role-card')
    const step5Next = document.getElementById('step5Next')
    const step5Back = document.getElementById('step5Back')
    
    roleCards.forEach(card => {
        const checkbox = card.querySelector('input[type="checkbox"]')
        
        card.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked
            }
            
            updateRoleCard(card, checkbox.checked)
            updateRoles()
        })
        
        checkbox.addEventListener('change', (e) => {
            updateRoleCard(card, e.target.checked)
            updateRoles()
        })
    })
    
    function updateRoleCard(card, checked) {
        if (checked) {
            card.classList.add('selected')
        } else {
            card.classList.remove('selected')
        }
    }
    
    function updateRoles() {
        const selectedRoles = []
        roleCards.forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]')
            if (checkbox.checked) {
                selectedRoles.push(card.dataset.role)
            }
        })
        
        onboardingData.roles = selectedRoles
        step5Next.disabled = selectedRoles.length === 0
    }
    
    step5Next.addEventListener('click', () => {
        if (onboardingData.roles.length > 0) {
            finishOnboarding()
        }
    })
    
    step5Back.addEventListener('click', previousStep)
}

// ===== FINALIZAÇÃO =====
async function finishOnboarding() {
    // Esconder etapas e progresso
    onboardingSteps.forEach(stepId => {
        document.getElementById(stepId).classList.add('hidden')
    })
    onboardingProgress.classList.add('hidden')
    
    // Mostrar tela de conclusão
    onboardingComplete.classList.remove('hidden')
    
    // Preencher resumo
    document.getElementById('summaryAvatar').innerHTML = 
        onboardingData.avatarType === 'upload' 
            ? `<img src="${onboardingData.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
            : `<div style="font-size: 2.5em;">${onboardingData.avatar}</div>`
    
    document.getElementById('summaryName').textContent = onboardingData.name
    
    const experienceLabels = {
        'beginner': 'Iniciante',
        'intermediate': 'Pouco Tempo', 
        'veteran': 'Muito Tempo'
    }
    
    const roleLabels = {
        'player': 'Jogador',
        'dm': 'Mestre',
        'both': 'Ambos'
    }
    
    const rolesText = onboardingData.roles.map(role => roleLabels[role]).join(', ')
    
    document.getElementById('summaryDetails').innerHTML = `
        <strong>Idade:</strong> ${onboardingData.age} anos<br>
        <strong>Experiência:</strong> ${experienceLabels[onboardingData.experience]}<br>
        <strong>Função:</strong> ${rolesText}
    `
    
    // Salvar dados do perfil
    try {
        await saveUserProfile()
        showMessage('Perfil criado com sucesso!', 'success')
    } catch (error) {
        console.error('Erro ao salvar perfil:', error)
        showMessage('Erro ao salvar perfil, mas você pode continuar', 'error')
    }
}

async function saveUserProfile() {
    // Determinar qual sistema de auth está ativo
    const firebaseUser = auth.currentUser
    const { data: { session } } = await supabase.auth.getSession()
    
    const profileData = {
        avatar: onboardingData.avatar,
        avatar_type: onboardingData.avatarType,
        name: onboardingData.name,
        age: onboardingData.age,
        experience: onboardingData.experience,
        roles: onboardingData.roles,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
    
    if (firebaseUser) {
        // Salvar no Firebase (ou em local storage por enquanto)
        localStorage.setItem(`profile_firebase_${firebaseUser.uid}`, JSON.stringify(profileData))
        console.log('Perfil salvo no Firebase:', profileData)
    } else if (session) {
        // Salvar no Supabase
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: session.user.id,
                ...profileData
            })
        
        if (error) {
            console.error('Erro ao salvar no Supabase:', error)
        } else {
            console.log('Perfil salvo no Supabase:', profileData)
        }
    }
}

function enterPlatform() {
    // Esconder onboarding
    onboardingComplete.classList.add('hidden')
    
    // Mostrar dashboard normal
    showForm(userDashboard)
}

// ===== INICIALIZAÇÃO DO ONBOARDING =====
function initOnboarding() {
    initAvatarStep()
    initNameStep()
    initAgeStep()
    initExperienceStep()
    initRoleStep()
    
    // Botão final
    document.getElementById('enterPlatform')?.addEventListener('click', enterPlatform)
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

// Inicializar onboarding
initOnboarding()

checkInitialSession()