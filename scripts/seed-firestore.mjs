// =====================================
// SEED: POPULAR FIRESTORE COM DADOS D&D 5E (PT-BR)
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
// DADOS DO JOGO (TUDO EM PT-BR)
// =====================================

const CLASSES = [
    {
        id: 'barbarian', name: 'Barbarian', name_pt: 'Bárbaro', hit_die: 'd12',
        description: 'Um guerreiro feroz que usa fúria e instintos primitivos para destruir inimigos.',
        spellcaster: false,
        skills_available: JSON.stringify(['Adestrar Animais', 'Atletismo', 'Intimidação', 'Natureza', 'Percepção', 'Sobrevivência']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['FOR', 'CON']),
        starting_wealth: '2d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) um machado grande ou (b) qualquer arma marcial corpo a corpo',
            '(a) dois machados de mão ou (b) qualquer arma simples',
            'Um kit de aventureiro e quatro azagaias'
        ])
    },
    {
        id: 'bard', name: 'Bard', name_pt: 'Bardo', hit_die: 'd8',
        description: 'Um artista inspirador cujas palavras e música invocam magia.',
        spellcaster: true,
        skills_available: JSON.stringify(['Acrobacia', 'Adestrar Animais', 'Arcana', 'Atletismo', 'Enganação', 'História', 'Intuição', 'Intimidação', 'Investigação', 'Medicina', 'Natureza', 'Percepção', 'Atuação', 'Persuasão', 'Religião', 'Prestidigitação', 'Furtividade', 'Sobrevivência']),
        skills_choose: 3,
        saving_throws: JSON.stringify(['DES', 'CAR']),
        starting_wealth: '5d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) uma rapieira ou (b) uma espada longa ou (c) qualquer arma simples',
            '(a) um kit de diplomata ou (b) um kit de artista',
            '(a) um alaúde ou (b) qualquer outro instrumento musical',
            'Armadura de couro e uma adaga'
        ])
    },
    {
        id: 'cleric', name: 'Cleric', name_pt: 'Clérigo', hit_die: 'd8',
        description: 'Um campeão sacerdotal que canaliza o poder divino.',
        spellcaster: true,
        skills_available: JSON.stringify(['História', 'Intuição', 'Medicina', 'Persuasão', 'Religião']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['SAB', 'CAR']),
        starting_wealth: '5d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) uma maça ou (b) um martelo de guerra (se proficiente)',
            '(a) brunea ou (b) armadura de couro ou (c) cota de malha (se proficiente)',
            '(a) uma besta leve e 20 virotes ou (b) qualquer arma simples',
            '(a) um kit de sacerdote ou (b) um kit de aventureiro',
            'Um escudo e um símbolo sagrado'
        ])
    },
    {
        id: 'druid', name: 'Druid', name_pt: 'Druida', hit_die: 'd8',
        description: 'Um sacerdote da antiga fé, comandando os poderes da natureza.',
        spellcaster: true,
        skills_available: JSON.stringify(['Arcana', 'Adestrar Animais', 'Intuição', 'Medicina', 'Natureza', 'Percepção', 'Religião', 'Sobrevivência']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['INT', 'SAB']),
        starting_wealth: '2d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) um escudo de madeira ou (b) qualquer arma simples',
            '(a) uma cimitarra ou (b) qualquer arma simples corpo a corpo',
            'Armadura de couro, kit de aventureiro e foco druídico'
        ])
    },
    {
        id: 'fighter', name: 'Fighter', name_pt: 'Guerreiro', hit_die: 'd10',
        description: 'Um mestre do combate marcial, treinado com armas e armaduras.',
        spellcaster: false,
        skills_available: JSON.stringify(['Acrobacia', 'Adestrar Animais', 'Atletismo', 'História', 'Intuição', 'Intimidação', 'Percepção', 'Sobrevivência']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['FOR', 'CON']),
        starting_wealth: '5d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) cota de malha ou (b) armadura de couro, arco longo e 20 flechas',
            '(a) uma arma marcial e um escudo ou (b) duas armas marciais',
            '(a) uma besta leve e 20 virotes ou (b) dois machados de arremesso',
            '(a) um kit de aventureiro ou (b) um kit de explorador'
        ])
    },
    {
        id: 'monk', name: 'Monk', name_pt: 'Monge', hit_die: 'd8',
        description: 'Um mestre das artes marciais que canaliza energia do corpo.',
        spellcaster: false,
        skills_available: JSON.stringify(['Acrobacia', 'Atletismo', 'História', 'Intuição', 'Religião', 'Furtividade']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['FOR', 'DES']),
        starting_wealth: '5d4 po',
        equipment_options: JSON.stringify([
            '(a) uma espada curta ou (b) qualquer arma simples',
            '(a) um kit de aventureiro ou (b) um kit de explorador',
            '10 dardos'
        ])
    },
    {
        id: 'paladin', name: 'Paladin', name_pt: 'Paladino', hit_die: 'd10',
        description: 'Um guerreiro santo, vinculado por um juramento sagrado.',
        spellcaster: true,
        skills_available: JSON.stringify(['Atletismo', 'Intuição', 'Intimidação', 'Medicina', 'Persuasão', 'Religião']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['SAB', 'CAR']),
        starting_wealth: '5d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) uma arma marcial e um escudo ou (b) duas armas marciais',
            '(a) cinco azagaias ou (b) qualquer arma simples corpo a corpo',
            '(a) um kit de sacerdote ou (b) um kit de aventureiro',
            'Cota de malha e um símbolo sagrado'
        ])
    },
    {
        id: 'ranger', name: 'Ranger', name_pt: 'Ranger', hit_die: 'd10',
        description: 'Um guerreiro que combate ameaças nas bordas da civilização.',
        spellcaster: true,
        skills_available: JSON.stringify(['Adestrar Animais', 'Atletismo', 'Intuição', 'Investigação', 'Natureza', 'Percepção', 'Furtividade', 'Sobrevivência']),
        skills_choose: 3,
        saving_throws: JSON.stringify(['FOR', 'DES']),
        starting_wealth: '5d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) brunea ou (b) armadura de couro',
            '(a) duas espadas curtas ou (b) duas armas simples corpo a corpo',
            '(a) um kit de aventureiro ou (b) um kit de explorador',
            'Um arco longo e uma aljava com 20 flechas'
        ])
    },
    {
        id: 'rogue', name: 'Rogue', name_pt: 'Ladino', hit_die: 'd8',
        description: 'Um trapaceiro que usa furtividade e astúcia.',
        spellcaster: false,
        skills_available: JSON.stringify(['Acrobacia', 'Atletismo', 'Enganação', 'Intuição', 'Intimidação', 'Investigação', 'Percepção', 'Atuação', 'Persuasão', 'Prestidigitação', 'Furtividade']),
        skills_choose: 4,
        saving_throws: JSON.stringify(['DES', 'INT']),
        starting_wealth: '4d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) uma rapieira ou (b) uma espada curta',
            '(a) um arco curto e aljava com 20 flechas ou (b) uma espada curta',
            '(a) um kit de assaltante ou (b) um kit de aventureiro ou (c) um kit de explorador',
            'Armadura de couro, duas adagas e ferramentas de ladrão'
        ])
    },
    {
        id: 'sorcerer', name: 'Sorcerer', name_pt: 'Feiticeiro', hit_die: 'd6',
        description: 'Um conjurador que possui magia inata por dons de sangue.',
        spellcaster: true,
        skills_available: JSON.stringify(['Arcana', 'Enganação', 'Intuição', 'Intimidação', 'Persuasão', 'Religião']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['CON', 'CAR']),
        starting_wealth: '3d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) uma besta leve e 20 virotes ou (b) qualquer arma simples',
            '(a) uma bolsa de componentes ou (b) um foco arcano',
            '(a) um kit de aventureiro ou (b) um kit de explorador',
            'Duas adagas'
        ])
    },
    {
        id: 'warlock', name: 'Warlock', name_pt: 'Bruxo', hit_die: 'd8',
        description: 'Um praticante de magia derivada de um pacto com entidade extraplanar.',
        spellcaster: true,
        skills_available: JSON.stringify(['Arcana', 'Enganação', 'História', 'Intimidação', 'Investigação', 'Natureza', 'Religião']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['SAB', 'CAR']),
        starting_wealth: '4d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) uma besta leve e 20 virotes ou (b) qualquer arma simples',
            '(a) uma bolsa de componentes ou (b) um foco arcano',
            '(a) um kit de estudioso ou (b) um kit de aventureiro',
            'Armadura de couro, qualquer arma simples e duas adagas'
        ])
    },
    {
        id: 'wizard', name: 'Wizard', name_pt: 'Mago', hit_die: 'd6',
        description: 'Um estudioso de artes arcanas que domina magia pelo estudo.',
        spellcaster: true,
        skills_available: JSON.stringify(['Arcana', 'História', 'Intuição', 'Investigação', 'Medicina', 'Religião']),
        skills_choose: 2,
        saving_throws: JSON.stringify(['INT', 'SAB']),
        starting_wealth: '4d4 x 10 po',
        equipment_options: JSON.stringify([
            '(a) um bordão ou (b) uma adaga',
            '(a) uma bolsa de componentes ou (b) um foco arcano',
            '(a) um kit de estudioso ou (b) um kit de aventureiro',
            'Um grimório'
        ])
    }
];

