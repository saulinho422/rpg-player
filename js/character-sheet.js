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
        if (!this.characterId) {
            alert('Personagem não encontrado!');
            window.location.href = 'dashboard.html';
            return;
        }

        await this.checkAuth();
        await this.loadCharacter();
        this.populateSheet();
        this.calculateAll();
        this.setupEventListeners();
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
        // In a real implementation, would load from classes.json
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
        // In a real implementation, would load from backgrounds.json
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
        // In a real implementation, would load from races.json
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
