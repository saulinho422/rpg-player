// =====================================
// TESTE DE CONEXÃO COM SUPABASE
// =====================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm'

const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
    console.log('🔍 Testando conexão com Supabase...')
    
    try {
        // Testa conexão básica
        const { data, error } = await supabase.from('profiles').select('count')
        
        if (error) {
            console.error('❌ Erro na conexão:', error)
            return false
        }
        
        console.log('✅ Conexão estabelecida com sucesso!')
        console.log('📊 Dados retornados:', data)
        
        // Testa se as tabelas existem
        const tables = ['profiles', 'characters', 'campaigns', 'campaign_players', 'sessions', 'activity_log']
        
        for (const table of tables) {
            try {
                const { error: tableError } = await supabase.from(table).select('*').limit(1)
                if (tableError) {
                    console.warn(`⚠️ Tabela ${table} pode não existir ou ter problemas:`, tableError.message)
                } else {
                    console.log(`✅ Tabela ${table} acessível`)
                }
            } catch (err) {
                console.warn(`⚠️ Erro ao testar tabela ${table}:`, err.message)
            }
        }
        
        return true
    } catch (error) {
        console.error('❌ Erro geral na conexão:', error)
        return false
    }
}

// Executa o teste automaticamente
testConnection().then(success => {
    if (success) {
        console.log('🎉 Sistema pronto para uso!')
    } else {
        console.log('💡 Certifique-se de que o schema.sql foi executado no Supabase')
    }
})

// Expõe a função globalmente para teste manual
window.testSupabaseConnection = testConnection