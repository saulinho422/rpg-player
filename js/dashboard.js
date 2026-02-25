// =====================================
// DASHBOARD - NAVEGAÇÃO E FUNCIONALIDADES
// =====================================

import { DashboardService } from './dashboard-real.js'
import { checkAuth } from './auth.js'

// Previne múltiplas inicializações
if (window.dashboardInitialized) {
    // already running, skip
} else {
    window.dashboardInitialized = true;

    // =====================================
    // CONTROLE DE ABAS
    // =====================================

    function initTabNavigation() {
        const sidebarNavItems = document.querySelectorAll('.sidebar .nav-item[data-tab]')
        const bottomNavItems  = document.querySelectorAll('.bottom-nav .nav-item[data-tab]')
        const tabContents     = document.querySelectorAll('.tab-content')

        function switchTab(tabName) {
            sidebarNavItems.forEach(item => item.classList.remove('active'))
            bottomNavItems.forEach(item => item.classList.remove('active'))
            tabContents.forEach(content => content.classList.remove('active'))

            sidebarNavItems.forEach(item => {
                if (item.dataset.tab === tabName) item.classList.add('active')
            })
            bottomNavItems.forEach(item => {
                if (item.dataset.tab === tabName) item.classList.add('active')
            })

            const targetContent = document.getElementById(`${tabName}-tab`)
            if (targetContent) targetContent.classList.add('active')

            localStorage.setItem('activeTab', tabName)
        }

        sidebarNavItems.forEach(item => {
            item.addEventListener('click', () => switchTab(item.dataset.tab))
        })
        bottomNavItems.forEach(item => {
            item.addEventListener('click', () => switchTab(item.dataset.tab))
        })

        const savedTab = localStorage.getItem('activeTab')
        if (savedTab) switchTab(savedTab)
    }

    // =====================================
    // INFORMAÇÕES DO USUÁRIO
    // =====================================

    function loadUserInfo() {
        const userAvatar   = document.getElementById('userAvatar')
        const userName     = document.getElementById('userName')
        const userNameGreet = document.getElementById('userNameGreet')

        const userData = {
            name:   localStorage.getItem('userName')  || 'Aventureiro',
            avatar: localStorage.getItem('userAvatar') || ''
        }

        if (userName)      userName.textContent = userData.name
        if (userNameGreet) userNameGreet.textContent = userData.name

        // FIX #8 — usar avatar local como fallback
        const avatarSrc = userData.avatar || 'img/perfil_empty_user.png'
        if (userAvatar) {
            userAvatar.src = avatarSrc
            userAvatar.onerror = () => { userAvatar.src = 'img/perfil_empty_user.png' }
        }

        // Sincronizar sidebar
        const sidebarAvatar   = document.getElementById('sidebarAvatar')
        const sidebarUserName = document.getElementById('sidebarUserName')
        if (sidebarAvatar) {
            sidebarAvatar.src = avatarSrc
            sidebarAvatar.onerror = () => { sidebarAvatar.src = 'img/perfil_empty_user.png' }
        }
        if (sidebarUserName) sidebarUserName.textContent = userData.name
    }

    // =====================================
    // FUNCIONALIDADES DOS CARDS
    // =====================================

    function initCardActions() {
        const tableBtns = document.querySelectorAll('.table-card .btn-primary')
        tableBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tableCard = e.target.closest('.table-card')
                const tableName = tableCard?.querySelector('h3')?.textContent || 'mesa'
                showMessage(`Conectando à mesa "${tableName}"...`, 'info')
            })
        })
    }

    // =====================================
    // LOGOUT
    // =====================================

    function initLogout() {
        const logoutBtn = document.getElementById('logoutBtn')
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.clear()
                window.location.href = 'login.html'
            })
        }
    }

    // =====================================
    // ANIMAÇÕES E RESPONSIVIDADE
    // =====================================

    function initAnimations() { /* handled by CSS */ }
    function initResponsiveFeatures() { /* handled by CSS */ }

    // =====================================
    // FIX #21 — SISTEMA DE MENSAGENS (sem inline styles de cor)
    // =====================================

    function showMessage(message, type = 'info') {
        let container = document.getElementById('messages')
        if (!container) {
            container = document.createElement('div')
            container.id = 'messages'
            document.body.appendChild(container)
        }

        const el = document.createElement('div')
        el.className = `message ${type}`
        el.textContent = message
        container.appendChild(el)

        setTimeout(() => {
            el.style.opacity = '0'
            el.style.transition = 'opacity 0.3s'
            setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el) }, 300)
        }, 4000)
    }

    // =====================================
    // INICIALIZAÇÃO — FIX #6: Firebase auth em vez de localStorage
    // =====================================

    document.addEventListener('DOMContentLoaded', async () => {
        if (!window.dashboardInitialized) return

        // FIX #6 — verificar autenticação real via Firebase onAuthStateChanged
        const user = await checkAuth()
        if (!user) {
            window.location.href = 'login.html'
            return
        }

        initTabNavigation()
        loadUserInfo()
        initCardActions()
        initLogout()
        initAnimations()
        initResponsiveFeatures()

        await DashboardService.loadAllData()
    })

    // Export
    window.dashboardFunctions = { showMessage }

} // fecha dashboardInitialized
