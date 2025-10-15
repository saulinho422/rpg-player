// =====================================
// DEBUG - VERIFICAR ESTADO DO USUÁRIO
// =====================================

// Função para verificar o estado atual do usuário
window.debugUserState = function() {
    console.log('=== DEBUG DO ESTADO DO USUÁRIO ===')
    
    // Verifica localStorage
    console.log('📁 localStorage:')
    console.log('  - isLoggedIn:', localStorage.getItem('isLoggedIn'))
    console.log('  - currentUserId:', localStorage.getItem('currentUserId'))
    console.log('  - userName:', localStorage.getItem('userName'))
    console.log('  - onboardingCompleted:', localStorage.getItem('onboardingCompleted'))
    
    // Verifica se há dados de onboarding em progresso
    const form = document.querySelector('form')
    if (form) {
        console.log('📝 Dados do formulário atual:')
        const formData = new FormData(form)
        for (let [key, value] of formData.entries()) {
            console.log(`  - ${key}: ${value}`)
        }
    }
    
    // Verifica se o sistema de onboarding foi inicializado
    if (window.onboarding) {
        console.log('🎮 Sistema de onboarding:')
        console.log('  - currentStep:', window.onboarding.currentStep)
        console.log('  - userData:', window.onboarding.userData)
    }
}

// Função para testar conexão com Supabase
window.testSupabaseProfile = async function() {
    console.log('=== TESTE DE PERFIL NO SUPABASE ===')
    
    const userId = localStorage.getItem('currentUserId')
    if (!userId) {
        console.error('❌ Nenhum userId encontrado no localStorage')
        return
    }
    
    try {
        // Importa o UserService
        const { UserService } = await import('./database.js')
        
        console.log('🔍 Buscando perfil para userId:', userId)
        const profile = await UserService.getProfile(userId)
        
        if (profile) {
            console.log('✅ Perfil encontrado:', profile)
        } else {
            console.log('⚠️ Perfil não encontrado - criando perfil básico...')
            
            // Tenta criar um perfil básico
            const basicProfile = {
                display_name: 'Usuário Teste',
                onboarding_completed: false
            }
            
            const created = await UserService.saveProfile(userId, basicProfile)
            console.log('✅ Perfil básico criado:', created)
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar perfil:', error)
    }
}

// Função para simular login (para testes)
window.simulateLogin = function() {
    console.log('🔐 Simulando login para testes...')
    
    // Gera um UUID simples para teste
    const testUserId = 'test-user-' + Math.random().toString(36).substr(2, 9)
    
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('currentUserId', testUserId)
    localStorage.setItem('onboardingCompleted', 'false')
    
    console.log('✅ Login simulado com userId:', testUserId)
}

// Auto-executa o debug quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Sistema de debug carregado')
    console.log('💡 Comandos disponíveis:')
    console.log('  - debugUserState() - Verifica estado do usuário')
    console.log('  - testSupabaseProfile() - Testa perfil no Supabase')
    console.log('  - simulateLogin() - Simula login para testes')
    
    // Auto-debug após 2 segundos
    setTimeout(() => {
        debugUserState()
    }, 2000)
})