const RACES = [
    { id: 'human', name: 'Human', name_pt: 'Humano', description: 'Os mais adaptáveis e ambiciosos dos povos comuns.', ability_score_increase: '+1 em todos os atributos', speed: 30, size: 'Médio', traits: JSON.stringify(['Idioma Extra']), languages: JSON.stringify(['Comum', 'Um extra']) },
    { id: 'elf', name: 'Elf', name_pt: 'Elfo', description: 'Seres mágicos de graça sobrenatural, habitantes de florestas primordiais.', ability_score_increase: '+2 Destreza', speed: 30, size: 'Médio', traits: JSON.stringify(['Visão no Escuro', 'Sentidos Aguçados', 'Ancestralidade Feérica', 'Transe']), languages: JSON.stringify(['Comum', 'Élfico']) },
    { id: 'dwarf', name: 'Dwarf', name_pt: 'Anão', description: 'Povo robusto e resistente, mestres em pedra e metal.', ability_score_increase: '+2 Constituição', speed: 25, size: 'Médio', traits: JSON.stringify(['Visão no Escuro', 'Resiliência Anã', 'Astúcia em Pedra']), languages: JSON.stringify(['Comum', 'Anão']) },
    { id: 'halfling', name: 'Halfling', name_pt: 'Halfling', description: 'Pequenos e ágeis, sobrevivem usando furtividade e sorte.', ability_score_increase: '+2 Destreza', speed: 25, size: 'Pequeno', traits: JSON.stringify(['Sortudo', 'Corajoso', 'Agilidade Halfling']), languages: JSON.stringify(['Comum', 'Halfling']) },
    { id: 'dragonborn', name: 'Dragonborn', name_pt: 'Draconato', description: 'Descendentes orgulhosos de dragões ancestrais.', ability_score_increase: '+2 Força, +1 Carisma', speed: 30, size: 'Médio', traits: JSON.stringify(['Ancestralidade Dracônica', 'Sopro Dracônico', 'Resistência a Dano']), languages: JSON.stringify(['Comum', 'Dracônico']) },
    { id: 'gnome', name: 'Gnome', name_pt: 'Gnomo', description: 'Inventores e exploradores cheios de entusiasmo e curiosidade.', ability_score_increase: '+2 Inteligência', speed: 25, size: 'Pequeno', traits: JSON.stringify(['Visão no Escuro', 'Astúcia Gnômica']), languages: JSON.stringify(['Comum', 'Gnômico']) },
    { id: 'half-elf', name: 'Half-Elf', name_pt: 'Meio-Elfo', description: 'Caminhantes entre dois mundos, combinando traços humanos e élficos.', ability_score_increase: '+2 Carisma, +1 em dois outros', speed: 30, size: 'Médio', traits: JSON.stringify(['Visão no Escuro', 'Ancestralidade Feérica', 'Versatilidade em Perícias']), languages: JSON.stringify(['Comum', 'Élfico', 'Um extra']) },
    { id: 'half-orc', name: 'Half-Orc', name_pt: 'Meio-Orc', description: 'Guerreiros ferozes com a força e resistência de seus ancestrais orcs.', ability_score_increase: '+2 Força, +1 Constituição', speed: 30, size: 'Médio', traits: JSON.stringify(['Visão no Escuro', 'Ameaçador', 'Resistência Implacável', 'Ataques Selvagens']), languages: JSON.stringify(['Comum', 'Orc']) },
    { id: 'tiefling', name: 'Tiefling', name_pt: 'Tiefling', description: 'Descendentes de linhagens infernais, marcados por aparência diabólica.', ability_score_increase: '+2 Carisma, +1 Inteligência', speed: 30, size: 'Médio', traits: JSON.stringify(['Visão no Escuro', 'Resistência Infernal', 'Legado Infernal']), languages: JSON.stringify(['Comum', 'Infernal']) }
];

