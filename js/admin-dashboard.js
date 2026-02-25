import { auth } from './firebase-config.js';
import { UserService, GameDataService } from './database.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// =====================================
// VERIFICAÇÃO DE ADMIN
// =====================================

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

            if (!profile) {
                showNotification('❌ Erro ao verificar permissões', 'error');
                setTimeout(() => { window.location.href = '/dashboard.html'; }, 2000);
                resolve(null);
                return;
            }

            if (!profile.is_owner && !profile.is_admin) {
                showNotification('❌ Você não tem permissão para acessar esta página', 'error');
                setTimeout(() => { window.location.href = '/dashboard.html'; }, 2000);
                resolve(null);
                return;
            }

            console.log('✅ Acesso admin autorizado!');
            resolve(profile);
        });
    });
}

// =====================================
// UI: BADGE DO USUÁRIO
// =====================================

function displayUserBadge(profile) {
    const badge = document.getElementById('userBadge');
    let roleText = '';

    if (profile.is_owner) {
        roleText = '👑 OWNER';
    } else if (profile.is_admin) {
        roleText = '🛡️ ADMIN';
    }

    if (profile.is_beta_tester) {
        roleText += ' | 🧪 BETA';
    }

    badge.textContent = `${profile.display_name || 'Admin'} — ${roleText}`;
}

// =====================================
// CONTADORES
// =====================================

const GAME_TABLES = [
    { id: 'classesCount', table: 'classes', label: 'Classes' },
    { id: 'racesCount', table: 'races', label: 'Raças' },
    { id: 'backgroundsCount', table: 'game_backgrounds', label: 'Antecedentes' },
    { id: 'languagesCount', table: 'languages', label: 'Idiomas' },
    { id: 'weaponsCount', table: 'game_weapons', label: 'Armas' },
    { id: 'armorCount', table: 'game_armor', label: 'Armaduras' },
    { id: 'equipmentCount', table: 'game_equipment', label: 'Equipamentos' },
    { id: 'featsCount', table: 'game_feats', label: 'Talentos' }
];

const COMMUNITY_TABLES = [
    { id: 'usersCount', sideId: 'sideUsersCount', table: 'users', label: 'Usuários' },
    { id: 'charactersCount', sideId: 'sideCharsCount', table: 'characters', label: 'Personagens' },
    { id: 'campaignsCount', sideId: 'sideCampsCount', table: 'campaigns', label: 'Campanhas' }
];

async function loadAllCounts() {
    let totalGameData = 0;

    for (const item of GAME_TABLES) {
        try {
            const count = await GameDataService.getCount(item.table);
            const el = document.getElementById(item.id);
            if (el) el.textContent = count;
            totalGameData += count;
        } catch (error) {
            const el = document.getElementById(item.id);
            if (el) el.textContent = '?';
        }
    }

    const totalEl = document.getElementById('totalGameData');
    if (totalEl) totalEl.textContent = totalGameData;

    for (const item of COMMUNITY_TABLES) {
        try {
            const count = await GameDataService.getCount(item.table);
            const el = document.getElementById(item.id);
            if (el) el.textContent = count;
            const sideEl = document.getElementById(item.sideId);
            if (sideEl) sideEl.textContent = count;
        } catch (error) {
            const el = document.getElementById(item.id);
            if (el) el.textContent = '?';
        }
    }
}

// =====================================
// VER TODOS (TABELA)
// =====================================

