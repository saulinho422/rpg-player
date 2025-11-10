// =====================================
// RPG PLAYER - SERVIÇOS DE BANCO DE DADOS
// Integração com Supabase
// =====================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm'

// Configuração do Supabase
const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

// Singleton - evita multiple instances
let supabaseInstance = null;
function getSupabaseClient() {
    if (!supabaseInstance) {
        supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                storageKey: 'rpg-player-auth',
                storage: window.localStorage
            }
        });
    }
    return supabaseInstance;
}

const supabase = getSupabaseClient();

// =====================================
// FUNÇÃO PARA OBTER CLIENTE AUTENTICADO
// =====================================
async function getAuthenticatedSupabaseClient() {
    // Pega a sessão atual
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
        console.log('✅ Sessão encontrada:', session.user.id)
        return supabase
    }
    
    // Se não há sessão, tenta verificar localStorage
    const userId = localStorage.getItem('currentUserId')
    if (userId) {
        console.log('⚠️ Usando localStorage userId:', userId)
        return supabase
    }
    
    throw new Error('Usuário não autenticado')
}

// =====================================
// SERVIÇOS DE USUÁRIO/PERFIL
// =====================================

export class UserService {
    // Busca perfil do usuário
    static async getProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = não encontrado
                throw error
            }
            
            return data
        } catch (error) {
            console.error('Erro ao buscar perfil:', error)
            return null
        }
    }
    
    // Cria ou atualiza perfil do usuário
    static async saveProfile(userId, profileData) {
        try {
            console.log('💾 Salvando perfil no Supabase...')
            console.log('🔑 UserId:', userId)
            console.log('📋 ProfileData:', profileData)
            
            // Verifica se há sessão ativa
            const { data: { session } } = await supabase.auth.getSession()
            console.log('🔐 Sessão atual:', session ? session.user.id : 'Nenhuma sessão')
            
            const dataToSave = {
                id: userId,
                ...profileData,
                updated_at: new Date().toISOString()
            }
            
            console.log('📦 Dados finais para salvar:', dataToSave)
            
            // CORREÇÃO: NUNCA USAR UPSERT - Pode substituir dados existentes!
            
            // 1. Primeiro verifica se o perfil já existe
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, display_name, email')
                .eq('id', userId)
                .single()
            
            let data, error
            
            if (existingProfile) {
                console.log('⚠️ Perfil já existe:', existingProfile)
                // Se já existe, apenas atualiza campos específicos
                const result = await supabase
                    .from('profiles')
                    .update({
                        ...profileData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId)
                    .select()
                    .single()
                
                data = result.data
                error = result.error
            } else {
                console.log('✅ Criando novo perfil...')
                // Usa INSERT direto (mais seguro com RLS)
                const result = await supabase
                    .from('profiles')
                    .insert(dataToSave)
                    .select()
                    .single()
                
                data = result.data
                error = result.error
            }
            
            if (error) {
                console.error('❌ Erro do Supabase:', error)
                console.error('❌ Código do erro:', error.code)
                console.error('❌ Detalhes:', error.details)
                console.error('❌ Mensagem:', error.message)
                throw error
            }
            
            console.log('✅ Dados salvos com sucesso:', data)
            
            // Log da atividade
            await ActivityService.logActivity(userId, {
                activity_type: 'profile_updated',
                title: 'Perfil atualizado',
                description: 'O usuário atualizou suas informações de perfil'
            })
            
            return data
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
            const { error } = await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userId)
            
            if (error) throw error
        } catch (error) {
            console.error('Erro ao atualizar último login:', error)
        }
    }
    
    // Busca estatísticas do usuário
    static async getUserStats(userId) {
        try {
            // Busca perfil
            const profile = await this.getProfile(userId)
            if (!profile) return null
            
            // Busca contadores reais
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
        const { count, error } = await supabase
            .from('characters')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)
        
        return error ? 0 : count
    }
    
    static async getCampaignsCount(userId) {
        const { count, error } = await supabase
            .from('campaign_players')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'active')
        
        return error ? 0 : count
    }
    
    static async getSessionsCount(userId) {
        const { count, error } = await supabase
            .from('sessions')
            .select(`
                *,
                campaigns!inner(campaign_players!inner(*))
            `, { count: 'exact', head: true })
            .eq('campaigns.campaign_players.user_id', userId)
            .eq('status', 'completed')
        
        return error ? 0 : count
    }
}

// =====================================
// SERVIÇOS DE PERSONAGENS
// =====================================