const BACKGROUNDS = [
    { id: 'acolyte', nome: 'Acólito', name: 'Acolyte', name_pt: 'Acólito', descricao: 'Você passou a vida em serviço de um templo, mediando entre os reinos dos santos e o mundo mortal.', description: 'Você passou a vida em serviço de um templo.', skill_proficiencies: JSON.stringify(['Intuição', 'Religião']), tool_proficiencies: JSON.stringify([]), language_count: 2, equipamento: JSON.stringify(['Símbolo sagrado', 'Livro de orações', '5 varetas de incenso', 'Vestimentas', 'Conjunto de roupas comuns', '15 po']) },
    { id: 'charlatan', nome: 'Charlatão', name: 'Charlatan', name_pt: 'Charlatão', descricao: 'Você sempre teve um talento para enganar pessoas e se safar de situações complicadas.', description: 'Você sempre teve um talento para enganar pessoas.', skill_proficiencies: JSON.stringify(['Enganação', 'Prestidigitação']), tool_proficiencies: JSON.stringify(['Kit de disfarce', 'Kit de falsificação']), language_count: 0, equipamento: JSON.stringify(['Conjunto de roupas finas', 'Kit de disfarce', 'Ferramentas de trapaça', '15 po']) },
    { id: 'criminal', nome: 'Criminoso', name: 'Criminal', name_pt: 'Criminoso', descricao: 'Você é um criminoso experiente com contatos no submundo e um histórico de infrações.', description: 'Você é um criminoso experiente com contatos no submundo.', skill_proficiencies: JSON.stringify(['Enganação', 'Furtividade']), tool_proficiencies: JSON.stringify(['Kit de jogo', 'Ferramentas de ladrão']), language_count: 0, equipamento: JSON.stringify(['Pé de cabra', 'Conjunto de roupas escuras com capuz', '15 po']) },
    { id: 'entertainer', nome: 'Artista', name: 'Entertainer', name_pt: 'Artista', descricao: 'Você vive para encantar audiências com performances incríveis e brilhantes.', description: 'Você vive para encantar audiências com performances.', skill_proficiencies: JSON.stringify(['Acrobacia', 'Atuação']), tool_proficiencies: JSON.stringify(['Kit de disfarce', 'Instrumento musical']), language_count: 0, equipamento: JSON.stringify(['Instrumento musical', 'Presente de um admirador', 'Fantasia', '15 po']) },
    { id: 'folk-hero', nome: 'Herói do Povo', name: 'Folk Hero', name_pt: 'Herói do Povo', descricao: 'Você vem de uma origem humilde mas é destinado a grandes feitos heroicos.', description: 'Você vem de uma origem humilde mas é destinado a grandes feitos.', skill_proficiencies: JSON.stringify(['Adestrar Animais', 'Sobrevivência']), tool_proficiencies: JSON.stringify(['Ferramentas de artesão', 'Veículos (terrestres)']), language_count: 0, equipamento: JSON.stringify(['Ferramentas de artesão', 'Pá', 'Panela de ferro', 'Conjunto de roupas comuns', '10 po']) },
    { id: 'hermit', nome: 'Eremita', name: 'Hermit', name_pt: 'Eremita', descricao: 'Você viveu em isolamento por um longo período, buscando iluminação espiritual.', description: 'Você viveu em isolamento por um longo período.', skill_proficiencies: JSON.stringify(['Medicina', 'Religião']), tool_proficiencies: JSON.stringify(['Kit de herbalismo']), language_count: 1, equipamento: JSON.stringify(['Estojo rolado cheio de anotações', 'Cobertor de inverno', 'Conjunto de roupas comuns', 'Kit de herbalismo', '5 po']) },
    { id: 'noble', nome: 'Nobre', name: 'Noble', name_pt: 'Nobre', descricao: 'Você nasceu em uma família de prestígio, riqueza e poder político.', description: 'Você nasceu em uma família de prestígio e riqueza.', skill_proficiencies: JSON.stringify(['História', 'Persuasão']), tool_proficiencies: JSON.stringify(['Kit de jogo']), language_count: 1, equipamento: JSON.stringify(['Conjunto de roupas finas', 'Anel de sinete', 'Pergaminho de linhagem', '25 po']) },
    { id: 'outlander', nome: 'Forasteiro', name: 'Outlander', name_pt: 'Forasteiro', descricao: 'Você cresceu nas terras selvagens, longe da civilização e seus confortos.', description: 'Você cresceu nas terras selvagens, longe da civilização.', skill_proficiencies: JSON.stringify(['Atletismo', 'Sobrevivência']), tool_proficiencies: JSON.stringify(['Instrumento musical']), language_count: 1, equipamento: JSON.stringify(['Bordão', 'Armadilha de caça', 'Troféu de animal', 'Conjunto de roupas de viajante', '10 po']) },
    { id: 'sage', nome: 'Sábio', name: 'Sage', name_pt: 'Sábio', descricao: 'Você dedicou anos ao estudo do conhecimento do mundo, mergulhando em livros e pergaminhos.', description: 'Você dedicou anos ao estudo do conhecimento do mundo.', skill_proficiencies: JSON.stringify(['Arcana', 'História']), tool_proficiencies: JSON.stringify([]), language_count: 2, equipamento: JSON.stringify(['Tinteiro', 'Pena', 'Faca pequena', 'Carta de um colega falecido', 'Conjunto de roupas comuns', '10 po']) },
    { id: 'soldier', nome: 'Soldado', name: 'Soldier', name_pt: 'Soldado', descricao: 'Você serviu nas forças militares, treinado para o combate e a disciplina.', description: 'Você serviu nas forças militares.', skill_proficiencies: JSON.stringify(['Atletismo', 'Intimidação']), tool_proficiencies: JSON.stringify(['Kit de jogo', 'Veículos (terrestres)']), language_count: 0, equipamento: JSON.stringify(['Insígnia de patente', 'Troféu de inimigo derrotado', 'Kit de jogo', 'Conjunto de roupas comuns', '10 po']) }
];

