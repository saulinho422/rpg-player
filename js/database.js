// =====================================
// RPG PLAYER - SERVIÇOS DE BANCO DE DADOS
// Integração com Firebase Firestore
// =====================================

import { db, auth } from './firebase-config.js'
import {
    doc, getDoc, setDoc, updateDoc, addDoc, deleteDoc,
    collection, query, where, orderBy, limit, getDocs,
    getCountFromServer, serverTimestamp, Timestamp
} from 'firebase/firestore'

// =====================================
// SERVIÇOS DE USUÁRIO/PERFIL
// =====================================

export class UserService {
    // Busca perfil do usuário
    static async getProfile(userId) {
        try {
            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) {
                return null
            }

            return { id: docSnap.id, ...docSnap.data() }
        } catch (error) {
            console.error('Erro ao buscar perfil:', error)
            return null
        }
    }

    // Cria ou atualiza perfil do usuário
    static async saveProfile(userId, profileData) {
        try {
            console.log('💾 Salvando perfil no Firestore...')
            console.log('🔑 UserId:', userId)
            console.log('📋 ProfileData:', profileData)

            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)

            const dataToSave = {
                ...profileData,
                updated_at: new Date().toISOString()
            }

            if (docSnap.exists()) {
                console.log('⚠️ Perfil já existe, atualizando...')
                await updateDoc(docRef, dataToSave)
            } else {
                console.log('✅ Criando novo perfil...')
                await setDoc(docRef, {
                    id: userId,
                    ...dataToSave,
                    created_at: new Date().toISOString()
                })
            }

            console.log('✅ Dados salvos com sucesso')

            // Log da atividade
            await ActivityService.logActivity(userId, {
                activity_type: 'profile_updated',
                title: 'Perfil atualizado',
                description: 'O usuário atualizou suas informações de perfil'
            })

            // Retorna o perfil atualizado
            const updatedDoc = await getDoc(docRef)
            return { id: updatedDoc.id, ...updatedDoc.data() }
        } catch (error) {
            console.error('Erro ao salvar perfil:', error)
            throw error
        }
    }

    // Completa o onboarding
    static async completeOnboarding(userId, onboardingData) {
        try {
            console.log('🚀 UserService.completeOnboarding chamado')
            console.log('📝 UserId:', userId)
            console.log('📝 OnboardingData:', onboardingData)

            const profileData = {
                display_name: onboardingData.name,
                age: parseInt(onboardingData.age),
                experience_level: onboardingData.experience,
                preferred_role: onboardingData.role,
                avatar_url: onboardingData.avatar,
                avatar_type: onboardingData.avatarType || 'preset',
                onboarding_completed: true,
                updated_at: new Date().toISOString()
            }

            console.log('📊 Dados do perfil preparados:', profileData)

            const result = await this.saveProfile(userId, profileData)
            console.log('✅ Perfil salvo:', result)

            // Log da atividade (se der erro, não falha o onboarding)
            try {
                await ActivityService.logActivity(userId, {
                    activity_type: 'onboarding_completed',
                    title: 'Onboarding concluído',
                    description: `Bem-vindo, ${onboardingData.name}! Perfil configurado com sucesso.`
                })
                console.log('📝 Atividade logada')
            } catch (activityError) {
                console.warn('⚠️ Erro ao logar atividade (não crítico):', activityError)
            }

            return result
        } catch (error) {
            console.error('❌ Erro ao completar onboarding:', error)
            throw error
        }
    }

    // Atualiza último login
    static async updateLastLogin(userId) {
        try {
            const docRef = doc(db, 'users', userId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                await updateDoc(docRef, { last_login: new Date().toISOString() })
            }
        } catch (error) {
            console.error('Erro ao atualizar último login:', error)
        }
    }

    // Busca estatísticas do usuário
    static async getUserStats(userId) {
        try {
            const profile = await this.getProfile(userId)
            if (!profile) return null

            const [charactersCount, campaignsCount, sessionsCount] = await Promise.all([
                this.getCharactersCount(userId),
                this.getCampaignsCount(userId),
                this.getSessionsCount(userId)
            ])

            return {
                ...profile,
                total_characters: charactersCount,
                total_campaigns: campaignsCount,
                total_sessions: sessionsCount
            }
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error)
            return null
        }
    }

    // Contadores auxiliares
    static async getCharactersCount(userId) {
        try {
            const q = query(
                collection(db, 'characters'),
                where('user_id', '==', userId),
                where('is_draft', '==', false)
            )
            const snapshot = await getCountFromServer(q)
            return snapshot.data().count
        } catch (error) {
            return 0
        }
    }

    static async getCampaignsCount(userId) {
        try {
            // Buscar campanhas onde o usuário é jogador ativo
            const q = query(
                collection(db, 'campaign_players'),
                where('user_id', '==', userId),
                where('status', '==', 'active')
            )
            const snapshot = await getCountFromServer(q)
            return snapshot.data().count
        } catch (error) {
            return 0
        }
    }

    static async getSessionsCount(userId) {
        // Simplificado - conta campanhas completadas
        try {
            const q = query(
                collection(db, 'campaign_players'),
                where('user_id', '==', userId)
            )
            const snapshot = await getDocs(q)
            return snapshot.size
        } catch (error) {
            return 0
        }
    }
}

