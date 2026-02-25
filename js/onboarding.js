// =====================================
// ONBOARDING - SISTEMA COMPLETO COM BANCO REAL
// =====================================

import { UserService } from './database.js'
import { db } from './firebase-config.js'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { checkAuth } from './auth.js'
import defaultAvatar from '../img/perfil_empty_user.png'

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
        this.lastNotification = null // Controle de notificações
        this.notificationTimeout = null

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

    async nextStep() {
        const isValid = await this.validateCurrentStep()
        if (!isValid) {
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

    async validateCurrentStep() {
        switch (this.currentStep) {
            case 1: // Avatar - OPCIONAL, não precisa validar
                // Se não tiver avatar, usa a imagem padrão
                if (!this.userData.avatar) {
                    this.userData.avatar = defaultAvatar
                    this.userData.avatarType = 'default'
                }
                break

            case 2: // Nome
                if (!this.userData.name || this.userData.name.length < 2) {
                    this.showMessage('Digite um nome válido (mínimo 2 caracteres)!', 'error')
                    return false
                }

                // Verifica se o nome já existe
                const nameExists = await this.isNameTaken(this.userData.name)
                if (nameExists) {
                    this.showMessage('Este nome já está em uso! Escolha uma das sugestões abaixo.', 'error')
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

        // CORREÇÃO: Buscar avatarImage novamente após clonar (pois está dentro do preview)
        const updatedAvatarImage = document.getElementById('avatarImage')

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
                console.log('✅ Carregando arquivo:', file.name, 'Tamanho:', (file.size / 1024).toFixed(2), 'KB')
                const reader = new FileReader()
                reader.onload = (e) => {
                    console.log('📸 Imagem lida, atualizando preview...')
                    // CORREÇÃO: Usar updatedAvatarImage em vez de avatarImage
                    if (updatedAvatarImage) {
                        updatedAvatarImage.src = e.target.result
                        console.log('✅ Imagem atribuída ao elemento img!')
                    } else {
                        console.error('❌ avatarImage não encontrado após clone!')
                    }
                    this.userData.avatar = e.target.result
                    this.userData.avatarType = 'upload'
                    console.log('✅ Foto carregada e salva em userData!')
                    this.showMessage('Foto carregada com sucesso!', 'success')
                }
                reader.onerror = (error) => {
                    console.error('❌ Erro ao ler arquivo:', error)
                    this.showMessage('Erro ao carregar foto. Tente novamente.', 'error')
                }
                reader.readAsDataURL(file)
            }
        })

        // Avatares predefinidos
        document.querySelectorAll('.avatar-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                console.log('👆 Avatar preset clicado:', preset.dataset.avatar)

                // CORREÇÃO: Buscar avatarImage novamente
                const currentAvatarImage = document.getElementById('avatarImage')

                // Remove seleção anterior
                document.querySelectorAll('.avatar-preset').forEach(p => p.classList.remove('selected'))

                // Seleciona atual
                preset.classList.add('selected')

                const avatarEmoji = preset.dataset.avatar
                this.userData.avatar = avatarEmoji
                this.userData.avatarType = 'preset'

                // Atualiza preview
                if (currentAvatarImage) {
                    currentAvatarImage.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="60">${avatarEmoji}</text></svg>`
                    console.log('✅ Avatar preset aplicado à imagem!')
                } else {
                    console.error('❌ Elemento avatarImage não encontrado!')
                }

                console.log('✅ Avatar selecionado:', avatarEmoji)
                this.showMessage('Avatar selecionado!', 'success')
            })
        })

        console.log('✅ Event listeners do avatar inicializados com sucesso!')
    }

    initNameListeners() {
        const nameInput = document.getElementById('playerName')
        const nameValidation = document.getElementById('nameValidation')
        let debounceTimeout = null

        nameInput?.addEventListener('input', (e) => {
            const name = e.target.value.trim()
            this.userData.name = name

            // Validação básica em tempo real
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
                nameValidation.textContent = 'Verificando disponibilidade...'
                nameValidation.className = 'input-validation'

                // Debounce para não fazer muitas consultas
                clearTimeout(debounceTimeout)
                debounceTimeout = setTimeout(() => this.checkNameAvailability(name, nameValidation), 500)
            }
        })

        // Sugestões de nomes
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestedName = btn.dataset.name
                nameInput.value = suggestedName
                this.userData.name = suggestedName
                this.checkNameAvailability(suggestedName, nameValidation)
            })
        })
    }

    async checkNameAvailability(name, validationElement) {
        try {
            // Busca no Firestore por nomes similares (case-sensitive)
            const q = query(
                collection(db, 'users'),
                where('display_name', '==', name),
                limit(1)
            )
            const snapshot = await getDocs(q)

            if (!snapshot.empty) {
                // Nome já existe - gera sugestões
                const suggestions = this.generateNameSuggestions(name)
                validationElement.innerHTML = `
                    ❌ Nome já existe! Tente:<br>
                    <small style="color: #d4af37; cursor: pointer;" onclick="onboarding.selectSuggestion('${suggestions[0]}')">${suggestions[0]}</small> • 
                    <small style="color: #d4af37; cursor: pointer;" onclick="onboarding.selectSuggestion('${suggestions[1]}')">${suggestions[1]}</small> • 
                    <small style="color: #d4af37; cursor: pointer;" onclick="onboarding.selectSuggestion('${suggestions[2]}')">${suggestions[2]}</small>
                `
                validationElement.className = 'input-validation invalid'
            } else {
                validationElement.textContent = 'Nome disponível ✓'
                validationElement.className = 'input-validation valid'
            }
        } catch (error) {
            console.error('Erro ao verificar nome:', error)
            validationElement.textContent = 'Nome válido ✓'
            validationElement.className = 'input-validation valid'
        }
    }

    generateNameSuggestions(name) {
        const suffixes = ['_RPG', '_' + Math.floor(Math.random() * 999), ' II', ' III', ' Junior', ' o Valente', ' Aventureiro']
        const random = Math.floor(Math.random() * suffixes.length)

        return [
            name + suffixes[random],
            name + suffixes[(random + 1) % suffixes.length],
            name + suffixes[(random + 2) % suffixes.length]
        ]
    }

    selectSuggestion(name) {
        const nameInput = document.getElementById('playerName')
        const nameValidation = document.getElementById('nameValidation')
        nameInput.value = name
        this.userData.name = name
        this.checkNameAvailability(name, nameValidation)
    }

    async isNameTaken(name) {
        try {
            const q = query(
                collection(db, 'users'),
                where('display_name', '==', name),
                limit(1)
            )
            const snapshot = await getDocs(q)
            return !snapshot.empty
        } catch (error) {
            console.error('Erro ao verificar nome:', error)
            return false
        }
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
        console.log('🎯 completeOnboarding() INICIADO')
        this.showMessage('Salvando seu perfil...', 'info')

        try {
            const userId = localStorage.getItem('currentUserId')
            console.log('🔍 Step 1 - userId:', userId)
            console.log('🔍 Step 1 - userData:', JSON.stringify(this.userData, null, 2))

            if (!userId) {
                throw new Error('Usuário não identificado. Faça login novamente.')
            }

            console.log('✅ Step 1 - UserId OK')

            // Garante que há uma foto de perfil (padrão se necessário)
            if (!this.userData.avatar) {
                console.log('⚠️ Avatar vazio, aplicando imagem padrão...')
                this.userData.avatar = defaultAvatar
                this.userData.avatarType = 'default'
                console.log('✅ Imagem padrão aplicada:', this.userData.avatar)
            } else {
                console.log('✅ Avatar já existe:', this.userData.avatar)
                console.log('📋 Tipo:', this.userData.avatarType)
            }

            // Valida dados obrigatórios
            console.log('🔍 Step 2 - Validando dados obrigatórios...')
            if (!this.userData.name || !this.userData.age || !this.userData.experience || !this.userData.role) {
                throw new Error('Dados incompletos. Verifique todos os campos.')
            }

            console.log('✅ Step 2 - Validação OK')

            // Salva no banco de dados real
            console.log('💾 Step 3 - Chamando UserService.completeOnboarding...')
            const result = await UserService.completeOnboarding(userId, this.userData)
            console.log('✅ Step 3 - Dados salvos no Firebase:', result)

            // Atualiza localStorage com dados salvos
            console.log('💾 Step 4 - Salvando no localStorage...')
            this.saveUserData()
            console.log('✅ Step 4 - localStorage atualizado')

            this.showMessage('Perfil configurado com sucesso! Redirecionando...', 'success')

            console.log('🚀 Step 5 - Redirecionando para dashboard em 2 segundos...')
            setTimeout(() => {
                console.log('🔄 Executando redirecionamento para dashboard.html')
                window.location.href = 'dashboard.html'
            }, 2000)

        } catch (error) {
            console.error('❌ ERRO COMPLETO em completeOnboarding:', error)
            console.error('❌ Error stack:', error.stack)
            console.error('❌ Error name:', error.name)
            console.error('❌ Error message:', error.message)

            // Mostra erro mais específico
            let errorMessage = 'Erro desconhecido'
            if (error.message) {
                errorMessage = error.message
            } else if (error.error) {
                errorMessage = error.error.message || 'Erro na base de dados'
            }

            this.showMessage(`Erro ao salvar perfil: ${errorMessage}`, 'error')

            // Mesmo com erro, tenta redirecionar (fallback)
            console.log('⚠️ Tentando redirecionar mesmo com erro...')
            setTimeout(() => {
                console.log('🔄 Redirecionamento de fallback')
                window.location.href = 'dashboard.html'
            }, 3000)
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
        // Previne notificações duplicadas consecutivas
        if (this.lastNotification === message) {
            console.log('⚠️ Notificação duplicada bloqueada:', message)
            return
        }

        this.lastNotification = message

        // Reseta o controle após 1 segundo
        clearTimeout(this.notificationTimeout)
        this.notificationTimeout = setTimeout(() => {
            this.lastNotification = null
        }, 1000)

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
        // Usa o checkAuth do Firebase Auth
        const user = await checkAuth()

        if (user) {
            console.log('✅ Usuário autenticado:', user.uid)
            localStorage.setItem('currentUserId', user.uid)
            localStorage.setItem('isLoggedIn', 'true')
            localStorage.setItem('userEmail', user.email || '')
            localStorage.setItem('onboardingCompleted', 'false')



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
window.debugUserState = async function () {
    console.log('=== 🔍 DEBUG DO ESTADO DO USUÁRIO ===')

    // 1. LocalStorage
    console.log('📦 LOCALSTORAGE:')
    console.log('  - isLoggedIn:', localStorage.getItem('isLoggedIn'))
    console.log('  - currentUserId:', localStorage.getItem('currentUserId'))
    console.log('  - onboardingCompleted:', localStorage.getItem('onboardingCompleted'))
    console.log('  - userName:', localStorage.getItem('userName'))

    // 2. Sessão Firebase
    console.log('\n🔐 SESSÃO FIREBASE:')
    try {
        const { checkAuth } = await import('./auth.js')
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