const LANGUAGES = [
    { code: 'common', name: 'Common', name_pt: 'Comum', category: 'Padrão', typical_speakers: ['Humanos'], script: 'Comum', description: 'Língua franca de quase todos os povos.' },
    { code: 'dwarvish', name: 'Dwarvish', name_pt: 'Anão', category: 'Padrão', typical_speakers: ['Anões'], script: 'Anão', description: 'Língua dos anões, gravada em runas.' },
    { code: 'elvish', name: 'Elvish', name_pt: 'Élfico', category: 'Padrão', typical_speakers: ['Elfos'], script: 'Élfico', description: 'Língua fluida e melódica dos elfos.' },
    { code: 'giant', name: 'Giant', name_pt: 'Gigante', category: 'Padrão', typical_speakers: ['Ogros', 'Gigantes'], script: 'Anão', description: 'Língua dos gigantes e ogros.' },
    { code: 'gnomish', name: 'Gnomish', name_pt: 'Gnômico', category: 'Padrão', typical_speakers: ['Gnomos'], script: 'Anão', description: 'Língua dos gnomos.' },
    { code: 'goblin', name: 'Goblin', name_pt: 'Goblin', category: 'Padrão', typical_speakers: ['Goblinoides'], script: 'Anão', description: 'Língua dos goblins.' },
    { code: 'halfling', name: 'Halfling', name_pt: 'Halfling', category: 'Padrão', typical_speakers: ['Halflings'], script: 'Comum', description: 'Língua dos halflings.' },
    { code: 'orc', name: 'Orc', name_pt: 'Orc', category: 'Padrão', typical_speakers: ['Orcs'], script: 'Anão', description: 'Língua dos orcs.' },
    { code: 'abyssal', name: 'Abyssal', name_pt: 'Abissal', category: 'Exótico', typical_speakers: ['Demônios'], script: 'Infernal', description: 'Língua dos demônios do Abismo.' },
    { code: 'celestial', name: 'Celestial', name_pt: 'Celestial', category: 'Exótico', typical_speakers: ['Celestiais'], script: 'Celestial', description: 'Língua dos seres celestiais.' },
    { code: 'draconic', name: 'Draconic', name_pt: 'Dracônico', category: 'Exótico', typical_speakers: ['Dragões', 'Draconatos'], script: 'Dracônico', description: 'Língua antiga dos dragões.' },
    { code: 'infernal', name: 'Infernal', name_pt: 'Infernal', category: 'Exótico', typical_speakers: ['Diabos'], script: 'Infernal', description: 'Língua dos diabos dos Nove Infernos.' }
];

