import { auth, db } from './firebase-config.js';
import { UserService, GameDataService } from './database.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Verificar autenticação e permissões de admin
async function checkAdminAccess() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();

            if (!user) {
                window.location.href = '/login.html';
                resolve(null);
                return;
            }

            const profile = await UserService.getProfile(user.uid);

            console.log('🔍 Admin Check - User:', user.uid);
            console.log('🔍 Admin Check - Profile:', profile);

            if (!profile) {
                console.error('❌ Perfil não encontrado');
                showNotification('❌ Erro ao verificar permissões', 'error');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
                resolve(null);
                return;
            }

            if (!profile.is_owner && !profile.is_admin) {
                console.warn('⚠️ Usuário não tem permissões de admin');
                showNotification('❌ Você não tem permissão para acessar esta página', 'error');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
                resolve(null);
                return;
            }

            console.log('✅ Acesso admin autorizado!');
            resolve(profile);
        });
    });
}

// Exibir informações do usuário admin
function displayUserBadge(profile) {
    const badge = document.getElementById('userBadge');
    let roleText = '';

    if (profile.is_owner) {
        roleText = '👑 OWNER';
    } else if (profile.is_admin) {
        roleText = '🛡️ ADMIN';
    }

    if (profile.is_beta_tester) {
        roleText += ' | 🧪 BETA TESTER';
    }

    badge.textContent = `${profile.display_name || 'Admin'} - ${roleText}`;
}

// Carregar contadores de todas as tabelas
async function loadAllCounts() {
    const tables = [
        { id: 'classesCount', table: 'classes' },
        { id: 'racesCount', table: 'races' },
        { id: 'backgroundsCount', table: 'game_backgrounds' },
        { id: 'languagesCount', table: 'languages' },
        { id: 'weaponsCount', table: 'game_weapons' },
        { id: 'armorCount', table: 'game_armor' },
        { id: 'equipmentCount', table: 'game_equipment' },
        { id: 'featsCount', table: 'game_feats' },
        { id: 'usersCount', table: 'users' },
        { id: 'charactersCount', table: 'characters' },
        { id: 'campaignsCount', table: 'campaigns' }
    ];

    for (const item of tables) {
        try {
            const count = await GameDataService.getCount(item.table);
            document.getElementById(item.id).textContent = count;
        } catch (error) {
            console.error(`Erro ao contar ${item.table}:`, error);
            document.getElementById(item.id).textContent = '?';
        }
    }
}

