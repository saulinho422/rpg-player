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
            await this.initCreationMode();
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
            console.log('📦 Carregando dados do banco de dados...');
            
            const [racesResult, classesResult, backgroundsResult, alignmentsResult] = await Promise.all([
                supabase.from('races').select('*'),
                supabase.from('classes').select('*'),
                supabase.from('game_backgrounds').select('*'),
                supabase.from('game_alignments').select('*')
            ]);

            if (racesResult.error) throw new Error('Erro ao carregar raças: ' + racesResult.error.message);
            if (classesResult.error) throw new Error('Erro ao carregar classes: ' + classesResult.error.message);
            if (backgroundsResult.error) throw new Error('Erro ao carregar antecedentes: ' + backgroundsResult.error.message);
            if (alignmentsResult.error) throw new Error('Erro ao carregar tendências: ' + alignmentsResult.error.message);

            this.gameData = {
                races: racesResult.data || [],
                classes: classesResult.data || [],
                backgrounds: backgroundsResult.data || [],
                alignments: alignmentsResult.data || []
            };

            console.log('✅ Dados carregados:', {
                races: this.gameData.races.length,
                classes: this.gameData.classes.length,
                backgrounds: this.gameData.backgrounds.length,
                alignments: this.gameData.alignments.length
            });
        } catch (error) {
            console.error('❌ Erro ao carregar dados do jogo:', error);
            alert('Erro ao carregar dados do banco de dados: ' + error.message);
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

        console.log('📝 Preenchendo ficha com:', this.character);

        // Informações básicas
        this.setInputValue('charname', this.character.name);
        this.setInputValue('classlevel', this.character.character_class ? `${this.character.character_class} ${this.character.level}` : '');
        this.setInputValue('background', this.character.background);
        this.setInputValue('race', this.character.race);
        this.setInputValue('alignment', this.character.alignment);
        this.setInputValue('experiencepoints', this.character.experience_points || 0);

        // Atributos
        this.setInputValue('Strengthscore', this.character.strength);
        this.setInputValue('Dexterityscore', this.character.dexterity);
        this.setInputValue('Constitutionscore', this.character.constitution);
        this.setInputValue('Intelligencescore', this.character.intelligence);
        this.setInputValue('Wisdomscore', this.character.wisdom);
        this.setInputValue('Charismascore', this.character.charisma);

        // HP
        this.setInputValue('maxhp', this.character.hit_points_max);
        this.setInputValue('currenthp', this.character.hit_points_current);

        // Hit Dice
        if (this.character.character_class) {
            const hitDie = this.getHitDieForClass(this.character.character_class);
            this.setInputValue('totalhd', `${this.character.level}${hitDie}`);
        }

        // Perícias (marcar checkboxes de proficiência)
        if (this.character.skills && Array.isArray(this.character.skills)) {
            console.log('🎯 Marcando perícias:', this.character.skills);
            this.character.skills.forEach(skill => {
                const checkbox = document.getElementById(`${skill}-prof`);
                if (checkbox) {
                    checkbox.checked = true;
                    console.log(`✅ Perícia marcada: ${skill}`);
                } else {
                    console.warn(`⚠️ Checkbox não encontrado para: ${skill}`);
                }
            });
        }

        // Salvaguardas (marcar checkboxes de proficiência)
        if (this.character.saving_throws && Array.isArray(this.character.saving_throws)) {
            console.log('🛡️ Marcando salvaguardas:', this.character.saving_throws);
            this.character.saving_throws.forEach(save => {
                const checkbox = document.getElementById(`${save}-save-prof`);
                if (checkbox) {
                    checkbox.checked = true;
                    console.log(`✅ Salvaguarda marcada: ${save}`);
                } else {
                    console.warn(`⚠️ Checkbox não encontrado para: ${save}`);
                }
            });
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
            const raceName = race.name_pt || race.name || 'Sem Nome';
            if (this.character.race === race.id) card.classList.add('selected');
            
            card.innerHTML = `
                <h3>${raceName}</h3>
                <p>${race.description || ''}</p>
                <div class="stats">
                    <small>Tamanho: ${race.size || 'Médio'} | Velocidade: ${race.speed || 30}ft</small>
                </div>
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
            const className = cls.name_pt || cls.name || 'Sem Nome';
            if (this.character.class === cls.id) card.classList.add('selected');
            
            card.innerHTML = `
                <h3>${className}</h3>
                <p>${cls.description || ''}</p>
                <div class="stats">
                    <small>Dado de Vida: d${cls.hit_die || 8} | Proficiências: ${cls.primary_ability || 'Variado'}</small>
                </div>
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
            const bgName = bg.name_pt || bg.name || 'Sem Nome';
            if (this.character.background === bg.id) card.classList.add('selected');
            
            card.innerHTML = `
                <h3>${bgName}</h3>
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
            const alignName = align.name_pt || align.name || 'Sem Nome';
            if (this.character.alignment === align.id) card.classList.add('selected');
            
            card.innerHTML = `
                <h4>${alignName}</h4>
                <p>${align.description || ''}</p>
            `;
            
            card.addEventListener('click', () => this.selectAlignment(align));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    selectRace(race) {
        this.character.race = race.id;
        this.character.raceData = race;
        const raceName = race.name_pt || race.name || 'Raça Selecionada';
        document.getElementById('race').value = raceName;
        document.getElementById('raceModal').classList.remove('active');
        this.saveDraft();
        
        console.log('✅ Raça selecionada:', raceName);
        
        // Abrir modal de classe após selecionar raça
        setTimeout(() => this.openClassModal(), 500);
    }

    selectClass(cls) {
        this.character.class = cls.id;
        this.character.classData = cls;
        const className = cls.name_pt || cls.name || 'Classe Selecionada';
        document.getElementById('classlevel').value = `${className} ${this.character.level || 1}`;
        document.getElementById('classModal').classList.remove('active');
        this.saveDraft();
        
        console.log('✅ Classe selecionada:', className);
        
        // Abrir modal de antecedente após selecionar classe
        setTimeout(() => this.openBackgroundModal(), 500);
    }

    selectBackground(bg) {
        this.character.background = bg.id;
        this.character.backgroundData = bg;
        const bgName = bg.name_pt || bg.name || 'Antecedente Selecionado';
        document.getElementById('background').value = bgName;
        document.getElementById('backgroundModal').classList.remove('active');
        this.saveDraft();
        
        console.log('✅ Antecedente selecionado:', bgName);
        
        // Abrir modal de tendência após selecionar antecedente
        setTimeout(() => this.openAlignmentModal(), 500);
    }

    selectAlignment(align) {
        this.character.alignment = align.id;
        this.character.alignmentData = align;
        const alignName = align.name_pt || align.name || 'Tendência Selecionada';
        document.getElementById('alignment').value = alignName;
        document.getElementById('alignmentModal').classList.remove('active');
        this.saveDraft();
        
        console.log('✅ Tendência selecionada:', alignName);
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

// Character Creation Wizard
class CharacterCreationWizard {
    constructor(characterSheet) {
        this.characterSheet = characterSheet;
        this.currentStep = 0;
        this.totalSteps = 8;
        this.wizardData = {
            name: '',
            race: null,
            subrace: null,
            class: null,
            subclass: null,
            skills: [],
            attributes: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
            attributeMethod: 'roll',
            alignment: null,
            background: null,
            equipment: [],
            equipmentMethod: 'package', // 'package' ou 'wealth'
            equipmentChoices: {}, // Armazena escolhas (a), (b), (c) etc
            startingWealth: 0,
            purchasedItems: [],
            level: 1,
            image: null
        };
        this.gameData = {
            races: [],
            subraces: [],
            classes: [],
            subclasses: [],
            skills: [],
            backgrounds: [],
            weapons: [],
            armors: [],
            equipment: []
        };
        this.isRolling = false;
        this.init();
    }

    async init() {
        console.log('🎯 Inicializando wizard...');
        
        // Carregar dados do jogo
        await this.loadGameData();
        
        // Setup modal
        this.modal = document.getElementById('characterCreationModal');
        this.contentArea = document.getElementById('creationContent');
        this.prevButton = document.getElementById('prevBtn');
        this.nextButton = document.getElementById('nextBtn');
        
        if (!this.modal || !this.contentArea) {
            console.error('❌ Elementos do modal não encontrados!');
            return;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Mostrar modal
        this.showModal();
        
        // Renderizar primeira etapa
        this.renderStep();
        
        console.log('✅ Wizard inicializado');
    }

    // Método auxiliar para delays
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async loadGameData() {
        try {
            console.log('📦 Carregando dados do jogo...');
            
            // Carregar raças (ordenar por name_pt em português)
            const { data: races, error: racesError } = await supabase
                .from('races')
                .select('*')
                .order('name_pt');
            
            if (!racesError && races) {
                this.gameData.races = races;
                console.log(`✅ ${races.length} raças carregadas`);
            }

            // Carregar subraças
            const { data: subraces, error: subracesError } = await supabase
                .from('subraces')
                .select('*')
                .order('name_pt');
            
            if (!subracesError && subraces) {
                this.gameData.subraces = subraces;
                console.log(`✅ ${subraces.length} subraças carregadas`);
            }

            // Carregar classes (ordenar por name_pt)
            const { data: classes, error: classesError } = await supabase
                .from('classes')
                .select('*')
                .order('name_pt');
            
            if (!classesError && classes) {
                this.gameData.classes = classes;
                console.log(`✅ ${classes.length} classes carregadas`);
            }

            // Carregar subclasses
            const { data: subclasses, error: subclassesError } = await supabase
                .from('subclasses')
                .select('*')
                .order('name_pt');
            
            if (!subclassesError && subclasses) {
                this.gameData.subclasses = subclasses;
                console.log(`✅ ${subclasses.length} subclasses carregadas`);
            }

            // Criar lista de perícias a partir das classes
            // Como não temos tabela 'skills', vamos extrair das skills_available das classes
            const allSkills = new Set();
            if (this.gameData.classes && this.gameData.classes.length > 0) {
                this.gameData.classes.forEach(cls => {
                    try {
                        const skillsAvailable = typeof cls.skills_available === 'string' 
                            ? JSON.parse(cls.skills_available) 
                            : cls.skills_available || [];
                        
                        if (Array.isArray(skillsAvailable)) {
                            skillsAvailable.forEach(skill => allSkills.add(skill));
                        }
                    } catch (error) {
                        console.warn(`⚠️ Erro ao processar perícias da classe ${cls.name_pt}:`, error);
                    }
                });
            }
            
            // Mapeamento de perícias para atributos (baseado em D&D 5e)
            const skillAbilityMap = {
                'Acrobacia': 'DES', 'Atletismo': 'FOR', 'Atuação': 'CAR',
                'Enganação': 'CAR', 'Furtividade': 'DES', 'História': 'INT',
                'Intimidação': 'CAR', 'Intuição': 'SAB', 'Investigação': 'INT',
                'Lidar com Animais': 'SAB', 'Medicina': 'SAB', 'Natureza': 'INT',
                'Percepção': 'SAB', 'Persuasão': 'CAR', 'Prestidigitação': 'DES',
                'Religião': 'INT', 'Sobrevivência': 'SAB', 'Arcana': 'INT'
            };
            
            // Se não conseguiu extrair perícias, usar lista padrão
            if (allSkills.size === 0) {
                console.warn('⚠️ Nenhuma perícia encontrada nas classes, usando lista padrão');
                const defaultSkills = [
                    'Acrobacia', 'Atletismo', 'Atuação', 'Enganação', 'Furtividade',
                    'História', 'Intimidação', 'Intuição', 'Investigação', 'Lidar com Animais',
                    'Medicina', 'Natureza', 'Percepção', 'Persuasão', 'Prestidigitação',
                    'Religião', 'Sobrevivência', 'Arcana'
                ];
                defaultSkills.forEach(skill => allSkills.add(skill));
            }
            
            this.gameData.skills = Array.from(allSkills).map(skillName => ({
                name: skillName,
                ability: skillAbilityMap[skillName] || 'INT'
            })).sort((a, b) => a.name.localeCompare(b.name));
            
            console.log(`✅ ${this.gameData.skills.length} perícias criadas a partir das classes`);
            console.log('📋 Perícias disponíveis:', this.gameData.skills.map(s => s.name).join(', '));

            // Carregar antecedentes do banco de dados (usar 'nome' ao invés de 'name')
            const { data: backgrounds, error: backgroundsError } = await supabase
                .from('game_backgrounds')
                .select('*')
                .order('nome');
            
            if (!backgroundsError && backgrounds && backgrounds.length > 0) {
                this.gameData.backgrounds = backgrounds;
                console.log(`✅ ${backgrounds.length} antecedentes carregados do banco`);
            } else {
                console.warn('⚠️ Nenhum antecedente encontrado no banco');
                this.gameData.backgrounds = [];
            }

            // Carregar armas
            const { data: weapons, error: weaponsError } = await supabase
                .from('game_weapons')
                .select('*')
                .order('nome');
            
            if (!weaponsError && weapons) {
                this.gameData.weapons = weapons;
                console.log(`✅ ${weapons.length} armas carregadas`);
            }

            // Carregar armaduras
            const { data: armors, error: armorsError } = await supabase
                .from('game_armor')
                .select('*')
                .order('nome');
            
            if (!armorsError && armors) {
                this.gameData.armors = armors;
                console.log(`✅ ${armors.length} armaduras carregadas`);
            }

            // Carregar equipamentos gerais (incluindo pacotes)
            const { data: equipment, error: equipmentError } = await supabase
                .from('game_equipment')
                .select('*')
                .order('nome');
            
            if (!equipmentError && equipment) {
                this.gameData.equipment = equipment;
                console.log(`✅ ${equipment.length} equipamentos carregados`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados do jogo:', error);
        }
    }

    setupEventListeners() {
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.previousStep());
        }
        
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextStep());
        }
    }

    showModal() {
        if (this.modal) {
            this.modal.classList.add('active');
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
        }
    }

    renderStep() {
        console.log(`📍 Renderizando etapa ${this.currentStep}`);
        
        // Atualizar barra de progresso
        this.updateProgressBar();
        
        // Renderizar conteúdo da etapa
        switch (this.currentStep) {
            case 0:
                this.renderNameStep();
                break;
            case 1:
                this.renderRaceStep();
                break;
            case 2:
                this.renderClassStep();
                break;
            case 3:
                this.renderSkillsStep();
                break;
            case 4:
                this.renderAttributesStep();
                break;
            case 5:
                this.renderDetailsStep();
                break;
            case 6:
                this.renderEquipmentStep();
                break;
            case 7:
                this.renderFinalStep();
                break;
        }
        
        // Atualizar botões
        this.updateButtons();
    }

    updateProgressBar() {
        const steps = document.querySelectorAll('.progress-step');
        const progressFill = document.querySelector('.progress-fill');
        
        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index < this.currentStep) {
                step.classList.add('completed');
            } else if (index === this.currentStep) {
                step.classList.add('active');
            }
        });
        
        if (progressFill) {
            const percentage = (this.currentStep / (this.totalSteps - 1)) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }

    updateButtons() {
        // Botão anterior
        if (this.prevButton) {
            if (this.currentStep === 0) {
                this.prevButton.classList.add('hidden');
            } else {
                this.prevButton.classList.remove('hidden');
            }
        }
        
        // Botão próximo
        if (this.nextButton) {
            if (this.currentStep === this.totalSteps - 1) {
                this.nextButton.textContent = 'Finalizar';
                this.nextButton.classList.add('primary');
            } else {
                this.nextButton.textContent = 'Próximo';
                this.nextButton.classList.remove('primary');
            }
            
            // Validar se pode avançar
            const canProceed = this.validateCurrentStep();
            this.nextButton.disabled = !canProceed;
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 0: // Nome
                return this.wizardData.name.trim().length >= 2;
            case 1: // Raça
                return this.wizardData.race !== null;
            case 2: // Classe
                return this.wizardData.class !== null;
            case 3: // Perícias
                const requiredSkills = this.wizardData.class?.skills_choose || 2;
                return this.wizardData.skills.length === requiredSkills;
            case 4: // Atributos - verificar se todos os valores foram alocados
                if (!this.wizardData.availableValues || this.wizardData.availableValues.length > 0) {
                    return false; // Ainda tem valores não alocados
                }
                // Verificar se todos os atributos foram preenchidos
                const attrs = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
                const allAllocated = attrs.every(attr => this.wizardData.attributes[attr] !== 10 || this.wizardData.attributeMethod === 'standard');
                
                // Marcar que os atributos foram alocados
                if (allAllocated && this.wizardData.availableValues.length === 0) {
                    this.wizardData.attributesAllocated = true;
                }
                
                return allAllocated;
            case 5: // Detalhes (alinhamento + antecedente)
                return this.wizardData.alignment !== null && this.wizardData.background !== null;
            case 6: // Equipamentos
                return this.wizardData.equipment.length > 0;
            case 7: // Final
                return true;
            default:
                return false;
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }

    async nextStep() {
        if (!this.validateCurrentStep()) return;
        
        if (this.currentStep === this.totalSteps - 1) {
            await this.finalizeCharacter();
        } else {
            this.currentStep++;
            this.renderStep();
        }
    }

    // ETAPA 0: Nome
    renderNameStep() {
        this.contentArea.innerHTML = `
            <div class="step-content">
                <h3 class="step-title">Nome do Personagem</h3>
                <p class="step-description">Escolha um nome épico para seu herói</p>
                
                <div class="creation-input-group">
                    <label for="wizardCharName">Nome *</label>
                    <input 
                        type="text" 
                        id="wizardCharName" 
                        placeholder="Ex: Aragorn, Gandalf..."
                        value="${this.wizardData.name}"
                        maxlength="50"
                    >
                </div>
            </div>
        `;
        
        const input = document.getElementById('wizardCharName');
        if (input) {
            input.focus();
            input.addEventListener('input', (e) => {
                this.wizardData.name = e.target.value;
                this.updateButtons();
            });
        }
    }

    // ETAPA 1: Raça + Sub-raça
    renderRaceStep() {
        const racesHtml = this.gameData.races.map(race => {
            const isSelected = this.wizardData.race?.id === race.id;
            // Parsear traits se for string JSON
            const traits = typeof race.traits === 'string' ? JSON.parse(race.traits) : race.traits;
            const traitsText = Array.isArray(traits) && traits.length > 0 ? traits.slice(0, 2).join(', ') : '';
            
            return `
                <div class="selection-card ${isSelected ? 'selected' : ''}" data-race-id="${race.id}">
                    <h3>${race.name_pt || race.name}</h3>
                    <p>${race.description || 'Raça disponível'}</p>
                    <div class="card-details">
                        <small><strong>Bônus:</strong> ${race.ability_score_increase || 'Variável'}</small><br>
                        ${race.speed ? `<small><strong>Velocidade:</strong> ${race.speed}</small><br>` : ''}
                        ${traitsText ? `<small><strong>Traços:</strong> ${traitsText}...</small>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        let subraceHtml = '';
        if (this.wizardData.race) {
            const subraces = this.gameData.subraces.filter(sr => sr.race_id === this.wizardData.race.id);
            if (subraces.length > 0) {
                subraceHtml = `
                    <h4 style="color: var(--primary-color); margin-top: 30px; margin-bottom: 15px;">Sub-raça</h4>
                    <div class="selection-grid">
                        ${subraces.map(subrace => {
                            const isSelected = this.wizardData.subrace?.id === subrace.id;
                            const subTraits = typeof subrace.traits === 'string' ? JSON.parse(subrace.traits) : subrace.traits;
                            const subTraitsText = Array.isArray(subTraits) && subTraits.length > 0 ? subTraits[0] : '';
                            
                            return `
                                <div class="selection-card ${isSelected ? 'selected' : ''}" data-subrace-id="${subrace.id}">
                                    <h3>${subrace.name_pt || subrace.name}</h3>
                                    <p>${subrace.description || 'Sub-raça disponível'}</p>
                                    ${subTraitsText ? `<div class="card-details"><small>${subTraitsText}</small></div>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        }

        this.contentArea.innerHTML = `
            <div class="step-content">
                <h3 class="step-title">Raça do Personagem</h3>
                <p class="step-description">Escolha a raça que define seu personagem</p>
                
                <div class="selection-grid">
                    ${racesHtml}
                </div>
                
                ${subraceHtml}
            </div>
        `;
        
        document.querySelectorAll('[data-race-id]').forEach(card => {
            card.addEventListener('click', () => {
                const raceId = card.dataset.raceId; // UUID string
                this.wizardData.race = this.gameData.races.find(r => r.id === raceId);
                this.wizardData.subrace = null;
                this.renderStep();
            });
        });

        document.querySelectorAll('[data-subrace-id]').forEach(card => {
            card.addEventListener('click', () => {
                const subraceId = card.dataset.subraceId; // UUID string
                this.wizardData.subrace = this.gameData.subraces.find(sr => sr.id === subraceId);
                this.updateButtons();
                document.querySelectorAll('[data-subrace-id]').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
    }

    // ETAPA 2: Classe + Subclasse
    renderClassStep() {
        const classesHtml = this.gameData.classes.map(cls => {
            const isSelected = this.wizardData.class?.id === cls.id;
            // Parsear saving_throws se for string JSON
            const savingThrows = typeof cls.saving_throws === 'string' ? JSON.parse(cls.saving_throws) : cls.saving_throws;
            const savesText = Array.isArray(savingThrows) ? savingThrows.join(', ') : '';
            
            return `
                <div class="selection-card ${isSelected ? 'selected' : ''}" data-class-id="${cls.id}">
                    <h3>${cls.name_pt || cls.name}</h3>
                    <p>${cls.description || 'Classe disponível'}</p>
                    <div class="card-details">
                        <small><strong>Dado de Vida:</strong> d${cls.hit_die || '8'}</small><br>
                        <small><strong>Salvaguardas:</strong> ${savesText}</small><br>
                        <small><strong>Perícias:</strong> Escolha ${cls.skills_choose || 2}</small>
                    </div>
                </div>
            `;
        }).join('');

        let subclassHtml = '';
        if (this.wizardData.class) {
            const subclasses = this.gameData.subclasses.filter(sc => sc.class_id === this.wizardData.class.id);
            if (subclasses.length > 0) {
                subclassHtml = `
                    <h4 style="color: var(--primary-color); margin-top: 30px; margin-bottom: 15px;">Subclasse (Opcional)</h4>
                    <div class="selection-grid">
                        ${subclasses.map(subclass => {
                            const isSelected = this.wizardData.subclass?.id === subclass.id;
                            return `
                                <div class="selection-card ${isSelected ? 'selected' : ''}" data-subclass-id="${subclass.id}">
                                    <h3>${subclass.name_pt || subclass.name}</h3>
                                    <p>${subclass.description || 'Subclasse disponível'}</p>
                                    ${subclass.level_available ? `<div class="card-details"><small>Disponível no nível ${subclass.level_available}</small></div>` : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        }

        this.contentArea.innerHTML = `
            <div class="step-content">
                <h3 class="step-title">Classe do Personagem</h3>
                <p class="step-description">Escolha a classe que define as habilidades</p>
                
                <div class="selection-grid">
                    ${classesHtml}
                </div>
                
                ${subclassHtml}
            </div>
        `;
        
        document.querySelectorAll('[data-class-id]').forEach(card => {
            card.addEventListener('click', () => {
                const classId = card.dataset.classId; // UUID string
                this.wizardData.class = this.gameData.classes.find(c => c.id === classId);
                this.wizardData.subclass = null;
                this.wizardData.skills = [];
                console.log('✅ Classe selecionada:', this.wizardData.class?.name_pt);
                this.renderStep();
            });
        });

        document.querySelectorAll('[data-subclass-id]').forEach(card => {
            card.addEventListener('click', () => {
                const subclassId = card.dataset.subclassId; // UUID string
                this.wizardData.subclass = this.gameData.subclasses.find(sc => sc.id === subclassId);
                this.updateButtons();
                document.querySelectorAll('[data-subclass-id]').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
        });
    }

    // ETAPA 3: Perícias
    renderSkillsStep() {
        if (!this.wizardData.class) {
            this.contentArea.innerHTML = '<p>Erro: Classe não selecionada</p>';
            return;
        }

        console.log('🔍 DEBUG renderSkillsStep:');
        console.log('  - this.gameData.skills:', this.gameData.skills);
        console.log('  - Array?', Array.isArray(this.gameData.skills));
        console.log('  - Length:', this.gameData.skills?.length);

        // Garantir que skills existe e é um array
        if (!this.gameData.skills || !Array.isArray(this.gameData.skills)) {
            console.error('❌ gameData.skills não está disponível!');
            this.contentArea.innerHTML = `
                <div class="step-content">
                    <h3 class="step-title">Erro ao Carregar Perícias</h3>
                    <p style="color: red;">Não foi possível carregar as perícias. Tente voltar e selecionar a classe novamente.</p>
                </div>
            `;
            return;
        }

        // Parsear skills_available se for string JSON
        let classSkills = [];
        try {
            classSkills = typeof this.wizardData.class.skills_available === 'string' 
                ? JSON.parse(this.wizardData.class.skills_available) 
                : this.wizardData.class.skills_available || [];
        } catch (error) {
            console.error('❌ Erro ao parsear skills_available:', error);
            classSkills = [];
        }
        
        const maxSkills = this.wizardData.class.skills_choose || 2;

        console.log('  - Classe:', this.wizardData.class.name_pt);
        console.log('  - Perícias disponíveis da classe:', classSkills);
        console.log('  - Máximo de perícias:', maxSkills);

        // Filtrar perícias disponíveis para esta classe
        const availableSkills = this.gameData.skills.filter(skill => classSkills.includes(skill.name));
        
        console.log('  - Perícias filtradas:', availableSkills.length);

        if (availableSkills.length === 0) {
            this.contentArea.innerHTML = `
                <div class="step-content">
                    <h3 class="step-title">Perícias da Classe</h3>
                    <p style="color: orange;">Nenhuma perícia disponível para esta classe. Clique em "Próximo" para continuar.</p>
                </div>
            `;
            return;
        }

        const skillsHtml = availableSkills.map(skill => {
            const isSelected = this.wizardData.skills.includes(skill.name);
            const isDisabled = !isSelected && this.wizardData.skills.length >= maxSkills;
            
            return `
                <div class="checkbox-item ${isDisabled ? 'disabled' : ''}" data-skill="${skill.name}">
                    <input 
                        type="checkbox" 
                        id="skill-${skill.name.replace(/\s+/g, '-')}" 
                        ${isSelected ? 'checked' : ''}
                        ${isDisabled ? 'disabled' : ''}
                    >
                    <label for="skill-${skill.name.replace(/\s+/g, '-')}">${skill.name} (${skill.ability})</label>
                </div>
            `;
        }).join('');

        this.contentArea.innerHTML = `
            <div class="step-content">
                <h3 class="step-title">Perícias da Classe</h3>
                <p class="step-description">
                    Escolha ${maxSkills} perícia(s)<br>
                    <strong style="color: var(--primary-color);">Selecionadas: ${this.wizardData.skills.length} / ${maxSkills}</strong>
                </p>
                
                <div class="checkbox-group">
                    ${skillsHtml}
                </div>
            </div>
        `;
        
        document.querySelectorAll('.checkbox-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const skillName = e.target.closest('.checkbox-item').dataset.skill;
                
                if (e.target.checked) {
                    if (this.wizardData.skills.length < maxSkills) {
                        this.wizardData.skills.push(skillName);
                    } else {
                        e.target.checked = false;
                    }
                } else {
                    this.wizardData.skills = this.wizardData.skills.filter(s => s !== skillName);
                }
                
                this.renderStep();
            });
        });
    }

    // ETAPA 4: Atributos
    renderAttributesStep() {
        // Inicializar arrays de valores se não existirem
        if (!this.wizardData.rolledValues) {
            this.wizardData.rolledValues = [];
        }
        if (!this.wizardData.availableValues) {
            this.wizardData.availableValues = [];
        }

        const attrNames = { str: 'Força', dex: 'Destreza', con: 'Constituição', int: 'Inteligência', wis: 'Sabedoria', cha: 'Carisma' };
        
        const toggleHtml = `
            <div class="toggle-group">
                <div class="toggle-option ${this.wizardData.attributeMethod === 'roll' ? 'active' : ''}" data-method="roll">
                    🎲 4d6 (Rolar Dados)
                </div>
                <div class="toggle-option ${this.wizardData.attributeMethod === 'standard' ? 'active' : ''}" data-method="standard">
                    📊 Valores Padrão
                </div>
            </div>
        `;

        let methodContentHtml = '';

        if (this.wizardData.attributeMethod === 'roll') {
            // Modo 4d6 - Rolar valores individuais com dados 3D
            const needsRolling = this.wizardData.rolledValues.length < 6;
            
            if (needsRolling) {
                methodContentHtml = `
                    <div style="text-align: center; margin: 30px 0;">
                        <h4 style="color: var(--primary-color); margin-bottom: 15px;">
                            Valores Rolados: ${this.wizardData.rolledValues.length} / 6
                        </h4>
                        <div class="rolled-values-display">
                            ${this.wizardData.rolledValues.map(v => `<div class="rolled-value">${v}</div>`).join('')}
                        </div>
                        
                        <!-- Container para os dados 3D -->
                        <div id="diceContainer" class="dice-container"></div>
                        
                        <button class="upload-button" id="rollSingleBtn" style="margin-top: 20px;" ${this.isRolling ? 'disabled' : ''}>
                            🎲 Rolar 4d6 (Soma dos 3 Maiores)
                        </button>
                    </div>
                `;
            } else {
                // Todos os 6 valores rolados - mostrar alocação
                methodContentHtml = `
                    <div style="margin: 20px 0;">
                        <h4 style="color: var(--primary-color); margin-bottom: 15px; text-align: center;">
                            Valores Disponíveis (clique para alocar)
                        </h4>
                        <div class="available-values-grid">
                            ${this.wizardData.availableValues.map((value, idx) => `
                                <div class="available-value" data-value="${value}" data-index="${idx}">
                                    ${value}
                                </div>
                            `).join('')}
                        </div>
                        <p style="text-align: center; color: var(--text-color); margin-top: 10px; font-size: 14px;">
                            Clique em um valor acima e depois no atributo abaixo
                        </p>
                    </div>
                `;
            }
        } else {
            // Modo Array Padrão - valores fixos [15, 14, 13, 12, 10, 8]
            // Só preencher se ainda não iniciou a alocação
            if (this.wizardData.availableValues.length === 0 && 
                !this.wizardData.attributesAllocated) {
                this.wizardData.availableValues = [15, 14, 13, 12, 10, 8];
            }
            
            methodContentHtml = `
                <div style="margin: 20px 0;">
                    <h4 style="color: var(--primary-color); margin-bottom: 15px; text-align: center;">
                        Valores Disponíveis (clique para alocar)
                    </h4>
                    <div class="available-values-grid">
                        ${this.wizardData.availableValues.map((value, idx) => `
                            <div class="available-value" data-value="${value}" data-index="${idx}">
                                ${value}
                            </div>
                        `).join('')}
                    </div>
                    <p style="text-align: center; color: var(--text-color); margin-top: 10px; font-size: 14px;">
                        Clique em um valor acima e depois no atributo abaixo
                    </p>
                </div>
            `;
        }

        const attributesHtml = `
            <div class="attribute-distribution">
                ${['str', 'dex', 'con', 'int', 'wis', 'cha'].map(attr => {
                    const value = this.wizardData.attributes[attr];
                    const modifier = Math.floor((value - 10) / 2);
                    const modString = modifier >= 0 ? `+${modifier}` : modifier;
                    const hasValue = value !== 10 || this.wizardData.availableValues.length < 6;
                    
                    return `
                        <div class="attribute-box ${hasValue ? 'has-value' : ''}" data-attr="${attr}">
                            <label>${attrNames[attr]}</label>
                            <div class="attribute-value">${value}</div>
                            <span class="modifier">${modString}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        this.contentArea.innerHTML = `
            <div class="step-content">
                <h3 class="step-title">Atributos</h3>
                <p class="step-description">Escolha o método e distribua os valores</p>
                
                ${toggleHtml}
                ${methodContentHtml}
                ${this.wizardData.availableValues.length > 0 || this.wizardData.rolledValues.length === 6 ? attributesHtml : ''}
            </div>
        `;
        
        // Event listeners para toggle
        document.querySelectorAll('.toggle-option').forEach(option => {
            option.addEventListener('click', () => {
                const newMethod = option.dataset.method;
                if (this.wizardData.attributeMethod !== newMethod) {
                    this.wizardData.attributeMethod = newMethod;
                    this.wizardData.rolledValues = [];
                    this.wizardData.availableValues = [];
                    this.wizardData.attributes = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
                    this.wizardData.attributesAllocated = false; // Reset da flag
                    
                    if (newMethod === 'standard') {
                        this.wizardData.availableValues = [15, 14, 13, 12, 10, 8];
                    }
                    
                    this.renderStep();
                }
            });
        });

        // Event listener para rolar valor individual (4d6) com dados 3D
        const rollSingleBtn = document.getElementById('rollSingleBtn');
        if (rollSingleBtn) {
            rollSingleBtn.addEventListener('click', async () => {
                console.log('🎲 Botão clicado! Dice3DRoller disponível?', typeof window.Dice3DRoller);
                
                if (this.isRolling) return; // Prevenir cliques duplos
                
                this.isRolling = true;
                rollSingleBtn.disabled = true;
                rollSingleBtn.textContent = '🎲 Rolando...';
                
                try {
                    // Criar instância do roller de dados 3D
                    const diceRoller = new window.Dice3DRoller('diceContainer');
                    
                    // Rolar os dados e esperar o resultado
                    const value = await diceRoller.roll();
                    
                    console.log('✅ Valor rolado:', value);
                    
                    // Adicionar valor aos rolados
                    this.wizardData.rolledValues.push(value);
                    
                    // Se completou os 6 valores, transferir para availableValues
                    if (this.wizardData.rolledValues.length === 6) {
                        this.wizardData.availableValues = [...this.wizardData.rolledValues];
                    }
                    
                    this.isRolling = false;
                    
                    // Aguardar 1 segundo antes de re-renderizar
                    await this.wait(1000);
                    
                    this.renderStep();
                } catch (error) {
                    console.error('❌ Erro ao rolar dados:', error);
                    this.isRolling = false;
                    rollSingleBtn.disabled = false;
                    rollSingleBtn.textContent = '🎲 Rolar 4d6 (Soma dos 3 Maiores)';
                }
            });
        }

        // Sistema de seleção e alocação de valores
        let selectedValue = null;
        let selectedIndex = null;

        document.querySelectorAll('.available-value').forEach(valueDiv => {
            valueDiv.addEventListener('click', () => {
                // Remover seleção anterior
                document.querySelectorAll('.available-value').forEach(v => v.classList.remove('selected'));
                
                // Selecionar novo valor
                valueDiv.classList.add('selected');
                selectedValue = parseInt(valueDiv.dataset.value);
                selectedIndex = parseInt(valueDiv.dataset.index);
            });
        });

        document.querySelectorAll('.attribute-box').forEach(attrBox => {
            attrBox.addEventListener('click', () => {
                if (selectedValue !== null && selectedIndex !== null) {
                    const attr = attrBox.dataset.attr;
                    const oldValue = this.wizardData.attributes[attr];
                    
                    console.log('📊 Alocando:', { attr, selectedValue, selectedIndex, oldValue });
                    console.log('📊 availableValues antes:', [...this.wizardData.availableValues]);
                    
                    // Se o atributo já tinha um valor alocado, devolver para availableValues
                    if (oldValue !== 10) {
                        this.wizardData.availableValues.push(oldValue);
                    }
                    
                    // Alocar novo valor
                    this.wizardData.attributes[attr] = selectedValue;
                    
                    // Remover valor de availableValues pelo VALOR, não pelo índice
                    const valueIndex = this.wizardData.availableValues.indexOf(selectedValue);
                    if (valueIndex !== -1) {
                        this.wizardData.availableValues.splice(valueIndex, 1);
                    }
                    
                    // Se zerou availableValues, marcar como completo IMEDIATAMENTE
                    if (this.wizardData.availableValues.length === 0) {
                        this.wizardData.attributesAllocated = true;
                        console.log('✅ Todos os valores foram alocados! Flag marcada.');
                    }
                    
                    console.log('📊 availableValues depois:', [...this.wizardData.availableValues]);
                    console.log('📊 attributes:', {...this.wizardData.attributes});
                    console.log('📊 attributesAllocated:', this.wizardData.attributesAllocated);
                    
                    // Resetar seleção
                    selectedValue = null;
                    selectedIndex = null;
                    
                    // Renderizar novamente
                    this.renderStep();
                    this.updateButtons();
                }
            });
        });
    }

    // ETAPA 5: Alinhamento + Antecedente
    renderDetailsStep() {
        const alignments = [
            { value: 'Lawful Good', label: 'Leal e Bom' },
            { value: 'Neutral Good', label: 'Neutro e Bom' },
            { value: 'Chaotic Good', label: 'Caótico e Bom' },
            { value: 'Lawful Neutral', label: 'Leal e Neutro' },
            { value: 'True Neutral', label: 'Neutro' },
            { value: 'Chaotic Neutral', label: 'Caótico e Neutro' },
            { value: 'Lawful Evil', label: 'Leal e Mau' },
            { value: 'Neutral Evil', label: 'Neutro e Mau' },
            { value: 'Chaotic Evil', label: 'Caótico e Mau' }
        ];

        const alignmentsHtml = alignments.map(alignment => {
            const isSelected = this.wizardData.alignment === alignment.value;
            return `
                <div class="selection-card ${isSelected ? 'selected' : ''}" data-alignment="${alignment.value}">
                    <h3 style="font-size: 16px;">${alignment.label}</h3>
                </div>
            `;
        }).join('');

        const backgroundsHtml = this.gameData.backgrounds.map(bg => {
            const isSelected = this.wizardData.background?.id === bg.id;
            // Usar 'nome' e 'descricao' do banco real
            const bgName = bg.nome || bg.name || 'Sem nome';
            const bgDesc = bg.descricao || bg.description || '';
            
            return `
                <div class="selection-card ${isSelected ? 'selected' : ''}" data-background-id="${bg.id}">
                    <h3>${bgName}</h3>
                    <p>${bgDesc.substring(0, 120)}${bgDesc.length > 120 ? '...' : ''}</p>
                </div>
            `;
        }).join('');

        this.contentArea.innerHTML = `
            <div class="step-content">
                <h3 class="step-title">Alinhamento e Antecedente</h3>
                <p class="step-description">Defina a personalidade e história</p>
                
                <h4 style="color: var(--primary-color); margin-bottom: 15px;">Alinhamento</h4>
                <div class="selection-grid">
                    ${alignmentsHtml}
                </div>
                
                <h4 style="color: var(--primary-color); margin-top: 30px; margin-bottom: 15px;">Antecedente</h4>
                <div class="selection-grid">
                    ${backgroundsHtml}
                </div>
            </div>
        `;
        
        document.querySelectorAll('[data-alignment]').forEach(card => {
            card.addEventListener('click', () => {
                this.wizardData.alignment = card.dataset.alignment;
                document.querySelectorAll('[data-alignment]').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.updateButtons();
            });
        });

        document.querySelectorAll('[data-background-id]').forEach(card => {
            card.addEventListener('click', () => {
                const bgId = card.dataset.backgroundId; // String ou UUID
                this.wizardData.background = this.gameData.backgrounds.find(bg => bg.id === bgId);
                document.querySelectorAll('[data-background-id]').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.updateButtons();
            });
        });
    }

    // ETAPA 6: Equipamentos
    // ETAPA 6: Equipamentos
    renderEquipmentStep() {
        if (!this.wizardData.class) {
            this.contentArea.innerHTML = '<p>Erro: Classe não selecionada</p>';
            return;
        }

        const toggleHtml = `
            <div class="toggle-group">
                <div class="toggle-option ${this.wizardData.equipmentMethod === 'package' ? 'active' : ''}" data-method="package">
                    📦 Pacote da Classe
                </div>
                <div class="toggle-option ${this.wizardData.equipmentMethod === 'wealth' ? 'active' : ''}" data-method="wealth">
                    💰 Riqueza Inicial
                </div>
            </div>
        `;

        let contentHtml = '';

        if (this.wizardData.equipmentMethod === 'package') {
            contentHtml = this.renderPackageMethod();
        } else {
            contentHtml = this.renderWealthMethod();
        }

        this.contentArea.innerHTML = `
            <div class="step-content">
                <h3 class="step-title">Equipamentos Iniciais</h3>
                <p class="step-description">Escolha como obter seu equipamento inicial</p>
                
                ${toggleHtml}
                ${contentHtml}
            </div>
        `;

        this.setupEquipmentListeners();
    }

    renderPackageMethod() {
        // Parsear equipment_options da classe
        let equipmentOptions = [];
        try {
            equipmentOptions = typeof this.wizardData.class.equipment_options === 'string'
                ? JSON.parse(this.wizardData.class.equipment_options)
                : this.wizardData.class.equipment_options || [];
        } catch (error) {
            console.error('Erro ao parsear equipment_options:', error);
        }

        if (equipmentOptions.length === 0) {
            return `<p style="color: orange; text-align: center; margin: 20px;">Nenhuma opção de equipamento disponível para esta classe.</p>`;
        }

        // Renderizar cada opção como um grupo de escolha
        const choicesHtml = equipmentOptions.map((option, index) => {
            // Extrair opções (a), (b), (c) do texto
            const matches = option.match(/\(([a-z])\)\s*([^(]+?)(?=\s*\([a-z]\)|$)/gi);
            
            if (!matches || matches.length === 0) {
                // Item fixo sem escolha
                return `
                    <div class="equipment-fixed-item">
                        <span class="fixed-icon">✓</span>
                        <span>${option}</span>
                    </div>
                `;
            }

            const choices = matches.map(match => {
                const letter = match.match(/\(([a-z])\)/)[1];
                const text = match.replace(/\([a-z]\)\s*/i, '').trim();
                return { letter, text };
            });

            const selectedChoice = this.wizardData.equipmentChoices[`choice_${index}`];

            return `
                <div class="equipment-choice-group">
                    <h4 style="color: var(--primary-color); margin-bottom: 10px;">Escolha ${index + 1}:</h4>
                    <div class="equipment-options">
                        ${choices.map(choice => `
                            <div class="equipment-option ${selectedChoice === choice.letter ? 'selected' : ''}" 
                                 data-choice-index="${index}" 
                                 data-choice-letter="${choice.letter}">
                                <span class="option-letter">(${choice.letter})</span>
                                <span class="option-text">${choice.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar equipamento do antecedente
        let backgroundEquipmentHtml = '';
        if (this.wizardData.background) {
            try {
                const bgEquipment = typeof this.wizardData.background.equipamento === 'string'
                    ? JSON.parse(this.wizardData.background.equipamento)
                    : this.wizardData.background.equipamento || [];
                
                if (Array.isArray(bgEquipment) && bgEquipment.length > 0) {
                    backgroundEquipmentHtml = `
                        <div class="background-equipment">
                            <h4 style="color: var(--secondary-color); margin: 20px 0 10px;">Equipamento do Antecedente:</h4>
                            <div class="equipment-list">
                                ${bgEquipment.map(item => `
                                    <div class="equipment-fixed-item">
                                        <span class="fixed-icon">✓</span>
                                        <span>${item}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Erro ao parsear equipamento do antecedente:', error);
            }
        }

        return `
            <div class="equipment-package-content">
                ${choicesHtml}
                ${backgroundEquipmentHtml}
            </div>
        `;
    }

    renderWealthMethod() {
        // Verificar se já rolou a riqueza inicial
        if (this.wizardData.startingWealth === 0) {
            const wealthFormula = this.wizardData.class.starting_wealth || '4d4 x 10 po';
            
            return `
                <div style="text-align: center; margin: 30px 0;">
                    <h4 style="color: var(--primary-color); margin-bottom: 15px;">Riqueza Inicial da Classe</h4>
                    <div class="wealth-display">
                        <div class="wealth-formula">${wealthFormula}</div>
                    </div>
                    <button class="upload-button" id="rollWealthBtn" style="margin-top: 20px;">
                        🎲 Rolar Riqueza Inicial
                    </button>
                    <p style="color: var(--text-color); font-size: 14px; margin-top: 15px;">
                        Você usará este dinheiro para comprar seus equipamentos
                    </p>
                </div>
            `;
        }

        // Mostrar loja de equipamentos
        return this.renderShop();
    }

    renderShop() {
        const categories = [
            { name: 'Armas', items: this.gameData.weapons || [], key: 'weapons' },
            { name: 'Armaduras', items: this.gameData.armors || [], key: 'armors' },
            { name: 'Equipamentos', items: this.gameData.equipment || [], key: 'equipment' }
        ];

        const categoriesHtml = categories.map(category => {
            if (category.items.length === 0) return '';

            const itemsHtml = category.items.map(item => {
                const custo = typeof item.custo === 'string' ? JSON.parse(item.custo) : item.custo;
                const custoText = `${custo.quantidade} ${custo.moeda}`;
                const isPurchased = this.wizardData.purchasedItems.some(p => p.id === item.id);

                return `
                    <div class="shop-item ${isPurchased ? 'purchased' : ''}" data-item-id="${item.id}" data-item-category="${category.key}">
                        <div class="shop-item-header">
                            <span class="shop-item-name">${item.nome}</span>
                            <span class="shop-item-cost">${custoText}</span>
                        </div>
                        ${item.dano ? `<div class="shop-item-detail">Dano: ${item.dano}</div>` : ''}
                        ${item.ca ? `<div class="shop-item-detail">CA: ${item.ca}</div>` : ''}
                        <button class="shop-item-btn ${isPurchased ? 'remove' : 'add'}">
                            ${isPurchased ? '✕ Remover' : '+ Adicionar'}
                        </button>
                    </div>
                `;
            }).join('');

            return `
                <div class="shop-category">
                    <h4 style="color: var(--primary-color); margin: 15px 0;">${category.name}</h4>
                    <div class="shop-items-grid">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="shop-content">
                <div class="shop-header">
                    <div class="wealth-info">
                        <span>💰 Dinheiro Disponível:</span>
                        <span class="wealth-amount">${this.wizardData.startingWealth} po</span>
                    </div>
                    <div class="purchased-count">
                        <span>Itens: ${this.wizardData.purchasedItems.length}</span>
                    </div>
                </div>
                ${categoriesHtml}
            </div>
        `;
    }

    setupEquipmentListeners() {
        // Toggle entre métodos
        document.querySelectorAll('.toggle-option').forEach(option => {
            option.addEventListener('click', () => {
                const newMethod = option.dataset.method;
                if (this.wizardData.equipmentMethod !== newMethod) {
                    this.wizardData.equipmentMethod = newMethod;
                    this.wizardData.equipmentChoices = {};
                    this.wizardData.startingWealth = 0;
                    this.wizardData.purchasedItems = [];
                    this.wizardData.equipment = [];
                    this.renderStep();
                }
            });
        });

        // Escolha de opções do pacote
        document.querySelectorAll('.equipment-option').forEach(option => {
            option.addEventListener('click', () => {
                const choiceIndex = option.dataset.choiceIndex;
                const choiceLetter = option.dataset.choiceLetter;
                
                this.wizardData.equipmentChoices[`choice_${choiceIndex}`] = choiceLetter;
                
                // Atualizar lista de equipamentos
                this.updateEquipmentFromChoices();
                
                this.renderStep();
                this.updateButtons();
            });
        });

        // Rolar riqueza inicial
        const rollWealthBtn = document.getElementById('rollWealthBtn');
        if (rollWealthBtn) {
            rollWealthBtn.addEventListener('click', () => {
                const formula = this.wizardData.class.starting_wealth || '4d4 x 10 po';
                const wealth = this.calculateStartingWealth(formula);
                this.wizardData.startingWealth = wealth;
                this.renderStep();
            });
        }

        // Comprar/remover itens da loja
        document.querySelectorAll('.shop-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemDiv = e.target.closest('.shop-item');
                const itemId = itemDiv.dataset.itemId;
                const category = itemDiv.dataset.itemCategory;
                
                const item = this.gameData[category].find(i => i.id === itemId);
                if (!item) return;

                const isPurchased = this.wizardData.purchasedItems.some(p => p.id === itemId);
                
                if (isPurchased) {
                    // Remover item
                    this.wizardData.purchasedItems = this.wizardData.purchasedItems.filter(p => p.id !== itemId);
                    const custo = typeof item.custo === 'string' ? JSON.parse(item.custo) : item.custo;
                    this.wizardData.startingWealth += this.convertToGold(custo);
                } else {
                    // Adicionar item
                    const custo = typeof item.custo === 'string' ? JSON.parse(item.custo) : item.custo;
                    const costInGold = this.convertToGold(custo);
                    
                    if (this.wizardData.startingWealth >= costInGold) {
                        this.wizardData.purchasedItems.push({
                            id: item.id,
                            nome: item.nome,
                            custo: custo
                        });
                        this.wizardData.startingWealth -= costInGold;
                    } else {
                        alert('💰 Dinheiro insuficiente!');
                        return;
                    }
                }

                this.updateEquipmentFromPurchases();
                this.renderStep();
                this.updateButtons();
            });
        });
    }

    calculateStartingWealth(formula) {
        // Ex: "5d4 x 10 po" ou "5d4 po"
        const match = formula.match(/(\d+)d(\d+)(?:\s*x\s*(\d+))?/i);
        if (!match) return 100; // Fallback

        const numDice = parseInt(match[1]);
        const diceSize = parseInt(match[2]);
        const multiplier = match[3] ? parseInt(match[3]) : 1;

        let total = 0;
        for (let i = 0; i < numDice; i++) {
            total += Math.floor(Math.random() * diceSize) + 1;
        }

        return total * multiplier;
    }

    convertToGold(custo) {
        // Converter diferentes moedas para ouro
        const conversions = {
            'po': 1,     // Peça de ouro
            'pp': 0.1,   // Peça de prata = 0.1 po
            'pc': 0.01,  // Peça de cobre = 0.01 po
            'pe': 0.5,   // Peça de electro = 0.5 po
            'pl': 10     // Peça de platina = 10 po
        };

        const moeda = custo.moeda.toLowerCase();
        const quantidade = custo.quantidade;

        return quantidade * (conversions[moeda] || 1);
    }

    updateEquipmentFromChoices() {
        // Montar lista de equipamentos baseada nas escolhas
        const equipment = [];
        
        // Adicionar escolhas do pacote da classe
        Object.entries(this.wizardData.equipmentChoices).forEach(([key, choice]) => {
            equipment.push(`Escolha ${key}: Opção (${choice})`);
        });

        // Adicionar equipamento do antecedente
        if (this.wizardData.background) {
            try {
                const bgEquipment = typeof this.wizardData.background.equipamento === 'string'
                    ? JSON.parse(this.wizardData.background.equipamento)
                    : this.wizardData.background.equipamento || [];
                
                equipment.push(...bgEquipment);
            } catch (error) {
                console.error('Erro ao adicionar equipamento do antecedente:', error);
            }
        }

        this.wizardData.equipment = equipment;
    }

    updateEquipmentFromPurchases() {
        this.wizardData.equipment = this.wizardData.purchasedItems.map(item => item.nome);
    }

    // ETAPA 7: Nível + Imagem
    renderFinalStep() {
        this.contentArea.innerHTML = `
            <div class="step-content">
                <h3 class="step-title">Finalização</h3>
                <p class="step-description">Nível inicial e imagem (opcional)</p>
                
                <div class="level-selector">
                    <h4 style="color: var(--primary-color);">Nível Inicial</h4>
                    <div class="level-display">${this.wizardData.level}</div>
                    <div class="level-slider">
                        <input type="range" id="levelSlider" min="1" max="20" value="${this.wizardData.level}">
                    </div>
                </div>
                
                <div class="image-upload-area">
                    <h4 style="color: var(--primary-color); margin-bottom: 15px;">Imagem (Opcional)</h4>
                    <div class="image-preview" id="imagePreview">
                        ${this.wizardData.image ? 
                            `<img src="${this.wizardData.image}" alt="Personagem">` :
                            '<div class="image-preview-placeholder">📷</div>'
                        }
                    </div>
                    <input type="file" id="imageUpload" accept="image/*" style="display: none;">
                    <button class="upload-button" id="uploadBtn">Adicionar Imagem</button>
                    <button class="upload-button secondary" id="skipImageBtn">Pular</button>
                </div>
            </div>
        `;
        
        const levelSlider = document.getElementById('levelSlider');
        if (levelSlider) {
            levelSlider.addEventListener('input', (e) => {
                this.wizardData.level = parseInt(e.target.value);
                document.querySelector('.level-display').textContent = this.wizardData.level;
            });
        }

        const uploadBtn = document.getElementById('uploadBtn');
        const imageUpload = document.getElementById('imageUpload');
        
        if (uploadBtn && imageUpload) {
            uploadBtn.addEventListener('click', () => imageUpload.click());
            
            imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.wizardData.image = event.target.result;
                        this.renderStep();
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    async finalizeCharacter() {
        try {
            console.log('💾 Finalizando personagem...');
            console.log('📊 Wizard Data:', this.wizardData);
            
            // Verificar se já existe um personagem carregado
            if (!this.characterSheet.characterId) {
                throw new Error('Nenhum personagem carregado para atualizar!');
            }

            const hitDie = this.getHitDieValue(this.wizardData.class.hit_die);
            const conMod = Math.floor((this.wizardData.attributes.con - 10) / 2);
            const maxHP = hitDie + conMod + ((this.wizardData.level - 1) * (Math.floor(hitDie / 2) + 1 + conMod));
            const dexMod = Math.floor((this.wizardData.attributes.dex - 10) / 2);
            const baseAC = 10 + dexMod;

            // Parsear saving_throws da classe
            const savingThrows = typeof this.wizardData.class?.saving_throws === 'string' 
                ? JSON.parse(this.wizardData.class.saving_throws) 
                : this.wizardData.class?.saving_throws || [];

            console.log('🔍 DEBUG - Salvaguardas:', {
                raw: this.wizardData.class?.saving_throws,
                parsed: savingThrows
            });

            console.log('🔍 DEBUG - Perícias:', {
                skills: this.wizardData.skills
            });

            console.log('🔍 DEBUG - Dado de Vida:', {
                hitDie: this.wizardData.class?.hit_die,
                calculated: this.getHitDieValue(this.wizardData.class.hit_die)
            });

            const characterData = {
                name: this.wizardData.name,
                race: this.wizardData.race?.name_pt || this.wizardData.race?.name || null,
                character_class: this.wizardData.class?.name_pt || this.wizardData.class?.name || null,
                background: this.wizardData.background?.nome || this.wizardData.background?.name || null,
                alignment: this.wizardData.alignment,
                level: this.wizardData.level,
                strength: this.wizardData.attributes.str,
                dexterity: this.wizardData.attributes.dex,
                constitution: this.wizardData.attributes.con,
                intelligence: this.wizardData.attributes.int,
                wisdom: this.wizardData.attributes.wis,
                charisma: this.wizardData.attributes.cha,
                hit_points_max: maxHP,
                hit_points_current: maxHP,
                armor_class: baseAC,
                speed: parseInt(this.wizardData.race?.speed) || 30,
                proficiency_bonus: Math.ceil(this.wizardData.level / 4) + 1,
                saving_throws: savingThrows,
                skills: this.wizardData.skills || [],
                equipment: this.wizardData.equipment || [],
                updated_at: new Date().toISOString()
            };

            console.log('📦 Atualizando personagem ID:', this.characterSheet.characterId);
            console.log('� Character Data:', characterData);

            const { error } = await supabase
                .from('characters')
                .update(characterData)
                .eq('id', this.characterSheet.characterId);

            if (error) {
                console.error('❌ Erro ao atualizar:', error);
                throw error;
            }

            console.log('✅ Personagem atualizado com sucesso!');

            // Atualizar objeto character na memória
            this.characterSheet.character = {
                ...this.characterSheet.character,
                name: this.wizardData.name,
                race: this.wizardData.race?.name_pt || this.wizardData.race?.name,
                character_class: this.wizardData.class?.name_pt || this.wizardData.class?.name,
                background: this.wizardData.background?.nome || this.wizardData.background?.name,
                alignment: this.wizardData.alignment,
                level: this.wizardData.level,
                strength: this.wizardData.attributes.str,
                dexterity: this.wizardData.attributes.dex,
                constitution: this.wizardData.attributes.con,
                intelligence: this.wizardData.attributes.int,
                wisdom: this.wizardData.attributes.wis,
                charisma: this.wizardData.attributes.cha,
                hit_points_max: maxHP,
                hit_points_current: maxHP,
                armor_class: baseAC,
                speed: parseInt(this.wizardData.race?.speed) || 30,
                skills: this.wizardData.skills || [],
                saving_throws: savingThrows,
                equipment: this.wizardData.equipment || []
            };

            // Fechar modal
            this.hideModal();

            // Recarregar e preencher a ficha com os dados atualizados
            await this.characterSheet.loadCharacter();
            this.characterSheet.populateSheet();
            this.characterSheet.calculateAll();

            // Mostrar mensagem de sucesso
            alert('✅ Ficha preenchida com sucesso!');

        } catch (error) {
            console.error('❌ Erro ao finalizar personagem:', error);
            console.error('❌ Stack:', error.stack);
            alert(`Erro ao criar personagem: ${error.message || 'Tente novamente.'}`);
        }
    }

    getHitDieValue(hitDie) {
        // Se já for um número, retornar direto
        if (typeof hitDie === 'number') return hitDie;
        
        // Se for string, fazer parse
        if (typeof hitDie === 'string') {
            const match = hitDie.match(/d(\d+)/);
            return match ? parseInt(match[1]) : 8;
        }
        
        // Fallback
        return 8;
    }

    markProficientSkills() {
        this.wizardData.skills.forEach(skillName => {
            const skillKey = skillName.replace(/\s+/g, '_');
            const profCheckbox = document.getElementById(`${skillKey}-prof`);
            if (profCheckbox) {
                profCheckbox.checked = true;
            }
        });

        if (this.wizardData.class) {
            const savingThrows = this.wizardData.class.saving_throw_proficiencies || [];
            savingThrows.forEach(save => {
                const saveCheckbox = document.getElementById(`${save}-save-prof`);
                if (saveCheckbox) {
                    saveCheckbox.checked = true;
                }
            });
        }

        this.characterSheet.calculateAll();
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const characterSheet = new CharacterSheet();
    
    // Se está em modo de criação, iniciar wizard
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true' || !params.get('id')) {
        setTimeout(() => {
            new CharacterCreationWizard(characterSheet);
        }, 500);
    }
});