// =====================================
// ARMAS (com custo no formato {quantidade, moeda})
// =====================================

const WEAPONS = [
    { id: 'club', nome: 'Clava', name: 'Club', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 1, moeda: 'pp' }), dano: '1d4', tipo_dano: 'concussão', peso: 1, propriedades: JSON.stringify(['Leve']) },
    { id: 'dagger', nome: 'Adaga', name: 'Dagger', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 2, moeda: 'po' }), dano: '1d4', tipo_dano: 'perfurante', peso: 0.5, propriedades: JSON.stringify(['Acuidade', 'Leve', 'Arremesso (6/18)']) },
    { id: 'greatclub', nome: 'Bordão', name: 'Greatclub', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 2, moeda: 'pp' }), dano: '1d8', tipo_dano: 'concussão', peso: 5, propriedades: JSON.stringify(['Duas mãos']) },
    { id: 'handaxe', nome: 'Machadinha', name: 'Handaxe', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 5, moeda: 'po' }), dano: '1d6', tipo_dano: 'cortante', peso: 1, propriedades: JSON.stringify(['Leve', 'Arremesso (6/18)']) },
    { id: 'javelin', nome: 'Azagaia', name: 'Javelin', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 5, moeda: 'pp' }), dano: '1d6', tipo_dano: 'perfurante', peso: 1, propriedades: JSON.stringify(['Arremesso (9/36)']) },
    { id: 'light-hammer', nome: 'Martelo Leve', name: 'Light Hammer', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 2, moeda: 'po' }), dano: '1d4', tipo_dano: 'concussão', peso: 1, propriedades: JSON.stringify(['Leve', 'Arremesso (6/18)']) },
    { id: 'mace', nome: 'Maça', name: 'Mace', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 5, moeda: 'po' }), dano: '1d6', tipo_dano: 'concussão', peso: 2, propriedades: JSON.stringify([]) },
    { id: 'quarterstaff', nome: 'Bordão', name: 'Quarterstaff', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 2, moeda: 'pp' }), dano: '1d6', tipo_dano: 'concussão', peso: 2, propriedades: JSON.stringify(['Versátil (1d8)']) },
    { id: 'sickle', nome: 'Foice', name: 'Sickle', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 1, moeda: 'po' }), dano: '1d4', tipo_dano: 'cortante', peso: 1, propriedades: JSON.stringify(['Leve']) },
    { id: 'spear', nome: 'Lança', name: 'Spear', categoria: 'Arma Simples Corpo a Corpo', custo: JSON.stringify({ quantidade: 1, moeda: 'po' }), dano: '1d6', tipo_dano: 'perfurante', peso: 1.5, propriedades: JSON.stringify(['Arremesso (6/18)', 'Versátil (1d8)']) },
    { id: 'light-crossbow', nome: 'Besta Leve', name: 'Light Crossbow', categoria: 'Arma Simples à Distância', custo: JSON.stringify({ quantidade: 25, moeda: 'po' }), dano: '1d8', tipo_dano: 'perfurante', peso: 2.5, propriedades: JSON.stringify(['Munição (24/96)', 'Recarga', 'Duas mãos']) },
    { id: 'dart', nome: 'Dardo', name: 'Dart', categoria: 'Arma Simples à Distância', custo: JSON.stringify({ quantidade: 5, moeda: 'pc' }), dano: '1d4', tipo_dano: 'perfurante', peso: 0.1, propriedades: JSON.stringify(['Acuidade', 'Arremesso (6/18)']) },
    { id: 'shortbow', nome: 'Arco Curto', name: 'Shortbow', categoria: 'Arma Simples à Distância', custo: JSON.stringify({ quantidade: 25, moeda: 'po' }), dano: '1d6', tipo_dano: 'perfurante', peso: 1, propriedades: JSON.stringify(['Munição (24/96)', 'Duas mãos']) },
    { id: 'sling', nome: 'Funda', name: 'Sling', categoria: 'Arma Simples à Distância', custo: JSON.stringify({ quantidade: 1, moeda: 'pp' }), dano: '1d4', tipo_dano: 'concussão', peso: 0, propriedades: JSON.stringify(['Munição (9/36)']) },
    // Armas Marciais
    { id: 'battleaxe', nome: 'Machado de Batalha', name: 'Battleaxe', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 10, moeda: 'po' }), dano: '1d8', tipo_dano: 'cortante', peso: 2, propriedades: JSON.stringify(['Versátil (1d10)']) },
    { id: 'flail', nome: 'Mangual', name: 'Flail', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 10, moeda: 'po' }), dano: '1d8', tipo_dano: 'concussão', peso: 1, propriedades: JSON.stringify([]) },
    { id: 'glaive', nome: 'Glaive', name: 'Glaive', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 20, moeda: 'po' }), dano: '1d10', tipo_dano: 'cortante', peso: 3, propriedades: JSON.stringify(['Pesada', 'Alcance', 'Duas mãos']) },
    { id: 'greataxe', nome: 'Machado Grande', name: 'Greataxe', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 30, moeda: 'po' }), dano: '1d12', tipo_dano: 'cortante', peso: 3.5, propriedades: JSON.stringify(['Pesada', 'Duas mãos']) },
    { id: 'greatsword', nome: 'Montante', name: 'Greatsword', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 50, moeda: 'po' }), dano: '2d6', tipo_dano: 'cortante', peso: 3, propriedades: JSON.stringify(['Pesada', 'Duas mãos']) },
    { id: 'halberd', nome: 'Alabarda', name: 'Halberd', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 20, moeda: 'po' }), dano: '1d10', tipo_dano: 'cortante', peso: 3, propriedades: JSON.stringify(['Pesada', 'Alcance', 'Duas mãos']) },
    { id: 'longsword', nome: 'Espada Longa', name: 'Longsword', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 15, moeda: 'po' }), dano: '1d8', tipo_dano: 'cortante', peso: 1.5, propriedades: JSON.stringify(['Versátil (1d10)']) },
    { id: 'morningstar', nome: 'Estrela da Manhã', name: 'Morningstar', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 15, moeda: 'po' }), dano: '1d8', tipo_dano: 'perfurante', peso: 2, propriedades: JSON.stringify([]) },
    { id: 'rapier', nome: 'Rapieira', name: 'Rapier', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 25, moeda: 'po' }), dano: '1d8', tipo_dano: 'perfurante', peso: 1, propriedades: JSON.stringify(['Acuidade']) },
    { id: 'scimitar', nome: 'Cimitarra', name: 'Scimitar', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 25, moeda: 'po' }), dano: '1d6', tipo_dano: 'cortante', peso: 1.5, propriedades: JSON.stringify(['Acuidade', 'Leve']) },
    { id: 'shortsword', nome: 'Espada Curta', name: 'Shortsword', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 10, moeda: 'po' }), dano: '1d6', tipo_dano: 'perfurante', peso: 1, propriedades: JSON.stringify(['Acuidade', 'Leve']) },
    { id: 'warhammer', nome: 'Martelo de Guerra', name: 'Warhammer', categoria: 'Arma Marcial Corpo a Corpo', custo: JSON.stringify({ quantidade: 15, moeda: 'po' }), dano: '1d8', tipo_dano: 'concussão', peso: 1, propriedades: JSON.stringify(['Versátil (1d10)']) },
    { id: 'longbow', nome: 'Arco Longo', name: 'Longbow', categoria: 'Arma Marcial à Distância', custo: JSON.stringify({ quantidade: 50, moeda: 'po' }), dano: '1d8', tipo_dano: 'perfurante', peso: 1, propriedades: JSON.stringify(['Munição (45/180)', 'Pesada', 'Duas mãos']) },
    { id: 'hand-crossbow', nome: 'Besta de Mão', name: 'Hand Crossbow', categoria: 'Arma Marcial à Distância', custo: JSON.stringify({ quantidade: 75, moeda: 'po' }), dano: '1d6', tipo_dano: 'perfurante', peso: 1.5, propriedades: JSON.stringify(['Munição (9/36)', 'Leve', 'Recarga']) },
    { id: 'heavy-crossbow', nome: 'Besta Pesada', name: 'Heavy Crossbow', categoria: 'Arma Marcial à Distância', custo: JSON.stringify({ quantidade: 50, moeda: 'po' }), dano: '1d10', tipo_dano: 'perfurante', peso: 9, propriedades: JSON.stringify(['Munição (30/120)', 'Pesada', 'Recarga', 'Duas mãos']) }
];