// Configuração de colunas por tabela
const TABLE_COLUMNS = {
    classes: [
        { key: 'id', label: 'ID' },
        { key: 'name_pt', label: 'Nome' },
        { key: 'hit_die', label: 'Dado de Vida' },
        { key: 'spellcaster', label: 'Conjurador', format: v => v ? '✅' : '❌' },
        { key: 'skills_choose', label: 'Perícias' }
    ],
    races: [
        { key: 'id', label: 'ID' },
        { key: 'name_pt', label: 'Nome' },
        { key: 'ability_score_increase', label: 'Atributos' },
        { key: 'speed', label: 'Velocidade' },
        { key: 'size', label: 'Tamanho' }
    ],
    game_backgrounds: [
        { key: 'id', label: 'ID' },
        { key: 'name_pt', label: 'Nome' },
        { key: 'description', label: 'Descrição' },
        { key: 'language_count', label: 'Idiomas' }
    ],
    languages: [
        { key: 'id', label: 'Código' },
        { key: 'name_pt', label: 'Nome' },
        { key: 'category', label: 'Categoria' },
        { key: 'description', label: 'Descrição' }
    ],
    game_weapons: [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'dano', label: 'Dano' },
        { key: 'tipo_dano', label: 'Tipo' }
    ],
    game_armor: [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'ca', label: 'CA' }
    ],
    game_equipment: [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome' },
        { key: 'categoria', label: 'Categoria' },
        { key: 'descricao', label: 'Descrição' }
    ],
    game_feats: [
        { key: 'id', label: 'ID' },
        { key: 'nome', label: 'Nome', fallback: 'name' },
        { key: 'descricao', label: 'Descrição', fallback: 'description' }
    ],
    users: [
        { key: 'id', label: 'UID' },
        { key: 'display_name', label: 'Nome' },
        { key: 'experience_level', label: 'Experiência' },
        { key: 'onboarding_completed', label: 'Onboarding', format: v => v ? '✅' : '❌' }
    ],
    characters: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nome' },
        { key: 'race', label: 'Raça' },
        { key: 'class', label: 'Classe' },
        { key: 'is_draft', label: 'Rascunho', format: v => v ? '📝' : '✅' }
    ],
    campaigns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nome' },
        { key: 'is_public', label: 'Pública', format: v => v ? '🌐' : '🔒' }
    ]
};

// Tabelas de game data que permitem exclusão
const DELETABLE_TABLES = ['classes', 'races', 'game_backgrounds', 'languages', 'game_weapons', 'game_armor', 'game_equipment', 'game_feats'];

