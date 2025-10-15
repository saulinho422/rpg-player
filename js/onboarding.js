// =====================================
// ONBOARDING - SISTEMA COMPLETO COM BANCO REAL
// =====================================

import { UserService } from './database.js'
import { checkAuth } from './auth-supabase-only.js'

class OnboardingSystem {
    constructor() {
        this.currentStep = 1
        this.totalSteps = 5
        this.userData = {
            avatar: null,
            avatarType: 'upload', // 'upload' ou 'preset'
            name: '',
            age: 18,
            experience: '',
            role: ''
        }
        
        this.init()
    }
    
    init() {
        console.log('🎮 OnboardingSystem.init() chamado')
        this.updateProgress()
        this.initEventListeners()
        this.initValidation()
        
        // Mensagem de boas-vindas
        const userId = localStorage.getItem('currentUserId')
        console.log('👤 User ID encontrado:', userId)
        
        if (!userId) {
            console.error('❌ ERRO: Não há userId no localStorage!')
            this.showMessage('⚠️ Erro: Usuário não identificado. Tente fazer login novamente.', 'error')
        } else {
            this.showMessage('Bem-vindo! Configure seu perfil em 5 passos simples.', 'info')
            console.log('✅ OnboardingSystem inicializado com sucesso!')
        }
    }
    
    // =====================================
    // NAVEGAÇÃO ENTRE ETAPAS
    // =====================================
    