// =====================================
// SERVIÇOS DE PERSONAGENS
// =====================================

export class CharacterService {
    // Lista personagens do usuário
    static async getUserCharacters(userId) {
        try {
            console.log('🔍 Buscando personagens para userId:', userId)

            const q = query(
                collection(db, 'characters'),
                where('user_id', '==', userId),
                orderBy('created_at', 'desc')
            )

            const snapshot = await getDocs(q)
            const characters = []

            snapshot.forEach(docSnap => {
                characters.push({ id: docSnap.id, ...docSnap.data() })
            })

            console.log('📦 Personagens encontrados:', characters.length)
            return characters
        } catch (error) {
            console.error('❌ Erro ao buscar personagens:', error)
            return []
        }
    }

    // Busca personagem específico
    static async getCharacter(characterId, userId) {
        try {
            const docRef = doc(db, 'characters', characterId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists()) return null

            const data = { id: docSnap.id, ...docSnap.data() }

            // Verifica se pertence ao usuário
            if (data.user_id !== userId) return null

            return data
        } catch (error) {
            console.error('Erro ao buscar personagem:', error)
            return null
        }
    }

    // Cria novo personagem
    static async createCharacter(userId, characterData) {
        try {
            const dataToSave = {
                user_id: userId,
                ...characterData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            const docRef = await addDoc(collection(db, 'characters'), dataToSave)

            // Log da atividade
            await ActivityService.logActivity(userId, {
                activity_type: 'character_created',
                title: 'Novo personagem criado',
                description: `Personagem "${characterData.name}" foi criado`,
                character_id: docRef.id
            })

            return { id: docRef.id, ...dataToSave }
        } catch (error) {
            console.error('Erro ao criar personagem:', error)
            throw error
        }
    }

    // Atualiza personagem
    static async updateCharacter(characterId, userId, updateData) {
        try {
            const docRef = doc(db, 'characters', characterId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists() || docSnap.data().user_id !== userId) {
                throw new Error('Personagem não encontrado ou sem permissão')
            }

            await updateDoc(docRef, {
                ...updateData,
                updated_at: new Date().toISOString()
            })

            const updatedDoc = await getDoc(docRef)
            return { id: updatedDoc.id, ...updatedDoc.data() }
        } catch (error) {
            console.error('Erro ao atualizar personagem:', error)
            throw error
        }
    }

    // Remove personagem (soft delete)
    static async deleteCharacter(characterId, userId) {
        try {
            const docRef = doc(db, 'characters', characterId)
            const docSnap = await getDoc(docRef)

            if (!docSnap.exists() || docSnap.data().user_id !== userId) {
                throw new Error('Personagem não encontrado ou sem permissão')
            }

            await updateDoc(docRef, { is_active: false })

            return true
        } catch (error) {
            console.error('Erro ao deletar personagem:', error)
            throw error
        }
    }
}

// =====================================
// SERVIÇOS DE CAMPANHAS
// =====================================

export class CampaignService {
    // Lista campanhas públicas
    static async getPublicCampaigns(limitCount = 20, offset = 0) {
        try {
            const q = query(
                collection(db, 'campaigns'),
                where('is_public', '==', true),
                orderBy('created_at', 'desc'),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            const campaigns = []

            snapshot.forEach(docSnap => {
                campaigns.push({ id: docSnap.id, ...docSnap.data() })
            })

            return campaigns
        } catch (error) {
            console.error('Erro ao buscar campanhas públicas:', error)
            return []
        }
    }

    // Lista campanhas do usuário
    static async getUserCampaigns(userId) {
        try {
            const q = query(
                collection(db, 'campaign_players'),
                where('user_id', '==', userId)
            )

            const snapshot = await getDocs(q)
            const campaignIds = []

            snapshot.forEach(docSnap => {
                const data = docSnap.data()
                if (['approved', 'active'].includes(data.status)) {
                    campaignIds.push({
                        campaign_id: data.campaign_id,
                        player_status: data.status,
                        joined_at: data.joined_at
                    })
                }
            })

            // Buscar detalhes das campanhas
            const campaigns = []
            for (const cp of campaignIds) {
                const campDoc = await getDoc(doc(db, 'campaigns', cp.campaign_id))
                if (campDoc.exists()) {
                    campaigns.push({
                        id: campDoc.id,
                        ...campDoc.data(),
                        player_status: cp.player_status,
                        joined_at: cp.joined_at
                    })
                }
            }

            return campaigns
        } catch (error) {
            console.error('Erro ao buscar campanhas do usuário:', error)
            return []
        }
    }

    // Cria nova campanha
    static async createCampaign(userId, campaignData) {
        try {
            const dataToSave = {
                dm_user_id: userId,
                ...campaignData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            const docRef = await addDoc(collection(db, 'campaigns'), dataToSave)

            // Log da atividade
            await ActivityService.logActivity(userId, {
                activity_type: 'campaign_created',
                title: 'Nova campanha criada',
                description: `Campanha "${campaignData.name}" foi criada`,
                campaign_id: docRef.id
            })

            return { id: docRef.id, ...dataToSave }
        } catch (error) {
            console.error('Erro ao criar campanha:', error)
            throw error
        }
    }

    // Solicita participação em campanha
    static async joinCampaign(campaignId, userId, message = '') {
        try {
            const dataToSave = {
                campaign_id: campaignId,
                user_id: userId,
                status: 'pending',
                application_message: message,
                created_at: new Date().toISOString()
            }

            const docRef = await addDoc(collection(db, 'campaign_players'), dataToSave)

            return { id: docRef.id, ...dataToSave }
        } catch (error) {
            console.error('Erro ao solicitar participação:', error)
            throw error
        }
    }
}

// =====================================
// SERVIÇOS DE ATIVIDADES
// =====================================

export class ActivityService {
    // Log de atividade
    static async logActivity(userId, activityData) {
        try {
            await addDoc(collection(db, 'activity_log'), {
                user_id: userId,
                ...activityData,
                created_at: new Date().toISOString()
            })
        } catch (error) {
            console.error('Erro ao registrar atividade:', error)
        }
    }

    // Busca atividades do usuário
    static async getUserActivities(userId, limitCount = 10) {
        try {
            const q = query(
                collection(db, 'activity_log'),
                where('user_id', '==', userId),
                orderBy('created_at', 'desc'),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            const activities = []

            snapshot.forEach(docSnap => {
                activities.push({ id: docSnap.id, ...docSnap.data() })
            })

            return activities
        } catch (error) {
            console.error('Erro ao buscar atividades:', error)
            return []
        }
    }

    // Busca atividades públicas recentes
    static async getPublicActivities(limitCount = 20) {
        try {
            const q = query(
                collection(db, 'activity_log'),
                where('is_public', '==', true),
                orderBy('created_at', 'desc'),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            const activities = []

            snapshot.forEach(docSnap => {
                activities.push({ id: docSnap.id, ...docSnap.data() })
            })

            return activities
        } catch (error) {
            console.error('Erro ao buscar atividades públicas:', error)
            return []
        }
    }
}

// =====================================
// UTILITÁRIOS
// =====================================

export class DatabaseUtils {
    // Testa conexão com o banco
    static async testConnection() {
        try {
            // Tenta ler um documento qualquer para testar a conexão
            const q = query(collection(db, 'users'), limit(1))
            await getDocs(q)
            return true
        } catch (error) {
            console.error('Erro na conexão:', error)
            return false
        }
    }

    // Inicializa dados de teste (apenas desenvolvimento)
    static async initTestData() {
        console.warn('Iniciando dados de teste - apenas para desenvolvimento!')
    }
}

// =====================================
// SERVIÇO DE DADOS DO JOGO (GAME DATA)
// =====================================

export class GameDataService {
    // Busca todos os itens de uma tabela de dados do jogo
    static async getAll(tableName) {
        try {
            const q = query(collection(db, tableName))
            const snapshot = await getDocs(q)
            const items = []

            snapshot.forEach(docSnap => {
                items.push({ id: docSnap.id, ...docSnap.data() })
            })

            return items
        } catch (error) {
            console.error(`Erro ao buscar ${tableName}:`, error)
            return []
        }
    }

    // Conta itens de uma tabela
    static async getCount(tableName) {
        try {
            const q = query(collection(db, tableName))
            const snapshot = await getCountFromServer(q)
            return snapshot.data().count
        } catch (error) {
            console.error(`Erro ao contar ${tableName}:`, error)
            return 0
        }
    }

    // Adiciona item a uma tabela
    static async addItem(tableName, data) {
        try {
            const docRef = await addDoc(collection(db, tableName), {
                ...data,
                created_at: new Date().toISOString()
            })
            return { id: docRef.id, ...data }
        } catch (error) {
            console.error(`Erro ao adicionar em ${tableName}:`, error)
            throw error
        }
    }

    // Remove item de uma tabela
    static async deleteItem(tableName, itemId) {
        try {
            await deleteDoc(doc(db, tableName, itemId))
            return true
        } catch (error) {
            console.error(`Erro ao deletar de ${tableName}:`, error)
            throw error
        }
    }
}

// Export do db e auth para uso direto se necessário
export { db, auth }