// =====================================
// ARMADURAS
// =====================================

const ARMOR = [
    { id: 'padded', nome: 'Armadura Acolchoada', name: 'Padded Armor', categoria: 'Leve', ca: '11 + mod. DES', custo: JSON.stringify({ quantidade: 5, moeda: 'po' }), peso: 4, requisito_forca: 0, desvantagem_furtividade: true },
    { id: 'leather', nome: 'Armadura de Couro', name: 'Leather Armor', categoria: 'Leve', ca: '11 + mod. DES', custo: JSON.stringify({ quantidade: 10, moeda: 'po' }), peso: 5, requisito_forca: 0, desvantagem_furtividade: false },
    { id: 'studded-leather', nome: 'Couro Batido', name: 'Studded Leather', categoria: 'Leve', ca: '12 + mod. DES', custo: JSON.stringify({ quantidade: 45, moeda: 'po' }), peso: 6.5, requisito_forca: 0, desvantagem_furtividade: false },
    { id: 'hide', nome: 'Gibão de Peles', name: 'Hide Armor', categoria: 'Média', ca: '12 + mod. DES (máx 2)', custo: JSON.stringify({ quantidade: 10, moeda: 'po' }), peso: 6, requisito_forca: 0, desvantagem_furtividade: false },
    { id: 'chain-shirt', nome: 'Camisão de Malha', name: 'Chain Shirt', categoria: 'Média', ca: '13 + mod. DES (máx 2)', custo: JSON.stringify({ quantidade: 50, moeda: 'po' }), peso: 10, requisito_forca: 0, desvantagem_furtividade: false },
    { id: 'scale-mail', nome: 'Brunea', name: 'Scale Mail', categoria: 'Média', ca: '14 + mod. DES (máx 2)', custo: JSON.stringify({ quantidade: 50, moeda: 'po' }), peso: 22.5, requisito_forca: 0, desvantagem_furtividade: true },
    { id: 'breastplate', nome: 'Peitoral', name: 'Breastplate', categoria: 'Média', ca: '14 + mod. DES (máx 2)', custo: JSON.stringify({ quantidade: 400, moeda: 'po' }), peso: 10, requisito_forca: 0, desvantagem_furtividade: false },
    { id: 'half-plate', nome: 'Meia Armadura', name: 'Half Plate', categoria: 'Média', ca: '15 + mod. DES (máx 2)', custo: JSON.stringify({ quantidade: 750, moeda: 'po' }), peso: 20, requisito_forca: 0, desvantagem_furtividade: true },
    { id: 'ring-mail', nome: 'Cota de Anéis', name: 'Ring Mail', categoria: 'Pesada', ca: '14', custo: JSON.stringify({ quantidade: 30, moeda: 'po' }), peso: 20, requisito_forca: 0, desvantagem_furtividade: true },
    { id: 'chain-mail', nome: 'Cota de Malha', name: 'Chain Mail', categoria: 'Pesada', ca: '16', custo: JSON.stringify({ quantidade: 75, moeda: 'po' }), peso: 27.5, requisito_forca: 13, desvantagem_furtividade: true },
    { id: 'splint', nome: 'Armadura de Talas', name: 'Splint Armor', categoria: 'Pesada', ca: '17', custo: JSON.stringify({ quantidade: 200, moeda: 'po' }), peso: 30, requisito_forca: 15, desvantagem_furtividade: true },
    { id: 'plate', nome: 'Armadura Completa', name: 'Plate Armor', categoria: 'Pesada', ca: '18', custo: JSON.stringify({ quantidade: 1500, moeda: 'po' }), peso: 32.5, requisito_forca: 15, desvantagem_furtividade: true },
    { id: 'shield', nome: 'Escudo', name: 'Shield', categoria: 'Escudo', ca: '+2', custo: JSON.stringify({ quantidade: 10, moeda: 'po' }), peso: 3, requisito_forca: 0, desvantagem_furtividade: false }
];

