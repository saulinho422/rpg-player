// =====================================
// DASHBOARD - NAVEGAÇÃO E FUNCIONALIDADES
// =====================================

import { DashboardService } from './dashboard-real.js'
import { checkAuth } from './auth-supabase-only.js'

// Previne múltiplas inicializações
if (window.dashboardInitialized) {
    console.warn('⚠️ Dashboard já foi inicializado, ignorando nova inicialização');
} else {
    window.dashboardInitialized = true;

// =====================================
// CONTROLE DE ABAS
// =====================================

function initTabNavigation() {
    // Navitens do sidebar (desktop)
    const sidebarNavItems = document.querySelectorAll('.sidebar .nav-item')
    // Navitens do bottom nav (mobile)
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item')
    // Conteúdos das abas
    const tabContents = document.querySelectorAll('.tab-content')
    
    // Função para mudar de aba
    function switchTab(tabName) {
        // Remove active de todas as nav-items (sidebar e bottom-nav)
        sidebarNavItems.forEach(item => item.classList.remove('active'))
        bottomNavItems.forEach(item => item.classList.remove('active'))
        
        // Remove active de todos os conteúdos
        tabContents.forEach(content => content.classList.remove('active'))
        
        // Ativa a aba específica em ambas as navegações
        sidebarNavItems.forEach(item => {
            if (item.dataset.tab === tabName) {
                item.classList.add('active')
            }
        })
        
        bottomNavItems.forEach(item => {
            if (item.dataset.tab === tabName) {
                item.classList.add('active')
            }
        })
        
        // Ativa o conteúdo correspondente
        const targetContent = document.getElementById(`${tabName}-tab`)
        if (targetContent) {
            targetContent.classList.add('active')
        }
        
        // Salva a aba ativa no localStorage
        localStorage.setItem('activeTab', tabName)
    }
    
    // Event listeners para sidebar
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab
            switchTab(tabName)
        })
    })
    
    // Event listeners para bottom nav
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab
            switchTab(tabName)
        })
    })
    
    // Restaura a aba ativa do localStorage
    const savedTab = localStorage.getItem('activeTab')
    if (savedTab) {
        switchTab(savedTab)
    }
}

// =====================================
// INFORMAÇÕES DO USUÁRIO
// =====================================

function loadUserInfo() {
    // Simula carregamento das informações do usuário
    const userAvatar = document.getElementById('userAvatar')
    const userName = document.getElementById('userName')
    const userLevel = document.getElementById('userLevel')
    
    // Dados simulados (em um app real, viriam do backend)
    const userData = {
        name: localStorage.getItem('userName') || 'Aventureiro',
        level: localStorage.getItem('userLevel') || 'Nível 1',
        avatar: localStorage.getItem('userAvatar') || 'https://via.placeholder.com/40'
    }
    
    if (userName) userName.textContent = userData.name
    if (userLevel) userLevel.textContent = userData.level
    if (userAvatar) userAvatar.src = userData.avatar
}

// =====================================
// FUNCIONALIDADES DOS CARDS
// =====================================

function initCardActions() {
    // Botões de personagens
    const characterBtns = document.querySelectorAll('.character-card .btn-primary')
    characterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const characterCard = e.target.closest('.character-card')
            const characterName = characterCard.querySelector('h3').textContent
            showMessage(`Entrando em jogo com ${characterName}...`, 'info')
        })
    })
    
    // Botões de mesas
    const tableBtns = document.querySelectorAll('.table-card .btn-primary')
    tableBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tableCard = e.target.closest('.table-card')
            const tableName = tableCard.querySelector('h3').textContent
            showMessage(`Conectando à mesa "${tableName}"...`, 'info')
        })
    })
    
    // Botões de adicionar
    const addBtns = document.querySelectorAll('.add-btn')
    addBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const contentHeader = e.target.closest('.content-header')
            const sectionTitle = contentHeader.querySelector('h2').textContent
            
            if (sectionTitle.includes('Personagens')) {
                showMessage('Abrindo criador de personagens...', 'info')
                // Aqui redirecionaria para a página de criação de personagem
            } else if (sectionTitle.includes('Mesas')) {
                showMessage('Abrindo criador de mesas...', 'info')
                // Aqui redirecionaria para a página de criação de mesa
            }
        })
    })
}

