// =====================================
// DASHBOARD - SERVIÇOS COM DADOS REAIS
// =====================================

import { UserService, CharacterService, CampaignService, ActivityService } from './database.js'

export class DashboardService {

    // =====================================
    // CARREGAMENTO DE DADOS DO USUÁRIO
    // =====================================

    static async loadUserData() {
        try {
            const userId = localStorage.getItem('currentUserId')
            if (!userId) {
                throw new Error('Usuário não identificado')
            }

            const userStats = await UserService.getUserStats(userId)

            if (userStats) {
                this.updateUserHeader(userStats)
                this.updateKPICards(userStats)
                this.updateSidebarBadges(userStats)
                this.updateSidebarLevel(userStats)
            }

            return userStats
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error)
            return null
        }
    }

    // =====================================
    // CARREGAMENTO DE PERSONAGENS REAIS
    // =====================================

    static async loadUserCharacters() {
        try {
            let userId = localStorage.getItem('currentUserId')

            console.log('🔍 Dashboard: Carregando personagens para userId:', userId)

            if (!userId) {
                console.warn('⚠️ Dashboard: Nenhum userId encontrado')
                return []
            }

            const characters = await CharacterService.getUserCharacters(userId)

            console.log('👥 Dashboard: Personagens carregados:', characters)

            // Mostra TODOS os personagens finalizados (is_draft = false)
            const validCharacters = characters.filter(char => char.is_draft === false)

            console.log('👥 Dashboard: Personagens finalizados:', validCharacters.length)

            // Atualiza AMBAS as seções: inline (aba Início) e grid (aba Personagens)
            this.updateInlineCharacters(validCharacters)
            this.updateCharactersSection(validCharacters)

            return validCharacters
        } catch (error) {
            console.error('❌ Dashboard: Erro ao carregar personagens:', error)
            return []
        }
    }

    // =====================================
    // CARREGAMENTO DE CAMPANHAS REAIS
    // =====================================

    static async loadUserCampaigns() {
        try {
            const userId = localStorage.getItem('currentUserId')
            if (!userId) return []

            const campaigns = await CampaignService.getUserCampaigns(userId)

            // Atualiza todas as seções de mesas
            this.updateActiveMesa(campaigns)
            this.updateMesasList(campaigns)
            this.updateCampaignsSection(campaigns)

            return campaigns
        } catch (error) {
            console.error('Erro ao carregar campanhas:', error)
            return []
        }
    }

    // =====================================
    // CARREGAMENTO DE ATIVIDADES REAIS
    // =====================================

    static async loadRecentActivities() {
        try {
            const userId = localStorage.getItem('currentUserId')
            if (!userId) return []

            const activities = await ActivityService.getUserActivities(userId, 5)

            this.updateFeedActivities(activities)
            this.updateLastSessionInfo(activities)

            return activities
        } catch (error) {
            console.error('Erro ao carregar atividades:', error)
            return []
        }
    }

    // =====================================
    // ATUALIZAÇÃO DO HEADER E SIDEBAR
    // =====================================

    static updateUserHeader(userStats) {
        const userName = document.getElementById('userName')
        const userNameGreet = document.getElementById('userNameGreet')
        const userAvatar = document.getElementById('userAvatar')
        const sidebarAvatar = document.getElementById('sidebarAvatar')
        const sidebarUserName = document.getElementById('sidebarUserName')

        const displayName = userStats.display_name || 'Aventureiro'

        if (userName) userName.textContent = displayName
        if (userNameGreet) userNameGreet.textContent = displayName
        if (sidebarUserName) sidebarUserName.textContent = displayName

        // Avatar
        const avatarSrc = this._getAvatarSrc(userStats)
        if (userAvatar) {
            userAvatar.src = avatarSrc
            userAvatar.onerror = () => { userAvatar.src = 'img/perfil_empty_user.png' }
        }
        if (sidebarAvatar) {
            sidebarAvatar.src = avatarSrc
            sidebarAvatar.onerror = () => { sidebarAvatar.src = 'img/perfil_empty_user.png' }
        }
    }

    static _getAvatarSrc(userStats) {
        if (!userStats.avatar_url) return 'img/perfil_empty_user.png'

        if (userStats.avatar_type === 'preset') {
            return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="24">${encodeURIComponent(userStats.avatar_url)}</text></svg>`
        }

        return userStats.avatar_url
    }

    // =====================================
    // KPI CARDS (aba Início)
    // =====================================

    static updateKPICards(userStats) {
        const kpiCharacters = document.getElementById('kpiCharacters')
        const kpiTables = document.getElementById('kpiTables')
        const kpiSessions = document.getElementById('kpiSessions')
        const kpiXP = document.getElementById('kpiXP')

        if (kpiCharacters) kpiCharacters.textContent = userStats.total_characters || 0
        if (kpiTables) kpiTables.textContent = userStats.total_campaigns || 0
        if (kpiSessions) kpiSessions.textContent = userStats.total_sessions || 0

        // XP — usar campo do perfil ou calcular
        const xp = userStats.xp || userStats.total_xp || 0
        if (kpiXP) kpiXP.textContent = xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp

        // Trends opcionais
        const charTrend = document.getElementById('kpiCharTrend')
        const tableTrend = document.getElementById('kpiTableTrend')
        const sessionTrend = document.getElementById('kpiSessionTrend')
        const xpTrend = document.getElementById('kpiXPTrend')

        if (charTrend) charTrend.textContent = userStats.total_characters > 0 ? `${userStats.total_characters} criado(s)` : 'Nenhum ainda'
        if (tableTrend) tableTrend.textContent = userStats.total_campaigns > 0 ? `${userStats.total_campaigns} ativa(s)` : 'Nenhuma ainda'
        if (sessionTrend) sessionTrend.textContent = userStats.total_sessions > 0 ? `${userStats.total_sessions} participação(ões)` : 'Nenhuma ainda'
        if (xpTrend) xpTrend.textContent = xp > 0 ? 'Acumulado total' : 'Comece a jogar!'
    }

    // =====================================
    // SIDEBAR BADGES
    // =====================================

    static updateSidebarBadges(userStats) {
        const charBadge = document.getElementById('sidebarCharBadge')
        const tableBadge = document.getElementById('sidebarTableBadge')

        if (charBadge) charBadge.textContent = userStats.total_characters || 0
        if (tableBadge) tableBadge.textContent = userStats.total_campaigns || 0
    }

    static updateSidebarLevel(userStats) {
        const levelEl = document.getElementById('sidebarUserLevel')
        if (!levelEl) return

        const xp = userStats.xp || userStats.total_xp || 0
        let levelTitle = 'Iniciante'
        if (xp >= 10000) levelTitle = 'Lendário'
        else if (xp >= 5000) levelTitle = 'Épico'
        else if (xp >= 2000) levelTitle = 'Herói'
        else if (xp >= 500) levelTitle = 'Veterano'
        else if (xp >= 100) levelTitle = 'Aventureiro'

        levelEl.textContent = `Nível de XP: ${levelTitle}`
    }

    // =====================================
    // PERSONAGENS INLINE (aba Início)
    // =====================================

    static updateInlineCharacters(characters) {
        const container = document.getElementById('characters-inline')
        if (!container) return

        if (characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state-inline">
                    <div class="empty-icon-sm">➕</div>
                    <div class="empty-text-sm">Crie um novo personagem para começar sua aventura</div>
                    <button class="btn-secondary" style="font-size:0.78rem;padding:6px 14px;"
                            onclick="window.location.href='character-sheet.html?new=true'">+ Novo Personagem</button>
                </div>
            `
            return
        }

        const html = characters.map(char => {
            const hp = char.hp_current ?? char.hit_points ?? 0
            const hpMax = char.hp_max ?? char.max_hit_points ?? 1
            const hpPercent = Math.round((hp / hpMax) * 100)
            const hpClass = hpPercent >= 60 ? 'high' : hpPercent >= 30 ? 'mid' : 'low'

            const classIcon = this._getClassIcon(char.character_class || char.class)
            const race = char.race || 'Desconhecida'
            const charClass = char.character_class || char.class || 'Aventureiro'
            const level = char.level || 1

            // Stats — pegar os 3 mais relevantes
            const stats = this._getTopStats(char)

            return `
                <div class="char-card-inline" data-character-id="${char.id}">
                    <div class="char-img-inline-placeholder">${classIcon}</div>
                    <div class="char-info-inline">
                        <div class="char-name-inline">${char.name || 'Sem Nome'}</div>
                        <div class="char-meta-inline">${race} · ${charClass} · Nível ${level}</div>
                        <div class="hp-bar-container">
                            <div class="hp-bar-labels"><span>PV</span><span>${hp}/${hpMax}</span></div>
                            <div class="hp-bar-track">
                                <div class="hp-bar-fill ${hpClass}" style="width:${hpPercent}%"></div>
                            </div>
                        </div>
                        <div class="char-stats-pills">
                            ${stats}
                        </div>
                    </div>
                    <div class="char-actions-inline">
                        <button class="btn-primary char-open-btn" style="font-size:0.7rem;padding:6px 10px;white-space:nowrap;"
                                onclick="window.location.href='character-sheet.html?id=${char.id}'">Abrir Ficha</button>
                        <button class="btn-secondary" style="font-size:0.7rem;padding:5px 10px;"
                                onclick="window.location.href='character-sheet.html?id=${char.id}'">Editar</button>
                    </div>
                </div>
            `
        }).join('')

        // Adiciona botão de criar no final
        container.innerHTML = html + `
            <div class="empty-state-inline">
                <div class="empty-icon-sm">➕</div>
                <div class="empty-text-sm">Crie um novo personagem para começar sua aventura</div>
                <button class="btn-secondary" style="font-size:0.78rem;padding:6px 14px;"
                        onclick="window.location.href='character-sheet.html?new=true'">+ Novo Personagem</button>
            </div>
        `
    }

    static _getClassIcon(charClass) {
        const icons = {
            'Mago': '🧙', 'Wizard': '🧙',
            'Guerreiro': '⚔️', 'Fighter': '⚔️',
            'Ladino': '🗡️', 'Rogue': '🗡️',
            'Clérigo': '✝️', 'Cleric': '✝️',
            'Paladino': '🛡️', 'Paladin': '🛡️',
            'Bárbaro': '💪', 'Barbarian': '💪',
            'Druida': '🌿', 'Druid': '🌿',
            'Ranger': '🏹',
            'Bardo': '🎵', 'Bard': '🎵',
            'Feiticeiro': '✨', 'Sorcerer': '✨',
            'Bruxo': '🔮', 'Warlock': '🔮',
            'Monge': '👊', 'Monk': '👊',
            'Artífice': '⚙️', 'Artificer': '⚙️'
        }
        return icons[charClass] || '🧝'
    }

    static _getTopStats(char) {
        // Tenta pegar atributos do personagem
        const abilities = char.abilities || char.attributes || {}
        const mapping = [
            { key: 'strength', label: 'FOR' },
            { key: 'dexterity', label: 'DES' },
            { key: 'constitution', label: 'CON' },
            { key: 'intelligence', label: 'INT' },
            { key: 'wisdom', label: 'SAB' },
            { key: 'charisma', label: 'CAR' }
        ]

        const stats = mapping
            .filter(m => abilities[m.key] !== undefined && abilities[m.key] !== null)
            .sort((a, b) => (abilities[b.key] || 0) - (abilities[a.key] || 0))
            .slice(0, 3)
            .map(m => `<span class="stat-pill-sm">${m.label} ${abilities[m.key]}</span>`)

        // Se tiver CA, adiciona
        const ac = char.armor_class ?? char.ac
        if (ac !== undefined && ac !== null) {
            stats.push(`<span class="stat-pill-sm">CA ${ac}</span>`)
        }

        if (stats.length === 0) {
            return `<span class="stat-pill-sm" style="opacity:0.5">Lv ${char.level || 1}</span>`
        }

        return stats.slice(0, 3).join('')
    }

    // =====================================
    // MESA ATIVA (aba Início — coluna direita)
    // =====================================

    static updateActiveMesa(campaigns) {
        const container = document.getElementById('mesa-ativa-content')
        const badge = document.getElementById('mesaStatusBadge')
        if (!container) return

        // Encontra a campanha ativa mais recente
        const activeCampaign = campaigns.find(c =>
            c.status === 'active' || c.player_status === 'active'
        )

        if (!activeCampaign) {
            if (badge) badge.textContent = ''
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:#8a8a9a;">
                    <div style="font-size:1.5rem;margin-bottom:8px;">🎲</div>
                    <div>Nenhuma mesa ativa no momento</div>
                    <button class="btn-secondary" style="margin-top:12px;font-size:0.82rem;"
                            onclick="alert('Funcionalidade em breve!')">Procurar Mesas</button>
                </div>
            `
            return
        }

        const statusConfig = this.getCampaignStatusConfig(activeCampaign.status)
        if (badge) badge.textContent = `${statusConfig.icon} ${statusConfig.text}`

        container.innerHTML = `
            <div class="mesa-title">${activeCampaign.name || 'Mesa sem nome'}</div>
            <div class="mesa-meta">${activeCampaign.system || 'D&D 5e'} · ${activeCampaign.current_players || '?'}/${activeCampaign.max_players || '?'} jogadores</div>
            ${activeCampaign.next_session
                ? `<div class="mesa-next">Próxima sessão: <strong style="color:#d4af37;">${activeCampaign.next_session}</strong></div>`
                : '<div class="mesa-next" style="color:#8a8a9a;">Sem sessão agendada</div>'
            }
            <div class="mesa-actions">
                <button class="btn-primary" style="flex:1;font-size:0.82rem;"
                        onclick="joinCampaignSession('${activeCampaign.id}')">Entrar na Mesa</button>
                <button class="btn-secondary" style="font-size:0.82rem;"
                        onclick="viewCampaign('${activeCampaign.id}')">Info</button>
            </div>
        `
    }

    // =====================================
    // FEED DE ATIVIDADES (aba Início)
    // =====================================

    static updateFeedActivities(activities) {
        const container = document.getElementById('feed-activities')
        if (!container) return

        if (!activities || activities.length === 0) {
            container.innerHTML = `
                <div class="feed-item">
                    <div class="feed-icon-circle">📝</div>
                    <div>
                        <div class="feed-title">Bem-vindo ao RPG Player!</div>
                        <div class="feed-time">Complete seu perfil e comece suas aventuras</div>
                    </div>
                </div>
            `
            return
        }

        container.innerHTML = activities.map(activity => {
            const timeAgo = this.getTimeAgo(activity.created_at)
            const icon = this.getActivityIcon(activity.activity_type)

            return `
                <div class="feed-item">
                    <div class="feed-icon-circle">${icon}</div>
                    <div>
                        <div class="feed-title">${activity.title || activity.description || 'Atividade'}</div>
                        <div class="feed-time">${timeAgo}</div>
                    </div>
                </div>
            `
        }).join('')
    }

    // =====================================
    // ÚLTIMA SESSÃO INFO (subtítulo da saudação)
    // =====================================

    static updateLastSessionInfo(activities) {
        const el = document.getElementById('lastSessionInfo')
        if (!el) return

        if (!activities || activities.length === 0) {
            el.textContent = 'Bem-vindo! Comece criando seu primeiro personagem.'
            return
        }

        const lastActivity = activities[0]
        const timeAgo = this.getTimeAgo(lastActivity.created_at)
        el.textContent = `Última atividade: ${timeAgo}`
    }

    // =====================================
    // LISTA DE MESAS (aba Início — seção inferior)
    // =====================================

    static updateMesasList(campaigns) {
        const container = document.getElementById('mesas-list-content')
        if (!container) return

        if (!campaigns || campaigns.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:#8a8a9a;">
                    <div>Nenhuma mesa encontrada</div>
                    <button class="btn-secondary" style="margin-top:10px;font-size:0.78rem;"
                            onclick="alert('Funcionalidade em breve!')">+ Criar Mesa</button>
                </div>
            `
            return
        }

        container.innerHTML = campaigns.map(campaign => {
            const statusConfig = this.getCampaignStatusConfig(campaign.status)
            const statusClass = campaign.status === 'active' ? 'active' : campaign.status === 'completed' ? 'done' : 'waiting'
            const actionText = campaign.status === 'active' ? 'Entrar' : campaign.status === 'completed' ? 'Histórico' : 'Configurar'

            return `
                <div class="tables-list-item">
                    <div class="table-status-dot ${statusClass}"></div>
                    <div class="table-list-name">${campaign.name || 'Mesa sem nome'}</div>
                    <div class="table-list-info">${campaign.system || 'D&D 5e'} · ${campaign.current_players || '?'}/${campaign.max_players || '?'} · ${statusConfig.icon} ${statusConfig.text}</div>
                    <span class="table-list-action" onclick="viewCampaign('${campaign.id}')">${actionText}</span>
                </div>
            `
        }).join('')
    }

    // =====================================
    // PERSONAGENS GRID (aba Personagens)
    // =====================================

    static updateCharactersSection(characters) {
        const charactersGrid = document.querySelector('.characters-grid')
        if (!charactersGrid) return

        if (characters.length === 0) {
            charactersGrid.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon" style="font-size:3rem;margin-bottom:12px;">🧝</div>
                    <h3>Nenhum personagem ainda</h3>
                    <p>Crie seu primeiro personagem para começar suas aventuras!</p>
                    <button class="btn-primary" onclick="window.location.href='character-sheet.html?new=true'">+ Criar Personagem</button>
                </div>
            `
            return
        }

        charactersGrid.innerHTML = characters.map(character => `
            <div class="character-card" data-character-id="${character.id}">
                <div class="character-avatar">
                    <div style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;font-size:4rem;background:rgba(212,175,55,0.1);">
                        ${this._getClassIcon(character.character_class || character.class)}
                    </div>
                </div>
                <div class="character-overlay">
                    <div class="character-level">Nível ${character.level || 1}</div>
                    <div class="character-info">
                        <h3>${character.name || 'Sem Nome'}</h3>
                        <div class="character-details">
                            <div class="character-class">${character.character_class || character.class || 'Aventureiro'}</div>
                            <div class="character-race">${character.race || 'Humano'}</div>
                        </div>
                    </div>
                    <div class="character-actions">
                        <button class="btn-secondary" onclick="window.location.href='character-sheet.html?id=${character.id}'">Editar</button>
                        <button class="btn-primary" disabled>Jogar</button>
                    </div>
                </div>
            </div>
        `).join('')
    }

    // =====================================
    // CAMPANHAS GRID (aba Mesas)
    // =====================================

    static updateCampaignsSection(campaigns) {
        const campaignsGrid = document.querySelector('.tables-grid')
        if (!campaignsGrid) return

        if (!campaigns || campaigns.length === 0) {
            campaignsGrid.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon" style="font-size:3rem;margin-bottom:12px;">🎲</div>
                    <h3>Nenhuma mesa ainda</h3>
                    <p>Participe de uma mesa ou crie a sua própria!</p>
                    <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
                        <button class="btn-secondary" onclick="alert('Funcionalidade em breve!')">Procurar Mesas</button>
                        <button class="btn-primary" onclick="alert('Funcionalidade em breve!')">+ Criar Mesa</button>
                    </div>
                </div>
            `
            return
        }

        campaignsGrid.innerHTML = campaigns.map(campaign => {
            const statusConfig = this.getCampaignStatusConfig(campaign.status)

            return `
                <div class="table-card ${campaign.status}" data-campaign-id="${campaign.id}">
                    <div class="table-header">
                        <div class="table-status">${statusConfig.icon} ${statusConfig.text}</div>
                        <div class="table-players">${campaign.current_players || '?'}/${campaign.max_players || '?'} jogadores</div>
                    </div>
                    <div class="table-info">
                        <h3>${campaign.name || 'Mesa sem nome'}</h3>
                        <div class="table-system">${campaign.system || 'D&D 5e'}</div>
                        <div class="table-description">
                            ${campaign.description || 'Sem descrição disponível.'}
                        </div>
                    </div>
                    <div class="table-actions">
                        <button class="btn-secondary" onclick="viewCampaign('${campaign.id}')">Ver Detalhes</button>
                        <button class="btn-primary" onclick="joinCampaignSession('${campaign.id}')">
                            ${campaign.status === 'active' ? 'Entrar na Mesa' : 'Visualizar'}
                        </button>
                    </div>
                </div>
            `
        }).join('')
    }

    // =====================================
    // UTILITÁRIOS
    // =====================================

    static getCampaignStatusConfig(status) {
        const configs = {
            'recruiting': { icon: '🟡', text: 'Recrutando' },
            'active': { icon: '🟢', text: 'Ativa' },
            'paused': { icon: '⏸️', text: 'Pausada' },
            'completed': { icon: '✅', text: 'Concluída' }
        }
        return configs[status] || { icon: '❓', text: 'Desconhecido' }
    }

    static getActivityIcon(activityType) {
        const icons = {
            'profile_updated': '👤',
            'onboarding_completed': '✨',
            'character_created': '⚔️',
            'campaign_created': '🎲',
            'campaign_joined': '🤝',
            'session_completed': '🏆'
        }
        return icons[activityType] || '📝'
    }

    static getTimeAgo(dateString) {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMinutes = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMinutes / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMinutes < 1) return 'Agora mesmo'
        if (diffMinutes < 60) return `Há ${diffMinutes} minutos`
        if (diffHours < 24) return `Há ${diffHours} horas`
        if (diffDays === 1) return 'Ontem'
        if (diffDays < 7) return `Há ${diffDays} dias`

        return date.toLocaleDateString('pt-BR')
    }

    // =====================================
    // CARREGAMENTO COMPLETO DO DASHBOARD
    // =====================================

    static async loadAllData() {
        try {
            console.log('🚀 Dashboard: Iniciando carregamento de todos os dados')

            this.showLoading(true)

            const [userData, characters, campaigns, activities] = await Promise.all([
                this.loadUserData(),
                this.loadUserCharacters(),
                this.loadUserCampaigns(),
                this.loadRecentActivities()
            ])

            console.log('📊 Dashboard: Dados carregados:', {
                userData: userData ? 'OK' : 'NULL',
                characters: characters ? `${characters.length} personagens` : 'NULL',
                campaigns: campaigns ? `${campaigns.length} campanhas` : 'NULL',
                activities: activities ? `${activities.length} atividades` : 'NULL'
            })

            this.showLoading(false)

            return { userData, characters, campaigns, activities }
        } catch (error) {
            console.error('❌ Dashboard: Erro ao carregar dados:', error)
            this.showLoading(false)
            this.showError('Erro ao carregar dados. Tente recarregar a página.')
            return null
        }
    }

    static showLoading(show) {
        const placeholders = document.querySelectorAll('.loading-placeholder')
        placeholders.forEach(p => {
            p.style.display = show ? 'block' : 'none'
        })
    }

    static showError(message) {
        if (window.dashboardFunctions && window.dashboardFunctions.showMessage) {
            window.dashboardFunctions.showMessage(message, 'error')
        } else {
            console.error(message)
        }
    }
}

// =====================================
// FUNÇÕES GLOBAIS PARA OS BOTÕES
// =====================================

window.createNewCharacter = function () {
    window.location.href = 'character-sheet.html?new=true'
}

window.editCharacter = function (characterId) {
    window.location.href = `character-sheet.html?id=${characterId}`
}

window.playCharacter = function (characterId) {
    alert(`Jogar com personagem: ${characterId}`)
}

window.createNewCampaign = function () {
    alert('Funcionalidade de criar mesa será implementada em breve!')
}

window.browseCampaigns = function () {
    alert('Funcionalidade de procurar mesas será implementada em breve!')
}

window.viewCampaign = function (campaignId) {
    alert(`Ver detalhes da campanha: ${campaignId}`)
}

window.joinCampaignSession = function (campaignId) {
    alert(`Entrar na mesa: ${campaignId}`)
}