// Funções de Modal
window.openModal = function (type) {
    const modal = document.getElementById('genericModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    let title = '';
    let form = '';

    switch (type) {
        case 'classes':
            title = 'Adicionar Nova Classe';
            form = `
                <form id="addForm" onsubmit="submitClass(event)">
                    <div class="form-group">
                        <label>ID *</label>
                        <input type="text" name="id" required placeholder="barbaro">
                    </div>
                    <div class="form-group">
                        <label>Nome (Inglês) *</label>
                        <input type="text" name="name" required placeholder="Barbarian">
                    </div>
                    <div class="form-group">
                        <label>Nome (Português) *</label>
                        <input type="text" name="name_pt" required placeholder="Bárbaro">
                    </div>
                    <div class="form-group">
                        <label>Dado de Vida *</label>
                        <select name="hit_die" required>
                            <option value="d6">d6</option>
                            <option value="d8">d8</option>
                            <option value="d10">d10</option>
                            <option value="d12">d12</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea name="description" rows="4" placeholder="Descrição da classe..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Lançador de Magia?</label>
                        <select name="spellcaster">
                            <option value="false">Não</option>
                            <option value="true">Sim</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Perícias Disponíveis (separadas por vírgula)</label>
                        <input type="text" name="skills_available" placeholder="Atletismo, Intimidação, Natureza">
                    </div>
                    <div class="form-group">
                        <label>Número de Perícias para Escolher</label>
                        <input type="number" name="skills_choose" value="2" min="0">
                    </div>
                    <button type="submit" class="btn btn-primary">Adicionar Classe</button>
                </form>
            `;
            break;

        case 'races':
            title = 'Adicionar Nova Raça';
            form = `
                <form id="addForm" onsubmit="submitRace(event)">
                    <div class="form-group">
                        <label>Nome (Inglês) *</label>
                        <input type="text" name="name" required placeholder="Dwarf">
                    </div>
                    <div class="form-group">
                        <label>Nome (Português) *</label>
                        <input type="text" name="name_pt" required placeholder="Anão">
                    </div>
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea name="description" rows="4" required placeholder="Descrição da raça..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Aumento de Atributo *</label>
                        <input type="text" name="ability_score_increase" required placeholder="Constituição +2">
                    </div>
                    <div class="form-group">
                        <label>Idade</label>
                        <input type="text" name="age" placeholder="Até 350 anos">
                    </div>
                    <div class="form-group">
                        <label>Alinhamento</label>
                        <input type="text" name="alignment" placeholder="Tende ao bem">
                    </div>
                    <div class="form-group">
                        <label>Tamanho *</label>
                        <select name="size" required>
                            <option value="Tiny">Miúdo</option>
                            <option value="Small">Pequeno</option>
                            <option value="Medium">Médio</option>
                            <option value="Large">Grande</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Velocidade (pés) *</label>
                        <input type="number" name="speed" value="30" required>
                    </div>
                    <div class="form-group">
                        <label>Traços (separados por vírgula)</label>
                        <input type="text" name="traits" placeholder="Visão no Escuro, Resiliência Anã">
                    </div>
                    <div class="form-group">
                        <label>Idiomas (separados por vírgula) *</label>
                        <input type="text" name="languages" required placeholder="Comum, Anão">
                    </div>
                    <button type="submit" class="btn btn-primary">Adicionar Raça</button>
                </form>
            `;
            break;

        case 'backgrounds':
            title = 'Adicionar Novo Antecedente';
            form = `
                <form id="addForm" onsubmit="submitBackground(event)">
                    <div class="form-group">
                        <label>ID *</label>
                        <input type="text" name="id" required placeholder="acolito">
                    </div>
                    <div class="form-group">
                        <label>Nome (Inglês) *</label>
                        <input type="text" name="name" required placeholder="Acolyte">
                    </div>
                    <div class="form-group">
                        <label>Nome (Português) *</label>
                        <input type="text" name="name_pt" required placeholder="Acólito">
                    </div>
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea name="description" rows="4" required placeholder="Descrição do antecedente..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Perícias (separadas por vírgula) *</label>
                        <input type="text" name="skill_proficiencies" required placeholder="Intuição, Religião">
                    </div>
                    <div class="form-group">
                        <label>Ferramentas (separadas por vírgula)</label>
                        <input type="text" name="tool_proficiencies" placeholder="Nenhuma">
                    </div>
                    <div class="form-group">
                        <label>Número de Idiomas</label>
                        <input type="number" name="language_count" value="2" min="0">
                    </div>
                    <button type="submit" class="btn btn-primary">Adicionar Antecedente</button>
                </form>
            `;
            break;

        case 'languages':
            title = 'Adicionar Novo Idioma';
            form = `
                <form id="addForm" onsubmit="submitLanguage(event)">
                    <div class="form-group">
                        <label>Código *</label>
                        <input type="text" name="code" required placeholder="common">
                    </div>
                    <div class="form-group">
                        <label>Nome (Inglês) *</label>
                        <input type="text" name="name" required placeholder="Common">
                    </div>
                    <div class="form-group">
                        <label>Nome (Português) *</label>
                        <input type="text" name="name_pt" required placeholder="Comum">
                    </div>
                    <div class="form-group">
                        <label>Categoria *</label>
                        <select name="category" required>
                            <option value="standard">Padrão</option>
                            <option value="exotic">Exótico</option>
                            <option value="secret">Secreto</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Falantes Típicos (separados por vírgula)</label>
                        <input type="text" name="typical_speakers" placeholder="Humanos, halflings">
                    </div>
                    <div class="form-group">
                        <label>Escrita</label>
                        <input type="text" name="script" placeholder="Comum">
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea name="description" rows="3" placeholder="Descrição do idioma..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Adicionar Idioma</button>
                </form>
            `;
            break;

        case 'weapons':
            title = 'Adicionar Nova Arma';
            form = `
                <form id="addForm" onsubmit="submitWeapon(event)">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" name="name" required placeholder="Espada Longa">
                    </div>
                    <div class="form-group">
                        <label>Categoria *</label>
                        <select name="category" required>
                            <option value="simple_melee">Corpo a Corpo Simples</option>
                            <option value="simple_ranged">À Distância Simples</option>
                            <option value="martial_melee">Corpo a Corpo Marcial</option>
                            <option value="martial_ranged">À Distância Marcial</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Custo (PO) *</label>
                        <input type="number" name="cost" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Dano *</label>
                        <input type="text" name="damage" required placeholder="1d8">
                    </div>
                    <div class="form-group">
                        <label>Tipo de Dano *</label>
                        <select name="damage_type" required>
                            <option value="slashing">Cortante</option>
                            <option value="piercing">Perfurante</option>
                            <option value="bludgeoning">Concussão</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Peso (lb) *</label>
                        <input type="number" name="weight" required step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Propriedades (separadas por vírgula)</label>
                        <input type="text" name="properties" placeholder="Versátil (1d10)">
                    </div>
                    <button type="submit" class="btn btn-primary">Adicionar Arma</button>
                </form>
            `;
            break;

        case 'armor':
            title = 'Adicionar Nova Armadura';
            form = `
                <form id="addForm" onsubmit="submitArmor(event)">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" name="name" required placeholder="Cota de Malha">
                    </div>
                    <div class="form-group">
                        <label>Categoria *</label>
                        <select name="category" required>
                            <option value="light">Leve</option>
                            <option value="medium">Média</option>
                            <option value="heavy">Pesada</option>
                            <option value="shield">Escudo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>CA Base *</label>
                        <input type="number" name="armor_class" required>
                    </div>
                    <div class="form-group">
                        <label>Modificador de Destreza</label>
                        <input type="text" name="dex_modifier" placeholder="max 2">
                    </div>
                    <div class="form-group">
                        <label>Custo (PO) *</label>
                        <input type="number" name="cost" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Peso (lb) *</label>
                        <input type="number" name="weight" required step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Requer Força Mínima?</label>
                        <input type="number" name="strength_requirement" placeholder="0" value="0">
                    </div>
                    <div class="form-group">
                        <label>Desvantagem em Furtividade?</label>
                        <select name="stealth_disadvantage">
                            <option value="false">Não</option>
                            <option value="true">Sim</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Adicionar Armadura</button>
                </form>
            `;
            break;

        case 'equipment':
            title = 'Adicionar Novo Equipamento';
            form = `
                <form id="addForm" onsubmit="submitEquipment(event)">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" name="name" required placeholder="Corda de Cânhamo">
                    </div>
                    <div class="form-group">
                        <label>Categoria *</label>
                        <input type="text" name="category" required placeholder="Equipamento de Aventura">
                    </div>
                    <div class="form-group">
                        <label>Custo (PO) *</label>
                        <input type="number" name="cost" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Peso (lb)</label>
                        <input type="number" name="weight" step="0.1" value="0">
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea name="description" rows="3" placeholder="Descrição do item..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Adicionar Equipamento</button>
                </form>
            `;
            break;

        case 'feats':
            title = 'Adicionar Novo Talento';
            form = `
                <form id="addForm" onsubmit="submitFeat(event)">
                    <div class="form-group">
                        <label>Nome *</label>
                        <input type="text" name="name" required placeholder="Mestre em Combate">
                    </div>
                    <div class="form-group">
                        <label>Pré-requisitos</label>
                        <input type="text" name="prerequisites" placeholder="Força 13 ou superior">
                    </div>
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea name="description" rows="5" required placeholder="Descrição completa do talento..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Adicionar Talento</button>
                </form>
            `;
            break;

        default:
            title = 'Funcionalidade em Desenvolvimento';
            form = '<p>Esta funcionalidade está em desenvolvimento.</p>';
    }

    modalTitle.textContent = title;
    modalBody.innerHTML = form;
    modal.classList.add('active');
}

window.closeModal = function () {
    document.getElementById('genericModal').classList.remove('active');
}

// Funções de submissão de formulários
window.submitClass = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        id: formData.get('id'),
        name: formData.get('name'),
        name_pt: formData.get('name_pt'),
        hit_die: formData.get('hit_die'),
        description: formData.get('description'),
        spellcaster: formData.get('spellcaster') === 'true',
        skills_available: formData.get('skills_available') ? formData.get('skills_available').split(',').map(s => s.trim()) : [],
        skills_choose: parseInt(formData.get('skills_choose')) || 2
    };

    try {
        await GameDataService.addItem('classes', data);
        showNotification('✅ Classe adicionada com sucesso!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro ao adicionar classe: ' + error.message, 'error');
    }
}

