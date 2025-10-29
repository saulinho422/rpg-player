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
        this.loadValues();
        this.renderValues();
        this.setupEventListeners();
        this.setupDragAndDrop();
    }
    
    loadValues() {
        // Carrega valores do localStorage
        const storedValues = localStorage.getItem('attributeValues');
        
        if (storedValues) {
            this.values = JSON.parse(storedValues);
            console.log('✅ Valores carregados:', this.values);
        } else {
            console.error('❌ Nenhum valor encontrado!');
            alert('Erro: Nenhum valor de atributo encontrado. Redirecionando...');
            window.location.href = 'attribute-method.html';
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
    
    finish() {
        // Extrai apenas os valores dos assignments
        const attributes = {};
        Object.keys(this.assignments).forEach(attr => {
            attributes[attr] = this.assignments[attr].value;
        });
        
        // Salva no localStorage
        localStorage.setItem('characterAttributes', JSON.stringify(attributes));
        
        // Calcula e salva modificadores
        const modifiers = {};
        Object.keys(attributes).forEach(attr => {
            modifiers[attr] = Math.floor((attributes[attr] - 10) / 2);
        });
        localStorage.setItem('characterModifiers', JSON.stringify(modifiers));
        
        console.log('✅ Atributos salvos:', attributes);
        console.log('✅ Modificadores salvos:', modifiers);
        
        // Redireciona para a ficha
        const characterId = new URLSearchParams(window.location.search).get('characterId');
        if (characterId) {
            window.location.href = `character-sheet.html?id=${characterId}`;
        } else {
            window.location.href = 'character-sheet.html';
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
document.addEventListener('DOMContentLoaded', () => {
    new AttributeDistributor();
});
