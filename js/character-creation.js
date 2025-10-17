// Supabase Configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm';

const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Teste de conexão
console.log('🔌 Testando conexão com Supabase...');
console.log('🌐 URL:', SUPABASE_URL);
console.log('🔑 Key configurada:', SUPABASE_ANON_KEY ? 'Sim ✅' : 'Não ❌');

// Character Creation Manager
class CharacterCreation {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 8;
        this.character = this.loadProgress() || this.initCharacter();
        this.currentUser = null;
        this.data = {
            races: [],
            classes: [],
            backgrounds: [],
            alignments: [],
            languages: [],
            feats: []
        };
        
        this.init();
    }

    initCharacter() {
        return {
            race: null,
            subrace: null,
            class: null,
            subclass: null,
            level: 1,
            alignment: null,
            background: null,
            name: '',
            image: null,
            appearance: {
                eyes: '',
                skin: '',
                hair: '',
                weight: '',
                height: '',
                age: ''
            },
            attributes: {
                str: 10,
                dex: 10,
                con: 10,
                int: 10,
                wis: 10,
                cha: 10
            },
            skills: [],
            hp: 0,
            hpMethod: 'average',
            languages: [],
            proficiencies: [],
            personality: {
                traits: '',
                ideals: '',
                bonds: '',
                flaws: ''
            }
        };
    }

    async init() {
        // Verificar autenticação
        await this.checkAuth();
        
        // Mostrar loading
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loadingOverlay);
        
        await this.loadData();
        
        // Remover loading
        loadingOverlay.remove();
        
        this.setupEventListeners();
        this.populateStep1();
        this.updateProgressBar();
    }

    async checkAuth() {
        console.log('🔐 Verificando autenticação...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        console.log('👤 Usuário:', user);
        console.log('❌ Erro de auth:', error);
        
        if (!user) {
            console.warn('⚠️ Usuário não autenticado! Redirecionando...');
            alert('Você precisa estar logado para criar um personagem!');
            window.location.href = 'login.html';
            return;
        }
        
        this.currentUser = user;
        console.log('✅ Usuário autenticado:', user.email);
    }

    async loadData() {
        try {
            console.log('📥 Iniciando carregamento de dados do Supabase...');
            
            // Carregar dados do Supabase em vez de arquivos JSON
            const [
                { data: races, error: racesError },
                { data: classes, error: classesError },
                { data: backgrounds, error: backgroundsError },
                { data: alignments, error: alignmentsError },
                { data: languages, error: languagesError },
                { data: feats, error: featsError }
            ] = await Promise.all([
                supabase.from('game_races').select('*'),
                supabase.from('game_classes').select('*'),
                supabase.from('game_backgrounds').select('*'),
                supabase.from('game_alignments').select('*'),
                supabase.from('game_languages').select('*'),
                supabase.from('game_feats').select('*')
            ]);

            // Log de erros individuais
            if (racesError) console.error('❌ Erro ao carregar raças:', racesError);
            if (classesError) console.error('❌ Erro ao carregar classes:', classesError);
            if (backgroundsError) console.error('❌ Erro ao carregar antecedentes:', backgroundsError);
            if (alignmentsError) console.error('❌ Erro ao carregar tendências:', alignmentsError);
            if (languagesError) console.error('❌ Erro ao carregar idiomas:', languagesError);
            if (featsError) console.error('❌ Erro ao carregar talentos:', featsError);

            this.data.races = races || [];
            this.data.classes = classes || [];
            this.data.backgrounds = backgrounds || [];
            this.data.alignments = alignments || [];
            this.data.languages = languages || [];
            this.data.feats = feats || [];

            console.log('✅ Dados carregados do Supabase:');
            console.log('   📊 Raças:', this.data.races.length);
            console.log('   📊 Classes:', this.data.classes.length);
            console.log('   📊 Antecedentes:', this.data.backgrounds.length);
            console.log('   📊 Tendências:', this.data.alignments.length);
            console.log('   📊 Idiomas:', this.data.languages.length);
            console.log('   📊 Talentos:', this.data.feats.length);
            
            // Log completo dos dados
            console.log('🔍 Dados completos:', this.data);
            
        } catch (error) {
            console.error('❌ Erro crítico ao carregar dados do Supabase:', error);
            alert('Erro ao carregar os dados do jogo. Verifique o console (F12) e se a migração foi executada.');
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.submitCharacter();
        });

        // Step 1: Race, Class, Level
        document.getElementById('race').addEventListener('change', (e) => this.handleRaceChange(e));
        document.getElementById('class').addEventListener('change', (e) => this.handleClassChange(e));
        document.getElementById('subclass').addEventListener('change', (e) => {
            this.character.subclass = e.target.value;
            this.saveProgress();
        });
        document.getElementById('level').addEventListener('change', (e) => {
            this.character.level = parseInt(e.target.value);
            this.saveProgress();
        });

        // Step 2: Alignment and Background
        document.getElementById('alignment').addEventListener('change', (e) => {
            this.character.alignment = e.target.value;
            this.saveProgress();
        });
        document.getElementById('background').addEventListener('change', (e) => {
            this.character.background = e.target.value;
            this.saveProgress();
        });

        // Step 3: Character Details
        document.getElementById('characterName').addEventListener('input', (e) => {
            this.character.name = e.target.value;
            this.saveProgress();
        });
        document.getElementById('characterImage').addEventListener('change', (e) => this.handleImageUpload(e));
        
        ['eyes', 'skin', 'hair', 'weight', 'height', 'age'].forEach(field => {
            document.getElementById(field).addEventListener('input', (e) => {
                this.character.appearance[field] = e.target.value;
                this.saveProgress();
            });
        });

        // Step 4: Attributes
        document.querySelectorAll('.method-btn[data-method]').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectAttributeMethod(e.target.closest('.method-btn')));
        });
        document.getElementById('rollDiceBtn')?.addEventListener('click', () => this.rollDice());

        // Step 5: Skills
        // Will be setup when skills are populated

        // Step 6: HP
        document.querySelectorAll('.method-btn[data-hp-method]').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectHPMethod(e.target.closest('.method-btn')));
        });

        // Step 8: Personality
        document.querySelectorAll('.random-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.randomPersonality(e.target.dataset.category));
        });
        document.querySelectorAll('.choose-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.choosePersonality(e.target.dataset.category));
        });

        // Modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeModals());
        });
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Selection Buttons
        document.getElementById('selectRaceBtn')?.addEventListener('click', () => this.openRaceSelectionModal());
        document.getElementById('selectClassBtn')?.addEventListener('click', () => this.openClassSelectionModal());
        document.getElementById('selectSubclassBtn')?.addEventListener('click', () => this.openSubclassSelectionModal());
        document.getElementById('selectBackgroundBtn')?.addEventListener('click', () => this.openBackgroundSelectionModal());
    }

    // ===== STEP 1: RACE, CLASS, LEVEL =====
    
    populateStep1() {
        // Populate levels (1-20)
        const levelSelect = document.getElementById('level');
        levelSelect.innerHTML = '<option value="">Selecione o nível...</option>';
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Nível ${i}`;
            levelSelect.appendChild(option);
        }
        
        console.log('✅ Step 1 inicializado. Raças:', this.data.races.length, 'Classes:', this.data.classes.length);
    }

    handleRaceChange(e) {
        const raceId = e.target.value;
        this.character.race = raceId;
        
        const selectedRace = this.data.races.find(r => r.id === raceId);
        
        if (selectedRace && selectedRace.subracas && selectedRace.subracas.length > 0) {
            this.showSubraceModal(selectedRace);
        } else {
            this.character.subrace = null;
        }
        
        this.saveProgress();
    }

    showSubraceModal(race) {
        const modal = document.getElementById('subraceModal');
        const title = document.getElementById('raceTitle');
        const raceInfo = document.getElementById('raceInfo');
        const subracesList = document.getElementById('subracesList');

        title.textContent = race.nome;

        // Display race benefits
        let infoHTML = '<h4>Benefícios da Raça:</h4><ul>';
        if (race.aumentoatributos) {
            infoHTML += '<li><strong>Atributos:</strong> ' + this.formatAttributeBonus(race.aumentoatributos) + '</li>';
        }
        if (race.deslocamento) {
            infoHTML += '<li><strong>Deslocamento:</strong> ' + race.deslocamento + '</li>';
        }
        if (race.tamanho) {
            infoHTML += '<li><strong>Tamanho:</strong> ' + race.tamanho + '</li>';
        }
        infoHTML += '</ul>';
        raceInfo.innerHTML = infoHTML;

        // Display subraces
        subracesList.innerHTML = '';
        race.subracas.forEach(subrace => {
            const subraceCard = document.createElement('div');
            subraceCard.className = 'subrace-card';
            subraceCard.innerHTML = `
                <h4>${subrace.nome}</h4>
                <p><strong>Atributos:</strong> ${this.formatAttributeBonus(subrace.aumentoatributos)}</p>
                ${subrace.habilidades ? `<p><strong>Habilidades:</strong> ${subrace.habilidades.join(', ')}</p>` : ''}
            `;
            subraceCard.addEventListener('click', () => {
                this.character.subrace = subrace.id;
                this.saveProgress();
                this.closeModals();
            });
            subracesList.appendChild(subraceCard);
        });

        document.getElementById('keepRaceBtn').onclick = () => {
            this.character.subrace = null;
            this.closeModals();
        };

        modal.style.display = 'block';
    }

    formatAttributeBonus(attributes) {
        const attrMap = {
            for: 'FOR', des: 'DES', con: 'CON',
            int: 'INT', sab: 'SAB', car: 'CAR'
        };
        return Object.entries(attributes)
            .map(([key, value]) => `${attrMap[key] || key} +${value}`)
            .join(', ');
    }

    handleClassChange(e) {
        const classId = e.target.value;
        this.character.class = classId;
        
        const selectedClass = this.data.classes.find(c => c.id === classId);
        const subclassSelect = document.getElementById('subclass');
        
        subclassSelect.innerHTML = '<option value="">Selecione uma subclasse...</option>';
        
        if (selectedClass && selectedClass.subclasses) {
            selectedClass.subclasses.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.id;
                option.textContent = `${sub.name} (Nível ${sub.level})`;
                subclassSelect.appendChild(option);
            });
        }
        
        this.saveProgress();
    }

    // ===== STEP 4: ATTRIBUTES =====
    
    selectAttributeMethod(btn) {
        const method = btn.dataset.method;
        document.querySelectorAll('.method-btn[data-method]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (method === '4d6') {
            document.getElementById('diceRolling').classList.remove('hidden');
            document.getElementById('attributeAssignment').classList.add('hidden');
            this.setupDiceRolling();
        } else {
            document.getElementById('diceRolling').classList.add('hidden');
            this.setupStandardArray();
        }
    }

    setupDiceRolling() {
        this.rolledValues = [];
        document.getElementById('rollsLeft').textContent = '6';
        document.getElementById('rolledValuesList').innerHTML = '';
        document.getElementById('rollDiceBtn').disabled = false;
    }

    rollDice() {
        if (this.rolledValues.length >= 6) return;

        const diceElements = [
            document.getElementById('die1'),
            document.getElementById('die2'),
            document.getElementById('die3'),
            document.getElementById('die4')
        ];

        // Animate dice
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            diceElements.forEach(die => {
                die.textContent = Math.floor(Math.random() * 6) + 1;
                die.classList.add('rolling');
            });
            rollCount++;
            if (rollCount > 10) {
                clearInterval(rollInterval);
                this.finalizeDiceRoll(diceElements);
            }
        }, 100);
    }

    finalizeDiceRoll(diceElements) {
        const rolls = diceElements.map(() => Math.floor(Math.random() * 6) + 1);
        rolls.sort((a, b) => a - b);
        const lowest = rolls[0];
        const sum = rolls.slice(1).reduce((a, b) => a + b, 0);

        diceElements.forEach((die, i) => {
            die.textContent = rolls[i];
            die.classList.remove('rolling');
            if (rolls[i] === lowest && rolls.filter(r => r === lowest).length === 1) {
                die.classList.add('dropped');
            }
        });

        this.rolledValues.push(sum);
        
        const valuesList = document.getElementById('rolledValuesList');
        const valueSpan = document.createElement('span');
        valueSpan.className = 'rolled-value';
        valueSpan.textContent = sum;
        valuesList.appendChild(valueSpan);

        const rollsLeft = 6 - this.rolledValues.length;
        document.getElementById('rollsLeft').textContent = rollsLeft;

        if (rollsLeft === 0) {
            document.getElementById('rollDiceBtn').disabled = true;
            this.populateAttributeSelects(this.rolledValues);
        }
    }

    setupStandardArray() {
        const standardValues = [15, 14, 13, 12, 10, 8];
        this.populateAttributeSelects(standardValues);
    }

    populateAttributeSelects(values) {
        const assignment = document.getElementById('attributeAssignment');
        assignment.classList.remove('hidden');

        const selects = assignment.querySelectorAll('select');
        selects.forEach(select => {
            select.innerHTML = '<option value="">-</option>';
            values.forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val;
                select.appendChild(option);
            });

            select.addEventListener('change', (e) => {
                const attr = e.target.name;
                this.character.attributes[attr] = parseInt(e.target.value) || 10;
                this.updateModifier(e.target);
                this.validateAttributeSelection();
                this.saveProgress();
            });
        });
    }

    updateModifier(select) {
        const value = parseInt(select.value) || 10;
        const modifier = Math.floor((value - 10) / 2);
        const modifierSpan = select.closest('.attribute-item').querySelector('.modifier');
        modifierSpan.textContent = modifier >= 0 ? `+${modifier}` : modifier;
    }

    validateAttributeSelection() {
        const selects = document.querySelectorAll('#attributeAssignment select');
        const values = Array.from(selects).map(s => s.value).filter(v => v);
        
        // Check for duplicates
        const hasDuplicates = values.length !== new Set(values).size;
        
        selects.forEach(select => {
            if (select.value && values.filter(v => v === select.value).length > 1) {
                select.style.borderColor = '#ff4444';
            } else {
                select.style.borderColor = '';
            }
        });

        return !hasDuplicates && values.length === 6;
    }

    // ===== STEP 5: SKILLS =====
    
    setupSkillsSelection() {
        const selectedClass = this.data.classes.find(c => c.id === this.character.class);
        const selectedBackground = this.data.backgrounds.find(b => b.id === this.character.background);

        const skillsGrid = document.getElementById('skillsGrid');
        skillsGrid.innerHTML = '';

        const allSkills = [
            { id: 'acrobatics', name: 'Acrobacia', ability: 'DES' },
            { id: 'animal-handling', name: 'Lidar com Animais', ability: 'SAB' },
            { id: 'arcana', name: 'Arcanismo', ability: 'INT' },
            { id: 'athletics', name: 'Atletismo', ability: 'FOR' },
            { id: 'deception', name: 'Enganação', ability: 'CAR' },
            { id: 'history', name: 'História', ability: 'INT' },
            { id: 'insight', name: 'Intuição', ability: 'SAB' },
            { id: 'intimidation', name: 'Intimidação', ability: 'CAR' },
            { id: 'investigation', name: 'Investigação', ability: 'INT' },
            { id: 'medicine', name: 'Medicina', ability: 'SAB' },
            { id: 'nature', name: 'Natureza', ability: 'INT' },
            { id: 'perception', name: 'Percepção', ability: 'SAB' },
            { id: 'performance', name: 'Atuação', ability: 'CAR' },
            { id: 'persuasion', name: 'Persuasão', ability: 'CAR' },
            { id: 'religion', name: 'Religião', ability: 'INT' },
            { id: 'sleight-of-hand', name: 'Prestidigitação', ability: 'DES' },
            { id: 'stealth', name: 'Furtividade', ability: 'DES' },
            { id: 'survival', name: 'Sobrevivência', ability: 'SAB' }
        ];

        const backgroundSkills = selectedBackground?.proficiencias?.pericias || [];
        const availableSkills = selectedClass?.proficiencies?.skills || [];
        const skillChoices = selectedClass?.proficiencies?.choose || 2;

        document.getElementById('skillsToChoose').textContent = skillChoices;

        allSkills.forEach(skill => {
            const skillCard = document.createElement('div');
            skillCard.className = 'skill-card';

            const isFromBackground = backgroundSkills.includes(skill.id);
            const isAvailable = availableSkills.includes(skill.id);

            if (isFromBackground) {
                skillCard.classList.add('from-background');
                this.character.skills.push(skill.id);
            } else if (isAvailable) {
                skillCard.classList.add('available');
                skillCard.addEventListener('click', () => this.toggleSkill(skill.id, skillCard, skillChoices));
            } else {
                skillCard.classList.add('disabled');
            }

            skillCard.innerHTML = `
                <span class="skill-name">${skill.name}</span>
                <span class="skill-ability">${skill.ability}</span>
            `;

            skillsGrid.appendChild(skillCard);
        });
    }

    toggleSkill(skillId, card, maxChoices) {
        const currentChoices = this.character.skills.filter(s => 
            !this.getBackgroundSkills().includes(s)
        ).length;

        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            this.character.skills = this.character.skills.filter(s => s !== skillId);
        } else {
            if (currentChoices < maxChoices) {
                card.classList.add('selected');
                this.character.skills.push(skillId);
            }
        }

        this.saveProgress();
    }

    getBackgroundSkills() {
        const selectedBackground = this.data.backgrounds.find(b => b.id === this.character.background);
        return selectedBackground?.proficiencias?.pericias || [];
    }

    // ===== STEP 6: HP =====
    
    selectHPMethod(btn) {
        const method = btn.dataset.hpMethod;
        this.character.hpMethod = method;
        
        document.querySelectorAll('.method-btn[data-hp-method]').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        this.calculateHP(method);
        this.saveProgress();
    }

    calculateHP(method) {
        const selectedClass = this.data.classes.find(c => c.id === this.character.class);
        if (!selectedClass) return;

        const hitDice = parseInt(selectedClass.hitdice.replace('d', ''));
        const conMod = Math.floor((this.character.attributes.con - 10) / 2);
        const level = this.character.level;

        let totalHP = 0;
        let breakdown = '';

        if (method === 'average') {
            const averagePerLevel = Math.floor(hitDice / 2) + 1;
            totalHP = hitDice + conMod + (averagePerLevel + conMod) * (level - 1);
            breakdown = `
                <p>Nível 1: ${hitDice} (dado) + ${conMod} (CON) = ${hitDice + conMod}</p>
                <p>Níveis 2-${level}: ${averagePerLevel} (média) + ${conMod} (CON) × ${level - 1} = ${(averagePerLevel + conMod) * (level - 1)}</p>
            `;
        } else {
            // For rolling, we'll use average for now (in a real implementation, would roll for each level)
            const averagePerLevel = Math.floor(hitDice / 2) + 1;
            totalHP = hitDice + conMod + (averagePerLevel + conMod) * (level - 1);
            breakdown = `<p>HP calculado com rolagem de dados (usando média para demonstração)</p>`;
        }

        this.character.hp = totalHP;
        document.getElementById('totalHP').textContent = totalHP;
        document.getElementById('hpBreakdown').innerHTML = breakdown;
        document.getElementById('hpCalculation').classList.remove('hidden');
    }

    // ===== STEP 7: LANGUAGES & PROFICIENCIES =====
    
    setupExtraChoices() {
        // Check if there are any extra choices to make
        const selectedRace = this.data.races.find(r => r.id === this.character.race);
        const selectedBackground = this.data.backgrounds.find(b => b.id === this.character.background);

        let hasExtraChoices = false;

        // Languages
        const raceLanguages = selectedRace?.idiomasextras || 0;
        const backgroundLanguages = selectedBackground?.proficiencias?.idiomas?.quantidade || 0;
        const totalLanguages = raceLanguages + backgroundLanguages;

        if (totalLanguages > 0) {
            hasExtraChoices = true;
            document.getElementById('languagesToChoose').textContent = totalLanguages;
            this.populateLanguages(totalLanguages);
        } else {
            document.getElementById('languageSection').style.display = 'none';
        }

        // If no extra choices, skip this step
        if (!hasExtraChoices) {
            // Move directly to next step
            this.currentStep++;
        }
    }

    populateLanguages(count) {
        const languagesGrid = document.getElementById('languagesGrid');
        languagesGrid.innerHTML = '';

        const allLanguages = [
            ...this.data.languages.languages.standard,
            ...this.data.languages.languages.exotic
        ];

        allLanguages.forEach(lang => {
            const langCard = document.createElement('div');
            langCard.className = 'choice-card';
            langCard.textContent = lang;
            langCard.addEventListener('click', () => this.toggleLanguage(lang, langCard, count));
            languagesGrid.appendChild(langCard);
        });
    }

    toggleLanguage(language, card, maxCount) {
        if (card.classList.contains('selected')) {
            card.classList.remove('selected');
            this.character.languages = this.character.languages.filter(l => l !== language);
        } else {
            if (this.character.languages.length < maxCount) {
                card.classList.add('selected');
                this.character.languages.push(language);
            }
        }
        this.saveProgress();
    }

    // ===== STEP 8: PERSONALITY =====
    
    randomPersonality(category) {
        const selectedBackground = this.data.backgrounds.find(b => b.id === this.character.background);
        if (!selectedBackground || !selectedBackground.personalidadessugeridas) return;

        const categoryMap = {
            'traits': 'tracos',
            'ideals': 'ideais',
            'bonds': 'vinculos',
            'flaws': 'defeitos'
        };

        const items = selectedBackground.personalidadessugeridas[categoryMap[category]];
        if (items && items.length > 0) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            const textarea = document.getElementById(category);
            textarea.value = randomItem;
            this.character.personality[category] = randomItem;
            this.saveProgress();
        }
    }

    choosePersonality(category) {
        const selectedBackground = this.data.backgrounds.find(b => b.id === this.character.background);
        if (!selectedBackground || !selectedBackground.personalidadesSugeridas) return;

        const categoryMap = {
            'traits': { key: 'tracos', title: 'Traços de Personalidade' },
            'ideals': { key: 'ideais', title: 'Ideais' },
            'bonds': { key: 'vinculos', title: 'Vínculos' },
            'flaws': { key: 'defeitos', title: 'Defeitos' }
        };

        const catInfo = categoryMap[category];
        const items = selectedBackground.personalidadessugeridas[catInfo.key];

        const modal = document.getElementById('personalityModal');
        const title = document.getElementById('personalityTitle');
        const list = document.getElementById('personalityList');

        title.textContent = catInfo.title;
        list.innerHTML = '';

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'personality-item';
            itemCard.textContent = item;
            itemCard.addEventListener('click', () => {
                document.getElementById(category).value = item;
                this.character.personality[category] = item;
                this.saveProgress();
                this.closeModals();
            });
            list.appendChild(itemCard);
        });

        modal.style.display = 'block';
    }

    // ===== NAVIGATION =====
    
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    nextStep() {
        if (this.validateStep(this.currentStep)) {
            if (this.currentStep < this.maxSteps) {
                this.currentStep++;
                
                // Setup specific steps
                if (this.currentStep === 5) {
                    this.setupSkillsSelection();
                } else if (this.currentStep === 7) {
                    this.setupExtraChoices();
                }
                
                this.showStep(this.currentStep);
            }
        } else {
            alert('Por favor, preencha todos os campos obrigatórios.');
        }
    }

    showStep(step) {
        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
        
        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    updateProgressBar() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index + 1 < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index + 1 === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        prevBtn.disabled = this.currentStep === 1;

        if (this.currentStep === this.maxSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }

    validateStep(step) {
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        const requiredInputs = stepElement.querySelectorAll('[required]');
        
        for (let input of requiredInputs) {
            if (!input.value) {
                return false;
            }
        }

        // Additional validation for specific steps
        if (step === 4) {
            return this.validateAttributeSelection();
        }

        return true;
    }

    // ===== UTILITIES =====
    
    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.character.image = event.target.result;
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `<img src="${event.target.result}" alt="Character">`;
                this.saveProgress();
            };
            reader.readAsDataURL(file);
        }
    }

    // ===================================
    // SELECTION MODALS
    // ===================================

    openRaceSelectionModal() {
        const modal = document.getElementById('raceSelectionModal');
        const grid = document.getElementById('raceSelectionGrid');
        
        grid.innerHTML = '';
        
        console.log('📋 Raças disponíveis:', this.data.races);
        
        if (!this.data.races || this.data.races.length === 0) {
            grid.innerHTML = '<p style="color: #d4af37; text-align: center; padding: 40px;">Nenhuma raça disponível. Execute a migração de dados.</p>';
            modal.style.display = 'block';
            return;
        }
        
        this.data.races.forEach(race => {
            const card = this.createSelectionCard(race, 'race');
            grid.appendChild(card);
        });
        
        modal.style.display = 'block';
    }

    openClassSelectionModal() {
        const modal = document.getElementById('classSelectionModal');
        const grid = document.getElementById('classSelectionGrid');
        
        grid.innerHTML = '';
        
        console.log('📋 Classes disponíveis:', this.data.classes);
        
        if (!this.data.classes || this.data.classes.length === 0) {
            grid.innerHTML = '<p style="color: #d4af37; text-align: center; padding: 40px;">Nenhuma classe disponível. Execute a migração de dados.</p>';
            modal.style.display = 'block';
            return;
        }
        
        this.data.classes.forEach(classData => {
            const card = this.createSelectionCard(classData, 'class');
            grid.appendChild(card);
        });
        
        modal.style.display = 'block';
    }

    openSubclassSelectionModal() {
        const selectedClass = this.data.classes.find(c => c.nome === this.character.class);
        if (!selectedClass || !selectedClass.subclasses || selectedClass.subclasses.length === 0) {
            alert('Esta classe não possui subclasses disponíveis.');
            return;
        }

        const modal = document.getElementById('subclassSelectionModal');
        const grid = document.getElementById('subclassSelectionGrid');
        
        grid.innerHTML = '';
        
        selectedClass.subclasses.forEach(subclass => {
            const card = this.createSelectionCard(subclass, 'subclass');
            grid.appendChild(card);
        });
        
        modal.style.display = 'block';
    }

    openBackgroundSelectionModal() {
        const modal = document.getElementById('backgroundSelectionModal');
        const grid = document.getElementById('backgroundSelectionGrid');
        
        grid.innerHTML = '';
        
        console.log('📋 Antecedentes disponíveis:', this.data.backgrounds);
        
        if (!this.data.backgrounds || this.data.backgrounds.length === 0) {
            grid.innerHTML = '<p style="color: #d4af37; text-align: center; padding: 40px;">Nenhum antecedente disponível. Execute a migração de dados.</p>';
            modal.style.display = 'block';
            return;
        }
        
        this.data.backgrounds.forEach(background => {
            const card = this.createSelectionCard(background, 'background');
            grid.appendChild(card);
        });
        
        modal.style.display = 'block';
    }

    createSelectionCard(item, type) {
        const card = document.createElement('div');
        card.className = 'selection-card';
        
        let icon = '⚡';
        let stats = '';
        
        if (type === 'race') {
            icon = this.getRaceIcon(item.nome);
            stats = `
                ${item.aumentoatributos ? `<div class="selection-card-stat"><strong>Atributos:</strong> ${item.aumentoatributos}</div>` : ''}
                ${item.deslocamento ? `<div class="selection-card-stat"><strong>Deslocamento:</strong> ${item.deslocamento}</div>` : ''}
                ${item.idiomasextras ? `<div class="selection-card-stat"><strong>Idiomas:</strong> ${item.idiomasextras}</div>` : ''}
            `;
        } else if (type === 'class') {
            icon = this.getClassIcon(item.nome);
            stats = `
                ${item.hitdice ? `<div class="selection-card-stat"><strong>Dado de Vida:</strong> ${item.hitdice}</div>` : ''}
                ${item.armaduras ? `<div class="selection-card-stat"><strong>Armaduras:</strong> ${item.armaduras}</div>` : ''}
                ${item.armas ? `<div class="selection-card-stat"><strong>Armas:</strong> ${item.armas}</div>` : ''}
            `;
        } else if (type === 'background') {
            icon = this.getBackgroundIcon(item.nome);
            stats = `
                ${item.pericias ? `<div class="selection-card-stat"><strong>Perícias:</strong> ${item.pericias}</div>` : ''}
                ${item.idiomas ? `<div class="selection-card-stat"><strong>Idiomas:</strong> ${item.idiomas || 'Nenhum'}</div>` : ''}
            `;
        } else if (type === 'subclass') {
            icon = '✨';
            stats = item.habilidades ? `<div class="selection-card-stat"><strong>Habilidades especiais</strong></div>` : '';
        }

        card.innerHTML = `
            <div class="selection-card-icon">${icon}</div>
            <div class="selection-card-title">${item.nome}</div>
            <div class="selection-card-description">${item.descricao || ''}</div>
            ${stats ? `<div class="selection-card-stats">${stats}</div>` : ''}
        `;

        card.addEventListener('click', () => {
            this.selectItem(item, type, card);
        });

        return card;
    }

    selectItem(item, type, card) {
        // Remove selection from all cards in this modal
        card.parentElement.querySelectorAll('.selection-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Mark this card as selected
        card.classList.add('selected');

        // Update character data and UI
        if (type === 'race') {
            this.character.race = item.nome;
            document.getElementById('race').value = item.nome;
            document.getElementById('selectedRaceLabel').textContent = item.nome;
            document.getElementById('selectRaceBtn').classList.add('selected');
            
            // Check for subraces
            if (item.subracas && item.subracas.length > 0) {
                setTimeout(() => {
                    this.closeModals();
                    this.showSubraceModal(item);
                }, 500);
            } else {
                setTimeout(() => this.closeModals(), 300);
            }
        } else if (type === 'class') {
            this.character.class = item.nome;
            document.getElementById('class').value = item.nome;
            document.getElementById('selectedClassLabel').textContent = item.nome;
            document.getElementById('selectClassBtn').classList.add('selected');
            
            // Show subclass option if available
            if (item.subclasses && item.subclasses.length > 0) {
                document.getElementById('subclassGroup').style.display = 'block';
            }
            
            setTimeout(() => this.closeModals(), 300);
        } else if (type === 'subclass') {
            this.character.subclass = item.nome;
            document.getElementById('subclass').value = item.nome;
            document.getElementById('selectedSubclassLabel').textContent = item.nome;
            document.getElementById('selectSubclassBtn').classList.add('selected');
            setTimeout(() => this.closeModals(), 300);
        } else if (type === 'background') {
            this.character.background = item.nome;
            document.getElementById('background').value = item.nome;
            document.getElementById('selectedBackgroundLabel').textContent = item.nome;
            document.getElementById('selectBackgroundBtn').classList.add('selected');
            setTimeout(() => this.closeModals(), 300);
        }

        this.saveProgress();
    }

    getRaceIcon(raceName) {
        const icons = {
            'Humano': '👤',
            'Elfo': '🧝',
            'Anão': '⚒️',
            'Halfling': '🍃',
            'Draconato': '🐉',
            'Gnomo': '🎩',
            'Meio-Elfo': '🧝‍♂️',
            'Meio-Orc': '💪',
            'Tiefling': '😈'
        };
        return icons[raceName] || '⚡';
    }

    getClassIcon(className) {
        const icons = {
            'Bárbaro': '⚔️',
            'Bardo': '🎵',
            'Clérigo': '✝️',
            'Druida': '🌿',
            'Guerreiro': '🛡️',
            'Monge': '🥋',
            'Paladino': '⚔️✨',
            'Ranger': '🏹',
            'Ladino': '🗡️',
            'Feiticeiro': '🔮',
            'Bruxo': '📿',
            'Mago': '🧙'
        };
        return icons[className] || '⚔️';
    }

    getBackgroundIcon(backgroundName) {
        const icons = {
            'Acólito': '✝️',
            'Artesão': '🔨',
            'Artista': '🎭',
            'Charlatão': '🎪',
            'Criminoso': '🗡️',
            'Eremita': '🏔️',
            'Forasteiro': '🌲',
            'Herói do Povo': '⚔️',
            'Marinheiro': '⚓',
            'Nobre': '👑',
            'Sábio': '📚',
            'Soldado': '🛡️'
        };
        return icons[backgroundName] || '📜';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    saveProgress() {
        localStorage.setItem('characterCreationProgress', JSON.stringify(this.character));
    }

    loadProgress() {
        const saved = localStorage.getItem('characterCreationProgress');
        return saved ? JSON.parse(saved) : null;
    }

    async submitCharacter() {
        if (!this.validateStep(this.currentStep)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            // Preparar dados para o Supabase
            const characterData = {
                user_id: this.currentUser.id,
                name: this.character.name,
                avatar_url: this.character.image,
                character_class: this.character.class,
                race: this.character.race,
                background: this.character.background,
                alignment: this.character.alignment,
                level: this.character.level,
                hit_points_max: this.character.hp,
                hit_points_current: this.character.hp,
                
                // Atributos
                strength: this.character.attributes.str,
                dexterity: this.character.attributes.dex,
                constitution: this.character.attributes.con,
                intelligence: this.character.attributes.int,
                wisdom: this.character.attributes.wis,
                charisma: this.character.attributes.cha,
                
                // Perícias
                skills: { proficient: this.character.skills },
                
                // Idiomas e proficiências
                custom_fields: {
                    languages: this.character.languages,
                    proficiencies: this.character.proficiencies,
                    subrace: this.character.subrace,
                    subclass: this.character.subclass,
                    appearance: this.character.appearance
                },
                
                // Personalidade
                personality_traits: this.character.personality.traits,
                ideals: this.character.personality.ideals,
                bonds: this.character.personality.bonds,
                flaws: this.character.personality.flaws
            };

            // Salvar no Supabase
            const { data, error } = await supabase
                .from('characters')
                .insert([characterData])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Personagem salvo no Supabase:', data);

            // Limpar progresso do localStorage
            localStorage.removeItem('characterCreationProgress');

            // Redirecionar para a ficha
            alert('Personagem criado com sucesso!');
            window.location.href = `character-sheet.html?id=${data.id}`;
            
        } catch (error) {
            console.error('❌ Erro ao salvar personagem:', error);
            alert('Erro ao salvar o personagem. Tente novamente.');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new CharacterCreation();
});
