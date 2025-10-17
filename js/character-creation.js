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
        
        // Attribute method system
        this.attributeMethod = null; // 4d6 or standard
        this.methodLocked = false; // Cannot change after confirmation
        this.rolledValues = [];
        this.standardValues = [15, 14, 13, 12, 10, 8];
        this.availableValues = [];
        this.rollsCompleted = 0;
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
        
        // Image upload handlers
        document.getElementById('uploadImageBtn').addEventListener('click', () => {
            document.getElementById('characterImage').click();
        });
        document.getElementById('characterImage').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImageBtn').addEventListener('click', () => this.removeCharacterImage());
        
        ['eyes', 'skin', 'hair', 'weight', 'height', 'age'].forEach(field => {
            document.getElementById(field).addEventListener('input', (e) => {
                this.character.appearance[field] = e.target.value;
                this.saveProgress();
            });
        });

        // Step 4: Attributes - Method buttons with confirmation
        document.querySelectorAll('.method-btn[data-method]').forEach(btn => {
            console.log('Adicionando listener para botão:', btn.dataset.method);
            btn.addEventListener('click', () => {
                console.log('Botão clicado! Método:', btn.dataset.method, 'methodLocked:', this.methodLocked);
                if (!this.methodLocked) {
                    this.showMethodConfirmation(btn.dataset.method);
                } else {
                    console.log('Método já está travado!');
                }
            });
        });
        document.getElementById('cancelMethodBtn')?.addEventListener('click', () => this.cancelMethodConfirmation());
        document.getElementById('confirmMethodBtn')?.addEventListener('click', () => this.confirmMethodSelection());
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
        document.getElementById('selectAlignmentBtn')?.addEventListener('click', () => this.openAlignmentSelectionModal());
    }

    // ===== STEP 1: RACE, CLASS, LEVEL =====
    
    populateStep1() {
        // Populate levels (1-20) as visual grid
        const levelGrid = document.getElementById('levelSelectionGrid');
        levelGrid.innerHTML = '';
        
        for (let i = 1; i <= 20; i++) {
            const levelCard = document.createElement('div');
            levelCard.className = 'level-card';
            levelCard.dataset.level = i;
            
            const levelNumber = document.createElement('div');
            levelNumber.className = 'level-number';
            levelNumber.textContent = i;
            
            levelCard.appendChild(levelNumber);
            
            levelCard.addEventListener('click', () => this.selectLevel(i, levelCard));
            
            levelGrid.appendChild(levelCard);
        }
        
        console.log('✅ Step 1 inicializado. Raças:', this.data.races.length, 'Classes:', this.data.classes.length);
    }
    
    selectLevel(level, card) {
        // Remove previous selection
        document.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        
        // Update hidden input and character data
        document.getElementById('level').value = level;
        this.character.level = level;
        
        this.saveProgress();
        
        console.log('✅ Nível selecionado:', level);
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
    
    showMethodConfirmation(method) {
        console.log('showMethodConfirmation chamado com método:', method);
        this.pendingMethod = method;
        const modal = document.getElementById('methodConfirmModal');
        const methodDisplay = modal.querySelector('.method-display');
        
        console.log('Modal encontrado:', modal);
        console.log('methodDisplay encontrado:', methodDisplay);
        
        if (method === '4d6') {
            methodDisplay.innerHTML = '<span class="method-icon">🎲</span> 4d6 (Drop Lowest)';
        } else {
            methodDisplay.innerHTML = '<span class="method-icon">📊</span> Standard Array';
        }
        
        modal.classList.add('active');
        console.log('Modal agora tem classe active');
    }

    cancelMethodConfirmation() {
        const modal = document.getElementById('methodConfirmModal');
        modal.classList.remove('active');
        this.pendingMethod = null;
    }

    confirmMethodSelection() {
        if (!this.pendingMethod) return;
        
        this.attributeMethod = this.pendingMethod;
        this.methodLocked = true;
        
        // Lock method buttons
        document.querySelectorAll('.method-btn[data-method]').forEach(btn => {
            if (btn.dataset.method !== this.attributeMethod) {
                btn.classList.add('locked');
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            } else {
                btn.classList.add('selected');
            }
        });
        
        // Close modal
        this.cancelMethodConfirmation();
        
        // Initialize selected method
        if (this.attributeMethod === '4d6') {
            this.setupDiceRolling();
        } else {
            this.setupStandardArray();
        }
    }

    setupDiceRolling() {
        this.rolledValues = [];
        this.rollsCompleted = 0;
        
        const diceSection = document.getElementById('diceRolling');
        const resultsDisplay = document.querySelector('.dice-results-display');
        
        diceSection.classList.remove('hidden');
        resultsDisplay.innerHTML = '';
        
        document.getElementById('rollsCompleted').textContent = '0';
        document.getElementById('rollDiceBtn').disabled = false;
        document.getElementById('rollDiceBtn').classList.remove('hidden');
    }

    rollDice() {
        if (this.rollsCompleted >= 6) return;
        
        const diceContainer = document.querySelector('.dice-3d-container');
        const diceElements = [
            document.getElementById('dice3d-1'),
            document.getElementById('dice3d-2'),
            document.getElementById('dice3d-3'),
            document.getElementById('dice3d-4')
        ];
        
        // Show dice container
        diceContainer.classList.remove('hidden');
        
        // Add rolling animation
        diceElements.forEach(die => {
            die.classList.add('rolling');
        });
        
        // Generate random values
        setTimeout(() => {
            const rolls = [
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ];
            
            this.finalizeDiceRoll(rolls, diceElements);
        }, 1000);
    }

    finalizeDiceRoll(rolls, diceElements) {
        // Remove rolling animation
        diceElements.forEach((die, index) => {
            die.classList.remove('rolling');
            // Update dice face display
            const value = rolls[index];
            die.querySelectorAll('.dice-face').forEach(face => {
                face.style.opacity = '0.3';
            });
            // Highlight the rolled number
            const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
            const targetFace = die.querySelector(`.dice-${faces[value - 1]}`);
            if (targetFace) targetFace.style.opacity = '1';
        });
        
        // Find lowest value
        const sortedRolls = [...rolls].sort((a, b) => a - b);
        const lowestValue = sortedRolls[0];
        const lowestIndex = rolls.indexOf(lowestValue);
        
        // Calculate sum (drop lowest)
        const sum = rolls.reduce((a, b) => a + b, 0) - lowestValue;
        
        // Display results
        const resultsDisplay = document.querySelector('.dice-results-display');
        const resultHTML = rolls.map((value, index) => {
            const isLowest = index === lowestIndex;
            return `<div class="result-value ${isLowest ? 'lowest' : ''}">${value}</div>`;
        }).join('');
        
        resultsDisplay.innerHTML = resultHTML;
        resultsDisplay.classList.remove('hidden');
        
        // After animation, add value to pool
        setTimeout(() => {
            this.rolledValues.push(sum);
            this.rollsCompleted++;
            
            document.getElementById('rollsCompleted').textContent = this.rollsCompleted;
            
            if (this.rollsCompleted >= 6) {
                document.getElementById('rollDiceBtn').disabled = true;
                document.getElementById('rollDiceBtn').textContent = 'Todas as rolagens completas!';
                setTimeout(() => {
                    this.showValuesPool();
                }, 500);
            } else {
                // Clear for next roll
                setTimeout(() => {
                    resultsDisplay.classList.add('hidden');
                    diceElements.forEach(die => {
                        die.querySelectorAll('.dice-face').forEach(face => {
                            face.style.opacity = '1';
                        });
                    });
                }, 2500);
            }
        }, 2500);
    }

    setupStandardArray() {
        this.availableValues = [...this.standardValues];
        this.showValuesPool();
    }

    showValuesPool() {
        const values = this.attributeMethod === '4d6' ? this.rolledValues : this.availableValues;
        
        // Hide dice section
        document.getElementById('diceRolling').classList.add('hidden');
        
        // Show values pool
        const valuesPool = document.querySelector('.values-pool');
        const poolContainer = valuesPool.querySelector('.pool-container');
        
        poolContainer.innerHTML = '';
        
        values.forEach((value, index) => {
            const valueDiv = document.createElement('div');
            valueDiv.className = 'draggable-value';
            valueDiv.draggable = true;
            valueDiv.dataset.value = value;
            valueDiv.dataset.index = index;
            valueDiv.innerHTML = `<span class="value-number">${value}</span>`;
            
            // Drag events
            valueDiv.addEventListener('dragstart', (e) => this.handleDragStart(e));
            valueDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
            poolContainer.appendChild(valueDiv);
        });
        
        valuesPool.classList.remove('hidden');
        
        // Setup drop zones
        this.setupDropZones();
    }

    setupDropZones() {
        const dropZones = document.querySelectorAll('.attribute-drop-zone');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    handleDragStart(e) {
        const draggableValue = e.target.closest('.draggable-value');
        if (draggableValue.classList.contains('used')) {
            e.preventDefault();
            return;
        }
        
        draggableValue.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggableValue.dataset.value);
        e.dataTransfer.setData('index', draggableValue.dataset.index);
    }

    handleDragEnd(e) {
        const draggableValue = e.target.closest('.draggable-value');
        draggableValue.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const dropZone = e.currentTarget;
        dropZone.classList.add('drag-over');
    }

    handleDragLeave(e) {
        const dropZone = e.currentTarget;
        dropZone.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        
        const dropZone = e.currentTarget;
        dropZone.classList.remove('drag-over');
        
        const value = e.dataTransfer.getData('text/plain');
        const index = e.dataTransfer.getData('index');
        
        // Check if already filled
        if (dropZone.classList.contains('filled')) {
            // Remove previous value
            const oldValue = dropZone.dataset.assignedValue;
            const oldIndex = dropZone.dataset.assignedIndex;
            if (oldValue) {
                const oldDraggable = document.querySelector(`.draggable-value[data-index="${oldIndex}"]`);
                if (oldDraggable) {
                    oldDraggable.classList.remove('used');
                }
            }
        }
        
        // Fill slot
        const slot = dropZone.querySelector('.attribute-value-slot');
        const placeholder = slot.querySelector('.slot-placeholder');
        const valueDisplay = slot.querySelector('.slot-value');
        const modifierDisplay = slot.querySelector('.slot-modifier');
        
        placeholder.classList.add('hidden');
        valueDisplay.textContent = value;
        valueDisplay.classList.remove('hidden');
        
        // Calculate modifier
        const modifier = Math.floor((parseInt(value) - 10) / 2);
        modifierDisplay.textContent = modifier >= 0 ? `+${modifier}` : modifier;
        modifierDisplay.classList.remove('hidden');
        
        dropZone.classList.add('filled');
        dropZone.dataset.assignedValue = value;
        dropZone.dataset.assignedIndex = index;
        
        // Mark draggable as used
        const draggable = document.querySelector(`.draggable-value[data-index="${index}"]`);
        if (draggable) {
            draggable.classList.add('used');
        }
        
        // Save to character
        const attribute = dropZone.dataset.attribute;
        this.character.attributes[attribute] = parseInt(value);
        
        // Check if all filled
        this.validateAttributes();
        this.saveProgress();
    }

    validateAttributes() {
        const dropZones = document.querySelectorAll('.attribute-drop-zone');
        const filledCount = Array.from(dropZones).filter(zone => zone.classList.contains('filled')).length;
        
        if (filledCount === 6) {
            // All attributes assigned!
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = '✓ Todos os atributos foram atribuídos!';
            successMessage.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 20px 40px;
                border-radius: 12px;
                font-size: 18px;
                font-weight: bold;
                box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
                z-index: 10000;
                animation: slideIn 0.5s ease-out;
            `;
            
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
            
            return true;
        }
        
        return false;
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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem válido.');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                this.character.image = event.target.result;
                
                // Show image preview
                const preview = document.getElementById('imagePreview');
                const placeholder = document.getElementById('imagePlaceholder');
                const removeBtn = document.getElementById('removeImageBtn');
                
                preview.src = event.target.result;
                preview.style.display = 'block';
                placeholder.style.display = 'none';
                removeBtn.style.display = 'flex';
                
                this.saveProgress();
                
                console.log('✅ Imagem do personagem carregada com sucesso');
            };
            reader.readAsDataURL(file);
        }
    }
    
    removeCharacterImage() {
        this.character.image = null;
        
        const preview = document.getElementById('imagePreview');
        const placeholder = document.getElementById('imagePlaceholder');
        const removeBtn = document.getElementById('removeImageBtn');
        const fileInput = document.getElementById('characterImage');
        
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'block';
        removeBtn.style.display = 'none';
        fileInput.value = '';
        
        this.saveProgress();
        
        console.log('🗑️ Imagem do personagem removida');
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
        console.log('🔍 Primeira classe (exemplo):', this.data.classes[0]);
        
        if (!this.data.classes || this.data.classes.length === 0) {
            grid.innerHTML = '<p style="color: #d4af37; text-align: center; padding: 40px;">Nenhuma classe disponível. Execute a migração de dados.</p>';
            modal.style.display = 'block';
            return;
        }
        
        this.data.classes.forEach(classData => {
            console.log('🎴 Criando card para classe:', classData.nome || classData.name, classData);
            const card = this.createSelectionCard(classData, 'class');
            grid.appendChild(card);
        });
        
        modal.style.display = 'block';
    }

    openSubclassSelectionModal() {
        console.log('🎭 Abrindo modal de subclasses...');
        console.log('   - Classe atual:', this.character.class);
        console.log('   - Classes disponíveis:', this.data.classes);
        
        const selectedClass = this.data.classes.find(c => {
            const className = c.nome || c.name;
            return className === this.character.class;
        });
        
        console.log('   - Classe encontrada:', selectedClass);
        
        if (!selectedClass) {
            console.error('❌ Classe não encontrada!');
            alert('Classe não encontrada. Por favor, selecione uma classe primeiro.');
            return;
        }
        
        // Suporta múltiplos formatos de subclasses
        const subclassesField = selectedClass.subclasses || selectedClass.subclassesl || selectedClass.subclasss || [];
        
        console.log('   - Subclasses encontradas:', subclassesField);
        
        if (!subclassesField || subclassesField.length === 0) {
            console.error('❌ Nenhuma subclasse disponível!');
            alert('Esta classe não possui subclasses disponíveis.');
            return;
        }

        const modal = document.getElementById('subclassSelectionModal');
        const grid = document.getElementById('subclassSelectionGrid');
        
        grid.innerHTML = '';
        
        subclassesField.forEach(subclass => {
            console.log('   - Criando card para subclasse:', subclass);
            const card = this.createSelectionCard(subclass, 'subclass');
            grid.appendChild(card);
        });
        
        modal.style.display = 'block';
        console.log('✅ Modal de subclasses aberto');
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
    
    openAlignmentSelectionModal() {
        const modal = document.getElementById('alignmentSelectionModal');
        const grid = document.getElementById('alignmentSelectionGrid');
        
        grid.innerHTML = '';
        
        // Define as 9 tendências
        const alignments = [
            { id: 'leal-bom', name: 'Leal e Bom', icon: '⚖️✨', description: 'Honrado, compassivo e justo', category: 'good' },
            { id: 'neutro-bom', name: 'Neutro e Bom', icon: '🕊️', description: 'Bondoso, mas pragmático', category: 'good' },
            { id: 'caotico-bom', name: 'Caótico e Bom', icon: '🦋✨', description: 'Livre, bondoso e rebelde', category: 'good' },
            
            { id: 'leal-neutro', name: 'Leal e Neutro', icon: '⚖️', description: 'Seguidor de leis e ordem', category: 'neutral' },
            { id: 'neutro', name: 'Neutro', icon: '⚖️➖', description: 'Equilibrado e imparcial', category: 'neutral' },
            { id: 'caotico-neutro', name: 'Caótico e Neutro', icon: '🎲', description: 'Imprevisível e independente', category: 'neutral' },
            
            { id: 'leal-mau', name: 'Leal e Mau', icon: '👑🔥', description: 'Tir\u00e2nico e meticuloso', category: 'evil' },
            { id: 'neutro-mau', name: 'Neutro e Mau', icon: '💀', description: 'Ego\u00edsta e cruel', category: 'evil' },
            { id: 'caotico-mau', name: 'Caótico e Mau', icon: '😈', description: 'Destrutivo e malicioso', category: 'evil' }
        ];
        
        alignments.forEach(alignment => {
            const card = document.createElement('div');
            card.className = `alignment-card ${alignment.category}`;
            
            card.innerHTML = `
                <div class="alignment-icon">${alignment.icon}</div>
                <div class="alignment-name">${alignment.name}</div>
                <div class="alignment-description">${alignment.description}</div>
            `;
            
            card.addEventListener('click', () => {
                // Update selection
                document.getElementById('alignment').value = alignment.id;
                document.getElementById('selectedAlignmentLabel').textContent = alignment.name;
                this.character.alignment = alignment.id;
                
                this.saveProgress();
                this.closeModals();
                
                console.log('✅ Tendência selecionada:', alignment.name);
            });
            
            grid.appendChild(card);
        });
        
        modal.style.display = 'block';
    }

    createSelectionCard(item, type) {
        const card = document.createElement('div');
        card.className = 'selection-card';
        
        let icon = '⚡';
        let stats = '';
        
        // Suporta múltiplos formatos de nome
        const itemName = item.nome || item.name || 'Indefinido';
        
        // CARDS = INFORMAÇÕES SIMPLES E RESUMIDAS
        if (type === 'race') {
            icon = this.getRaceIcon(itemName);
            
            // Apenas o essencial no card
            let atributos = '';
            if (item.aumentoatributos) {
                if (typeof item.aumentoatributos === 'string') {
                    atributos = item.aumentoatributos;
                } else if (typeof item.aumentoatributos === 'object') {
                    atributos = Object.entries(item.aumentoatributos)
                        .map(([attr, value]) => `${attr.toUpperCase()} +${value}`)
                        .join(', ');
                }
            }
            
            stats = `
                ${atributos ? `<div class="selection-card-stat">${atributos}</div>` : ''}
                ${item.deslocamento ? `<div class="selection-card-stat">${item.deslocamento} pés</div>` : ''}
                ${item.subracas && item.subracas.length > 0 ? `<div class="selection-card-stat">${item.subracas.length} sub-raças</div>` : ''}
            `;
        } else if (type === 'subrace') {
            icon = '✨';
            
            let atributos = '';
            if (item.aumentoatributos) {
                if (typeof item.aumentoatributos === 'string') {
                    atributos = item.aumentoatributos;
                } else if (typeof item.aumentoatributos === 'object') {
                    atributos = Object.entries(item.aumentoatributos)
                        .map(([attr, value]) => `${attr.toUpperCase()} +${value}`)
                        .join(', ');
                }
            }
            
            stats = `
                ${atributos ? `<div class="selection-card-stat">+${atributos}</div>` : ''}
            `;
        } else if (type === 'class') {
            icon = this.getClassIcon(itemName);
            
            stats = `
                ${item.hitdice ? `<div class="selection-card-stat">Dado de Vida: ${item.hitdice}</div>` : ''}
                ${item.atributoprincipal ? `<div class="selection-card-stat">Principal: ${item.atributoprincipal}</div>` : ''}
            `;
        } else if (type === 'background') {
            icon = this.getBackgroundIcon(itemName);
            
            const skills = item.proficiencias?.pericias?.join(', ') || '';
            stats = skills ? `<div class="selection-card-stat">${skills}</div>` : '';
        } else if (type === 'subclass') {
            icon = '✨';
            stats = '';
        }

        card.innerHTML = `
            <div class="selection-card-icon">${icon}</div>
            <div class="selection-card-title">${itemName}</div>
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
            // Salva a raça selecionada temporariamente
            this.tempSelectedRace = item;
            
            // Mostra informações da raça no topo do modal
            this.showRaceInfo(item);
            
            // Check for subraces - mostra botão de sub-raças
            if (item.subracas && item.subracas.length > 0) {
                this.showSubraceButton(item);
            } else {
                this.hideSubraceButton();
            }
            
            // Habilita botão de confirmar
            this.enableConfirmRaceButton();
            
        } else if (type === 'subrace') {
            // Quando seleciona uma sub-raça
            this.tempSelectedSubrace = item;
            this.showSubraceInfo(item);
            this.enableConfirmSubraceButton();
            
        } else if (type === 'class') {
            const className = item.nome || item.name || 'Classe';
            this.character.class = className;
            document.getElementById('class').value = className;
            document.getElementById('selectedClassLabel').textContent = className;
            document.getElementById('selectClassBtn').classList.add('selected');
            
            console.log('✅ Classe selecionada:', className);
            console.log('🔍 Verificando subclasses...', item);
            console.log('   - item.subclasses:', item.subclasses);
            console.log('   - item.subclassesl:', item.subclassesl); 
            console.log('   - Todas as chaves:', Object.keys(item));
            
            // Suporta múltiplos formatos de subclasses
            const subclassesField = item.subclasses || item.subclassesl || item.subclasss || [];
            
            console.log('   - Subclasses encontradas:', subclassesField);
            
            // Show subclass option if available
            if (subclassesField && subclassesField.length > 0) {
                console.log('✅ Mostrando opção de subclasse');
                document.getElementById('subclassGroup').style.display = 'block';
            } else {
                console.log('❌ Nenhuma subclasse disponível para', className);
            }
            
            setTimeout(() => this.closeModals(), 300);
        } else if (type === 'subclass') {
            const subclassName = item.nome || item.name || 'Subclasse';
            this.character.subclass = subclassName;
            document.getElementById('subclass').value = subclassName;
            document.getElementById('selectedSubclassLabel').textContent = subclassName;
            document.getElementById('selectSubclassBtn').classList.add('selected');
            
            console.log('✅ Subclasse selecionada:', subclassName);
            
            setTimeout(() => this.closeModals(), 300);
        } else if (type === 'background') {
            const backgroundName = item.nome || item.name || 'Antecedente';
            this.character.background = backgroundName;
            document.getElementById('background').value = backgroundName;
            document.getElementById('selectedBackgroundLabel').textContent = backgroundName;
            document.getElementById('selectBackgroundBtn').classList.add('selected');
            
            console.log('✅ Antecedente selecionado:', backgroundName);
            
            setTimeout(() => this.closeModals(), 300);
        }

        this.saveProgress();
    }

    showRaceInfo(race) {
        const modal = document.getElementById('raceSelectionModal');
        let infoDiv = modal.querySelector('.race-info-display');
        
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.className = 'race-info-display';
            modal.querySelector('.modal-content').insertBefore(infoDiv, modal.querySelector('.selection-grid'));
        }
        
        // === FORMATAR TODOS OS DADOS ===
        
        // Atributos
        let atributos = '';
        if (race.aumentoatributos) {
            if (typeof race.aumentoatributos === 'string') {
                atributos = race.aumentoatributos;
            } else if (typeof race.aumentoatributos === 'object') {
                atributos = Object.entries(race.aumentoatributos)
                    .map(([attr, value]) => `${attr.toUpperCase()} +${value}`)
                    .join(', ');
            }
        }
        
        // Idiomas
        let idiomas = '';
        if (race.idiomas && Array.isArray(race.idiomas)) {
            idiomas = race.idiomas.join(', ');
        }
        
        // Habilidades Raciais (detalhadas)
        let habilidadesHTML = '';
        if (race.habilidades && Array.isArray(race.habilidades)) {
            habilidadesHTML = race.habilidades.map(h => {
                if (typeof h === 'string') {
                    return `<li><strong>${h}</strong></li>`;
                } else if (typeof h === 'object' && h.nome) {
                    return `
                        <li>
                            <strong>${h.nome}:</strong> 
                            ${h.descricao || ''}
                        </li>
                    `;
                }
                return '';
            }).filter(h => h).join('');
        }
        
        // Proficiências
        let proficienciasHTML = '';
        if (race.proficiencias) {
            const profs = [];
            if (race.proficiencias.armas) profs.push(`<li><strong>Armas:</strong> ${race.proficiencias.armas.join(', ')}</li>`);
            if (race.proficiencias.ferramentas) profs.push(`<li><strong>Ferramentas:</strong> ${race.proficiencias.ferramentas.join(', ')}</li>`);
            proficienciasHTML = profs.join('');
        }
        
        infoDiv.innerHTML = `
            <div class="info-header">
                <h3>${this.getRaceIcon(race.nome)} ${race.nome}</h3>
                ${race.descricao ? `<p class="info-description">${race.descricao}</p>` : ''}
            </div>
            
            <div class="info-sections">
                <!-- Atributos -->
                ${atributos ? `
                    <div class="info-section">
                        <h4>⚡ Aumento de Atributos</h4>
                        <p class="info-value">${atributos}</p>
                    </div>
                ` : ''}
                
                <!-- Características Físicas -->
                <div class="info-section">
                    <h4>📏 Características</h4>
                    <ul class="info-list">
                        ${race.tamanho ? `<li><strong>Tamanho:</strong> ${race.tamanho}</li>` : ''}
                        ${race.deslocamento ? `<li><strong>Deslocamento:</strong> ${race.deslocamento} pés</li>` : ''}
                        ${race.visaonoescuro ? `<li><strong>Visão no Escuro:</strong> ${race.visaonoescuro} pés</li>` : ''}
                    </ul>
                </div>
                
                <!-- Idiomas -->
                ${idiomas || race.idiomasextras ? `
                    <div class="info-section">
                        <h4>🗣️ Idiomas</h4>
                        <ul class="info-list">
                            ${idiomas ? `<li><strong>Você fala:</strong> ${idiomas}</li>` : ''}
                            ${race.idiomasextras ? `<li><strong>Escolha:</strong> +${race.idiomasextras} idioma(s) adicional(is)</li>` : ''}
                        </ul>
                    </div>
                ` : ''}
                
                <!-- Habilidades Raciais -->
                ${habilidadesHTML ? `
                    <div class="info-section">
                        <h4>✨ Habilidades Raciais</h4>
                        <ul class="info-list habilidades-list">
                            ${habilidadesHTML}
                        </ul>
                    </div>
                ` : ''}
                
                <!-- Proficiências -->
                ${proficienciasHTML ? `
                    <div class="info-section">
                        <h4>🎯 Proficiências</h4>
                        <ul class="info-list">
                            ${proficienciasHTML}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        
        infoDiv.style.display = 'block';
    }

    showSubraceButton(race) {
        const modal = document.getElementById('raceSelectionModal');
        let buttonDiv = modal.querySelector('.subrace-button-container');
        
        if (!buttonDiv) {
            buttonDiv = document.createElement('div');
            buttonDiv.className = 'subrace-button-container';
            const grid = modal.querySelector('.selection-grid');
            grid.parentNode.insertBefore(buttonDiv, grid.nextSibling);
        }
        
        buttonDiv.innerHTML = `
            <button type="button" class="btn-subrace" onclick="characterCreation.openSubraceModal()">
                ✨ Ver Sub-raças (${race.subracas.length} disponíveis)
            </button>
        `;
        buttonDiv.style.display = 'block';
    }

    hideSubraceButton() {
        const modal = document.getElementById('raceSelectionModal');
        const buttonDiv = modal.querySelector('.subrace-button-container');
        if (buttonDiv) {
            buttonDiv.style.display = 'none';
        }
    }

    enableConfirmRaceButton() {
        const modal = document.getElementById('raceSelectionModal');
        let actionsDiv = modal.querySelector('.modal-actions-bottom');
        
        if (!actionsDiv) {
            actionsDiv = document.createElement('div');
            actionsDiv.className = 'modal-actions-bottom';
            modal.querySelector('.modal-content').appendChild(actionsDiv);
        }
        
        actionsDiv.innerHTML = `
            <button type="button" class="btn-cancel" onclick="characterCreation.closeModals()">Cancelar</button>
            <button type="button" class="btn-confirm" onclick="characterCreation.confirmRaceSelection()">Confirmar Raça</button>
        `;
        actionsDiv.style.display = 'flex';
    }

    confirmRaceSelection() {
        if (this.tempSelectedRace) {
            const raceName = this.tempSelectedRace.nome || this.tempSelectedRace.name || 'Raça';
            this.character.race = raceName;
            document.getElementById('race').value = raceName;
            document.getElementById('selectedRaceLabel').textContent = raceName;
            document.getElementById('selectRaceBtn').classList.add('selected');
            
            console.log('✅ Raça confirmada:', raceName);
            
            if (this.tempSelectedSubrace) {
                const subraceName = this.tempSelectedSubrace.nome || this.tempSelectedSubrace.name || 'Sub-raça';
                this.character.subrace = subraceName;
                console.log('✅ Sub-raça confirmada:', subraceName);
            }
            
            this.closeModals();
            this.tempSelectedRace = null;
            this.tempSelectedSubrace = null;
        }
    }

    openSubraceModal() {
        console.log('🎭 Abrindo modal de sub-raças...');
        console.log('Raça temporária:', this.tempSelectedRace);
        
        if (!this.tempSelectedRace) {
            console.error('❌ Nenhuma raça selecionada!');
            return;
        }
        
        // Esconde o modal de raças
        document.getElementById('raceSelectionModal').style.display = 'none';
        
        // Mostra modal de sub-raças
        const modal = document.getElementById('subraceSelectionModal');
        const grid = document.getElementById('subraceSelectionGrid');
        
        grid.innerHTML = '';
        
        console.log('Sub-raças disponíveis:', this.tempSelectedRace.subracas);
        
        this.tempSelectedRace.subracas.forEach(subrace => {
            const card = this.createSelectionCard(subrace, 'subrace');
            grid.appendChild(card);
        });
        
        // Mostra info da raça no topo
        this.showRaceInfoInSubraceModal(this.tempSelectedRace);
        
        // Adiciona botões
        this.addSubraceModalActions();
        
        modal.style.display = 'block';
        console.log('✅ Modal de sub-raças aberto');
    }

    showRaceInfoInSubraceModal(race) {
        const modal = document.getElementById('subraceSelectionModal');
        let infoDiv = modal.querySelector('.race-info-display');
        
        if (!infoDiv) {
            infoDiv = document.createElement('div');
            infoDiv.className = 'race-info-display';
            modal.querySelector('.modal-content').insertBefore(infoDiv, modal.querySelector('h2').nextSibling);
        }
        
        infoDiv.innerHTML = `
            <p class="parent-race-info">
                <strong>Raça Base:</strong> ${this.getRaceIcon(race.nome)} ${race.nome}
            </p>
        `;
        infoDiv.style.display = 'block';
    }

    showSubraceInfo(subrace) {
        console.log('📋 Mostrando info da sub-raça:', subrace);
        
        const modal = document.getElementById('subraceSelectionModal');
        let infoDiv = modal.querySelector('.subrace-info-display');
        
        if (!infoDiv) {
            console.log('🆕 Criando div de info da sub-raça');
            infoDiv = document.createElement('div');
            infoDiv.className = 'subrace-info-display';
            const raceInfo = modal.querySelector('.race-info-display');
            raceInfo.parentNode.insertBefore(infoDiv, raceInfo.nextSibling);
        }
        
        // Formatar atributos adicionais - SUPORTA MÚLTIPLOS FORMATOS
        let atributos = '';
        const atributoField = subrace.aumentoatributos || subrace.aumentoAtributos || subrace.abilityScoreIncrease;
        
        if (atributoField) {
            if (typeof atributoField === 'string') {
                atributos = atributoField;
            } else if (typeof atributoField === 'object') {
                atributos = Object.entries(atributoField)
                    .map(([attr, value]) => `${attr.toUpperCase()} +${value}`)
                    .join(', ');
            }
        }
        
        console.log('⚡ Atributos formatados:', atributos);
        
        // Habilidades da sub-raça (detalhadas) - SUPORTA MÚLTIPLOS FORMATOS
        let habilidadesHTML = '';
        const habilidadesField = subrace.habilidades || subrace.caracteristicas || subrace.traits;
        
        if (habilidadesField && Array.isArray(habilidadesField)) {
            habilidadesHTML = habilidadesField.map(h => {
                if (typeof h === 'string') {
                    return `<li><strong>${h}</strong></li>`;
                } else if (typeof h === 'object') {
                    const nome = h.nome || h.name || '';
                    const desc = h.descricao || h.description || h.desc || '';
                    if (nome) {
                        return `
                            <li>
                                <strong>${nome}:</strong> 
                                ${desc}
                            </li>
                        `;
                    }
                }
                return '';
            }).filter(h => h).join('');
        }
        
        console.log('✨ Habilidades HTML:', habilidadesHTML);
        
        // Proficiências da sub-raça
        let proficienciasHTML = '';
        if (subrace.proficiencias) {
            const profs = [];
            if (subrace.proficiencias.armas) profs.push(`<li><strong>Armas:</strong> ${subrace.proficiencias.armas.join(', ')}</li>`);
            if (subrace.proficiencias.armaduras) profs.push(`<li><strong>Armaduras:</strong> ${subrace.proficiencias.armaduras.join(', ')}</li>`);
            if (subrace.proficiencias.ferramentas) profs.push(`<li><strong>Ferramentas:</strong> ${subrace.proficiencias.ferramentas.join(', ')}</li>`);
            proficienciasHTML = profs.join('');
        }
        
        console.log('🎯 Proficiências HTML:', proficienciasHTML);
        
        const descricao = subrace.descricao || subrace.description || '';
        const nome = subrace.nome || subrace.name || 'Sub-raça';
        
        const finalHTML = `
            <div class="info-header subrace-header">
                <h4>✨ ${nome}</h4>
                ${descricao ? `<p class="info-description">${descricao}</p>` : ''}
            </div>
            
            <div class="info-sections">
                <!-- Atributos Adicionais -->
                ${atributos ? `
                    <div class="info-section-inline">
                        <strong>⚡ Atributos Adicionais:</strong> ${atributos}
                    </div>
                ` : ''}
                
                <!-- Habilidades -->
                ${habilidadesHTML ? `
                    <div class="info-section-inline">
                        <strong>✨ Habilidades:</strong>
                        <ul class="info-list-compact">
                            ${habilidadesHTML}
                        </ul>
                    </div>
                ` : ''}
                
                <!-- Proficiências -->
                ${proficienciasHTML ? `
                    <div class="info-section-inline">
                        <strong>🎯 Proficiências:</strong>
                        <ul class="info-list-compact">
                            ${proficienciasHTML}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
        
        console.log('📄 HTML final da sub-raça:', finalHTML);
        infoDiv.innerHTML = finalHTML;
        infoDiv.style.display = 'block';
        console.log('✅ Info da sub-raça exibida');
    }

    addSubraceModalActions() {
        const modal = document.getElementById('subraceSelectionModal');
        let actionsDiv = modal.querySelector('.modal-actions-bottom');
        
        if (!actionsDiv) {
            actionsDiv = document.createElement('div');
            actionsDiv.className = 'modal-actions-bottom';
            modal.querySelector('.modal-content').appendChild(actionsDiv);
        }
        
        actionsDiv.innerHTML = `
            <button type="button" class="btn-cancel" onclick="characterCreation.backToRaceModal()">← Voltar</button>
            <button type="button" class="btn-confirm" onclick="characterCreation.confirmSubraceSelection()">Confirmar Sub-raça</button>
        `;
        actionsDiv.style.display = 'flex';
    }

    enableConfirmSubraceButton() {
        // Botão já está criado, só precisa estar habilitado
    }

    backToRaceModal() {
        document.getElementById('subraceSelectionModal').style.display = 'none';
        document.getElementById('raceSelectionModal').style.display = 'block';
    }

    confirmSubraceSelection() {
        if (this.tempSelectedRace) {
            const raceName = this.tempSelectedRace.nome || this.tempSelectedRace.name || 'Raça';
            this.character.race = raceName;
            document.getElementById('race').value = raceName;
            
            let labelText = raceName;
            if (this.tempSelectedSubrace) {
                const subraceName = this.tempSelectedSubrace.nome || this.tempSelectedSubrace.name || 'Sub-raça';
                this.character.subrace = subraceName;
                labelText += ` (${subraceName})`;
                console.log('✅ Sub-raça confirmada:', subraceName);
            }
            
            document.getElementById('selectedRaceLabel').textContent = labelText;
            document.getElementById('selectRaceBtn').classList.add('selected');
            
            console.log('✅ Raça + Sub-raça confirmadas:', labelText);
            
            this.closeModals();
            this.tempSelectedRace = null;
            this.tempSelectedSubrace = null;
        }
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
let characterCreation; // Variável global para acesso aos métodos
document.addEventListener('DOMContentLoaded', () => {
    characterCreation = new CharacterCreation();
    window.characterCreation = characterCreation; // Garante acesso global
    console.log('✅ CharacterCreation inicializado', characterCreation);
});