window.submitRace = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        name_pt: formData.get('name_pt'),
        description: formData.get('description'),
        ability_score_increase: formData.get('ability_score_increase'),
        age: formData.get('age'),
        alignment: formData.get('alignment'),
        size: formData.get('size'),
        speed: parseInt(formData.get('speed')),
        traits: formData.get('traits') ? formData.get('traits').split(',').map(s => s.trim()) : [],
        languages: formData.get('languages').split(',').map(s => s.trim())
    };

    try {
        await GameDataService.addItem('races', data);
        showNotification('✅ Raça adicionada com sucesso!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro ao adicionar raça: ' + error.message, 'error');
    }
}

window.submitBackground = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        id: formData.get('id'),
        name: formData.get('name'),
        name_pt: formData.get('name_pt'),
        description: formData.get('description'),
        skill_proficiencies: formData.get('skill_proficiencies').split(',').map(s => s.trim()),
        tool_proficiencies: formData.get('tool_proficiencies') ? formData.get('tool_proficiencies').split(',').map(s => s.trim()) : [],
        language_count: parseInt(formData.get('language_count')) || 0
    };

    try {
        await GameDataService.addItem('game_backgrounds', data);
        showNotification('✅ Antecedente adicionado com sucesso!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro ao adicionar antecedente: ' + error.message, 'error');
    }
}

