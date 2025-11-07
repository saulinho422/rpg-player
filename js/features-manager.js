// ========================================
// FEATURES & TRAITS MANAGER
// ========================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm';

const SUPABASE_URL = 'https://bifiatkpfmrrnfhvgrpb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZmlhdGtwZm1ycm5maHZncnBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM2NTMsImV4cCI6MjA3NjA1OTY1M30.g5S4aT-ml_cgGoJHWudB36EWz-3bonFZW3DEIWNOUAM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class FeaturesManager {
    constructor(characterSheet) {
        this.characterSheet = characterSheet;
        this.features = [];
        this.isUnlocked = false;
        this.editingFeatureId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFeatures();
    }

    setupEventListeners() {
        // Botão adicionar habilidade
        const addBtn = document.getElementById('addFeatureBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openModal());
        }

        // Botão toggle lock
        const lockBtn = document.getElementById('toggleLockFeatures');
        if (lockBtn) {
            lockBtn.addEventListener('click', () => this.toggleLock());
        }

        // Modal: Fechar
        const closeBtn = document.getElementById('closeFeatureModal');
        const cancelBtn = document.getElementById('cancelFeatureBtn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());

        // Modal: Submit form
        const form = document.getElementById('featureForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveFeature();
            });
        }
    }

    async loadFeatures() {
        try {
            if (!this.characterSheet.characterId) return;

            const { data, error } = await supabase
                .from('character_features')
                .select('*')
                .eq('character_id', this.characterSheet.characterId)
                .order('display_order', { ascending: true });

            if (error) throw error;

            this.features = data || [];
            this.renderFeatures();
        } catch (error) {
            console.error('Erro ao carregar habilidades:', error);
        }
    }

    renderFeatures() {
        const container = document.getElementById('featuresList');
        if (!container) return;

        if (this.features.length === 0) {
            container.innerHTML = '<p class="features-empty">Nenhuma habilidade adicionada ainda.</p>';
            return;
        }

        container.innerHTML = this.features.map((feature, index) => `
            <div class="feature-card" data-feature-id="${feature.id}" data-index="${index}" draggable="${this.isUnlocked}">
                <div class="feature-card-header">
                    ${this.isUnlocked ? '<span class="feature-drag-handle">☰</span>' : ''}
                    <div class="feature-card-content" onclick="window.featuresManager.toggleExpand('${feature.id}')">
                        <div class="feature-card-title">${feature.name}</div>
                        <div class="feature-card-meta">
                            <strong>${this.getTypeLabel(feature.type)}</strong>${feature.source ? `: ${feature.source}` : ''}
                        </div>
                    </div>
                    <div class="feature-card-actions">
                        ${this.isUnlocked ? `<button class="feature-action-btn delete" onclick="window.featuresManager.deleteFeature('${feature.id}')" title="Deletar">❌</button>` : ''}
                        <button class="feature-action-btn" onclick="window.featuresManager.editFeature('${feature.id}')" title="Editar">⚙️</button>
                    </div>
                </div>
                ${feature.description ? `<div class="feature-card-description">${feature.description}</div>` : ''}
            </div>
        `).join('');

        // Setup drag & drop if unlocked
        if (this.isUnlocked) {
            this.setupDragAndDrop();
        }
    }

    toggleExpand(featureId) {
        const card = document.querySelector(`[data-feature-id="${featureId}"]`);
        if (card) {
            card.classList.toggle('expanded');
        }
    }

    getTypeLabel(type) {
        const labels = {
            'class': 'Class',
            'feat': 'Feat',
            'racial': 'Racial',
            'background': 'Background'
        };
        return labels[type] || type;
    }

    toggleLock() {
        this.isUnlocked = !this.isUnlocked;
        const lockBtn = document.getElementById('toggleLockFeatures');
        const lockIcon = lockBtn.querySelector('.lock-icon');
        const container = document.getElementById('featuresList');
        
        if (this.isUnlocked) {
            lockIcon.textContent = '🔓';
            lockBtn.classList.add('unlocked');
            container.classList.add('features-unlocked');
        } else {
            lockIcon.textContent = '🔒';
            lockBtn.classList.remove('unlocked');
            container.classList.remove('features-unlocked');
        }
        
        this.renderFeatures();
    }

    openModal(feature = null) {
        const modal = document.getElementById('featureModal');
        const title = modal.querySelector('h2');
        const submitBtn = modal.querySelector('button[type="submit"]');
        
        if (feature) {
            // Modo edição
            this.editingFeatureId = feature.id;
            title.textContent = 'Editar Habilidade';
            submitBtn.textContent = 'Salvar Alterações';
            document.getElementById('featureName').value = feature.name;
            document.getElementById('featureType').value = feature.type;
            document.getElementById('featureSource').value = feature.source || '';
            document.getElementById('featureDescription').value = feature.description || '';
        } else {
            // Modo criação
            this.editingFeatureId = null;
            title.textContent = 'Adicionar Habilidade';
            submitBtn.textContent = 'Adicionar Habilidade';
            document.getElementById('featureForm').reset();
        }
        
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('featureModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Aguarda animação
        document.getElementById('featureForm').reset();
        this.editingFeatureId = null;
    }

    async saveFeature() {
        const name = document.getElementById('featureName').value;
        const type = document.getElementById('featureType').value;
        const source = document.getElementById('featureSource').value;
        const description = document.getElementById('featureDescription').value;

        if (!name || !type) {
            alert('Por favor, preencha os campos obrigatórios.');
            return;
        }

        try {
            const featureData = {
                character_id: this.characterSheet.characterId,
                name,
                type,
                source,
                description,
                display_order: this.editingFeatureId ? undefined : this.features.length
            };

            if (this.editingFeatureId) {
                // Atualizar habilidade existente
                const { error } = await supabase
                    .from('character_features')
                    .update(featureData)
                    .eq('id', this.editingFeatureId);

                if (error) throw error;
            } else {
                // Criar nova habilidade
                const { error } = await supabase
                    .from('character_features')
                    .insert([featureData]);

                if (error) throw error;
            }

            this.closeModal();
            await this.loadFeatures();
        } catch (error) {
            console.error('Erro ao salvar habilidade:', error);
            alert('Erro ao salvar habilidade: ' + error.message);
        }
    }

    editFeature(featureId) {
        const feature = this.features.find(f => f.id === featureId);
        if (feature) {
            this.openModal(feature);
        }
    }

    async deleteFeature(featureId) {
        if (!confirm('Tem certeza que deseja deletar esta habilidade?')) return;

        try {
            const { error } = await supabase
                .from('character_features')
                .delete()
                .eq('id', featureId);

            if (error) throw error;

            await this.loadFeatures();
        } catch (error) {
            console.error('Erro ao deletar habilidade:', error);
            alert('Erro ao deletar habilidade: ' + error.message);
        }
    }

    setupDragAndDrop() {
        const cards = document.querySelectorAll('.feature-card');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', card.innerHTML);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                const draggingCard = document.querySelector('.dragging');
                if (draggingCard !== card) {
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');
                
                const draggingCard = document.querySelector('.dragging');
                if (draggingCard && draggingCard !== card) {
                    this.reorderFeatures(
                        draggingCard.dataset.index,
                        card.dataset.index
                    );
                }
            });
        });
    }

    async reorderFeatures(fromIndex, toIndex) {
        fromIndex = parseInt(fromIndex);
        toIndex = parseInt(toIndex);

        // Reordenar array local
        const [movedFeature] = this.features.splice(fromIndex, 1);
        this.features.splice(toIndex, 0, movedFeature);

        // Atualizar display_order no banco
        try {
            const updates = this.features.map((feature, index) => ({
                id: feature.id,
                display_order: index
            }));

            for (const update of updates) {
                await supabase
                    .from('character_features')
                    .update({ display_order: update.display_order })
                    .eq('id', update.id);
            }

            this.renderFeatures();
        } catch (error) {
            console.error('Erro ao reordenar habilidades:', error);
            await this.loadFeatures(); // Reverter em caso de erro
        }
    }
}

// Exportar para uso global
window.FeaturesManager = FeaturesManager;
