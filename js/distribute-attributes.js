// =====================================
// SISTEMA DE DISTRIBUIÇÃO DE ATRIBUTOS
// =====================================

class AttributeDistributor {
    constructor() {
        this.values = [];
        this.assignments = {
            str: null,
            dex: null,
            con: null,
            int: null,
            wis: null,
            cha: null
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }
    
    async loadValues() {
        try {
            // Tenta carregar dos parâmetros da URL (método preferido)
            const params = new URLSearchParams(window.location.search);
            const values = params.get('values');
            
            if (values) {
                this.values = JSON.parse(decodeURIComponent(values));
                console.log('✅ Valores carregados da URL:', this.values);
                return;
            }

            // Se não tem na URL, verifica se tem personagem para carregar
            const characterId = params.get('id');
            if (characterId) {
                await this.loadFromDatabase(characterId);
                return;
            }

            // Fallback: valores padrão se nada foi encontrado
            console.warn('⚠️ Nenhum valor encontrado, usando padrão');
            this.values = [15, 14, 13, 12, 10, 8]; // Array padrão
            
        } catch (error) {
            console.error('❌ Erro ao carregar valores:', error);
            // Usa valores padrão em caso de erro
            this.values = [15, 14, 13, 12, 10, 8];
        }
    }

    async loadFromDatabase(characterId) {
        try {
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm');
            const supabase = createClient(
                'https://bifiatkpfmrrnfhvgrpb.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'
            );

            const { data, error } = await supabase
                .from('characters')
                .select('strength, dexterity, constitution, intelligence, wisdom, charisma')
                .eq('id', characterId)
                .single();

            if (error) throw error;

            if (data) {
                // Converte atributos salvos em valores disponíveis para redistribuir
                this.values = [
                    data.strength, data.dexterity, data.constitution,
                    data.intelligence, data.wisdom, data.charisma
                ].sort((a, b) => b - a); // Ordena decrescente
                
                console.log('✅ Atributos carregados do banco:', this.values);
            } else {
                this.values = [15, 14, 13, 12, 10, 8]; // Padrão
            }
        } catch (error) {
            console.error('❌ Erro ao carregar do banco:', error);
            this.values = [15, 14, 13, 12, 10, 8]; // Padrão
        }
    }
    
    renderValues() {
        const pool = document.getElementById('valuesPool');
        pool.innerHTML = '';
        
        this.values.forEach((value, index) => {
            const chip = document.createElement('div');
            chip.className = 'value-chip';
            chip.textContent = value;
            chip.draggable = true;
            chip.dataset.value = value;
            chip.dataset.index = index;
            
            pool.appendChild(chip);
        });
    }
    
    setupEventListeners() {
        document.getElementById('backBtn').addEventListener('click', () => {
            if (confirm('Tem certeza? Seus valores serão perdidos.')) {
                window.history.back();
            }
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('finishBtn').addEventListener('click', () => {
            this.finish();
        });
    }
    
    setupDragAndDrop() {
        let draggedChip = null;
        
        // Event listeners para os chips de valores
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('value-chip')) {
                draggedChip = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', e.target.dataset.value);
                e.dataTransfer.setData('index', e.target.dataset.index);
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('value-chip')) {
                e.target.classList.remove('dragging');
                draggedChip = null;
            }
        });
        
        // Event listeners para as zonas de drop
        const dropZones = document.querySelectorAll('.attribute-drop-zone');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', (e) => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                
                const value = parseInt(e.dataTransfer.getData('text/plain'));
                const index = e.dataTransfer.getData('index');
                const attribute = zone.dataset.attribute;
                
                this.assignValue(attribute, value, index, draggedChip);
            });
        });
    }
    
    assignValue(attribute, value, index, chipElement) {
        // Verifica se o valor já está sendo usado no MESMO índice
        const currentAssignment = this.assignments[attribute];
        
        // Remove valor anterior se existir
        if (currentAssignment && currentAssignment.chip) {
            this.returnValueToPool(currentAssignment.value, currentAssignment.index);
        }
        
        // Atribui novo valor com referência ao chip
        this.assignments[attribute] = {
            value: value,
            index: index,
            chip: chipElement
        };
        
        // Remove do pool apenas o chip específico
        if (chipElement && chipElement.parentNode) {
            chipElement.remove();
        }
        
        // Atualiza display
        this.updateAttributeDisplay(attribute, value);
        
        // Calcula modificador
        this.calculateModifier(attribute, value);
        
        // Verifica se todos os atributos foram preenchidos
        this.checkCompletion();
    }
    
    removeValueFromPool(chipElement) {
        if (chipElement && chipElement.parentNode) {
            chipElement.remove();
        }
    }
    
    returnValueToPool(value, index) {
        const pool = document.getElementById('valuesPool');
        const chip = document.createElement('div');
        chip.className = 'value-chip';
        chip.textContent = value;
        chip.draggable = true;
        chip.dataset.value = value;
        chip.dataset.index = index;
        
        // Insere na posição correta (ordenado)
        const chips = Array.from(pool.children);
        let inserted = false;
        
        for (let i = 0; i < chips.length; i++) {
            if (parseInt(chips[i].dataset.value) < value) {
                pool.insertBefore(chip, chips[i]);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            pool.appendChild(chip);
        }
    }
    
    updateAttributeDisplay(attribute, value) {
        const zone = document.querySelector(`.attribute-drop-zone[data-attribute="${attribute}"]`);
        zone.classList.add('filled');
        zone.innerHTML = `<div class="attribute-value">${value}</div>`;
    }
    
    calculateModifier(attribute, value) {
        // Fórmula D&D: (Atributo - 10) / 2, arredondado para baixo
        const modifier = Math.floor((value - 10) / 2);
        
        const modElement = document.querySelector(`.mod-value[data-mod="${attribute}"]`);
        modElement.textContent = modifier >= 0 ? `+${modifier}` : modifier;
        
        // Animação
        modElement.style.animation = 'none';
        setTimeout(() => {
            modElement.style.animation = 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }, 10);
    }
    
    checkCompletion() {
        const allFilled = Object.values(this.assignments).every(val => val !== null);
        
        if (allFilled) {
            document.getElementById('finishBtn').style.display = 'block';
            
            // Efeito de conclusão
            this.showCompletionEffect();
        } else {
            document.getElementById('finishBtn').style.display = 'none';
        }
    }
    
    showCompletionEffect() {
        // Animação de celebração
        const slots = document.querySelectorAll('.attribute-slot');
        slots.forEach((slot, index) => {
            setTimeout(() => {
                slot.style.animation = 'none';
                setTimeout(() => {
                    slot.style.animation = 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                }, 10);
            }, index * 100);
        });
    }
    
    reset() {
        if (!confirm('Tem certeza que deseja resetar? Todos os valores serão devolvidos ao pool.')) {
            return;
        }
        
        // Limpa assignments
        this.assignments = {
            str: null,
            dex: null,
            con: null,
            int: null,
            wis: null,
            cha: null
        };
        
        // Reseta displays
        const zones = document.querySelectorAll('.attribute-drop-zone');
        zones.forEach(zone => {
            zone.classList.remove('filled');
            zone.innerHTML = '<span class="drop-hint">Arraste aqui</span>';
        });
        
        // Reseta modificadores
        const mods = document.querySelectorAll('.mod-value');
        mods.forEach(mod => {
            mod.textContent = '+0';
        });
        
        // Re-renderiza valores
        this.renderValues();
        
        // Esconde botão de finalizar
        document.getElementById('finishBtn').style.display = 'none';
    }
    
    async finish() {
        try {
            // Extrai apenas os valores dos assignments
            const attributes = {};
            Object.keys(this.assignments).forEach(attr => {
                attributes[attr] = this.assignments[attr].value;
            });
            
            console.log('✅ Atributos definidos:', attributes);
            
            // Salva no banco de dados
            await this.saveAttributesToDatabase(attributes);
            
            // Redireciona para a ficha
            const params = new URLSearchParams(window.location.search);
            const characterId = params.get('id');
            const returnTo = params.get('return_to');
            
            if (characterId && returnTo) {
                window.location.href = `${returnTo}?id=${characterId}`;
            } else if (characterId) {
                window.location.href = `character-sheet.html?id=${characterId}`;
            } else {
                window.location.href = 'character-sheet.html';
            }
        } catch (error) {
            console.error('❌ Erro ao salvar atributos:', error);
            alert('Erro ao salvar atributos. Tente novamente.');
        }
    }

    async saveAttributesToDatabase(attributes) {
        // Importa Supabase
        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm');
        const supabase = createClient(
            'https://bifiatkpfmrrnfhvgrpb.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM'
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        // Busca o rascunho mais recente ou cria um novo
        const params = new URLSearchParams(window.location.search);
        let characterId = params.get('id');

        if (!characterId) {
            // Buscar rascunho existente
            const { data: drafts } = await supabase
                .from('characters')
                .select('id')
                .eq('user_id', user.id)
                .eq('is_draft', true)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (drafts && drafts.length > 0) {
                characterId = drafts[0].id;
            }
        }

        if (characterId) {
            // Atualiza o personagem/rascunho existente
            const { error } = await supabase
                .from('characters')
                .update({
                    strength: attributes.str,
                    dexterity: attributes.dex,
                    constitution: attributes.con,
                    intelligence: attributes.int,
                    wisdom: attributes.wis,
                    charisma: attributes.cha,
                    draft_step: 'attributes_complete',
                    updated_at: new Date().toISOString()
                })
                .eq('id', characterId);

            if (error) throw error;
            console.log('✅ Atributos salvos no personagem:', characterId);
        } else {
            throw new Error('Nenhum personagem encontrado para atualizar');
        }
    }
}

// Adiciona CSS para animação
const style = document.createElement('style');
style.textContent = `
    @keyframes popIn {
        0% {
            transform: scale(0);
            opacity: 0;
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    const distributor = new AttributeDistributor();
    await distributor.loadValues();
    distributor.renderValues();
    distributor.renderAttributes();
});