window.submitLanguage = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        code: formData.get('code'),
        name: formData.get('name'),
        name_pt: formData.get('name_pt'),
        category: formData.get('category'),
        typical_speakers: formData.get('typical_speakers') ? formData.get('typical_speakers').split(',').map(s => s.trim()) : [],
        script: formData.get('script'),
        description: formData.get('description')
    };

    try {
        await GameDataService.addItem('languages', data);
        showNotification('✅ Idioma adicionado com sucesso!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro ao adicionar idioma: ' + error.message, 'error');
    }
}

window.submitWeapon = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        category: formData.get('category'),
        cost: parseFloat(formData.get('cost')),
        damage: formData.get('damage'),
        damage_type: formData.get('damage_type'),
        weight: parseFloat(formData.get('weight')),
        properties: formData.get('properties') ? formData.get('properties').split(',').map(s => s.trim()) : []
    };

    try {
        await GameDataService.addItem('game_weapons', data);
        showNotification('✅ Arma adicionada com sucesso!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro ao adicionar arma: ' + error.message, 'error');
    }
}

window.submitArmor = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        category: formData.get('category'),
        armor_class: parseInt(formData.get('armor_class')),
        dex_modifier: formData.get('dex_modifier') || null,
        cost: parseFloat(formData.get('cost')),
        weight: parseFloat(formData.get('weight')),
        strength_requirement: parseInt(formData.get('strength_requirement')) || 0,
        stealth_disadvantage: formData.get('stealth_disadvantage') === 'true'
    };

    try {
        await GameDataService.addItem('game_armor', data);
        showNotification('✅ Armadura adicionada com sucesso!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro ao adicionar armadura: ' + error.message, 'error');
    }
}

window.submitEquipment = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        category: formData.get('category'),
        cost: parseFloat(formData.get('cost')),
        weight: parseFloat(formData.get('weight')) || 0,
        description: formData.get('description')
    };

    try {
        await GameDataService.addItem('game_equipment', data);
        showNotification('✅ Equipamento adicionado com sucesso!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro ao adicionar equipamento: ' + error.message, 'error');
    }
}

window.submitFeat = async function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        prerequisites: formData.get('prerequisites') || null,
        description: formData.get('description')
    };

    try {
        await GameDataService.addItem('game_feats', data);
        showNotification('✅ Talento adicionado com sucesso!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro ao adicionar talento: ' + error.message, 'error');
    }
}

// Função para visualizar tabelas (simplificada - pode ser expandida)
window.viewTable = function (table) {
    showNotification(`📊 Visualização de tabelas será implementada em breve`, 'info');
    // TODO: Implementar listagem completa com edição/exclusão
}

// Função de notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Logout
window.logout = async function () {
    await signOut(auth);
    localStorage.clear();
    window.location.href = '/login.html';
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const profile = await checkAdminAccess();

    if (profile) {
        displayUserBadge(profile);
        loadAllCounts();
    }
});
