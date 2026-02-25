// =====================================
// DASHBOARD - SERVIÇOS COM DADOS REAIS
// =====================================

import { UserService, CharacterService, CampaignService, ActivityService } from './database.js'
import defaultAvatar from '../img/perfil_empty_user.png'
import emptyCharacterIcon from '../img/logo_personagem_vazio.png'
import emptyTableIcon from '../img/logo_mesas.png'

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

            // Carrega estatísticas completas do usuário
            const userStats = await UserService.getUserStats(userId)

            if (userStats) {
                // Atualiza informações no header
                this.updateUserHeader(userStats)

                // Atualiza cards de estatísticas
                this.updateStatsCards(userStats)
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
            let userId = localStorage.getItem('currentUserId');

            console.log('🔍 Dashboard: Carregando personagens para userId:', userId)

            if (!userId) {
                console.warn('⚠️ Dashboard: Nenhum userId encontrado')
                return []
            }

            // Usar CharacterService do database.js
            const characters = await CharacterService.getUserCharacters(userId)

            console.log('👥 Dashboard: Personagens carregados:', characters)
            console.log('👥 Dashboard: Total de personagens retornados:', characters.length)

            // Mostra TODOS os personagens finalizados (is_draft = false), mesmo sem nome
            const validCharacters = characters.filter(char => {
                const isFinished = char.is_draft === false;
                console.log(`👤 Personagem "${char.name || '(sem nome)'}": is_draft=${char.is_draft}, mostrando=${isFinished}`);
                return isFinished;
            });

            console.log('👥 Dashboard: Personagens finalizados:', validCharacters.length, 'de', characters.length, 'total');

            // Atualiza a seção de personagens
            this.updateCharactersSection(validCharacters)
            console.log('✅ Dashboard: Seção de personagens atualizada')

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

            // Atualiza a seção de mesas
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

            // Atualiza a seção de atividades
            this.updateActivitiesSection(activities)

            return activities
        } catch (error) {
            console.error('Erro ao carregar atividades:', error)
            return []
        }
    }

    // =====================================
    // ATUALIZAÇÃO DA INTERFACE
    // =====================================

    static updateUserHeader(userStats) {
        const userName = document.getElementById('userName')
        const userAvatar = document.getElementById('userAvatar')

        console.log('🎨 updateUserHeader - userStats recebido:', userStats)
        console.log('🖼️ Avatar URL:', userStats.avatar_url)
        console.log('📋 Avatar Type:', userStats.avatar_type)

        if (userName && userStats.display_name) {
            userName.textContent = userStats.display_name
        }

        if (userAvatar) {
            if (userStats.avatar_url) {
                console.log('✅ Avatar URL existe:', userStats.avatar_url)
                if (userStats.avatar_type === 'preset') {
                    // Se é emoji, cria SVG
                    console.log('🎭 Tipo: preset (emoji)')
                    userAvatar.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="24">${encodeURIComponent(userStats.avatar_url)}</text></svg>`
                } else {
                    // Se é URL de imagem (upload ou default)
                    console.log('🖼️ Tipo: upload/default (imagem)', userStats.avatar_url)
                    userAvatar.src = userStats.avatar_url
                    console.log('📍 Avatar src definido como:', userAvatar.src)
                }
            } else {
                // Fallback se não tiver avatar_url
                console.log('⚠️ Avatar URL vazio, usando fallback')
                userAvatar.src = defaultAvatar
            }
        } else {
            console.log('❌ Elemento userAvatar não encontrado no DOM')
        }
    }

    static updateStatsCards(userStats) {
        // Atualiza cards de estatísticas com dados reais
        const statsData = [
            {
                selector: '.stat-card:nth-child(1) .stat-number',
                value: userStats.total_characters || 0,
                label: 'Personagens'
            },
            {
                selector: '.stat-card:nth-child(2) .stat-number',
                value: userStats.total_campaigns || 0,
                label: 'Mesas Ativas'
            },
            {
                selector: '.stat-card:nth-child(3) .stat-number',
                value: userStats.total_sessions || 0,
                label: 'Aventuras'
            },
            {
                selector: '.stat-card:nth-child(4) .stat-number',
                value: `Nível ${userStats.player_level || 1}`,
                label: 'Experiência'
            }
        ]

        statsData.forEach(stat => {
            const element = document.querySelector(stat.selector)
            if (element) {
                element.textContent = stat.value
            }
        })
    }

    static updateCharactersSection(characters) {
        console.log('🎨 Dashboard: Atualizando seção de personagens com:', characters)

        const charactersGrid = document.querySelector('.characters-grid')
        if (!charactersGrid) {
            console.error('❌ Dashboard: Elemento .characters-grid não encontrado!')
            return
        }

        if (characters.length === 0) {
            console.log('📝 Dashboard: Nenhum personagem encontrado, exibindo mensagem')
            charactersGrid.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">
                        <img src="${emptyCharacterIcon}" alt="Sem personagens" style="width: 120px; height: 120px; opacity: 0.6;">
                    </div>
                    <h3>Nenhum personagem ainda</h3>
                    <p>Crie seu primeiro personagem para começar suas aventuras!</p>
                    <button class="btn-primary" onclick="window.location.href='character-sheet.html?new=true'">+ Criar Personagem</button>
                </div>
            `
            return
        }

        const charactersHTML = characters.map(character => `
            <div class="character-card" data-character-id="${character.id}">
                <div class="character-avatar">
                    <img src="${character.avatar_url || 'https://via.placeholder.com/400x200'}" alt="${character.name || 'Personagem'}">
                </div>
                <div class="character-overlay">
                    <div class="character-level">Nível ${character.level || 1}</div>
                    <div class="character-info">
                        <h3>${character.name || 'Sem Nome'}</h3>
                        <div class="character-details">
                            <div class="character-class">${character.character_class || 'Aventureiro'}</div>
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

        charactersGrid.innerHTML = charactersHTML
    }

    static updateCampaignsSection(campaigns) {
        const campaignsGrid = document.querySelector('.tables-grid')
        if (!campaignsGrid) return

        if (campaigns.length === 0) {
            campaignsGrid.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">
                        <img src="${emptyTableIcon}" alt="Sem mesas" style="width: 120px; height: 120px; opacity: 0.6;">
                    </div>
                    <h3>Nenhuma mesa ainda</h3>
                    <p>Participe de uma mesa ou crie a sua própria!</p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                        <button class="btn-secondary" onclick="browseCampaigns()">Procurar Mesas</button>
                        <button class="btn-primary" onclick="createNewCampaign()">+ Criar Mesa</button>
                    </div>
                </div>
            `
            return
        }

        const campaignsHTML = campaigns.map(campaign => {
            const statusConfig = this.getCampaignStatusConfig(campaign.status)

            return `
                <div class="table-card ${campaign.status}" data-campaign-id="${campaign.id}">
                    <div class="table-header">
                        <div class="table-status">${statusConfig.icon} ${statusConfig.text}</div>
                        <div class="table-players">${campaign.current_players}/${campaign.max_players} jogadores</div>
                    </div>
                    <div class="table-info">
                        <h3>${campaign.name}</h3>
                        <div class="table-system">${campaign.system}</div>
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

        campaignsGrid.innerHTML = campaignsHTML
    }

    static getCampaignStatusConfig(status) {
        const configs = {
            'recruiting': { icon: '🟡', text: 'Recrutando' },
            'active': { icon: '🟢', text: 'Ativa' },
            'paused': { icon: '⏸️', text: 'Pausada' },
            'completed': { icon: '✅', text: 'Concluída' }
        }

        return configs[status] || { icon: '❓', text: 'Desconhecido' }
    }

    static updateActivitiesSection(activities) {
        const activityList = document.querySelector('.activity-list')
        if (!activityList) return

        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">📝</div>
                    <div class="activity-content">
                        <div class="activity-title">Bem-vindo ao RPG Player!</div>
                        <div class="activity-time">Complete seu perfil e comece suas aventuras</div>
                    </div>
                </div>
            `
            return
        }

        const activitiesHTML = activities.map(activity => {
            const timeAgo = this.getTimeAgo(activity.created_at)
            const icon = this.getActivityIcon(activity.activity_type)

            return `
                <div class="activity-item">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time">${timeAgo}</div>
                    </div>
                </div>
            `
        }).join('')

        activityList.innerHTML = activitiesHTML
    }

    // =====================================
    // UTILITÁRIOS
    // =====================================

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

            // Exibe loading
            this.showLoading(true)

            // Carrega todos os dados em paralelo
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

            // Remove loading
            this.showLoading(false)

            return {
                userData,
                characters,
                campaigns,
                activities
            }
        } catch (error) {
            console.error('❌ Dashboard: Erro ao carregar dados:', error)
            this.showLoading(false)
            this.showError('Erro ao carregar dados. Tente recarregar a página.')
            return null
        }
    }

    static showLoading(show) {
        // Implementar loading spinner se necessário
        if (show) {
            console.log('Carregando dados do dashboard...')
        } else {
            console.log('Dados carregados com sucesso!')
        }
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
    window.location.href = 'character-creation.html'
}

window.editCharacter = function (characterId) {
    alert(`Editar personagem: ${characterId}`)
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