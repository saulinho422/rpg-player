// =====================================
// SCRIPT DE MIGRAÇÃO: SUPABASE → FIRESTORE
// =====================================
// Execução: node scripts/migrate-to-firestore.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';

// Firebase config (mesmo do projeto)
const firebaseConfig = {
    apiKey: "AIzaSyDdJLB9LOgzSLjq8XL4h9b8C8S0Lj-0fQE",
    authDomain: "player-7a871.firebaseapp.com",
    projectId: "player-7a871",
    storageBucket: "player-7a871.firebasestorage.app",
    messagingSenderId: "654737462105",
    appId: "1:654737462105:web:e33d19e0f54e2c2f8a5d86",
    measurementId: "G-F66FNT6XVP"
};

// Supabase REST API config
const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM';

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================================
// FUNÇÕES DE MIGRAÇÃO
// =====================================

// Busca dados do Supabase via REST
async function fetchFromSupabase(table, selectFields = '*') {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${selectFields}`;
    const response = await fetch(url, {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return await response.json();
}

// Migra uma tabela inteira para uma coleção Firestore
async function migrateTable(supabaseTable, firestoreCollection, options = {}) {
    const { idField = 'id', transform = null } = options;

    console.log(`\n📥 Migrando: ${supabaseTable} → ${firestoreCollection}...`);

    try {
        const data = await fetchFromSupabase(supabaseTable);
        console.log(`   📊 ${data.length} registros encontrados`);

        if (data.length === 0) {
            console.log(`   ⚠️ Nenhum dado para migrar`);
            return 0;
        }

        let migrated = 0;
        for (const item of data) {
            try {
                // Transforma dados se necessário
                const transformedItem = transform ? transform(item) : item;

                // Usa o ID do Supabase como ID do documento no Firestore
                const docId = String(transformedItem[idField] || transformedItem.id);

                // Remove o campo id do objeto (será o ID do doc)
                const { [idField]: _, ...docData } = transformedItem;

                await setDoc(doc(db, firestoreCollection, docId), docData);
                migrated++;
            } catch (itemError) {
                console.error(`   ❌ Erro ao migrar item:`, item[idField], itemError.message);
            }
        }

        console.log(`   ✅ ${migrated}/${data.length} registros migrados`);
        return migrated;
    } catch (error) {
        console.error(`   ❌ Erro ao migrar ${supabaseTable}:`, error.message);
        return 0;
    }
}

// =====================================
// MIGRAÇÃO PRINCIPAL
// =====================================

async function runMigration() {
    console.log('🚀 === MIGRAÇÃO SUPABASE → FIRESTORE ===');
    console.log(`📅 ${new Date().toLocaleString('pt-BR')}\n`);

    const results = {};

    // 1. DADOS DO JOGO (tabelas estáticas)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 FASE 1: Dados do Jogo (estáticos)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Classes (id é string como "barbarian")
    results.classes = await migrateTable('classes', 'classes');

    // Raças
    results.races = await migrateTable('races', 'races');

    // Backgrounds
    results.backgrounds = await migrateTable('game_backgrounds', 'game_backgrounds');

    // Idiomas
    results.languages = await migrateTable('languages', 'languages', {
        idField: 'code'
    });

    // Armas
    results.weapons = await migrateTable('game_weapons', 'game_weapons');

    // Armaduras
    results.armor = await migrateTable('game_armor', 'game_armor');

    // Equipamentos
    results.equipment = await migrateTable('game_equipment', 'game_equipment');

    // Talentos (Feats)
    results.feats = await migrateTable('game_feats', 'game_feats');

    // 2. DADOS DOS USUÁRIOS
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 FASE 2: Perfis dos Usuários');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    results.users = await migrateTable('profiles', 'users');

    // 3. PERSONAGENS
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚔️ FASE 3: Personagens');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    results.characters = await migrateTable('characters', 'characters');

    // 4. CAMPANHAS
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎲 FASE 4: Campanhas');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    results.campaigns = await migrateTable('campaigns', 'campaigns');

    // 5. FEATURES DE PERSONAGEM
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ FASE 5: Features de Personagem');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    results.character_features = await migrateTable('character_features', 'character_features');

    // RESUMO FINAL
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO DA MIGRAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let totalMigrated = 0;
    for (const [table, count] of Object.entries(results)) {
        const status = count > 0 ? '✅' : '⚠️';
        console.log(`   ${status} ${table}: ${count} registros`);
        totalMigrated += count;
    }

    console.log(`\n   🎯 Total: ${totalMigrated} registros migrados`);
    console.log('\n✅ === MIGRAÇÃO CONCLUÍDA ===\n');
}

// Executa
runMigration().catch(error => {
    console.error('❌ ERRO FATAL:', error);
    process.exit(1);
});
