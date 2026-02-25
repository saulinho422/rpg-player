// =====================================
// TESTE DE CONEXÃO COM FIREBASE
// =====================================

import { db } from './firebase-config.js'
import { collection, getDocs, limit, query } from 'firebase/firestore'

async function testConnection() {
    console.log('🔍 Testando conexão com Firebase...')

    try {
        // Teste básico de conectividade
        const q = query(collection(db, 'users'), limit(1))
        const snapshot = await getDocs(q)

        console.log('✅ Conexão com Firebase OK!')
        console.log('📊 Documentos na coleção users:', snapshot.size)

        // Testa cada coleção
        const tables = [
            'users', 'characters', 'campaigns', 'activityLog',
            'classes', 'races', 'game_backgrounds', 'languages',
            'game_weapons', 'game_armor', 'game_equipment', 'game_feats'
        ]

        console.log('\n📋 Verificando coleções:')
        for (const table of tables) {
            try {
                const tableQuery = query(collection(db, table), limit(1))
                const tableSnap = await getDocs(tableQuery)
                console.log(`  ✅ ${table}: acessível (${tableSnap.size} docs retornados)`)
            } catch (tableError) {
                console.log(`  ❌ ${table}: ${tableError.message}`)
            }
        }

    } catch (error) {
        console.error('❌ Erro ao conectar:', error)
        console.log('💡 Verifique as configurações do Firebase no firebase-config.js')
    }
}

window.testFirebaseConnection = testConnection