// =====================================
// EQUIPAMENTOS GERAIS
// =====================================

const EQUIPMENT = [
    { id: 'backpack', nome: 'Mochila', name: 'Backpack', categoria: 'Recipiente', custo: JSON.stringify({ quantidade: 2, moeda: 'po' }), peso: 2.5, descricao: 'Mochila de couro para carregar equipamentos.' },
    { id: 'bedroll', nome: 'Saco de Dormir', name: 'Bedroll', categoria: 'Acampamento', custo: JSON.stringify({ quantidade: 1, moeda: 'po' }), peso: 3.5, descricao: 'Saco de dormir portátil para descanso ao ar livre.' },
    { id: 'rope-50', nome: 'Corda (15m)', name: 'Rope (50 ft)', categoria: 'Aventura', custo: JSON.stringify({ quantidade: 1, moeda: 'po' }), peso: 5, descricao: '15 metros de corda de cânhamo resistente.' },
    { id: 'torch', nome: 'Tocha', name: 'Torch', categoria: 'Iluminação', custo: JSON.stringify({ quantidade: 1, moeda: 'pc' }), peso: 0.5, descricao: 'Tocha que ilumina um raio de 6m por 1 hora.' },
    { id: 'rations', nome: 'Rações (1 dia)', name: 'Rations (1 day)', categoria: 'Comida', custo: JSON.stringify({ quantidade: 5, moeda: 'pp' }), peso: 1, descricao: 'Rações secas e compactas para um dia de viagem.' },
    { id: 'waterskin', nome: 'Cantil', name: 'Waterskin', categoria: 'Recipiente', custo: JSON.stringify({ quantidade: 2, moeda: 'pp' }), peso: 2.5, descricao: 'Cantil de couro para carregar água.' },
    { id: 'healers-kit', nome: 'Kit de Cura', name: "Healer's Kit", categoria: 'Médico', custo: JSON.stringify({ quantidade: 5, moeda: 'po' }), peso: 1.5, descricao: 'Kit com bandagens e pomadas para primeiros socorros (10 usos).' },
    { id: 'thieves-tools', nome: 'Ferramentas de Ladrão', name: "Thieves' Tools", categoria: 'Ferramentas', custo: JSON.stringify({ quantidade: 25, moeda: 'po' }), peso: 0.5, descricao: 'Ferramentas para abrir fechaduras e desarmar armadilhas.' },
    { id: 'holy-symbol', nome: 'Símbolo Sagrado', name: 'Holy Symbol', categoria: 'Foco', custo: JSON.stringify({ quantidade: 5, moeda: 'po' }), peso: 0, descricao: 'Símbolo sagrado para conjurar magias divinas.' },
    { id: 'component-pouch', nome: 'Bolsa de Componentes', name: 'Component Pouch', categoria: 'Foco', custo: JSON.stringify({ quantidade: 25, moeda: 'po' }), peso: 1, descricao: 'Bolsa com componentes mágicos diversos.' },
    { id: 'tinderbox', nome: 'Pederneira', name: 'Tinderbox', categoria: 'Aventura', custo: JSON.stringify({ quantidade: 5, moeda: 'pp' }), peso: 0.5, descricao: 'Kit para acender fogo facilmente.' },
    { id: 'lantern-hooded', nome: 'Lanterna Encapuzada', name: 'Hooded Lantern', categoria: 'Iluminação', custo: JSON.stringify({ quantidade: 5, moeda: 'po' }), peso: 1, descricao: 'Lanterna com capuz que ilumina um cone de 18m por 6 horas.' },
    { id: 'grappling-hook', nome: 'Gancho', name: 'Grappling Hook', categoria: 'Aventura', custo: JSON.stringify({ quantidade: 2, moeda: 'po' }), peso: 2, descricao: 'Gancho de metal para escalar superfícies.' },
    { id: 'piton', nome: 'Pinos de Escalada (10)', name: 'Pitons (10)', categoria: 'Aventura', custo: JSON.stringify({ quantidade: 1, moeda: 'po' }), peso: 1.25, descricao: '10 pinos de ferro para fixar cordas em superfícies de pedra.' },
    { id: 'tent', nome: 'Barraca (2 pessoas)', name: 'Tent (2-person)', categoria: 'Acampamento', custo: JSON.stringify({ quantidade: 2, moeda: 'po' }), peso: 10, descricao: 'Barraca simples de lona para duas pessoas.' },
    { id: 'ink', nome: 'Tinta (frasco)', name: 'Ink (1 oz bottle)', categoria: 'Escrita', custo: JSON.stringify({ quantidade: 10, moeda: 'po' }), peso: 0, descricao: 'Frasco de tinta para escrita e desenho.' },
    { id: 'paper', nome: 'Papel (folha)', name: 'Paper (one sheet)', categoria: 'Escrita', custo: JSON.stringify({ quantidade: 2, moeda: 'pp' }), peso: 0, descricao: 'Folha de papel para escritos e mapas.' },
    { id: 'potion-healing', nome: 'Poção de Cura', name: 'Potion of Healing', categoria: 'Poção', custo: JSON.stringify({ quantidade: 50, moeda: 'po' }), peso: 0.25, descricao: 'Poção que recupera 2d4+2 pontos de vida.' },
    { id: 'arrows-20', nome: 'Flechas (20)', name: 'Arrows (20)', categoria: 'Munição', custo: JSON.stringify({ quantidade: 1, moeda: 'po' }), peso: 0.5, descricao: 'Aljava com 20 flechas para arcos.' },
    { id: 'bolts-20', nome: 'Virotes (20)', name: 'Crossbow Bolts (20)', categoria: 'Munição', custo: JSON.stringify({ quantidade: 1, moeda: 'po' }), peso: 0.75, descricao: 'Caixa com 20 virotes para bestas.' }
];