window.viewTable = async function (tableName) {
    const modal = document.getElementById('genericModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const label = GAME_TABLES.find(t => t.table === tableName)?.label
        || COMMUNITY_TABLES.find(t => t.table === tableName)?.label
        || tableName;

    modalTitle.textContent = `📋 ${label}`;
    modalBody.innerHTML = '<div class="table-empty">⏳ Carregando dados...</div>';
    modal.classList.add('active');

    try {
        const items = await GameDataService.getAll(tableName);
        const columns = TABLE_COLUMNS[tableName] || [{ key: 'id', label: 'ID' }];
        const canDelete = DELETABLE_TABLES.includes(tableName);

        if (items.length === 0) {
            modalBody.innerHTML = '<div class="table-empty">📭 Nenhum item encontrado</div>';
            return;
        }

        const headerCells = columns.map(c => `<th>${c.label}</th>`).join('');
        const actionHeader = canDelete ? '<th>Ações</th>' : '';

        const rows = items.map(item => {
            const cells = columns.map(col => {
                let value = item[col.key];
                if (value === undefined && col.fallback) value = item[col.fallback];
                if (col.format) value = col.format(value);
                if (value === undefined || value === null) value = '-';
                if (typeof value === 'object') value = JSON.stringify(value);
                return `<td title="${String(value)}">${value}</td>`;
            }).join('');

            const actionCell = canDelete
                ? `<td><button class="btn btn-danger btn-sm" onclick="deleteItem('${tableName}', '${item.id}')">Excluir</button></td>`
                : '';

            return `<tr>${cells}${actionCell}</tr>`;
        }).join('');

        modalBody.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead><tr>${headerCells}${actionHeader}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Erro ao carregar tabela:', error);
        modalBody.innerHTML = `<div class="table-empty">❌ Erro ao carregar: ${error.message}</div>`;
    }
};

// =====================================
// EXCLUIR ITEM
// =====================================

window.deleteItem = async function (tableName, itemId) {
    if (!confirm(`Tem certeza que deseja excluir o item "${itemId}"?`)) return;

    try {
        await GameDataService.deleteItem(tableName, itemId);
        showNotification(`✅ Item "${itemId}" excluído com sucesso!`, 'success');
        loadAllCounts();
        viewTable(tableName);
    } catch (error) {
        showNotification(`❌ Erro ao excluir: ${error.message}`, 'error');
    }
};

// =====================================
// MODAIS DE ADIÇÃO
// =====================================

window.openModal = function (type) {
    const modal = document.getElementById('genericModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    let title = '';
    let form = '';

    switch (type) {
        case 'classes':
            title = '⚔️ Adicionar Nova Classe';
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
                        <textarea name="description" rows="3" placeholder="Descrição da classe..."></textarea>
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
                        <label>Nº de Perícias para Escolher</label>
                        <input type="number" name="skills_choose" value="2" min="0">
                    </div>
                    <div class="form-submit">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-gold">Adicionar Classe</button>
                    </div>
                </form>
            `;
            break;

        case 'races':
            title = '🧝 Adicionar Nova Raça';
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
                        <textarea name="description" rows="3" required placeholder="Descrição da raça..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>Aumento de Atributo *</label>
                        <input type="text" name="ability_score_increase" required placeholder="+2 Constituição">
                    </div>
                    <div class="form-group">
                        <label>Tamanho *</label>
                        <select name="size" required>
                            <option value="Pequeno">Pequeno</option>
                            <option value="Médio" selected>Médio</option>
                            <option value="Grande">Grande</option>
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
                    <div class="form-submit">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-gold">Adicionar Raça</button>
                    </div>
                </form>
            `;
            break;

        case 'backgrounds':
            title = '📜 Adicionar Antecedente';
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
                        <textarea name="description" rows="3" required placeholder="Descrição do antecedente..."></textarea>
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
                        <label>Nº de Idiomas</label>
                        <input type="number" name="language_count" value="2" min="0">
                    </div>
                    <div class="form-submit">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-gold">Adicionar Antecedente</button>
                    </div>
                </form>
            `;
            break;

        case 'languages':
            title = '🗣️ Adicionar Idioma';
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
                            <option value="Padrão">Padrão</option>
                            <option value="Exótico">Exótico</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea name="description" rows="2" placeholder="Descrição do idioma..."></textarea>
                    </div>
                    <div class="form-submit">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-gold">Adicionar Idioma</button>
                    </div>
                </form>
            `;
            break;

        case 'weapons':
            title = '🗡️ Adicionar Arma';
            form = `
                <form id="addForm" onsubmit="submitWeapon(event)">
                    <div class="form-group">
                        <label>Nome (PT-BR) *</label>
                        <input type="text" name="nome" required placeholder="Espada Longa">
                    </div>
                    <div class="form-group">
                        <label>Nome (Inglês)</label>
                        <input type="text" name="name" placeholder="Longsword">
                    </div>
                    <div class="form-group">
                        <label>Categoria *</label>
                        <select name="categoria" required>
                            <option value="Arma Simples Corpo a Corpo">Simples Corpo a Corpo</option>
                            <option value="Arma Simples à Distância">Simples à Distância</option>
                            <option value="Arma Marcial Corpo a Corpo">Marcial Corpo a Corpo</option>
                            <option value="Arma Marcial à Distância">Marcial à Distância</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Custo (quantidade) *</label>
                        <input type="number" name="custo_qtd" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Moeda *</label>
                        <select name="custo_moeda" required>
                            <option value="po">Peça de Ouro (po)</option>
                            <option value="pp">Peça de Prata (pp)</option>
                            <option value="pc">Peça de Cobre (pc)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Dano *</label>
                        <input type="text" name="dano" required placeholder="1d8">
                    </div>
                    <div class="form-group">
                        <label>Tipo de Dano *</label>
                        <select name="tipo_dano" required>
                            <option value="cortante">Cortante</option>
                            <option value="perfurante">Perfurante</option>
                            <option value="concussão">Concussão</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Peso (kg)</label>
                        <input type="number" name="peso" step="0.1" value="0">
                    </div>
                    <div class="form-group">
                        <label>Propriedades (separadas por vírgula)</label>
                        <input type="text" name="propriedades" placeholder="Versátil (1d10), Leve">
                    </div>
                    <div class="form-submit">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-gold">Adicionar Arma</button>
                    </div>
                </form>
            `;
            break;

        case 'armor':
            title = '🛡️ Adicionar Armadura';
            form = `
                <form id="addForm" onsubmit="submitArmor(event)">
                    <div class="form-group">
                        <label>Nome (PT-BR) *</label>
                        <input type="text" name="nome" required placeholder="Cota de Malha">
                    </div>
                    <div class="form-group">
                        <label>Nome (Inglês)</label>
                        <input type="text" name="name" placeholder="Chain Mail">
                    </div>
                    <div class="form-group">
                        <label>Categoria *</label>
                        <select name="categoria" required>
                            <option value="Leve">Leve</option>
                            <option value="Média">Média</option>
                            <option value="Pesada">Pesada</option>
                            <option value="Escudo">Escudo</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>CA *</label>
                        <input type="text" name="ca" required placeholder="16">
                    </div>
                    <div class="form-group">
                        <label>Custo (quantidade) *</label>
                        <input type="number" name="custo_qtd" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Moeda *</label>
                        <select name="custo_moeda" required>
                            <option value="po">Peça de Ouro (po)</option>
                            <option value="pp">Peça de Prata (pp)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Peso (kg)</label>
                        <input type="number" name="peso" step="0.1" value="0">
                    </div>
                    <div class="form-group">
                        <label>Requisito de Força</label>
                        <input type="number" name="requisito_forca" value="0">
                    </div>
                    <div class="form-group">
                        <label>Desvantagem em Furtividade?</label>
                        <select name="desvantagem_furtividade">
                            <option value="false">Não</option>
                            <option value="true">Sim</option>
                        </select>
                    </div>
                    <div class="form-submit">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-gold">Adicionar Armadura</button>
                    </div>
                </form>
            `;
            break;

        case 'equipment':
            title = '🎒 Adicionar Equipamento';
            form = `
                <form id="addForm" onsubmit="submitEquipment(event)">
                    <div class="form-group">
                        <label>Nome (PT-BR) *</label>
                        <input type="text" name="nome" required placeholder="Corda de Cânhamo">
                    </div>
                    <div class="form-group">
                        <label>Nome (Inglês)</label>
                        <input type="text" name="name" placeholder="Hemp Rope">
                    </div>
                    <div class="form-group">
                        <label>Categoria *</label>
                        <input type="text" name="categoria" required placeholder="Aventura">
                    </div>
                    <div class="form-group">
                        <label>Custo (quantidade) *</label>
                        <input type="number" name="custo_qtd" required step="0.01">
                    </div>
                    <div class="form-group">
                        <label>Moeda *</label>
                        <select name="custo_moeda" required>
                            <option value="po">Peça de Ouro (po)</option>
                            <option value="pp">Peça de Prata (pp)</option>
                            <option value="pc">Peça de Cobre (pc)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Peso (kg)</label>
                        <input type="number" name="peso" step="0.1" value="0">
                    </div>
                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea name="descricao" rows="2" placeholder="Descrição do item..."></textarea>
                    </div>
                    <div class="form-submit">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-gold">Adicionar Equipamento</button>
                    </div>
                </form>
            `;
            break;

        case 'feats':
            title = '✨ Adicionar Talento';
            form = `
                <form id="addForm" onsubmit="submitFeat(event)">
                    <div class="form-group">
                        <label>Nome (PT-BR) *</label>
                        <input type="text" name="nome" required placeholder="Mestre em Combate">
                    </div>
                    <div class="form-group">
                        <label>Nome (Inglês)</label>
                        <input type="text" name="name" placeholder="Combat Master">
                    </div>
                    <div class="form-group">
                        <label>Pré-requisitos</label>
                        <input type="text" name="prerequisites" placeholder="Força 13 ou superior">
                    </div>
                    <div class="form-group">
                        <label>Descrição *</label>
                        <textarea name="descricao" rows="4" required placeholder="Descrição completa do talento..."></textarea>
                    </div>
                    <div class="form-submit">
                        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
                        <button type="submit" class="btn btn-gold">Adicionar Talento</button>
                    </div>
                </form>
            `;
            break;

        default:
            title = 'Em Desenvolvimento';
            form = '<p style="color:rgba(232,220,198,0.5);">Esta funcionalidade está em desenvolvimento.</p>';
    }

    modalTitle.textContent = title;
    modalBody.innerHTML = form;
    modal.classList.add('active');
};

window.closeModal = function () {
    document.getElementById('genericModal').classList.remove('active');
};

// =====================================
// SUBMISSÕES DE FORMULÁRIO
// =====================================

window.submitClass = async function (event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = {
        id: fd.get('id'),
        name: fd.get('name'),
        name_pt: fd.get('name_pt'),
        hit_die: fd.get('hit_die'),
        description: fd.get('description'),
        spellcaster: fd.get('spellcaster') === 'true',
        skills_available: fd.get('skills_available') ? JSON.stringify(fd.get('skills_available').split(',').map(s => s.trim())) : '[]',
        skills_choose: parseInt(fd.get('skills_choose')) || 2
    };

    try {
        await GameDataService.addItem('classes', data);
        showNotification('✅ Classe adicionada!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro: ' + error.message, 'error');
    }
};

window.submitRace = async function (event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = {
        name: fd.get('name'),
        name_pt: fd.get('name_pt'),
        description: fd.get('description'),
        ability_score_increase: fd.get('ability_score_increase'),
        size: fd.get('size'),
        speed: parseInt(fd.get('speed')),
        traits: fd.get('traits') ? JSON.stringify(fd.get('traits').split(',').map(s => s.trim())) : '[]',
        languages: fd.get('languages') ? JSON.stringify(fd.get('languages').split(',').map(s => s.trim())) : '[]'
    };

    try {
        await GameDataService.addItem('races', data);
        showNotification('✅ Raça adicionada!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro: ' + error.message, 'error');
    }
};

window.submitBackground = async function (event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = {
        id: fd.get('id'),
        name: fd.get('name'),
        name_pt: fd.get('name_pt'),
        description: fd.get('description'),
        skill_proficiencies: fd.get('skill_proficiencies') ? JSON.stringify(fd.get('skill_proficiencies').split(',').map(s => s.trim())) : '[]',
        tool_proficiencies: fd.get('tool_proficiencies') ? JSON.stringify(fd.get('tool_proficiencies').split(',').map(s => s.trim())) : '[]',
        language_count: parseInt(fd.get('language_count')) || 0
    };

    try {
        await GameDataService.addItem('game_backgrounds', data);
        showNotification('✅ Antecedente adicionado!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro: ' + error.message, 'error');
    }
};

window.submitLanguage = async function (event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = {
        code: fd.get('code'),
        name: fd.get('name'),
        name_pt: fd.get('name_pt'),
        category: fd.get('category'),
        description: fd.get('description')
    };

    try {
        await GameDataService.addItem('languages', data);
        showNotification('✅ Idioma adicionado!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro: ' + error.message, 'error');
    }
};

window.submitWeapon = async function (event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = {
        nome: fd.get('nome'),
        name: fd.get('name') || '',
        categoria: fd.get('categoria'),
        custo: JSON.stringify({ quantidade: parseFloat(fd.get('custo_qtd')), moeda: fd.get('custo_moeda') }),
        dano: fd.get('dano'),
        tipo_dano: fd.get('tipo_dano'),
        peso: parseFloat(fd.get('peso')) || 0,
        propriedades: fd.get('propriedades') ? JSON.stringify(fd.get('propriedades').split(',').map(s => s.trim())) : '[]'
    };

    try {
        await GameDataService.addItem('game_weapons', data);
        showNotification('✅ Arma adicionada!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro: ' + error.message, 'error');
    }
};

window.submitArmor = async function (event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = {
        nome: fd.get('nome'),
        name: fd.get('name') || '',
        categoria: fd.get('categoria'),
        ca: fd.get('ca'),
        custo: JSON.stringify({ quantidade: parseFloat(fd.get('custo_qtd')), moeda: fd.get('custo_moeda') }),
        peso: parseFloat(fd.get('peso')) || 0,
        requisito_forca: parseInt(fd.get('requisito_forca')) || 0,
        desvantagem_furtividade: fd.get('desvantagem_furtividade') === 'true'
    };

    try {
        await GameDataService.addItem('game_armor', data);
        showNotification('✅ Armadura adicionada!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro: ' + error.message, 'error');
    }
};

window.submitEquipment = async function (event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = {
        nome: fd.get('nome'),
        name: fd.get('name') || '',
        categoria: fd.get('categoria'),
        custo: JSON.stringify({ quantidade: parseFloat(fd.get('custo_qtd')), moeda: fd.get('custo_moeda') }),
        peso: parseFloat(fd.get('peso')) || 0,
        descricao: fd.get('descricao') || ''
    };

    try {
        await GameDataService.addItem('game_equipment', data);
        showNotification('✅ Equipamento adicionado!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro: ' + error.message, 'error');
    }
};

window.submitFeat = async function (event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const data = {
        nome: fd.get('nome'),
        name: fd.get('name') || '',
        prerequisites: fd.get('prerequisites') || null,
        descricao: fd.get('descricao')
    };

    try {
        await GameDataService.addItem('game_feats', data);
        showNotification('✅ Talento adicionado!', 'success');
        closeModal();
        loadAllCounts();
    } catch (error) {
        showNotification('❌ Erro: ' + error.message, 'error');
    }
};

// =====================================
// NOTIFICAÇÕES
// =====================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =====================================
// LOGOUT
// =====================================

window.logout = async function () {
    await signOut(auth);
    localStorage.clear();
    window.location.href = '/login.html';
};

// =====================================
// INICIALIZAÇÃO
// =====================================

document.addEventListener('DOMContentLoaded', async () => {
    const profile = await checkAdminAccess();

    if (profile) {
        displayUserBadge(profile);
        loadAllCounts();
    }

    // Sidebar navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const section = item.dataset.section;
            if (section === 'users') viewTable('users');
            else if (section === 'characters') viewTable('characters');
            else if (section === 'campaigns') viewTable('campaigns');
        });
    });
});