// =====================================
// SISTEMA DE MENSAGENS
// =====================================

function showMessage(message, type = 'info') {
    // Cria container de mensagens se não existir
    let messagesContainer = document.getElementById('messages')
    if (!messagesContainer) {
        messagesContainer = document.createElement('div')
        messagesContainer.id = 'messages'
        messagesContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 350px;
        `
        document.body.appendChild(messagesContainer)
    }
    
    const messageElement = document.createElement('div')
    messageElement.className = `message ${type}`
    messageElement.style.cssText = `
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 10px;
        font-weight: 600;
        text-align: center;
        animation: slideIn 0.3s ease-in-out;
        font-family: 'Cinzel', serif;
    `
    
    // Estilos por tipo
    switch (type) {
        case 'success':
            messageElement.style.background = 'rgba(40, 167, 69, 0.9)'
            messageElement.style.border = '1px solid #28a745'
            messageElement.style.color = '#fff'
            break
        case 'error':
            messageElement.style.background = 'rgba(220, 53, 69, 0.9)'
            messageElement.style.border = '1px solid #dc3545'
            messageElement.style.color = '#fff'
            break
        case 'info':
        default:
            messageElement.style.background = 'rgba(23, 162, 184, 0.9)'
            messageElement.style.border = '1px solid #17a2b8'
            messageElement.style.color = '#fff'
            break
    }
    
    messageElement.textContent = message
    messagesContainer.appendChild(messageElement)
    
    // Remove a mensagem após 4 segundos
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.style.animation = 'slideOut 0.3s ease-in-out'
            setTimeout(() => {
                messageElement.parentNode.removeChild(messageElement)
            }, 300)
        }
    }, 4000)
}

// =====================================
// LOGOUT
// =====================================

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn')
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            showMessage('Desconectando...', 'info')
            
            // Usa a função de logout global do auth.js
            if (window.performLogout) {
                await window.performLogout()
            } else {
                // Fallback caso a função não esteja disponível
                localStorage.clear()
                window.location.href = 'login.html'
            }
        })
    }
}

// =====================================
// ANIMAÇÕES DINÂMICAS
// =====================================

function initAnimations() {
    // Adiciona animações de hover aos cards
    const cards = document.querySelectorAll('.stat-card, .character-card, .table-card')
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)'
            card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        })
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)'
        })
    })
}

// =====================================
// RESPONSIVIDADE AVANÇADA
// =====================================

function initResponsiveFeatures() {
    // Detecta mudanças de orientação/tamanho
    function handleResize() {
        const isMobile = window.innerWidth <= 768
        const sidebar = document.querySelector('.sidebar')
        const bottomNav = document.querySelector('.bottom-nav')
        
        if (isMobile) {
            sidebar.style.display = 'none'
            bottomNav.style.display = 'flex'
        } else {
            sidebar.style.display = 'block'
            bottomNav.style.display = 'none'
        }
    }
    
    // Executa na inicialização e em redimensionamentos
    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100) // Delay para aguardar a mudança
    })
}

// =====================================
// VERIFICAÇÃO DE AUTENTICAÇÃO
// =====================================

function checkAuthentication() {
    // Verifica se o usuário está logado (simulado)
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    
    if (!isLoggedIn) {
        showMessage('Acesso negado. Redirecionando para login...', 'error')
        setTimeout(() => {
            window.location.href = 'login.html'
        }, 2000)
        return false
    }
    
    return true
}

// =====================================
// INICIALIZAÇÃO
// =====================================

document.addEventListener('DOMContentLoaded', async () => {
    // Verifica se já foi inicializado
    if (!window.dashboardInitialized) {
        console.warn('⚠️ Dashboard não foi marcado como inicializado, abortando');
        return;
    }
    
    // Verifica autenticação primeiro
    if (!checkAuthentication()) {
        return
    }
    
    console.log('🚀 Inicializando dashboard...');
    
    // Inicializa todos os módulos
    initTabNavigation()
    loadUserInfo()
    initCardActions()
    initLogout()
    initAnimations()
    initResponsiveFeatures()
    
    // Carrega dados reais do banco de dados
    await DashboardService.loadAllData()
    
    // Adiciona estilos de animação
    const style = document.createElement('style')
    style.textContent = `
        @keyframes slideIn {
            from { 
                opacity: 0; 
                transform: translateX(100px); 
            }
            to { 
                opacity: 1; 
                transform: translateX(0); 
            }
        }
        
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
    
    // Mensagem de boas-vindas
    setTimeout(() => {
        showMessage('Dashboard carregado com sucesso!', 'success')
    }, 500)
})