// =====================================
// TALENTOS
// =====================================

const FEATS = [
    { id: 'alert', nome: 'Alerta', name: 'Alert', prerequisites: null, descricao: 'Sempre alerta para o perigo. +5 iniciativa, não pode ser surpreendido enquanto estiver consciente.' },
    { id: 'athlete', nome: 'Atleta', name: 'Athlete', prerequisites: null, descricao: 'Treinamento atlético intenso. +1 FOR ou DES, levanta-se usando apenas 1,5m de movimento.' },
    { id: 'great-weapon-master', nome: 'Mestre em Armas Grandes', name: 'Great Weapon Master', prerequisites: null, descricao: 'Ataques críticos ou que reduzam HP a 0 concedem ataque bônus. Pode -5 ataque/+10 dano.' },
    { id: 'lucky', nome: 'Sortudo', name: 'Lucky', prerequisites: null, descricao: 'Você tem 3 pontos de sorte por descanso longo. Pode rolar d20 adicional em testes.' },
    { id: 'sentinel', nome: 'Sentinela', name: 'Sentinel', prerequisites: null, descricao: 'Mestre em defender aliados. Criaturas atingidas por seu ataque de oportunidade ficam com velocidade 0.' },
    { id: 'sharpshooter', nome: 'Atirador Preciso', name: 'Sharpshooter', prerequisites: null, descricao: 'Domina ataques à distância. Sem desvantagem em alcance máximo, ignora cobertura parcial. Pode -5 ataque/+10 dano.' },
    { id: 'tough', nome: 'Resistente', name: 'Tough', prerequisites: null, descricao: 'Seu máximo de pontos de vida aumenta em 2 para cada nível que você possuir.' },
    { id: 'war-caster', nome: 'Conjurador de Guerra', name: 'War Caster', prerequisites: 'Capacidade de conjurar pelo menos uma magia', descricao: 'Vantagem em testes de concentração, pode conjurar magias como ataque de oportunidade.' },
    { id: 'resilient', nome: 'Resiliente', name: 'Resilient', prerequisites: null, descricao: '+1 em um atributo de sua escolha. Você ganha proficiência em testes de resistência desse atributo.' },
    { id: 'mobile', nome: 'Mobilidade', name: 'Mobile', prerequisites: null, descricao: 'Sua velocidade aumenta em 3m. Quando ataca uma criatura, pode evitar ataques de oportunidade dela.' },
    { id: 'observant', nome: 'Observador', name: 'Observant', prerequisites: null, descricao: '+1 INT ou SAB. +5 em Percepção passiva e Investigação passiva. Lê lábios.' },
    { id: 'shield-master', nome: 'Mestre em Escudos', name: 'Shield Master', prerequisites: null, descricao: 'Pode usar escudo para empurrar criaturas. Bônus de CA em testes de resistência de DES.' }
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
    console.log('🌱 === SEED: POPULANDO FIRESTORE COM DADOS D&D 5E (PT-BR) ===');
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