export class CharacterService {
    // Lista personagens do usuário
    static async getUserCharacters(userId) {
        try {
            console.log('🔍 Buscando personagens para userId:', userId);
            
            const { data, error } = await supabase
                .from('characters')
                .select(`
                    id, name, race, character_class, background, alignment, level,
                    strength, dexterity, constitution, intelligence, wisdom, charisma,
                    hit_points_max, hit_points_current, armor_class, speed, proficiency_bonus,
                    saving_throws, skills, equipment, avatar_url, is_draft, draft_step,
                    created_at, updated_at, user_id
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
            
            if (error) {
                console.error('❌ Erro na query de personagens:', error);
                throw error;
            }
            
            console.log('� Personagens encontrados:', data?.length || 0);
            
            return data || []
        } catch (error) {
            console.error('❌ Erro ao buscar personagens:', error)
            return []
        }
    }
    
    // Busca personagem específico
    static async getCharacter(characterId, userId) {
        try {
            const { data, error } = await supabase
                .from('characters')
                .select('*')
                .eq('id', characterId)
                .eq('user_id', userId)
                .single()
            
            if (error) throw error
            
            return data
        } catch (error) {
            console.error('Erro ao buscar personagem:', error)
            return null
        }
    }
    
    // Cria novo personagem
    static async createCharacter(userId, characterData) {
        try {
            const { data, error } = await supabase
                .from('characters')
                .insert({
                    user_id: userId,
                    ...characterData
                })
                .select()
                .single()
            
            if (error) throw error
            
            // Log da atividade
            await ActivityService.logActivity(userId, {
                activity_type: 'character_created',
                title: 'Novo personagem criado',
                description: `Personagem "${characterData.name}" foi criado`,
                character_id: data.id
            })
            
            return data
        } catch (error) {
            console.error('Erro ao criar personagem:', error)
            throw error
        }
    }
    
    // Atualiza personagem
    static async updateCharacter(characterId, userId, updateData) {
        try {
            const { data, error } = await supabase
                .from('characters')
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', characterId)
                .eq('user_id', userId)
                .select()
                .single()
            
            if (error) throw error
            
            return data
        } catch (error) {
            console.error('Erro ao atualizar personagem:', error)
            throw error
        }
    }
    
    // Remove personagem (soft delete)
    static async deleteCharacter(characterId, userId) {
        try {
            const { error } = await supabase
                .from('characters')
                .update({ is_active: false })
                .eq('id', characterId)
                .eq('user_id', userId)
            
            if (error) throw error
            
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
    static async getPublicCampaigns(limit = 20, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select(`
                    *,
                    profiles:dm_user_id (display_name, avatar_url),
                    campaign_players (status, user_id)
                `)
                .eq('is_public', true)
                .in('status', ['recruiting', 'active'])
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)
            
            if (error) throw error
            
            return data || []
        } catch (error) {
            console.error('Erro ao buscar campanhas públicas:', error)
            return []
        }
    }
    
    // Lista campanhas do usuário
    static async getUserCampaigns(userId) {
        try {
            const { data, error } = await supabase
                .from('campaign_players')
                .select(`
                    *,
                    campaigns (
                        *,
                        profiles:dm_user_id (display_name, avatar_url)
                    )
                `)
                .eq('user_id', userId)
                .in('status', ['approved', 'active'])
                .order('created_at', { ascending: false })
            
            if (error) throw error
            
            return data?.map(cp => ({
                ...cp.campaigns,
                player_status: cp.status,
                joined_at: cp.joined_at
            })) || []
        } catch (error) {
            console.error('Erro ao buscar campanhas do usuário:', error)
            return []
        }
    }
    
    // Cria nova campanha
    static async createCampaign(userId, campaignData) {
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .insert({
                    dm_user_id: userId,
                    ...campaignData
                })
                .select()
                .single()
            
            if (error) throw error
            
            // Log da atividade
            await ActivityService.logActivity(userId, {
                activity_type: 'campaign_created',
                title: 'Nova campanha criada',
                description: `Campanha "${campaignData.name}" foi criada`,
                campaign_id: data.id
            })
            
            return data
        } catch (error) {
            console.error('Erro ao criar campanha:', error)
            throw error
        }
    }
    
    // Solicita participação em campanha
    static async joinCampaign(campaignId, userId, message = '') {
        try {
            const { data, error } = await supabase
                .from('campaign_players')
                .insert({
                    campaign_id: campaignId,
                    user_id: userId,
                    status: 'pending',
                    application_message: message
                })
                .select()
                .single()
            
            if (error) throw error
            
            return data
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
            const { error } = await supabase
                .from('activity_log')
                .insert({
                    user_id: userId,
                    ...activityData,
                    created_at: new Date().toISOString()
                })
            
            if (error) throw error
        } catch (error) {
            console.error('Erro ao registrar atividade:', error)
        }
    }
    
    // Busca atividades do usuário
    static async getUserActivities(userId, limit = 10) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit)
            
            if (error) throw error
            
            return data || []
        } catch (error) {
            console.error('Erro ao buscar atividades:', error)
            return []
        }
    }
    
    // Busca atividades públicas recentes
    static async getPublicActivities(limit = 20) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select(`
                    *,
                    profiles (display_name, avatar_url)
                `)
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(limit)
            
            if (error) throw error
            
            return data || []
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
            const { data, error } = await supabase
                .from('profiles')
                .select('count', { count: 'exact', head: true })
            
            if (error) throw error
            
            return true
        } catch (error) {
            console.error('Erro na conexão:', error)
            return false
        }
    }
    
    // Inicializa dados de teste (apenas desenvolvimento)
    static async initTestData() {
        console.warn('Iniciando dados de teste - apenas para desenvolvimento!')
        
        // Esta função seria usada apenas em desenvolvimento
        // para popular o banco com dados de exemplo
    }
}

// Export do cliente Supabase para uso direto se necessário
export { supabase }