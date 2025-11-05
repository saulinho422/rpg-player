// Supabase Configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm';

const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Character Sheet Manager
class CharacterSheet {
    constructor() {
        this.character = null;
        this.characterId = this.getCharacterIdFromURL();
        this.currentUser = null;
        this.gameData = {};
        this.init();
    }

    getCharacterIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async init() {
        await this.checkAuth();
        await this.loadGameData();
        
        // Se não tem ID, está em modo de criação
        if (!this.characterId) {
            this.initCreationMode();
            return;
        }

        await this.loadCharacter();
        this.populateSheet();
        this.calculateAll();
        this.setupEventListeners();
    }

    async checkAuth() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/login.html';
                return;
            }
            this.currentUser = user;
        } catch (error) {
            console.error('❌ Erro na autenticação:', error);
            window.location.href = '/login.html';
        }
    }

    async loadGameData() {
        try {
            const [racesRes, classesRes, backgroundsRes, alignmentsRes] = await Promise.all([
                fetch('js/data/races.json'),
                fetch('js/data/classes.json'),
                fetch('js/data/backgrounds.json'),
                fetch('js/data/alignments.json')
            ]);

            this.gameData = {
                races: await racesRes.json(),
                classes: await classesRes.json(),
                backgrounds: await backgroundsRes.json(),
                alignments: await alignmentsRes.json()
            };
        } catch (error) {
            console.error('❌ Erro ao carregar dados do jogo:', error);
        }
    }

    async initCreationMode() {
        try {
            // Verificar se existe um rascunho para este usuário
            const draft = await this.loadOrCreateDraft();
            
            if (draft) {
                console.log('📝 Rascunho encontrado, continuando criação:', draft);
                this.character = this.convertDraftToCharacter(draft);
                this.characterId = draft.id;
            } else {
                // Inicializar personagem vazio
                this.character = {
                    name: '',
                    race: null,
                    class: null,
                    background: null,
                    alignment: null,
                    level: 1,
                    attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
                };
            }
            
            // Popular a ficha com dados existentes
            this.populateSheet();
            
            // Setup event listeners
            this.setupEventListeners();
            this.setupCreationListeners();
            
            // Atualizar cálculos
            this.calculateAll();
            
            // Setup auto-save para rascunho
            this.setupAutoSave();
            
        } catch (error) {
            console.error('❌ Erro ao inicializar modo de criação:', error);
            alert('Erro ao inicializar criação de personagem!');
        }
    }

    async loadOrCreateDraft() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            // Buscar rascunho existente
            const { data: drafts, error } = await supabase
                .from('characters')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_draft', true)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            // Se encontrou um rascunho, retorna
            if (drafts && drafts.length > 0) {
                return drafts[0];
            }

            // Se não encontrou, verifica se deve criar um novo
            const params = new URLSearchParams(window.location.search);
            const isNewCharacter = params.get('new') === 'true';
            
            if (isNewCharacter) {
                // Criar novo rascunho
                const newDraft = await this.createNewDraft(user.id);
                return newDraft;
            }

            return null;
        } catch (error) {
            console.error('❌ Erro ao carregar/criar rascunho:', error);
            return null;
        }
    }

    async createNewDraft(userId) {
        try {
            const { data, error } = await supabase
                .from('characters')
                .insert([{
                    user_id: userId,
                    name: '',
                    is_draft: true,
                    draft_step: 'basic_info',
                    level: 1,
                    strength: 10,
                    dexterity: 10,
                    constitution: 10,
                    intelligence: 10,
                    wisdom: 10,
                    charisma: 10,
                    hit_points_max: 8,
                    hit_points_current: 8,
                    armor_class: 10
                }])
                .select()
                .single();

            if (error) throw error;
            
            console.log('✅ Novo rascunho criado:', data);
            return data;
        } catch (error) {
            console.error('❌ Erro ao criar rascunho:', error);
            return null;
        }
    }

    convertDraftToCharacter(draft) {
        console.log('🔄 Convertendo rascunho para personagem:', draft);
        
        const character = {
            id: draft.id,
            name: draft.name || '',
            race: draft.race,
            class: draft.character_class,
            background: draft.background,
            alignment: draft.alignment,
            level: draft.level || 1,
            attributes: {
                str: draft.strength || 10,
                dex: draft.dexterity || 10,
                con: draft.constitution || 10,
                int: draft.intelligence || 10,
                wis: draft.wisdom || 10,
                cha: draft.charisma || 10
            },
            hp: draft.hit_points_max || 8,
            hpCurrent: draft.hit_points_current || 8,
            image: draft.avatar_url
        };
        
        console.log('✅ Personagem convertido:', character);
        return character;
    }

    async loadCharacter() {
        try {
            const { data, error } = await supabase
                .from('characters')
                .select('*')
                .eq('id', this.characterId)
                .eq('user_id', this.currentUser.id)
                .single();

            if (error) throw error;

            this.character = this.convertDraftToCharacter(data);
        } catch (error) {
            console.error('❌ Erro ao carregar personagem:', error);
            alert('Erro ao carregar personagem!');
        }
    }

    populateSheet() {
        if (!this.character) return;

        // Informações básicas
        this.setInputValue('charname', this.character.name);
        this.setInputValue('classlevel', this.character.class ? `${this.character.class} ${this.character.level}` : '');
        this.setInputValue('background', this.character.background);
        this.setInputValue('race', this.character.race);
        this.setInputValue('alignment', this.character.alignment);
        this.setInputValue('experiencepoints', '0');

        // Atributos
        if (this.character.attributes) {
            this.setInputValue('Strengthscore', this.character.attributes.str);
            this.setInputValue('Dexterityscore', this.character.attributes.dex);
            this.setInputValue('Constitutionscore', this.character.attributes.con);
            this.setInputValue('Intelligencescore', this.character.attributes.int);
            this.setInputValue('Wisdomscore', this.character.attributes.wis);
            this.setInputValue('Charismascore', this.character.attributes.cha);
        }

        // HP
        this.setInputValue('maxhp', this.character.hp);
        this.setInputValue('currenthp', this.character.hpCurrent);

        // Hit Dice
        if (this.character.class) {
            const hitDie = this.getHitDieForClass(this.character.class);
            this.setInputValue('totalhd', `${this.character.level}${hitDie}`);
        }
    }

    setInputValue(id, value) {
        const element = document.getElementById(id);
        if (element && value !== undefined && value !== null) {
            element.value = value;
        }
    }

    getHitDieForClass(className) {
        const classDice = {
            'Barbarian': 'd12',
            'Fighter': 'd10',
            'Paladin': 'd10',
            'Ranger': 'd10',
            'Bard': 'd8',
            'Cleric': 'd8',
            'Druid': 'd8',
            'Monk': 'd8',
            'Rogue': 'd8',
            'Warlock': 'd8',
            'Sorcerer': 'd6',
            'Wizard': 'd6'
        };
        return classDice[className] || 'd8';
    }

    calculateAll() {
        this.calculateModifiers();
        this.calculateProficiencyBonus();
        this.calculateSavingThrows();
        this.calculateSkills();
        this.calculatePassivePerception();
        this.calculateCombatStats();
    }

    calculateModifiers() {
        const attributes = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
        
        attributes.forEach(attr => {
            const scoreElement = document.getElementById(`${attr}score`);
            const modElement = document.getElementById(`${attr}mod`);
            
            if (scoreElement && modElement) {
                const score = parseInt(scoreElement.value) || 10;
                const modifier = Math.floor((score - 10) / 2);
                const modString = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                modElement.value = modString;

                // Atualizar no objeto character
                if (this.character && this.character.attributes) {
                    const attrKey = attr.toLowerCase().substring(0, 3);
                    this.character.attributes[attrKey] = score;
                }
            }
        });
    }

    calculateProficiencyBonus() {
        const level = this.character?.level || 1;
        const profBonus = Math.ceil(level / 4) + 1;
        const element = document.getElementById('proficiencybonus');
        if (element) {
            element.value = `+${profBonus}`;
        }
        return profBonus;
    }

    calculateSavingThrows() {
        const attributes = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
        const profBonus = this.calculateProficiencyBonus();
        
        attributes.forEach(attr => {
            const modElement = document.getElementById(`${attr}mod`);
            const saveElement = document.getElementById(`${attr}-save`);
            const profElement = document.getElementById(`${attr}-save-prof`);
            
            if (modElement && saveElement) {
                const modifier = parseInt(modElement.value) || 0;
                const isProficient = profElement?.checked || false;
                const saveBonus = modifier + (isProficient ? profBonus : 0);
                const saveString = saveBonus >= 0 ? `+${saveBonus}` : `${saveBonus}`;
                saveElement.value = saveString;
            }
        });
    }

    calculateSkills() {
        const skills = [
            { name: 'Acrobatics', attr: 'Dexterity' },
            { name: 'Animal Handling', attr: 'Wisdom' },
            { name: 'Arcana', attr: 'Intelligence' },
            { name: 'Athletics', attr: 'Strength' },
            { name: 'Deception', attr: 'Charisma' },
            { name: 'History', attr: 'Intelligence' },
            { name: 'Insight', attr: 'Wisdom' },
            { name: 'Intimidation', attr: 'Charisma' },
            { name: 'Investigation', attr: 'Intelligence' },
            { name: 'Medicine', attr: 'Wisdom' },
            { name: 'Nature', attr: 'Intelligence' },
            { name: 'Perception', attr: 'Wisdom' },
            { name: 'Performance', attr: 'Charisma' },
            { name: 'Persuasion', attr: 'Charisma' },
            { name: 'Religion', attr: 'Intelligence' },
            { name: 'Sleight of Hand', attr: 'Dexterity' },
            { name: 'Stealth', attr: 'Dexterity' },
            { name: 'Survival', attr: 'Wisdom' }
        ];

        const profBonus = this.calculateProficiencyBonus();

        skills.forEach(skill => {
            const skillElement = document.getElementById(skill.name.replace(' ', '_'));
            const profElement = document.getElementById(`${skill.name.replace(' ', '_')}-prof`);
            const modElement = document.getElementById(`${skill.attr}mod`);
            
            if (skillElement && modElement) {
                const modifier = parseInt(modElement.value) || 0;
                const isProficient = profElement?.checked || false;
                const skillBonus = modifier + (isProficient ? profBonus : 0);
                const skillString = skillBonus >= 0 ? `+${skillBonus}` : `${skillBonus}`;
                skillElement.value = skillString;
            }
        });
    }

    calculatePassivePerception() {
        const perceptionElement = document.getElementById('Perception');
        const passiveElement = document.getElementById('passiveperception');
        
        if (perceptionElement && passiveElement) {
            const perceptionBonus = parseInt(perceptionElement.value) || 0;
            const passivePerception = 10 + perceptionBonus;
            passiveElement.value = passivePerception;
        }
    }

    calculateCombatStats() {
        // AC básica (10 + mod Dex)
        const dexModElement = document.getElementById('Dexteritymod');
        const acElement = document.getElementById('ac');
        
        if (dexModElement && acElement) {
            const dexMod = parseInt(dexModElement.value) || 0;
            const baseAC = 10 + dexMod;
            acElement.value = baseAC;
        }

        // Iniciativa (mod Dex)
        const initiativeElement = document.getElementById('initiative');
        if (dexModElement && initiativeElement) {
            const dexMod = parseInt(dexModElement.value) || 0;
            const initiativeString = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
            initiativeElement.value = initiativeString;
        }

        // Velocidade padrão
        const speedElement = document.getElementById('speed');
        if (speedElement && !speedElement.value) {
            speedElement.value = '30';
        }
    }

    setupEventListeners() {
        // Controles do header
        const backBtn = document.getElementById('backBtn');
        const menuBtn = document.getElementById('menuBtn');
        const finishBtn = document.getElementById('finishBtn');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = '/dashboard.html';
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                this.saveCharacter();
            });
        }

        // Sidebar
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const closeSidebar = document.querySelector('.close-sidebar');

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        if (closeSidebar) {
            closeSidebar.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Event listeners para atributos
        const attributes = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
        attributes.forEach(attr => {
            const element = document.getElementById(`${attr}score`);
            if (element) {
                element.addEventListener('input', () => {
                    this.calculateAll();
                });
            }
        });

        // Event listeners para proficiências
        const proficiencyElements = document.querySelectorAll('input[type="checkbox"][id$="-prof"]');
        proficiencyElements.forEach(element => {
            element.addEventListener('change', () => {
                this.calculateAll();
            });
        });
    }

    setupCreationListeners() {
        // Event listeners para campos básicos
        const charNameElement = document.getElementById('charname');
        if (charNameElement) {
            charNameElement.addEventListener('input', (e) => {
                if (this.character) {
                    this.character.name = e.target.value;
                }
            });
        }

        // Fechar modais com X
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Fechar modal ao clicar fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Mostrar botão de salvar se está em modo de criação
        const finishBtn = document.getElementById('finishBtn');
        if (finishBtn) {
            finishBtn.style.display = 'block';
            finishBtn.addEventListener('click', () => this.saveCharacter());
        }

        // Abrir modal de raça automaticamente após 2 segundos se não tiver raça selecionada
        setTimeout(() => {
            if (!this.character.race) {
                this.openRaceModal();
            }
        }, 2000);
    }

    setupAutoSave() {
        // Auto-save a cada 30 segundos
        if (this.characterId) {
            setInterval(() => {
                this.saveDraft();
            }, 30000);
        }
    }

    openRaceModal() {
        const modal = document.getElementById('raceModal');
        const grid = document.getElementById('raceGrid');
        
        if (!modal || !grid) return;
        
        grid.innerHTML = '';
        
        if (!this.gameData.races || this.gameData.races.length === 0) {
            grid.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Nenhuma raça disponível.</p>';
            modal.classList.add('active');
            return;
        }
        
        this.gameData.races.forEach(race => {
            const card = document.createElement('div');
            card.className = 'modal-item';
            if (this.character.race === race.name) card.classList.add('selected');
            
            card.innerHTML = `
                <h3>${race.name}</h3>
                <p>${race.description || ''}</p>
            `;
            
            card.addEventListener('click', () => this.selectRace(race));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    openClassModal() {
        const modal = document.getElementById('classModal');
        const grid = document.getElementById('classGrid');
        
        if (!modal || !grid) return;
        
        grid.innerHTML = '';
        
        if (!this.gameData.classes || this.gameData.classes.length === 0) {
            grid.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Nenhuma classe disponível.</p>';
            modal.classList.add('active');
            return;
        }
        
        this.gameData.classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'modal-item';
            if (this.character.class === cls.name) card.classList.add('selected');
            
            card.innerHTML = `
                <h3>${cls.name}</h3>
                <p>${cls.description || ''}</p>
            `;
            
            card.addEventListener('click', () => this.selectClass(cls));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    openBackgroundModal() {
        const modal = document.getElementById('backgroundModal');
        const grid = document.getElementById('backgroundGrid');
        
        if (!modal || !grid) return;
        
        grid.innerHTML = '';
        
        if (!this.gameData.backgrounds || this.gameData.backgrounds.length === 0) {
            grid.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Nenhum antecedente disponível.</p>';
            modal.classList.add('active');
            return;
        }
        
        this.gameData.backgrounds.forEach(bg => {
            const card = document.createElement('div');
            card.className = 'modal-item';
            if (this.character.background === bg.name) card.classList.add('selected');
            
            card.innerHTML = `
                <h3>${bg.name}</h3>
                <p>${bg.description || ''}</p>
            `;
            
            card.addEventListener('click', () => this.selectBackground(bg));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    openAlignmentModal() {
        const modal = document.getElementById('alignmentModal');
        const grid = document.getElementById('alignmentGrid');
        
        if (!modal || !grid) return;
        
        grid.innerHTML = '';
        
        if (!this.gameData.alignments || this.gameData.alignments.length === 0) {
            grid.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Nenhuma tendência disponível.</p>';
            modal.classList.add('active');
            return;
        }
        
        this.gameData.alignments.forEach(align => {
            const card = document.createElement('div');
            card.className = 'alignment-item';
            if (this.character.alignment === align.name) card.classList.add('selected');
            
            card.innerHTML = `
                <h4>${align.name}</h4>
                <p>${align.description || ''}</p>
            `;
            
            card.addEventListener('click', () => this.selectAlignment(align));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    selectRace(race) {
        this.character.race = race.name;
        document.getElementById('race').value = race.name;
        document.getElementById('raceModal').classList.remove('active');
        this.saveDraft();
        
        // Abrir modal de classe após selecionar raça
        setTimeout(() => this.openClassModal(), 500);
    }

    selectClass(cls) {
        this.character.class = cls.name;
        document.getElementById('classlevel').value = `${cls.name} ${this.character.level || 1}`;
        document.getElementById('classModal').classList.remove('active');
        this.saveDraft();
        
        // Abrir modal de antecedente após selecionar classe
        setTimeout(() => this.openBackgroundModal(), 500);
    }

    selectBackground(bg) {
        this.character.background = bg.name;
        document.getElementById('background').value = bg.name;
        document.getElementById('backgroundModal').classList.remove('active');
        this.saveDraft();
        
        // Abrir modal de tendência após selecionar antecedente
        setTimeout(() => this.openAlignmentModal(), 500);
    }

    selectAlignment(align) {
        this.character.alignment = align.name;
        document.getElementById('alignment').value = align.name;
        document.getElementById('alignmentModal').classList.remove('active');
        this.saveDraft();
    }

    async saveDraft() {
        if (!this.characterId || !this.character) return;
        
        try {
            const updateData = {
                name: this.character.name || '',
                race: this.character.race,
                character_class: this.character.class,
                background: this.character.background,
                alignment: this.character.alignment,
                level: this.character.level || 1,
                strength: this.character.attributes?.str || 10,
                dexterity: this.character.attributes?.dex || 10,
                constitution: this.character.attributes?.con || 10,
                intelligence: this.character.attributes?.int || 10,
                wisdom: this.character.attributes?.wis || 10,
                charisma: this.character.attributes?.cha || 10,
                hit_points_max: this.character.hp || 8,
                hit_points_current: this.character.hpCurrent || 8,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('characters')
                .update(updateData)
                .eq('id', this.characterId);

            if (error) throw error;
            
            console.log('💾 Rascunho salvo automaticamente');
        } catch (error) {
            console.error('❌ Erro ao salvar rascunho:', error);
        }
    }

    async saveCharacter() {
        if (!this.character) return;

        try {
            const updateData = {
                name: this.character.name || 'Personagem Sem Nome',
                race: this.character.race,
                character_class: this.character.class,
                background: this.character.background,
                alignment: this.character.alignment,
                level: this.character.level || 1,
                strength: this.character.attributes?.str || 10,
                dexterity: this.character.attributes?.dex || 10,
                constitution: this.character.attributes?.con || 10,
                intelligence: this.character.attributes?.int || 10,
                wisdom: this.character.attributes?.wis || 10,
                charisma: this.character.attributes?.cha || 10,
                hit_points_max: this.character.hp || 8,
                hit_points_current: this.character.hpCurrent || 8,
                is_draft: false,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('characters')
                .update(updateData)
                .eq('id', this.characterId);

            if (error) throw error;
            
            alert('✅ Personagem salvo com sucesso!');
            window.location.href = '/dashboard.html';
            
        } catch (error) {
            console.error('❌ Erro ao salvar personagem:', error);
            alert('Erro ao salvar personagem!');
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new CharacterSheet();
});