    nextStep() {
        if (!this.validateCurrentStep()) {
            return false
        }
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++
            this.updateUI()
            this.updateProgress()
        } else {
            this.completeOnboarding()
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--
            this.updateUI()
            this.updateProgress()
        }
    }
    
    goToStep(stepNumber) {
        if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
            this.currentStep = stepNumber
            this.updateUI()
            this.updateProgress()
        }
    }
    
    updateUI() {
        // Remove active de todas as etapas
        document.querySelectorAll('.onboarding-step').forEach(step => {
            step.classList.remove('active')
        })
        
        // Ativa a etapa atual
        const currentStepElement = document.getElementById(`step${this.currentStep}`)
        if (currentStepElement) {
            currentStepElement.classList.add('active')
        }
        
        // Atualiza botões
        const prevBtn = document.getElementById('prevBtn')
        const nextBtn = document.getElementById('nextBtn')
        
        prevBtn.disabled = this.currentStep === 1
        nextBtn.textContent = this.currentStep === this.totalSteps ? 'Finalizar ✨' : 'Próximo →'
        
        // Atualiza dots
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.remove('active', 'completed')
            
            if (index + 1 === this.currentStep) {
                dot.classList.add('active')
            } else if (index + 1 < this.currentStep) {
                dot.classList.add('completed')
            }
        })
    }
    
    updateProgress() {
        const progressFill = document.getElementById('progressFill')
        const currentStepSpan = document.getElementById('currentStep')
        
        const percentage = (this.currentStep / this.totalSteps) * 100
        
        progressFill.style.width = `${percentage}%`
        currentStepSpan.textContent = this.currentStep
    }
    
    // =====================================
    // VALIDAÇÃO DAS ETAPAS
    // =====================================
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1: // Avatar
                if (!this.userData.avatar) {
                    this.showMessage('Selecione um avatar antes de continuar!', 'error')
                    return false
                }
                break
                
            case 2: // Nome
                if (!this.userData.name || this.userData.name.length < 2) {
                    this.showMessage('Digite um nome válido (mínimo 2 caracteres)!', 'error')
                    return false
                }
                break
                
            case 3: // Idade
                if (!this.userData.age || this.userData.age < 13 || this.userData.age > 99) {
                    this.showMessage('Selecione uma idade válida!', 'error')
                    return false
                }
                break
                
            case 4: // Experiência
                if (!this.userData.experience) {
                    this.showMessage('Selecione seu nível de experiência!', 'error')
                    return false
                }
                break
                
            case 5: // Função
                if (!this.userData.role) {
                    this.showMessage('Selecione sua função preferida!', 'error')
                    return false
                }
                break
        }
        
        return true
    }
    
    // =====================================
    // EVENT LISTENERS
    // =====================================
    
    initEventListeners() {
        // Navegação
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep())
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevStep())
        
        // Skip onboarding
        document.getElementById('skipOnboarding')?.addEventListener('click', () => this.skipOnboarding())
        
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', async () => {
            this.showMessage('Desconectando...', 'info')
            if (window.performLogout) {
                await window.performLogout()
            } else {
                localStorage.clear()
                window.location.href = 'login.html'
            }
        })
        
        // Dots de navegação
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToStep(index + 1))
        })
        
        // Step 1: Avatar
        this.initAvatarListeners()
        
        // Step 2: Nome
        this.initNameListeners()
        
        // Step 3: Idade
        this.initAgeListeners()
        
        // Step 4: Experiência
        this.initExperienceListeners()
        
        // Step 5: Função
        this.initRoleListeners()
    }
    
    initAvatarListeners() {
        console.log('🎨 Inicializando event listeners do avatar...')
        
        // Upload de avatar
        const avatarPreview = document.getElementById('avatarPreview')
        const avatarInput = document.getElementById('avatarInput')
        const avatarImage = document.getElementById('avatarImage')
        
        console.log('🔍 Elementos encontrados:', {
            avatarPreview: !!avatarPreview,
            avatarInput: !!avatarInput,
            avatarImage: !!avatarImage
        })
        
        if (!avatarPreview || !avatarInput || !avatarImage) {
            console.error('❌ Elementos do avatar não encontrados!')
            return
        }
        
        // Remove listeners anteriores (se existirem) e adiciona novos
        const newAvatarPreview = avatarPreview.cloneNode(true)
        avatarPreview.parentNode.replaceChild(newAvatarPreview, avatarPreview)
        
        const newAvatarInput = avatarInput.cloneNode(true)
        avatarInput.parentNode.replaceChild(newAvatarInput, avatarInput)
        
        // Adiciona listener no novo preview
        newAvatarPreview.addEventListener('click', () => {
            console.log('👆 Avatar preview clicado!')
            newAvatarInput.click()
        })
        
        // Adiciona listener no novo input
        newAvatarInput.addEventListener('change', (e) => {
            console.log('📁 Arquivo selecionado')
            const file = e.target.files[0]
            if (file) {
                console.log('✅ Carregando arquivo:', file.name)
                const reader = new FileReader()
                reader.onload = (e) => {
                    avatarImage.src = e.target.result
                    this.userData.avatar = e.target.result
                    this.userData.avatarType = 'upload'
                    console.log('✅ Foto carregada!')
                    this.showMessage('Foto carregada com sucesso!', 'success')
                }
                reader.readAsDataURL(file)
            }
        })
        
        // Avatares predefinidos
        document.querySelectorAll('.avatar-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                console.log('👆 Avatar preset clicado:', preset.dataset.avatar)
                
                // Remove seleção anterior
                document.querySelectorAll('.avatar-preset').forEach(p => p.classList.remove('selected'))
                
                // Seleciona atual
                preset.classList.add('selected')
                
                const avatarEmoji = preset.dataset.avatar
                this.userData.avatar = avatarEmoji
                this.userData.avatarType = 'preset'
                
                // Atualiza preview
                avatarImage.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="60">${avatarEmoji}</text></svg>`
                
                console.log('✅ Avatar selecionado:', avatarEmoji)
                this.showMessage('Avatar selecionado!', 'success')
            })
        })
        
        console.log('✅ Event listeners do avatar inicializados com sucesso!')
    }
    
    initNameListeners() {
        const nameInput = document.getElementById('playerName')
        const nameValidation = document.getElementById('nameValidation')
        
        nameInput?.addEventListener('input', (e) => {
            const name = e.target.value.trim()
            this.userData.name = name
            
            // Validação em tempo real
            if (name.length === 0) {
                nameValidation.textContent = ''
                nameValidation.className = 'input-validation'
            } else if (name.length < 2) {
                nameValidation.textContent = 'Nome muito curto (mínimo 2 caracteres)'
                nameValidation.className = 'input-validation invalid'
            } else if (name.length > 30) {
                nameValidation.textContent = 'Nome muito longo (máximo 30 caracteres)'
                nameValidation.className = 'input-validation invalid'
            } else {
                nameValidation.textContent = 'Nome válido ✓'
                nameValidation.className = 'input-validation valid'
            }
        })
        
        // Sugestões de nomes
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestedName = btn.dataset.name
                nameInput.value = suggestedName
                this.userData.name = suggestedName
                nameValidation.textContent = 'Nome válido ✓'
                nameValidation.className = 'input-validation valid'
            })
        })
    }
    
    initAgeListeners() {
        const ageSlider = document.getElementById('ageSlider')
        const ageValue = document.getElementById('ageValue')
        
        ageSlider?.addEventListener('input', (e) => {
            const age = parseInt(e.target.value)
            this.userData.age = age
            ageValue.textContent = age
        })
    }
    
    initExperienceListeners() {
        document.querySelectorAll('.experience-card').forEach(card => {
            card.addEventListener('click', () => {
                // Remove seleção anterior
                document.querySelectorAll('.experience-card').forEach(c => c.classList.remove('selected'))
                
                // Seleciona atual
                card.classList.add('selected')
                
                this.userData.experience = card.dataset.experience
                this.showMessage('Nível de experiência selecionado!', 'success')
            })
        })
    }
    
    initRoleListeners() {
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => {
                // Remove seleção anterior
                document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'))
                
                // Seleciona atual
                card.classList.add('selected')
                
                this.userData.role = card.dataset.role
                this.showMessage('Função selecionada!', 'success')
            })
        })
    }
    
    // =====================================
    // VALIDAÇÃO DE NOME
    // =====================================
    
    initValidation() {
        // Validação de nome em tempo real já implementada em initNameListeners
    }
    
    // =====================================
    // FINALIZAÇÃO DO ONBOARDING
    // =====================================
    
    async completeOnboarding() {
        this.showMessage('Salvando seu perfil...', 'info')
        
        try {
            const userId = localStorage.getItem('currentUserId')
            console.log('🔍 Debug - userId:', userId)
            console.log('🔍 Debug - userData:', this.userData)
            
            if (!userId) {
                throw new Error('Usuário não identificado. Faça login novamente.')
            }
            
            // Valida dados obrigatórios
            if (!this.userData.name || !this.userData.age || !this.userData.experience || !this.userData.role) {
                throw new Error('Dados incompletos. Verifique todos os campos.')
            }
            
            // Salva no banco de dados real
            console.log('💾 Tentando salvar no Supabase...')
            const result = await UserService.completeOnboarding(userId, this.userData)
            console.log('✅ Dados salvos:', result)
            
            // Atualiza localStorage com dados salvos
            this.saveUserData()
            
            this.showMessage('Perfil configurado com sucesso! Redirecionando...', 'success')
            
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 2000)
            
        } catch (error) {
            console.error('❌ Erro completo ao salvar onboarding:', error)
            
            // Mostra erro mais específico
            let errorMessage = 'Erro desconhecido'
            if (error.message) {
                errorMessage = error.message
            } else if (error.error) {
                errorMessage = error.error.message || 'Erro na base de dados'
            }
            
            this.showMessage(`Erro ao salvar perfil: ${errorMessage}`, 'error')
        }
    }
    
    saveUserData() {
        // Salva no localStorage (em um app real, enviaria para o backend)
        localStorage.setItem('userName', this.userData.name)
        localStorage.setItem('userAge', this.userData.age)
        localStorage.setItem('userExperience', this.userData.experience)
        localStorage.setItem('userRole', this.userData.role)
        localStorage.setItem('userAvatar', this.userData.avatar)
        localStorage.setItem('userAvatarType', this.userData.avatarType)
        localStorage.setItem('onboardingCompleted', 'true')
        localStorage.setItem('isLoggedIn', 'true')
        
        // Dados do perfil para dashboard
        localStorage.setItem(`profile_${Date.now()}`, JSON.stringify(this.userData))
    }
    
    skipOnboarding() {
        const confirmSkip = confirm('Tem certeza que deseja pular a configuração? Você pode configurar seu perfil depois.')
        
        if (confirmSkip) {
            this.showMessage('Redirecionando para o dashboard...', 'info')
            
            // Salva dados básicos
            localStorage.setItem('userName', 'Aventureiro')
            localStorage.setItem('userLevel', 'Nível 1')
            localStorage.setItem('onboardingCompleted', 'false')
            localStorage.setItem('isLoggedIn', 'true')
            
            setTimeout(() => {
                window.location.href = 'dashboard.html'
            }, 1500)
        }
    }
    
    // =====================================
    // SISTEMA DE MENSAGENS
    // =====================================
    
    showMessage(message, type = 'info') {
        let messagesContainer = document.getElementById('messages')
        if (!messagesContainer) {
            messagesContainer = document.createElement('div')
            messagesContainer.id = 'messages'
            messagesContainer.className = 'messages'
            document.body.appendChild(messagesContainer)
        }
        
        const messageElement = document.createElement('div')
        messageElement.className = `message ${type}`
        messageElement.textContent = message
        
        messagesContainer.appendChild(messageElement)
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOut 0.3s ease-in-out'
                setTimeout(() => {
                    messageElement.parentNode?.removeChild(messageElement)
                }, 300)
            }
        }, 5000)
    }
}

// =====================================
// VERIFICAÇÃO DE AUTENTICAÇÃO ROBUSTA
// =====================================

async function checkAuthentication() {
    console.log('🔐 Verificando autenticação...')
    
    try {
        // CORREÇÃO: Verificar se há token de confirmação na URL (vindo do email)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        
        if (accessToken) {
            console.log('📧 Token de confirmação de email detectado na URL!')
            console.log('⏳ Aguardando Supabase processar a sessão...')
            
            // Aguarda um pouco para o Supabase processar o token
            await new Promise(resolve => setTimeout(resolve, 1500))
        }
        
        // Usa o checkAuth da nova autenticação
        const user = await checkAuth()
        
        if (user) {
            console.log('✅ Usuário autenticado:', user.id)
            // CORREÇÃO: Garantir que currentUserId está no localStorage
            localStorage.setItem('currentUserId', user.id)
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('userEmail', user.email || '')
            localStorage.setItem('onboardingCompleted', 'false')
            
            // Limpa o hash da URL para evitar reprocessamento
            if (accessToken) {
                console.log('🧹 Limpando token da URL...')
                window.history.replaceState(null, '', window.location.pathname)
            }
            
            return true
        } else {
            console.log('⚠️ Usuário não autenticado')
            // Se não há usuário, redireciona para login
            alert('Acesso negado. Você precisa fazer login primeiro.\n\nRedirecionando para a página de login...')
            
            setTimeout(() => {
                window.location.href = 'login.html'
            }, 1000)
            
            return false
        }
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error)
        
        // Em caso de erro, também redireciona
        alert('Erro ao verificar autenticação. Redirecionando para login...')
        
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 1000)
        
        return false
    }
}

// =====================================
// INICIALIZAÇÃO
// =====================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando onboarding...')
    console.log('📍 localStorage antes da verificação:', {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        currentUserId: localStorage.getItem('currentUserId'),
        onboardingCompleted: localStorage.getItem('onboardingCompleted')
    })
    
    // Verifica autenticação primeiro (agora assíncrona)
    const isAuthenticated = await checkAuthentication()
    
    if (!isAuthenticated) {
        console.log('❌ Não autenticado, parando inicialização')
        return
    }
    
    console.log('✅ Usuário autenticado, continuando...')
    console.log('📍 localStorage após verificação:', {
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        currentUserId: localStorage.getItem('currentUserId'),
        onboardingCompleted: localStorage.getItem('onboardingCompleted')
    })
    
    // Verifica se o onboarding já foi completado
    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    
    if (onboardingCompleted === 'true') {
        const goToDashboard = confirm('Você já configurou seu perfil. Deseja ir para o dashboard ou reconfigurar?')
        
        if (goToDashboard) {
            window.location.href = 'dashboard.html'
            return
        }
    }
    
    // Inicializa o sistema de onboarding
    console.log('🎮 Inicializando sistema de onboarding...')
    window.onboarding = new OnboardingSystem()
    
    // CORREÇÃO: Aguarda um pouco para garantir que DOM está pronto
    setTimeout(() => {
        console.log('🔄 Re-inicializando event listeners do avatar...')
        if (window.onboarding) {
            window.onboarding.initAvatarListeners()
        }
    }, 500)
    
    // Adiciona estilos de animação
    const style = document.createElement('style')
    style.textContent = `
        @keyframes slideOut {
            from { 
                opacity: 1; 
                transform: translateX(0); 
            }
            to { 
                opacity: 0; 
                transform: translateX(100px); 
            }
        }
    `
    document.head.appendChild(style)
})

// =====================================
// UTILITÁRIOS
// =====================================

// Função para detectar se é dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Previne fechamento acidental da página
window.addEventListener('beforeunload', (e) => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted')
    
    if (onboardingCompleted !== 'true') {
        e.preventDefault()
        e.returnValue = 'Você tem certeza que deseja sair? Seu progresso será perdido.'
    }
})

// =====================================
// FUNÇÃO DE DEBUG GLOBAL
// =====================================
window.debugUserState = async function() {
    console.log('=== 🔍 DEBUG DO ESTADO DO USUÁRIO ===')
    
    // 1. LocalStorage
    console.log('📦 LOCALSTORAGE:')
    console.log('  - isLoggedIn:', localStorage.getItem('isLoggedIn'))
    console.log('  - currentUserId:', localStorage.getItem('currentUserId'))
    console.log('  - onboardingCompleted:', localStorage.getItem('onboardingCompleted'))
    console.log('  - userName:', localStorage.getItem('userName'))
    
    // 2. Sessão Supabase
    console.log('\n🔐 SESSÃO SUPABASE:')
    try {
        const { checkAuth } = await import('./auth-supabase-only.js')
        const user = await checkAuth()
        
        if (user) {
            console.log('  ✅ Usuário autenticado:', user.id)
            console.log('  📧 Email:', user.email)
        } else {
            console.log('  ❌ Nenhuma sessão ativa')
        }
    } catch (error) {
        console.log('  ❌ Erro ao verificar sessão:', error.message)
    }
    
    // 3. Estado do Onboarding
    console.log('\n🎮 SISTEMA DE ONBOARDING:')
    if (window.onboarding) {
        console.log('  ✅ Sistema inicializado')
        console.log('  📍 Etapa atual:', window.onboarding.currentStep)
        console.log('  📝 Dados do usuário:', window.onboarding.userData)
    } else {
        console.log('  ❌ Sistema NÃO inicializado')
    }
    
    // 4. Event Listeners
    console.log('\n🎯 EVENT LISTENERS:')
    const avatarPreview = document.getElementById('avatarPreview')
    const avatarInput = document.getElementById('avatarInput')
    
    console.log('  - avatarPreview existe:', !!avatarPreview)
    console.log('  - avatarInput existe:', !!avatarInput)
    
    if (avatarPreview) {
        const listeners = getEventListeners(avatarPreview)
        console.log('  - avatarPreview tem listeners:', Object.keys(listeners).length > 0 ? 'SIM' : 'NÃO')
    }
    
    console.log('\n=== FIM DO DEBUG ===')
    
    // Mostra alerta para o usuário também
    const userId = localStorage.getItem('currentUserId')
    const isAuth = !!userId
    
    alert(`DEBUG RÁPIDO:
✅ Autenticado: ${isAuth ? 'SIM' : 'NÃO'}
📋 User ID: ${userId || 'Nenhum'}
🎮 Onboarding: ${window.onboarding ? 'Inicializado' : 'NÃO inicializado'}

Veja o console (F12) para detalhes completos.`)
}