// =====================================
// UTILITÁRIOS EXTRAS
// =====================================

// Função para detectar se é dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Função para detectar se está em modo landscape
function isLandscape() {
    return window.innerWidth > window.innerHeight
}

// Export das funções principais (para uso em outros módulos se necessário)
window.dashboardFunctions = {
    showMessage,
    isMobileDevice,
    isLandscape
}

// Função de debug para verificar personagens
window.debugCharacters = async function() {
    try {
        console.log('🐛 DEBUG: Iniciando verificação de personagens...');
        
        // Pega userId
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || localStorage.getItem('currentUserId');
        
        console.log('🔑 DEBUG: UserId:', userId);
        
        if (!userId) {
            alert('❌ Nenhum usuário encontrado!');
            return;
        }
        
        // Busca TODOS os personagens sem filtro
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('❌ DEBUG: Erro ao buscar:', error);
            alert(`Erro: ${error.message}`);
            return;
        }
        
        console.log('📊 DEBUG: Personagens encontrados:', data?.length || 0);
        console.table(data);
        
        // Mostra detalhes de cada personagem
        data?.forEach((char, index) => {
            console.log(`${index + 1}. "${char.name}":`, {
                id: char.id,
                name: char.name,
                is_draft: char.is_draft,
                draft_step: char.draft_step,
                created_at: char.created_at,
                class: char.character_class,
                race: char.race
            });
        });
        
        alert(`✅ Encontrados ${data?.length || 0} personagens. Veja o console para detalhes.`);
        
    } catch (error) {
        console.error('❌ DEBUG: Erro:', error);
        alert(`Erro no debug: ${error.message}`);
    }
};

// Função global de debug
window.debugCharacters = async function() {
    try {
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm');
        const supabase = createClient(
            'https://bifiatkpfmrrnfhvgrpb.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'
        );

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || localStorage.getItem('currentUserId');
        
        console.log('🔍 DEBUG - UserId:', userId);
        
        if (!userId) {
            alert('❌ Nenhum usuário encontrado!');
            return;
        }
        
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('❌ Erro na query:', error);
            alert(`Erro: ${error.message}`);
            return;
        }
        
        console.log('📊 TODOS OS PERSONAGENS:', data);
        
        const summary = data.map(char => ({
            nome: char.name || '(sem nome)',
            is_draft: char.is_draft,
            criado_em: new Date(char.created_at).toLocaleString('pt-BR'),
            id: char.id.substring(0, 8) + '...'
        }));
        
        console.table(summary);
        
        alert(`Encontrados ${data.length} personagens no banco!\nVerifique o console para detalhes.`);
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
        alert(`Erro no debug: ${error.message}`);
    }
};

} // Fecha a verificação de dashboardInitialized