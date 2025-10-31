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
        try {
            // Verificar se existe um rascunho para este usuário
            const draft = await this.loadOrCreateDraft();
            
            if (draft) {
                console.log('📝 Rascunho encontrado, continuando criação:', draft);
                this.character = this.convertDraftToCharacter(draft);
                this.characterId = draft.id; // Para permitir edição do rascunho
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

            // Carregar dados dos JSONs
            await this.loadGameData();
            
            // Setup event listeners dos modais
            this.setupCreationListeners();
            
            // Atualizar visualização dos atributos
            this.updateAttributeDisplays();
            
            // Se há um rascunho carregado, popular a ficha
            if (draft && this.character) {
                // Aguardar um pouco para garantir que DOM está pronto
                setTimeout(() => {
                    this.populateSheet();
                }, 100);
            }
            
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

    async saveDraft() {
        if (!this.characterId) return;
        
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
                avatar_url: this.character.image,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('characters')
                .update(updateData)
                .eq('id', this.characterId);

            if (error) throw error;
            
            console.log('✅ Rascunho salvo automaticamente');
        } catch (error) {
            console.error('❌ Erro ao salvar rascunho:', error);
        }
    }

    setupAutoSave() {
        // Auto-save a cada 30 segundos
        this.autoSaveInterval = setInterval(() => {
            this.saveDraft();
        }, 30000);

        // Auto-save quando sair da página
        window.addEventListener('beforeunload', () => {
            this.saveDraft();
        });

        // Auto-save em mudanças importantes
        const nameField = document.getElementById('charName');
        if (nameField) {
            nameField.addEventListener('input', (e) => {
                this.character.name = e.target.value;
                // Auto-save após 2 segundos de inatividade
                clearTimeout(this.nameTimeout);
                this.nameTimeout = setTimeout(() => this.saveDraft(), 2000);
            });
        }

        // Outros campos importantes
        const importantFields = ['charRace', 'charClass', 'charBackground'];
        importantFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', () => {
                    setTimeout(() => this.saveDraft(), 1000);
                });
            }
        });
    }

    updateAttributeDisplays() {
        // Mapear atributos para os IDs dos inputs
        const attrMap = {
            str: 'strValue',
            dex: 'dexValue',
            con: 'conValue',
            int: 'intValue',
            wis: 'wisValue',
            cha: 'chaValue'
        };

        const modMap = {
            str: 'strMod',
            dex: 'dexMod',
            con: 'conMod',
            int: 'intMod',
            wis: 'wisMod',
            cha: 'chaMod'
        };

        Object.keys(attrMap).forEach(key => {
            const input = document.getElementById(attrMap[key]);
            if (input && this.character.attributes[key]) {
                input.value = this.character.attributes[key];
                
                // Calcular e mostrar modificador
                const mod = Math.floor((this.character.attributes[key] - 10) / 2);
                const modElement = document.getElementById(modMap[key]);
                if (modElement) {
                    modElement.textContent = mod >= 0 ? `+${mod}` : mod;
                }
            }
        });
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
            const raceIcon = race.icon || race.icone || '🧙';
            
            card.innerHTML = `
                <div class="card-icon">${raceIcon}</div>
                <h3>${raceName}</h3>
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
            const classIcon = cls.icon || cls.icone || '⚔️';
            
            card.innerHTML = `
                <div class="card-icon">${classIcon}</div>
                <h3>${className}</h3>
            `;
            
            card.addEventListener('click', () => this.selectClass(cls));
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    openSubclassModal(classData) {
        // Verifica se a classe tem subclasses
        const subclasses = classData.subclasses || classData.subclasses || [];
        
        if (!subclasses || subclasses.length === 0) {
            // Se não tem subclasses, apenas confirma a seleção
            this.confirmClassSelection(classData, null);
            return;
        }

        const modal = document.getElementById('subclassModal');
        if (!modal) {
            // Criar modal dinamicamente se não existir
            this.createSubclassModal();
            return this.openSubclassModal(classData);
        }

        const grid = document.getElementById('subclassGrid');
        const title = modal.querySelector('h2');
        
        const className = classData.name || classData.nome || 'Classe';
        title.textContent = `⚔️ Escolha sua Subclasse de ${className}`;
        
        grid.innerHTML = '';
        
        subclasses.forEach(subcls => {
            const card = document.createElement('div');
            card.className = 'modal-card';
            
            const subclassName = subcls.name || subcls.nome || 'Sem Nome';
            const subclassIcon = subcls.icon || subcls.icone || '🎯';
            
            card.innerHTML = `
                <div class="card-icon">${subclassIcon}</div>
                <h3>${subclassName}</h3>
            `;
            
            card.addEventListener('click', () => {
                this.confirmClassSelection(classData, subcls);
                modal.classList.remove('active');
            });
            grid.appendChild(card);
        });
        
        modal.classList.add('active');
    }

    createSubclassModal() {
        const modalHTML = `
            <div id="subclassModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>⚔️ Escolha sua Subclasse</h2>
                    <div class="modal-grid" id="subclassGrid"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Adicionar event listeners
        const modal = document.getElementById('subclassModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    confirmClassSelection(classData, subclass) {
        this.character.class = classData;
        this.character.subclass = subclass;
        
        const className = classData.name || classData.nome || 'Classe Selecionada';
        const subclassName = subclass ? ` (${subclass.name || subclass.nome})` : '';
        
        document.getElementById('charClassDisplay').textContent = `${className}${subclassName} - Nível ${this.character.level}`;
        document.getElementById('classModal').classList.remove('active');
        this.saveCreationProgress();
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
            const bgIcon = bg.icon || bg.icone || '📜';
            
            card.innerHTML = `
                <div class="card-icon">${bgIcon}</div>
                <h3>${bgName}</h3>
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
        // Fecha o modal de classe
        document.getElementById('classModal').classList.remove('active');
        
        // Abre o modal de subclasse
        setTimeout(() => {
            this.openSubclassModal(cls);
        }, 300);
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

    async saveCreationProgress() {
        // Salvar rascunho no banco de dados
        await this.saveDraft();
        console.log('Progresso salvo no banco:', this.character);
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
        // Verificações de segurança
        if (!this.character) {
            console.warn('⚠️ populateSheet: character não está definido');
            return;
        }

        // Header information - com verificação de elementos
        const charNameEl = document.getElementById('charName');
        if (charNameEl) charNameEl.value = this.character.name || '';

        const charClassEl = document.getElementById('charClass');
        if (charClassEl) charClassEl.value = `${this.getClassName()} Nível ${this.character.level}`;

        const charBackgroundEl = document.getElementById('charBackground');
        if (charBackgroundEl) charBackgroundEl.value = this.getBackgroundName();

        const charRaceEl = document.getElementById('charRace');
        if (charRaceEl) charRaceEl.value = this.getRaceName();

        const charAlignmentEl = document.getElementById('charAlignment');
        if (charAlignmentEl) charAlignmentEl.value = this.formatAlignment(this.character.alignment);

        // Attributes - com verificação
        if (this.character.attributes) {
            Object.keys(this.character.attributes).forEach(attr => {
                const value = this.character.attributes[attr];
                const valueEl = document.getElementById(`${attr}Value`);
                const modEl = document.getElementById(`${attr}Mod`);
                
                if (valueEl) valueEl.value = value;
                
                if (modEl) {
                    // Calculate and display modifier
                    const modifier = Math.floor((value - 10) / 2);
                    modEl.textContent = modifier >= 0 ? `+${modifier}` : modifier;
                }
            });
        }

        // HP - com verificação
        const hpMaxEl = document.getElementById('hpMax');
        const hpCurrentEl = document.getElementById('hpCurrent');
        if (hpMaxEl) hpMaxEl.value = this.character.hp || 8;
        if (hpCurrentEl && !hpCurrentEl.value) hpCurrentEl.value = this.character.hpCurrent || this.character.hp || 8;

        // Hit Dice - com verificação
        const hitDice = this.getHitDice();
        const hitDiceTotalEl = document.getElementById('hitDiceTotal');
        const hitDiceCurrentEl = document.getElementById('hitDiceCurrent');
        if (hitDiceTotalEl) hitDiceTotalEl.value = `${this.character.level}${hitDice}`;
        if (hitDiceCurrentEl && !hitDiceCurrentEl.value) hitDiceCurrentEl.value = `${this.character.level}${hitDice}`;

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

// =====================================
// SIDEBAR MENU
// =====================================

function initSidebarMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.querySelector('.close-sidebar');
    
    if (!menuBtn || !sidebar || !overlay) return;
    
    // Abrir menu
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
    
    // Fechar menu
    const closeSidebar = () => {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };
    
    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    // Ações do menu
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            
            if (action === 'attribute-method') {
                // Vai para a página de atributos, mas mantém o ID na URL
                const params = new URLSearchParams(window.location.search);
                const charId = params.get('id');
                
                if (charId) {
                    window.location.href = `attribute-method.html?return_to=character-sheet.html&id=${charId}`;
                } else {
                    window.location.href = 'attribute-method.html?return_to=character-sheet.html';
                }
            }
            
            closeSidebar();
        });
    });
}

// =====================================
// MODO EDITÁVEL
// =====================================

function initEditMode() {
    const params = new URLSearchParams(window.location.search);
    const isNewCharacter = !params.get('id');
    const finishBtn = document.getElementById('finishBtn');
    
    if (isNewCharacter) {
        // Modo de criação - ficha editável
        enableEditMode();
        if (finishBtn) {
            finishBtn.style.display = 'block';
            finishBtn.addEventListener('click', finishCharacterCreation);
        }
    }
}

function enableEditMode() {
    // Torna campos editáveis
    const nameInput = document.getElementById('charName');
    if (nameInput) {
        nameInput.removeAttribute('readonly');
        nameInput.placeholder = 'Digite o nome do personagem';
    }
    
    // Habilita outros campos conforme necessário
    console.log('✅ Modo de edição ativado');
}

async function finishCharacterCreation() {
    try {
        // Verifica autenticação
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Você precisa estar logado para salvar um personagem!');
            window.location.href = 'login.html';
            return;
        }

        // Pega a instância do CharacterSheet
        const characterSheet = window.characterSheetInstance;
        if (!characterSheet || !characterSheet.character) {
            alert('Erro: dados do personagem não encontrados!');
            return;
        }

        const character = characterSheet.character;
        
        // Validações
        if (!character.name || character.name.trim() === '') {
            alert('Por favor, dê um nome ao seu personagem!');
            return;
        }

        if (!character.attributes || Object.values(character.attributes).some(val => val < 3 || val > 30 || !val)) {
            alert('Por favor, defina os valores dos atributos primeiro através do Menu → Valores de Atributo');
            return;
        }

        // Se é um rascunho, converte para personagem final
        if (characterSheet.characterId) {
            // Atualiza rascunho para personagem completo
            const { error } = await supabase
                .from('characters')
                .update({
                    is_draft: false,
                    draft_step: null,
                    name: character.name.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', characterSheet.characterId);

            if (error) {
                console.error('❌ Erro ao finalizar personagem:', error);
                alert(`Erro ao salvar personagem: ${error.message}`);
                return;
            }

            console.log('✅ Personagem finalizado com sucesso!');
        } else {
            // Caso não tenha rascunho, criar personagem novo
            const characterData = {
                user_id: user.id,
                name: character.name.trim(),
                race: character.race,
                character_class: character.class,
                background: character.background,
                alignment: character.alignment,
                level: character.level || 1,
                experience_points: 0,
                strength: character.attributes.str || 10,
                dexterity: character.attributes.dex || 10,
                constitution: character.attributes.con || 10,
                intelligence: character.attributes.int || 10,
                wisdom: character.attributes.wis || 10,
                charisma: character.attributes.cha || 10,
                hit_points_current: character.hpCurrent || 8,
                hit_points_max: character.hp || 8,
                avatar_url: character.image,
                is_draft: false
            };

            const { data, error } = await supabase
                .from('characters')
                .insert([characterData])
                .select();

            if (error) {
                console.error('❌ Erro ao salvar:', error);
                alert(`Erro ao salvar personagem: ${error.message}`);
                return;
            }

            console.log('✅ Personagem salvo com sucesso:', data);
        }
        
        // Para o auto-save
        if (characterSheet.autoSaveInterval) {
            clearInterval(characterSheet.autoSaveInterval);
        }
        
        alert('✅ Personagem criado com sucesso!');
        
        // Redireciona para dashboard
        window.location.href = 'dashboard.html';
        
    } catch (error) {
        console.error('❌ Erro fatal:', error);
        alert(`Erro ao finalizar personagem: ${error.message}`);
    }
}

// Character Image Upload
function initCharacterImageUpload() {
    const container = document.getElementById('characterImageContainer');
    const input = document.getElementById('characterImageInput');
    const image = document.getElementById('charImage');
    
    if (!container || !input || !image) return;
    
    // Clique no container abre o seletor de arquivo
    container.addEventListener('click', () => {
        input.click();
    });
    
    // Quando selecionar arquivo
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida!');
            return;
        }
        
        // Validar tamanho (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB!');
            return;
        }
        
        // Ler e exibir
        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;
            
            // Salvar no personagem e fazer auto-save
            const characterSheet = window.characterSheetInstance;
            if (characterSheet && characterSheet.character) {
                characterSheet.character.image = event.target.result;
                characterSheet.saveDraft();
            }
            
            console.log('✅ Imagem do personagem atualizada');
        };
        reader.readAsDataURL(file);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.characterSheetInstance = new CharacterSheet();
    initSidebarMenu();
    initEditMode();
    initCharacterImageUpload();
});
