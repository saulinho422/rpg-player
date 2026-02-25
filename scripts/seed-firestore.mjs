// =====================================
// SEED: POPULAR FIRESTORE COM DADOS D&D 5E
// =====================================
// Execução: node scripts/seed-firestore.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDdJLB9LOgzSLjq8XL4h9b8C8S0Lj-0fQE",
    authDomain: "player-7a871.firebaseapp.com",
    projectId: "player-7a871",
    storageBucket: "player-7a871.firebasestorage.app",
    messagingSenderId: "654737462105",
    appId: "1:654737462105:web:e33d19e0f54e2c2f8a5d86"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================================
// DADOS DO JOGO
// =====================================

const CLASSES = [
    { id: 'barbarian', name: 'Barbarian', name_pt: 'Bárbaro', hit_die: 'd12', description: 'Um guerreiro feroz que usa fúria e instintos primitivos para destruir inimigos.', spellcaster: false, skills_available: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'], skills_choose: 2 },
    { id: 'bard', name: 'Bard', name_pt: 'Bardo', hit_die: 'd8', description: 'Um artista inspirador cujas palavras e música invocam magia.', spellcaster: true, skills_available: ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'], skills_choose: 3 },
    { id: 'cleric', name: 'Cleric', name_pt: 'Clérigo', hit_die: 'd8', description: 'Um campeão sacerdotal que canaliza o poder divino.', spellcaster: true, skills_available: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'], skills_choose: 2 },
    { id: 'druid', name: 'Druid', name_pt: 'Druida', hit_die: 'd8', description: 'Um sacerdote da antiga fé, comandando os poderes da natureza.', spellcaster: true, skills_available: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'], skills_choose: 2 },
    { id: 'fighter', name: 'Fighter', name_pt: 'Guerreiro', hit_die: 'd10', description: 'Um mestre do combate marcial, treinado com armas e armaduras.', spellcaster: false, skills_available: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'], skills_choose: 2 },
    { id: 'monk', name: 'Monk', name_pt: 'Monge', hit_die: 'd8', description: 'Um mestre das artes marciais que canaliza energia do corpo.', spellcaster: false, skills_available: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'], skills_choose: 2 },
    { id: 'paladin', name: 'Paladin', name_pt: 'Paladino', hit_die: 'd10', description: 'Um guerreiro santo, vinculado por um juramento sagrado.', spellcaster: true, skills_available: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'], skills_choose: 2 },
    { id: 'ranger', name: 'Ranger', name_pt: 'Ranger', hit_die: 'd10', description: 'Um guerreiro que combate ameaças nas bordas da civilização.', spellcaster: true, skills_available: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'], skills_choose: 3 },
    { id: 'rogue', name: 'Rogue', name_pt: 'Ladino', hit_die: 'd8', description: 'Um trapaceiro que usa furtividade e astúcia.', spellcaster: false, skills_available: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'], skills_choose: 4 },
    { id: 'sorcerer', name: 'Sorcerer', name_pt: 'Feiticeiro', hit_die: 'd6', description: 'Um conjurador que possui magia inata por dons de sangue.', spellcaster: true, skills_available: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'], skills_choose: 2 },
    { id: 'warlock', name: 'Warlock', name_pt: 'Bruxo', hit_die: 'd8', description: 'Um praticante de magia derivada de um pacto com entidade extraplanar.', spellcaster: true, skills_available: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'], skills_choose: 2 },
    { id: 'wizard', name: 'Wizard', name_pt: 'Mago', hit_die: 'd6', description: 'Um estudioso de artes arcanas que domina magia pelo estudo.', spellcaster: true, skills_available: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'], skills_choose: 2 }
];

const RACES = [
    { id: 'human', name: 'Human', name_pt: 'Humano', description: 'Os mais adaptáveis e ambiciosos dos povos comuns.', ability_score_increase: '+1 em todos os atributos', speed: 30, size: 'Medium', traits: ['Extra Language'], languages: ['Common', 'One extra'] },
    { id: 'elf', name: 'Elf', name_pt: 'Elfo', description: 'Seres mágicos de graça sobrenatural, habitantes de florestas primordiais.', ability_score_increase: '+2 Destreza', speed: 30, size: 'Medium', traits: ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance'], languages: ['Common', 'Elvish'] },
    { id: 'dwarf', name: 'Dwarf', name_pt: 'Anão', description: 'Povo robusto e resistente, mestres em pedra e metal.', ability_score_increase: '+2 Constituição', speed: 25, size: 'Medium', traits: ['Darkvision', 'Dwarven Resilience', 'Stonecunning'], languages: ['Common', 'Dwarvish'] },
    { id: 'halfling', name: 'Halfling', name_pt: 'Halfling', description: 'Pequenos e ágeis, sobrevivem usando furtividade e sorte.', ability_score_increase: '+2 Destreza', speed: 25, size: 'Small', traits: ['Lucky', 'Brave', 'Halfling Nimbleness'], languages: ['Common', 'Halfling'] },
    { id: 'dragonborn', name: 'Dragonborn', name_pt: 'Draconato', description: 'Descendentes orgulhosos de dragões ancestrais.', ability_score_increase: '+2 Força, +1 Carisma', speed: 30, size: 'Medium', traits: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'], languages: ['Common', 'Draconic'] },
    { id: 'gnome', name: 'Gnome', name_pt: 'Gnomo', description: 'Inventores e exploradores cheios de entusiasmo e curiosidade.', ability_score_increase: '+2 Inteligência', speed: 25, size: 'Small', traits: ['Darkvision', 'Gnome Cunning'], languages: ['Common', 'Gnomish'] },
    { id: 'half-elf', name: 'Half-Elf', name_pt: 'Meio-Elfo', description: 'Caminhantes entre dois mundos, combinando traços humanos e élficos.', ability_score_increase: '+2 Carisma, +1 em dois outros', speed: 30, size: 'Medium', traits: ['Darkvision', 'Fey Ancestry', 'Skill Versatility'], languages: ['Common', 'Elvish', 'One extra'] },
    { id: 'half-orc', name: 'Half-Orc', name_pt: 'Meio-Orc', description: 'Guerreiros ferozes com a força e resistência de seus ancestrais orcs.', ability_score_increase: '+2 Força, +1 Constituição', speed: 30, size: 'Medium', traits: ['Darkvision', 'Menacing', 'Relentless Endurance', 'Savage Attacks'], languages: ['Common', 'Orc'] },
    { id: 'tiefling', name: 'Tiefling', name_pt: 'Tiefling', description: 'Descendentes de linhagens infernais, marcados por aparência diabólica.', ability_score_increase: '+2 Carisma, +1 Inteligência', speed: 30, size: 'Medium', traits: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'], languages: ['Common', 'Infernal'] }
];

const BACKGROUNDS = [
    { id: 'acolyte', name: 'Acolyte', name_pt: 'Acólito', description: 'Você passou a vida em serviço de um templo.', skill_proficiencies: ['Insight', 'Religion'], tool_proficiencies: [], language_count: 2 },
    { id: 'charlatan', name: 'Charlatan', name_pt: 'Charlatão', description: 'Você sempre teve um talento para enganar pessoas.', skill_proficiencies: ['Deception', 'Sleight of Hand'], tool_proficiencies: ['Disguise kit', 'Forgery kit'], language_count: 0 },
    { id: 'criminal', name: 'Criminal', name_pt: 'Criminoso', description: 'Você é um criminoso experiente com contatos no submundo.', skill_proficiencies: ['Deception', 'Stealth'], tool_proficiencies: ['Gaming set', 'Thieves\' tools'], language_count: 0 },
    { id: 'entertainer', name: 'Entertainer', name_pt: 'Artista', description: 'Você vive para encantar audiências com performances.', skill_proficiencies: ['Acrobatics', 'Performance'], tool_proficiencies: ['Disguise kit', 'Musical instrument'], language_count: 0 },
    { id: 'folk-hero', name: 'Folk Hero', name_pt: 'Herói do Povo', description: 'Você vem de uma origem humilde mas é destinado a grandes feitos.', skill_proficiencies: ['Animal Handling', 'Survival'], tool_proficiencies: ['Artisan\'s tools', 'Vehicles (land)'], language_count: 0 },
    { id: 'hermit', name: 'Hermit', name_pt: 'Eremita', description: 'Você viveu em isolamento por um longo período.', skill_proficiencies: ['Medicine', 'Religion'], tool_proficiencies: ['Herbalism kit'], language_count: 1 },
    { id: 'noble', name: 'Noble', name_pt: 'Nobre', description: 'Você nasceu em uma família de prestígio e riqueza.', skill_proficiencies: ['History', 'Persuasion'], tool_proficiencies: ['Gaming set'], language_count: 1 },
    { id: 'outlander', name: 'Outlander', name_pt: 'Forasteiro', description: 'Você cresceu nas terras selvagens, longe da civilização.', skill_proficiencies: ['Athletics', 'Survival'], tool_proficiencies: ['Musical instrument'], language_count: 1 },
    { id: 'sage', name: 'Sage', name_pt: 'Sábio', description: 'Você dedicou anos ao estudo do conhecimento do mundo.', skill_proficiencies: ['Arcana', 'History'], tool_proficiencies: [], language_count: 2 },
    { id: 'soldier', name: 'Soldier', name_pt: 'Soldado', description: 'Você serviu nas forças militares.', skill_proficiencies: ['Athletics', 'Intimidation'], tool_proficiencies: ['Gaming set', 'Vehicles (land)'], language_count: 0 }
];

const LANGUAGES = [
    { code: 'common', name: 'Common', name_pt: 'Comum', category: 'Standard', typical_speakers: ['Humans'], script: 'Common', description: 'Língua franca de quase todos os povos.' },
    { code: 'dwarvish', name: 'Dwarvish', name_pt: 'Anão', category: 'Standard', typical_speakers: ['Dwarves'], script: 'Dwarvish', description: 'Língua dos anões.' },
    { code: 'elvish', name: 'Elvish', name_pt: 'Élfico', category: 'Standard', typical_speakers: ['Elves'], script: 'Elvish', description: 'Língua dos elfos.' },
    { code: 'giant', name: 'Giant', name_pt: 'Gigante', category: 'Standard', typical_speakers: ['Ogres', 'Giants'], script: 'Dwarvish', description: 'Língua dos gigantes.' },
    { code: 'gnomish', name: 'Gnomish', name_pt: 'Gnômico', category: 'Standard', typical_speakers: ['Gnomes'], script: 'Dwarvish', description: 'Língua dos gnomos.' },
    { code: 'goblin', name: 'Goblin', name_pt: 'Goblin', category: 'Standard', typical_speakers: ['Goblinoids'], script: 'Dwarvish', description: 'Língua dos goblins.' },
    { code: 'halfling', name: 'Halfling', name_pt: 'Halfling', category: 'Standard', typical_speakers: ['Halflings'], script: 'Common', description: 'Língua dos halflings.' },
    { code: 'orc', name: 'Orc', name_pt: 'Orc', category: 'Standard', typical_speakers: ['Orcs'], script: 'Dwarvish', description: 'Língua dos orcs.' },
    { code: 'abyssal', name: 'Abyssal', name_pt: 'Abissal', category: 'Exotic', typical_speakers: ['Demons'], script: 'Infernal', description: 'Língua dos demônios.' },
    { code: 'celestial', name: 'Celestial', name_pt: 'Celestial', category: 'Exotic', typical_speakers: ['Celestials'], script: 'Celestial', description: 'Língua dos celestiais.' },
    { code: 'draconic', name: 'Draconic', name_pt: 'Dracônico', category: 'Exotic', typical_speakers: ['Dragons', 'Dragonborn'], script: 'Draconic', description: 'Língua dos dragões.' },
    { code: 'infernal', name: 'Infernal', name_pt: 'Infernal', category: 'Exotic', typical_speakers: ['Devils'], script: 'Infernal', description: 'Língua dos diabos.' }
];

const WEAPONS = [
    { id: 'club', name: 'Club', category: 'Simple Melee', cost: 0.1, damage: '1d4', damage_type: 'bludgeoning', weight: 2, properties: ['Light'] },
    { id: 'dagger', name: 'Dagger', category: 'Simple Melee', cost: 2, damage: '1d4', damage_type: 'piercing', weight: 1, properties: ['Finesse', 'Light', 'Thrown (20/60)'] },
    { id: 'greatclub', name: 'Greatclub', category: 'Simple Melee', cost: 0.2, damage: '1d8', damage_type: 'bludgeoning', weight: 10, properties: ['Two-handed'] },
    { id: 'handaxe', name: 'Handaxe', category: 'Simple Melee', cost: 5, damage: '1d6', damage_type: 'slashing', weight: 2, properties: ['Light', 'Thrown (20/60)'] },
    { id: 'javelin', name: 'Javelin', category: 'Simple Melee', cost: 0.5, damage: '1d6', damage_type: 'piercing', weight: 2, properties: ['Thrown (30/120)'] },
    { id: 'mace', name: 'Mace', category: 'Simple Melee', cost: 5, damage: '1d6', damage_type: 'bludgeoning', weight: 4, properties: [] },
    { id: 'quarterstaff', name: 'Quarterstaff', category: 'Simple Melee', cost: 0.2, damage: '1d6', damage_type: 'bludgeoning', weight: 4, properties: ['Versatile (1d8)'] },
    { id: 'shortsword', name: 'Shortsword', category: 'Martial Melee', cost: 10, damage: '1d6', damage_type: 'piercing', weight: 2, properties: ['Finesse', 'Light'] },
    { id: 'longsword', name: 'Longsword', category: 'Martial Melee', cost: 15, damage: '1d8', damage_type: 'slashing', weight: 3, properties: ['Versatile (1d10)'] },
    { id: 'greatsword', name: 'Greatsword', category: 'Martial Melee', cost: 50, damage: '2d6', damage_type: 'slashing', weight: 6, properties: ['Heavy', 'Two-handed'] },
    { id: 'battleaxe', name: 'Battleaxe', category: 'Martial Melee', cost: 10, damage: '1d8', damage_type: 'slashing', weight: 4, properties: ['Versatile (1d10)'] },
    { id: 'rapier', name: 'Rapier', category: 'Martial Melee', cost: 25, damage: '1d8', damage_type: 'piercing', weight: 2, properties: ['Finesse'] },
    { id: 'shortbow', name: 'Shortbow', category: 'Simple Ranged', cost: 25, damage: '1d6', damage_type: 'piercing', weight: 2, properties: ['Ammunition (80/320)', 'Two-handed'] },
    { id: 'longbow', name: 'Longbow', category: 'Martial Ranged', cost: 50, damage: '1d8', damage_type: 'piercing', weight: 2, properties: ['Ammunition (150/600)', 'Heavy', 'Two-handed'] },
    { id: 'light-crossbow', name: 'Light Crossbow', category: 'Simple Ranged', cost: 25, damage: '1d8', damage_type: 'piercing', weight: 5, properties: ['Ammunition (80/320)', 'Loading', 'Two-handed'] }
];

const ARMOR = [
    { id: 'padded', name: 'Padded Armor', category: 'Light', armor_class: 11, dex_modifier: 'full', cost: 5, weight: 8, strength_requirement: 0, stealth_disadvantage: true },
    { id: 'leather', name: 'Leather Armor', category: 'Light', armor_class: 11, dex_modifier: 'full', cost: 10, weight: 10, strength_requirement: 0, stealth_disadvantage: false },
    { id: 'studded-leather', name: 'Studded Leather', category: 'Light', armor_class: 12, dex_modifier: 'full', cost: 45, weight: 13, strength_requirement: 0, stealth_disadvantage: false },
    { id: 'chain-shirt', name: 'Chain Shirt', category: 'Medium', armor_class: 13, dex_modifier: 'max2', cost: 50, weight: 20, strength_requirement: 0, stealth_disadvantage: false },
    { id: 'scale-mail', name: 'Scale Mail', category: 'Medium', armor_class: 14, dex_modifier: 'max2', cost: 50, weight: 45, strength_requirement: 0, stealth_disadvantage: true },
    { id: 'breastplate', name: 'Breastplate', category: 'Medium', armor_class: 14, dex_modifier: 'max2', cost: 400, weight: 20, strength_requirement: 0, stealth_disadvantage: false },
    { id: 'half-plate', name: 'Half Plate', category: 'Medium', armor_class: 15, dex_modifier: 'max2', cost: 750, weight: 40, strength_requirement: 0, stealth_disadvantage: true },
    { id: 'chain-mail', name: 'Chain Mail', category: 'Heavy', armor_class: 16, dex_modifier: 'none', cost: 75, weight: 55, strength_requirement: 13, stealth_disadvantage: true },
    { id: 'plate', name: 'Plate Armor', category: 'Heavy', armor_class: 18, dex_modifier: 'none', cost: 1500, weight: 65, strength_requirement: 15, stealth_disadvantage: true },
    { id: 'shield', name: 'Shield', category: 'Shield', armor_class: 2, dex_modifier: null, cost: 10, weight: 6, strength_requirement: 0, stealth_disadvantage: false }
];

const EQUIPMENT = [
    { id: 'backpack', name: 'Backpack', category: 'Container', cost: 2, weight: 5, description: 'Mochila de couro para carregar equipamentos.' },
    { id: 'bedroll', name: 'Bedroll', category: 'Camping', cost: 1, weight: 7, description: 'Saco de dormir portátil.' },
    { id: 'rope-50', name: 'Rope (50 ft)', category: 'Adventuring', cost: 1, weight: 10, description: '50 pés de corda de cânhamo.' },
    { id: 'torch', name: 'Torch', category: 'Light', cost: 0.01, weight: 1, description: 'Tocha que ilumina por 1 hora.' },
    { id: 'rations', name: 'Rations (1 day)', category: 'Food', cost: 0.5, weight: 2, description: 'Rações secas para um dia.' },
    { id: 'waterskin', name: 'Waterskin', category: 'Container', cost: 0.2, weight: 5, description: 'Cantil de água.' },
    { id: 'healers-kit', name: "Healer's Kit", category: 'Medical', cost: 5, weight: 3, description: 'Kit com bandagens e pomadas para primeiros socorros (10 usos).' },
    { id: 'thieves-tools', name: "Thieves' Tools", category: 'Tools', cost: 25, weight: 1, description: 'Ferramentas para abrir fechaduras e desarmar armadilhas.' },
    { id: 'holy-symbol', name: 'Holy Symbol', category: 'Focus', cost: 5, weight: 0, description: 'Símbolo sagrado para conjurar magias divinas.' },
    { id: 'component-pouch', name: 'Component Pouch', category: 'Focus', cost: 25, weight: 2, description: 'Bolsa com componentes mágicos diversos.' }
];

const FEATS = [
    { id: 'alert', name: 'Alert', prerequisites: null, description: 'Sempre alerta para o perigo. +5 iniciativa, não pode ser surpreendido.' },
    { id: 'athlete', name: 'Athlete', prerequisites: null, description: 'Treinamento atlético intenso. +1 FOR ou DES, levanta-se usando 5 pés de movimento.' },
    { id: 'great-weapon-master', name: 'Great Weapon Master', prerequisites: null, description: 'Ataques críticos ou que reduzam HP a 0 concedem ataque bônus. Pode -5 ataque/+10 dano.' },
    { id: 'lucky', name: 'Lucky', prerequisites: null, description: 'Você tem 3 pontos de sorte por descanso longo. Pode rolar d20 adicional.' },
    { id: 'sentinel', name: 'Sentinel', prerequisites: null, description: 'Mestre em defender aliados. Criaturas atingidas por ataque de oportunidade ficam com velocidade 0.' },
    { id: 'sharpshooter', name: 'Sharpshooter', prerequisites: null, description: 'Domina ataques à distância. Sem desvantagem em longa distância, ignora cobertura parcial.' },
    { id: 'tough', name: 'Tough', prerequisites: null, description: 'Seu máximo de HP aumenta em 2 por nível.' },
    { id: 'war-caster', name: 'War Caster', prerequisites: 'Capacidade de conjurar pelo menos uma magia', description: 'Vantagem em testes de concentração, pode conjurar como ataque de oportunidade.' }
];

// =====================================
// EXECUÇÃO DO SEED
// =====================================

async function seedCollection(collectionName, items, idField = 'id') {
    console.log(`\n📥 Populando: ${collectionName} (${items.length} itens)...`);
    let count = 0;

    for (const item of items) {
        try {
            const docId = String(item[idField]);
            const { [idField]: _, ...docData } = item;
            docData.created_at = new Date().toISOString();

            await setDoc(doc(db, collectionName, docId), docData);
            count++;
        } catch (error) {
            console.error(`   ❌ Erro em ${item[idField]}:`, error.message);
        }
    }

    console.log(`   ✅ ${count}/${items.length} inseridos`);
    return count;
}

async function runSeed() {
    console.log('🌱 === SEED: POPULANDO FIRESTORE COM DADOS D&D 5E ===');
    console.log(`📅 ${new Date().toLocaleString('pt-BR')}\n`);

    const results = {};

    results.classes = await seedCollection('classes', CLASSES);
    results.races = await seedCollection('races', RACES);
    results.backgrounds = await seedCollection('game_backgrounds', BACKGROUNDS);
    results.languages = await seedCollection('languages', LANGUAGES, 'code');
    results.weapons = await seedCollection('game_weapons', WEAPONS);
    results.armor = await seedCollection('game_armor', ARMOR);
    results.equipment = await seedCollection('game_equipment', EQUIPMENT);
    results.feats = await seedCollection('game_feats', FEATS);

    // RESUMO
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMO DO SEED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    let total = 0;
    for (const [table, count] of Object.entries(results)) {
        console.log(`   ✅ ${table}: ${count} itens`);
        total += count;
    }

    console.log(`\n   🎯 Total: ${total} itens inseridos no Firestore`);
    console.log('\n✅ === SEED CONCLUÍDO ===\n');

    // Encerrar o processo
    process.exit(0);
}

runSeed().catch(error => {
    console.error('❌ ERRO FATAL:', error);
    process.exit(1);
});
