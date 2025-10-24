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
        this.init();
    }

    getCharacterIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async init() {
        await this.checkAuth();
        
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

    async initCreationMode() {
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

        // Carregar dados dos JSONs
        await this.loadGameData();
        
        // Setup event listeners dos modais
        this.setupCreationListeners();
    }

    async loadGameData() {
        try {
            console.log('🔄 Carregando dados do Supabase...');
            
            // Carregar dados do Supabase (tabelas com prefixo game_)
            const [racesResult, classesResult, backgroundsResult] = await Promise.all([
                supabase.from('game_races').select('*'),
                supabase.from('game_classes').select('*'),
                supabase.from('game_backgrounds').select('*')
            ]);

            console.log('📦 Resultados:', { racesResult, classesResult, backgroundsResult });

            if (racesResult.error) {
                console.error('❌ Erro em races:', racesResult.error);
                throw racesResult.error;
            }
            if (classesResult.error) {
                console.error('❌ Erro em classes:', classesResult.error);
                throw classesResult.error;
            }
            if (backgroundsResult.error) {
                console.error('❌ Erro em backgrounds:', backgroundsResult.error);
                throw backgroundsResult.error;
            }

            this.races = racesResult.data || [];
            this.classes = classesResult.data || [];
            this.backgrounds = backgroundsResult.data || [];
            
            // Alinhamentos são fixos (não vêm do banco)
            this.alignments = [
                { id: 'leal-bom', name: 'Leal e Bom', icon: '⚖️✨', description: 'Honra e compaixão' },
                { id: 'neutro-bom', name: 'Neutro e Bom', icon: '🕊️', description: 'Bondade equilibrada' },
                { id: 'caotico-bom', name: 'Caótico e Bom', icon: '🦋', description: 'Liberdade benevolente' },
                { id: 'leal-neutro', name: 'Leal e Neutro', icon: '⚖️', description: 'Ordem e tradição' },
                { id: 'neutro', name: 'Neutro', icon: '⚖️⚪', description: 'Equilíbrio perfeito' },
                { id: 'caotico-neutro', name: 'Caótico e Neutro', icon: '🎲', description: 'Liberdade individual' },
                { id: 'leal-mau', name: 'Leal e Mau', icon: '⚖️👿', description: 'Tirania organizada' },
                { id: 'neutro-mau', name: 'Neutro e Mau', icon: '💀', description: 'Egoísmo puro' },
                { id: 'caotico-mau', name: 'Caótico e Mau', icon: '🔥', description: 'Destruição caótica' }
            ];

            console.log('✅ Dados carregados com sucesso:', {
                races: this.races.length,
                classes: this.classes.length,
                backgrounds: this.backgrounds.length
            });

            // Se não tiver dados, avisar
            if (this.races.length === 0 || this.classes.length === 0 || this.backgrounds.length === 0) {
                console.warn('⚠️ Algumas tabelas estão vazias no banco de dados!');
            }
        } catch (error) {
            console.error('❌ ERRO FATAL ao carregar dados:', error);
            alert(`Erro ao carregar dados do jogo: ${error.message}\n\nVerifique se as tabelas races, classes e backgrounds existem no Supabase.`);
        }
    }

    setupCreationListeners() {
        // Abrir modais
        document.getElementById('raceBox')?.addEventListener('click', () => this.openRaceModal());
        document.getElementById('classBox')?.addEventListener('click', () => this.openClassModal());
        document.getElementById('backgroundBox')?.addEventListener('click', () => this.openBackgroundModal());
        document.getElementById('alignmentBox')?.addEventListener('click', () => this.openAlignmentModal());

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

        // Botão voltar
        document.getElementById('backBtn')?.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }

    openRaceModal() {
        const modal = document.getElementById('raceModal');
        const grid = document.getElementById('raceGrid');
        
        grid.innerHTML = '';
        
        if (!this.races || this.races.length === 0) {
            grid.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Nenhuma raça disponível. Verifique o banco de dados.</p>';
            modal.classList.add('active');
            return;
        }
        
        this.races.forEach(race => {
            const card = document.createElement('div');
            card.className = 'modal-card';
            if (this.character.race?.id === race.id) card.classList.add('selected');
            
            // Aceita tanto 'name' quanto 'nome'
            const raceName = race.name || race.nome || 'Sem Nome';
            const raceDesc = race.description || race.descricao || '';
            const raceIcon = race.icon || race.icone || '🧙';
            
            // Mostrar bônus de atributos se existir
            let bonusText = '';
            const bonuses = race.ability_bonuses || race.aumentoAtributos;
            if (bonuses) {
                const bonusArray = Object.entries(bonuses)
                    .filter(([key, val]) => val > 0)
                    .map(([key, val]) => {
                        // Mapear nomes de atributos em português para inglês
                        const attrMap = {
                            'for': 'FOR', 'des': 'DES', 'con': 'CON',
                            'int': 'INT', 'sab': 'SAB', 'car': 'CAR',
                            'str': 'FOR', 'dex': 'DES', 'wis': 'SAB', 'cha': 'CAR'
                        };
                        const attrName = attrMap[key.toLowerCase()] || key.toUpperCase();
                        return `${attrName} +${val}`;
                    })
                    .join(', ');
                if (bonusArray) {
                    bonusText = `<p><strong>${bonusArray}</strong></p>`;
                }
            }
            
            card.innerHTML = `
                <div class="card-icon">${raceIcon}</div>
                <h3>${raceName}</h3>
                ${bonusText}
                <p>${raceDesc.substring(0, 100)}${raceDesc.length > 100 ? '...' : ''}</p>
            `;
            
            card.addEventListener('click', () => this.selectRace(race));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    openClassModal() {
        const modal = document.getElementById('classModal');
        const grid = document.getElementById('classGrid');
        
        grid.innerHTML = '';
        
        if (!this.classes || this.classes.length === 0) {
            grid.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Nenhuma classe disponível. Verifique o banco de dados.</p>';
            modal.classList.add('active');
            return;
        }
        
        this.classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'modal-card';
            if (this.character.class?.id === cls.id) card.classList.add('selected');
            
            // Aceita tanto campos em inglês quanto em português
            const className = cls.name || cls.nome || 'Sem Nome';
            const classDesc = cls.description || cls.descricao || '';
            const classIcon = cls.icon || cls.icone || '⚔️';
            const hitDie = cls.hit_die || cls.hitDice || cls.dado_vida || '?';
            const primaryAbility = cls.primary_ability || cls.habilidade_primaria || 'Variável';
            
            // Extrair apenas o número do dado de vida (ex: "1d8" -> "8")
            const dieNumber = hitDie.toString().replace(/\D/g, '');
            
            card.innerHTML = `
                <div class="card-icon">${classIcon}</div>
                <h3>${className}</h3>
                <p><strong>Dado de Vida:</strong> d${dieNumber}</p>
                <p><strong>Habilidade:</strong> ${primaryAbility}</p>
                <p>${classDesc.substring(0, 80)}${classDesc.length > 80 ? '...' : ''}</p>
            `;
            
            card.addEventListener('click', () => this.selectClass(cls));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    openBackgroundModal() {
        const modal = document.getElementById('backgroundModal');
        const grid = document.getElementById('backgroundGrid');
        
        grid.innerHTML = '';
        
        if (!this.backgrounds || this.backgrounds.length === 0) {
            grid.innerHTML = '<p style="color: white; text-align: center; padding: 2rem;">Nenhum antecedente disponível. Verifique o banco de dados.</p>';
            modal.classList.add('active');
            return;
        }
        
        this.backgrounds.forEach(bg => {
            const card = document.createElement('div');
            card.className = 'modal-card';
            if (this.character.background?.id === bg.id) card.classList.add('selected');
            
            // Aceita tanto campos em inglês quanto em português
            const bgName = bg.name || bg.nome || 'Sem Nome';
            const bgDesc = bg.description || bg.descricao || '';
            const bgIcon = bg.icon || bg.icone || '📜';
            
            card.innerHTML = `
                <div class="card-icon">${bgIcon}</div>
                <h3>${bgName}</h3>
                <p>${bgDesc.substring(0, 120)}${bgDesc.length > 120 ? '...' : ''}</p>
            `;
            
            card.addEventListener('click', () => this.selectBackground(bg));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    openAlignmentModal() {
        const modal = document.getElementById('alignmentModal');
        const grid = document.getElementById('alignmentGrid');
        
        grid.innerHTML = '';
        
        this.alignments.forEach(align => {
            const card = document.createElement('div');
            card.className = 'alignment-card';
            if (this.character.alignment?.id === align.id) card.classList.add('selected');
            
            card.innerHTML = `
                <div class="card-icon">${align.icon}</div>
                <h4>${align.name}</h4>
                <p>${align.description}</p>
            `;
            
            card.addEventListener('click', () => this.selectAlignment(align));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    selectRace(race) {
        this.character.race = race;
        const raceName = race.name || race.nome || 'Raça Selecionada';
        document.getElementById('charRaceDisplay').textContent = raceName;
        document.getElementById('raceModal').classList.remove('active');
        this.saveCreationProgress();
    }

    selectClass(cls) {
        this.character.class = cls;
        const className = cls.name || cls.nome || 'Classe Selecionada';
        document.getElementById('charClassDisplay').textContent = `${className} - Nível ${this.character.level}`;
        document.getElementById('classModal').classList.remove('active');
        this.saveCreationProgress();
    }

    selectBackground(bg) {
        this.character.background = bg;
        const bgName = bg.name || bg.nome || 'Antecedente Selecionado';
        document.getElementById('charBackgroundDisplay').textContent = bgName;
        document.getElementById('backgroundModal').classList.remove('active');
        this.saveCreationProgress();
    }

    selectAlignment(align) {
        this.character.alignment = align;
        document.getElementById('charAlignmentDisplay').textContent = align.name;
        document.getElementById('alignmentModal').classList.remove('active');
        this.saveCreationProgress();
    }

    saveCreationProgress() {
        // Salvar no localStorage temporariamente
        localStorage.setItem('character_creation', JSON.stringify(this.character));
        console.log('Progresso salvo:', this.character);
    }

    async checkAuth() {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            alert('Você precisa estar logado para visualizar este personagem!');
            window.location.href = 'login.html';
            return;
        }
        
        this.currentUser = user;
    }

    async loadCharacter() {
        try {
            const { data, error } = await supabase
                .from('characters')
                .select('*')
                .eq('id', this.characterId)
                .single();

            if (error) throw error;

            if (!data) {
                alert('Personagem não encontrado!');
                window.location.href = 'dashboard.html';
                return;
            }

            // Verificar se o personagem pertence ao usuário
            if (data.user_id !== this.currentUser.id) {
                alert('Você não tem permissão para visualizar este personagem!');
                window.location.href = 'dashboard.html';
                return;
            }

            // Converter dados do Supabase para o formato esperado
            this.character = {
                id: data.id,
                name: data.name,
                image: data.avatar_url,
                class: data.character_class,
                race: data.race,
                background: data.background,
                alignment: data.alignment,
                level: data.level,
                hp: data.hit_points_max,
                hpCurrent: data.hit_points_current,
                attributes: {
                    str: data.strength,
                    dex: data.dexterity,
                    con: data.constitution,
                    int: data.intelligence,
                    wis: data.wisdom,
                    cha: data.charisma
                },
                skills: data.skills?.proficient || [],
                languages: data.custom_fields?.languages || [],
                proficiencies: data.custom_fields?.proficiencies || [],
                subrace: data.custom_fields?.subrace,
                subclass: data.custom_fields?.subclass,
                appearance: data.custom_fields?.appearance || {},
                personality: {
                    traits: data.personality_traits || '',
                    ideals: data.ideals || '',
                    bonds: data.bonds || '',
                    flaws: data.flaws || ''
                }
            };

            console.log('✅ Personagem carregado do Supabase:', this.character);
        } catch (error) {
            console.error('❌ Erro ao carregar personagem:', error);
            alert('Erro ao carregar o personagem!');
            window.location.href = 'dashboard.html';
        }
    }

    populateSheet() {
        // Header information
        document.getElementById('charName').value = this.character.name || '';
        document.getElementById('charClass').value = `${this.getClassName()} Nível ${this.character.level}`;
        document.getElementById('charBackground').value = this.getBackgroundName();
        document.getElementById('charRace').value = this.getRaceName();
        document.getElementById('charAlignment').value = this.formatAlignment(this.character.alignment);

        // Attributes
        Object.keys(this.character.attributes).forEach(attr => {
            const value = this.character.attributes[attr];
            document.getElementById(`${attr}Value`).value = value;
            
            // Calculate and display modifier
            const modifier = Math.floor((value - 10) / 2);
            document.getElementById(`${attr}Mod`).textContent = modifier >= 0 ? `+${modifier}` : modifier;
        });

        // HP
        document.getElementById('hpMax').value = this.character.hp;
        document.getElementById('hpCurrent').value = this.character.hp;

        // Hit Dice
        const hitDice = this.getHitDice();
        document.getElementById('hitDiceTotal').value = `${this.character.level}${hitDice}`;
        document.getElementById('hitDiceCurrent').value = `${this.character.level}${hitDice}`;

        // Skills - mark proficient skills
        if (this.character.skills && this.character.skills.length > 0) {
            const skillMapping = {
                'acrobatics': 'skillAcrobatics',
                'animal-handling': 'skillAnimalHandling',
                'arcana': 'skillArcana',
                'athletics': 'skillAthletics',
                'deception': 'skillDeception',
                'history': 'skillHistory',
                'insight': 'skillInsight',
                'intimidation': 'skillIntimidation',
                'investigation': 'skillInvestigation',
                'medicine': 'skillMedicine',
                'nature': 'skillNature',
                'perception': 'skillPerception',
                'performance': 'skillPerformance',
                'persuasion': 'skillPersuasion',
                'religion': 'skillReligion',
                'sleight-of-hand': 'skillSleightOfHand',
                'stealth': 'skillStealth',
                'survival': 'skillSurvival'
            };

            this.character.skills.forEach(skill => {
                const elementId = skillMapping[skill];
                if (elementId) {
                    document.getElementById(elementId).checked = true;
                }
            });
        }

        // Languages and proficiencies
        let languagesText = '';
        if (this.character.languages && this.character.languages.length > 0) {
            languagesText += 'Idiomas: ' + this.character.languages.join(', ') + '\n\n';
        }
        if (this.character.proficiencies && this.character.proficiencies.length > 0) {
            languagesText += 'Proficiências: ' + this.character.proficiencies.join(', ');
        }
        document.getElementById('languages').value = languagesText;

        // Personality
        if (this.character.personality) {
            document.getElementById('personalityTraits').value = this.character.personality.traits || '';
            document.getElementById('ideals').value = this.character.personality.ideals || '';
            document.getElementById('bonds').value = this.character.personality.bonds || '';
            document.getElementById('flaws').value = this.character.personality.flaws || '';
        }

        // Appearance (Page 2)
        if (this.character.appearance) {
            document.getElementById('age').value = this.character.appearance.age || '';
            document.getElementById('height').value = this.character.appearance.height || '';
            document.getElementById('weight').value = this.character.appearance.weight || '';
            document.getElementById('eyes').value = this.character.appearance.eyes || '';
            document.getElementById('skin').value = this.character.appearance.skin || '';
            document.getElementById('hair').value = this.character.appearance.hair || '';
        }

        // Character Image
        if (this.character.image) {
            document.getElementById('charImage').src = this.character.image;
            document.getElementById('charImage').style.display = 'block';
        }

        // Speed
        document.getElementById('speed').textContent = '9m'; // Default, can be modified by race
    }

    calculateAll() {
        this.calculateProficiencyBonus();
        this.calculateSavingThrows();
        this.calculateSkills();
        this.calculatePassivePerception();
        this.calculateArmorClass();
        this.calculateInitiative();
    }

    calculateProficiencyBonus() {
        const level = this.character.level;
        const profBonus = Math.ceil(level / 4) + 1;
        document.getElementById('profBonus').textContent = `+${profBonus}`;
        return profBonus;
    }

    calculateSavingThrows() {
        const profBonus = this.calculateProficiencyBonus();
        const savingThrows = this.getProficientSaves();

        const attributes = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        attributes.forEach(attr => {
            const attrValue = this.character.attributes[attr];
            const modifier = Math.floor((attrValue - 10) / 2);
            const isProficient = savingThrows.includes(attr);
            
            if (isProficient) {
                document.getElementById(`save${this.capitalize(attr)}`).checked = true;
            }

            const totalMod = modifier + (isProficient ? profBonus : 0);
            const modText = totalMod >= 0 ? `+${totalMod}` : totalMod;
            document.getElementById(`save${this.capitalize(attr)}Mod`).textContent = modText;
        });
    }

    calculateSkills() {
        const profBonus = this.calculateProficiencyBonus();
        
        const skillsData = [
            { id: 'Acrobatics', ability: 'dex' },
            { id: 'AnimalHandling', ability: 'wis' },
            { id: 'Arcana', ability: 'int' },
            { id: 'Athletics', ability: 'str' },
            { id: 'Deception', ability: 'cha' },
            { id: 'History', ability: 'int' },
            { id: 'Insight', ability: 'wis' },
            { id: 'Intimidation', ability: 'cha' },
            { id: 'Investigation', ability: 'int' },
            { id: 'Medicine', ability: 'wis' },
            { id: 'Nature', ability: 'int' },
            { id: 'Perception', ability: 'wis' },
            { id: 'Performance', ability: 'cha' },
            { id: 'Persuasion', ability: 'cha' },
            { id: 'Religion', ability: 'int' },
            { id: 'SleightOfHand', ability: 'dex' },
            { id: 'Stealth', ability: 'dex' },
            { id: 'Survival', ability: 'wis' }
        ];

        skillsData.forEach(skill => {
            const checkbox = document.getElementById(`skill${skill.id}`);
            const modSpan = checkbox.nextElementSibling;
            
            const attrValue = this.character.attributes[skill.ability];
            const modifier = Math.floor((attrValue - 10) / 2);
            const isProficient = checkbox.checked;
            
            const totalMod = modifier + (isProficient ? profBonus : 0);
            const modText = totalMod >= 0 ? `+${totalMod}` : totalMod;
            modSpan.textContent = modText;
        });
    }

    calculatePassivePerception() {
        const wisValue = this.character.attributes.wis;
        const wisMod = Math.floor((wisValue - 10) / 2);
        const profBonus = this.calculateProficiencyBonus();
        const isPerceptionProficient = document.getElementById('skillPerception').checked;
        
        const passivePerception = 10 + wisMod + (isPerceptionProficient ? profBonus : 0);
        document.getElementById('passivePerception').textContent = passivePerception;
    }

    calculateArmorClass() {
        // Base AC = 10 + DEX modifier
        // This is a simplified calculation - in a full implementation,
        // would need to account for armor, shields, etc.
        const dexValue = this.character.attributes.dex;
        const dexMod = Math.floor((dexValue - 10) / 2);
        const ac = 10 + dexMod;
        
        document.getElementById('armorClass').textContent = ac;
    }

    calculateInitiative() {
        const dexValue = this.character.attributes.dex;
        const dexMod = Math.floor((dexValue - 10) / 2);
        const initiative = dexMod >= 0 ? `+${dexMod}` : dexMod;
        
        document.getElementById('initiative').textContent = initiative;
    }

    // Helper methods to get class/race/background names
    getClassName() {
        if (!this.character.class) return 'Classe não definida';
        
        // Se for objeto, retorna o nome
        if (typeof this.character.class === 'object') {
            return this.character.class.name || this.character.class.nome || 'Classe não definida';
        }
        
        // Se for string, usa o mapeamento
        const classMap = {
            'barbaro': 'Bárbaro',
            'bardo': 'Bardo',
            'bruxo': 'Bruxo',
            'clerigo': 'Clérigo',
            'druida': 'Druida',
            'feiticeiro': 'Feiticeiro',
            'guerreiro': 'Guerreiro',
            'ladino': 'Ladino',
            'mago': 'Mago',
            'monge': 'Monge',
            'paladino': 'Paladino',
            'patrulheiro': 'Patrulheiro',
            'artifice': 'Artífice'
        };
        return classMap[this.character.class] || this.character.class;
    }

    getBackgroundName() {
        if (!this.character.background) return 'Antecedente não definido';
        
        // Se for objeto, retorna o nome
        if (typeof this.character.background === 'object') {
            return this.character.background.name || this.character.background.nome || 'Antecedente não definido';
        }
        
        // Se for string, usa o mapeamento
        const bgMap = {
            'acolito': 'Acólito',
            'artesao-guilda': 'Artesão de Guilda',
            'artista': 'Artista',
            'charlatao': 'Charlatão',
            'criminoso': 'Criminoso',
            'eremita': 'Eremita',
            'forasteiro': 'Forasteiro',
            'heroi-povo': 'Herói do Povo',
            'marinheiro': 'Marinheiro',
            'nobre': 'Nobre',
            'orfao': 'Órfão',
            'sabio': 'Sábio',
            'soldado': 'Soldado'
        };
        return bgMap[this.character.background] || this.character.background;
    }

    getRaceName() {
        if (!this.character.race) return 'Raça não definida';
        
        // Se for objeto, retorna o nome
        if (typeof this.character.race === 'object') {
            const raceName = this.character.race.name || this.character.race.nome || 'Raça não definida';
            if (this.character.subrace) {
                return `${raceName} (${this.character.subrace})`;
            }
            return raceName;
        }
        
        // Se for string, retorna direto
        let raceName = this.character.race || '';
        if (this.character.subrace) {
            raceName += ` (${this.character.subrace})`;
        }
        return raceName;
    }

    formatAlignment(alignment) {
        const alignmentMap = {
            'leal-bom': 'Leal e Bom',
            'neutro-bom': 'Neutro e Bom',
            'caotico-bom': 'Caótico e Bom',
            'leal-neutro': 'Leal e Neutro',
            'neutro': 'Neutro',
            'caotico-neutro': 'Caótico e Neutro',
            'leal-mau': 'Leal e Mau',
            'neutro-mau': 'Neutro e Mau',
            'caotico-mau': 'Caótico e Mau'
        };
        return alignmentMap[alignment] || alignment;
    }

    getHitDice() {
        // Map class to hit dice
        const hitDiceMap = {
            'barbaro': 'd12',
            'bardo': 'd8',
            'bruxo': 'd8',
            'clerigo': 'd8',
            'druida': 'd8',
            'feiticeiro': 'd6',
            'guerreiro': 'd10',
            'ladino': 'd8',
            'mago': 'd6',
            'monge': 'd8',
            'paladino': 'd10',
            'patrulheiro': 'd10',
            'artifice': 'd8'
        };
        return hitDiceMap[this.character.class] || 'd8';
    }

    getProficientSaves() {
        // Map class to proficient saving throws
        const savesMap = {
            'barbaro': ['str', 'con'],
            'bardo': ['dex', 'cha'],
            'bruxo': ['wis', 'cha'],
            'clerigo': ['wis', 'cha'],
            'druida': ['int', 'wis'],
            'feiticeiro': ['con', 'cha'],
            'guerreiro': ['str', 'con'],
            'ladino': ['dex', 'int'],
            'mago': ['int', 'wis'],
            'monge': ['str', 'dex'],
            'paladino': ['wis', 'cha'],
            'patrulheiro': ['str', 'dex'],
            'artifice': ['con', 'int']
        };
        return savesMap[this.character.class] || [];
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    setupEventListeners() {
        // Print button
        document.getElementById('printBtn').addEventListener('click', () => {
            window.print();
        });

        // Edit button
        document.getElementById('editBtn').addEventListener('click', () => {
            this.toggleEditMode();
        });

        // Delete button
        document.getElementById('deleteBtn').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este personagem? Esta ação não pode ser desfeita.')) {
                this.deleteCharacter();
            }
        });

        // Back button
        document.getElementById('backBtn').addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });

        // Auto-save on input changes
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!input.readOnly && !input.disabled) {
                input.addEventListener('change', () => this.saveCharacter());
            }
        });

        // Skill checkboxes - recalculate on change
        document.querySelectorAll('.skill-item input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculateSkills();
                this.calculatePassivePerception();
                this.saveCharacter();
            });
        });
    }

    toggleEditMode() {
        const isEditing = document.body.classList.toggle('edit-mode');
        
        const readonlyFields = document.querySelectorAll('input[readonly], textarea[readonly]');
        readonlyFields.forEach(field => {
            if (isEditing) {
                field.removeAttribute('readonly');
                field.classList.add('editable');
            } else {
                field.setAttribute('readonly', true);
                field.classList.remove('editable');
            }
        });

        const editBtn = document.getElementById('editBtn');
        editBtn.textContent = isEditing ? '💾 Salvar' : '✏️ Editar';
        
        if (!isEditing) {
            this.saveCharacter();
        }
    }

    async saveCharacter() {
        try {
            // Atualizar dados do personagem
            const updates = {
                name: document.getElementById('charName').value,
                hit_points_max: parseInt(document.getElementById('hpMax').value) || this.character.hp,
                hit_points_current: parseInt(document.getElementById('hpCurrent').value) || this.character.hp,
                
                // Atualizar aparência se houver mudanças
                custom_fields: {
                    ...this.character.custom_fields,
                    appearance: {
                        age: document.getElementById('age').value,
                        height: document.getElementById('height').value,
                        weight: document.getElementById('weight').value,
                        eyes: document.getElementById('eyes').value,
                        skin: document.getElementById('skin').value,
                        hair: document.getElementById('hair').value
                    }
                },
                
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('characters')
                .update(updates)
                .eq('id', this.characterId);

            if (error) throw error;

            console.log('✅ Personagem salvo no Supabase');
            
        } catch (error) {
            console.error('❌ Erro ao salvar personagem:', error);
            alert('Erro ao salvar as alterações.');
        }
    }

    async deleteCharacter() {
        try {
            const { error } = await supabase
                .from('characters')
                .delete()
                .eq('id', this.characterId);

            if (error) throw error;

            console.log('✅ Personagem excluído do Supabase');
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            console.error('❌ Erro ao excluir personagem:', error);
            alert('Erro ao excluir o personagem.');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new CharacterSheet();
});
