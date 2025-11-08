# Correções do `populateSheet()` - Auto-preenchimento da Ficha

## 🐛 Problema Identificado

O wizard coletava todos os dados corretamente e salvava no banco Supabase, mas ao finalizar, **apenas o campo `name` era preenchido na ficha**. Todos os outros campos ficavam vazios.

## 🔍 Causa Raiz

O método `populateSheet()` em `js/character-sheet.js` estava usando IDs de HTML que **NÃO EXISTIAM** no arquivo `character-sheet.html`.

### Exemplos de IDs Incorretos:
```javascript
// ❌ ERRADO - Estes IDs não existem no HTML
this.setInputValue('Strengthscore', this.character.strength);
this.setInputValue('Dexterityscore', this.character.dexterity);
this.setInputValue('Constitutionscore', this.character.constitution);
// ... etc
```

### IDs Corretos no HTML:
```html
<!-- ✅ CORRETO - Estes são os IDs reais -->
<div id="forca-value">10</div>
<div id="destreza-value">10</div>
<div id="constituicao-value">10</div>
<!-- ... etc -->
```

## ✅ Correções Implementadas

### 1. **Campos de Identidade** (Aba Identity)
- `character-name-2` - Nome do personagem
- `character-class-2` - Classe
- `character-race-2` - Raça  
- `character-background-2` - Antecedente
- `character-alignment-2` - Alinhamento
- `character-level-2` - Nível

### 2. **Campos de Combate** (Aba Combat)
- `maxhp` - HP máximo (aba Combate)
- `currenthp` - HP atual (aba Combate)
- `temphp` - HP temporário (aba Combate)
- `max-hp` - HP máximo (aba Identidade)
- `current-hp` - HP atual (aba Identidade)
- `temp-hp` - HP temporário (aba Identidade)
- `ac` - Classe de Armadura
- `speed` - Velocidade
- `initiative` - Iniciativa (calculada a partir do modificador de Destreza)

### 3. **Dado de Vida** (Hit Dice)
- `hit-dice` - div na aba Identidade (formato: "1d12")
- `hitdice` - input na aba Combate (mesmo valor)

### 4. **Atributos** (Attributes Tab)

**IMPORTANTE**: Os campos de atributos são `<div>` elementos (display-only), NÃO `<input>`.

```javascript
// ✅ CORRETO - Usar textContent, não value
const valueDiv = document.getElementById('forca-value');
valueDiv.textContent = this.character.strength;

// Calcular e preencher modificador
const modDiv = document.getElementById('forca-modifier');
const mod = Math.floor((this.character.strength - 10) / 2);
modDiv.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
```

**IDs de Atributos:**
- `forca-value` / `forca-modifier` (Força)
- `destreza-value` / `destreza-modifier` (Destreza)
- `constituicao-value` / `constituicao-modifier` (Constituição)
- `inteligencia-value` / `inteligencia-modifier` (Inteligência)
- `sabedoria-value` / `sabedoria-modifier` (Sabedoria)
- `carisma-value` / `carisma-modifier` (Carisma)

### 5. **Bônus de Proficiência**
- `proficiency-bonus` - span element (formato: "+2")

### 6. **Salvaguardas** (Saving Throws)

**Tradução**: Banco salva em INGLÊS, HTML usa IDs em PORTUGUÊS

```javascript
const saveMap = {
    'Strength': 'forca',
    'Dexterity': 'destreza',
    'Constitution': 'constituicao',
    'Intelligence': 'inteligencia',
    'Wisdom': 'sabedoria',
    'Charisma': 'carisma'
};

// Marcar checkboxes
this.character.saving_throws.forEach(save => {
    const ptName = saveMap[save];
    document.getElementById(`save-${ptName}`).checked = true;
});
```

**IDs de Salvaguardas:**
- `save-forca`
- `save-destreza`
- `save-constituicao`
- `save-inteligencia`
- `save-sabedoria`
- `save-carisma`

### 7. **Perícias** (Skills)

**Tradução**: Banco salva em PORTUGUÊS (ex: "Acrobacia"), HTML usa IDs em inglês (ex: "acrobatics")

```javascript
const skillIdMap = {
    'Acrobacia': 'acrobatics',
    'Lidar com Animais': 'animal-handling',
    'Arcanismo': 'arcana',
    'Arcana': 'arcana',
    'Atletismo': 'athletics',
    'Enganação': 'deception',
    'História': 'history',
    'Intuição': 'insight',
    'Intimidação': 'intimidation',
    'Investigação': 'investigation',
    'Medicina': 'medicine',
    'Natureza': 'nature',
    'Percepção': 'perception',
    'Performance': 'performance',
    'Persuasão': 'persuasion',
    'Religião': 'religion',
    'Prestidigitação': 'sleight-of-hand',
    'Furtividade': 'stealth',
    'Sobrevivência': 'survival'
};

// Marcar checkboxes de perícias
this.character.skills.forEach(skill => {
    const skillId = skillIdMap[skill];
    document.getElementById(`skill-${skillId}`).checked = true;
});
```

**IDs de Perícias:**
- `skill-acrobatics`
- `skill-animal-handling`
- `skill-arcana`
- `skill-athletics`
- `skill-deception`
- `skill-history`
- `skill-insight`
- `skill-intimidation`
- `skill-investigation`
- `skill-medicine`
- `skill-nature`
- `skill-perception`
- `skill-performance`
- `skill-persuasion`
- `skill-religion`
- `skill-sleight-of-hand`
- `skill-stealth`
- `skill-survival`

### 8. **Campos de Texto** (Textareas)

Estes campos são preenchidos se existirem no objeto `character`:

- `proficiencies` - Proficiências (aba Identidade)
- `languages` - Idiomas (aba Identidade)
- `backstory` - História de Fundo (aba Identidade)
- `appearance` - Aparência (aba Identidade)
- `personality-traits` - Traços de Personalidade (aba Identidade)
- `ideals` - Ideais (aba Identidade)
- `bonds` - Vínculos (aba Identidade)
- `flaws` - Defeitos (aba Identidade)

## 📋 Estrutura do Método Corrigido

```javascript
populateSheet() {
    if (!this.character) return;

    console.log('🎨 Preenchendo ficha com dados do personagem');

    // === ABA IDENTIDADE ===
    this.setInputValue('character-name-2', this.character.name);
    this.setInputValue('character-class-2', this.character.character_class);
    this.setInputValue('character-race-2', this.character.race);
    this.setInputValue('character-background-2', this.character.background);
    this.setInputValue('character-alignment-2', this.character.alignment);
    this.setInputValue('character-level-2', this.character.level);

    // HP - DUAS ABAS (Combat + Identity)
    this.setInputValue('max-hp', this.character.hit_points_max);
    this.setInputValue('current-hp', this.character.hit_points_current);
    this.setInputValue('temp-hp', this.character.temp_hp || 0);
    this.setInputValue('maxhp', this.character.hit_points_max);
    this.setInputValue('currenthp', this.character.hit_points_current);
    this.setInputValue('temphp', this.character.temp_hp || 0);

    // Dado de Vida - DUAS ABAS
    const hitDie = this.getHitDieForClass(this.character.character_class);
    const hitDiceDiv = document.getElementById('hit-dice');
    if (hitDiceDiv) hitDiceDiv.textContent = `${this.character.level}${hitDie}`;
    this.setInputValue('hitdice', `${this.character.level}${hitDie}`);

    // === ABA COMBATE ===
    this.setInputValue('ac', this.character.armor_class);
    this.setInputValue('speed', `${this.character.speed}m`);

    // Iniciativa (calculada do modificador de Destreza)
    const dexMod = Math.floor((this.character.dexterity - 10) / 2);
    this.setInputValue('initiative', dexMod >= 0 ? `+${dexMod}` : `${dexMod}`);

    // === ABA ATRIBUTOS ===
    const attrs = [
        { id: 'forca', value: this.character.strength },
        { id: 'destreza', value: this.character.dexterity },
        { id: 'constituicao', value: this.character.constitution },
        { id: 'inteligencia', value: this.character.intelligence },
        { id: 'sabedoria', value: this.character.wisdom },
        { id: 'carisma', value: this.character.charisma }
    ];

    attrs.forEach(attr => {
        const valueDiv = document.getElementById(`${attr.id}-value`);
        const modDiv = document.getElementById(`${attr.id}-modifier`);

        if (valueDiv) {
            valueDiv.textContent = attr.value;
        }

        if (modDiv) {
            const mod = Math.floor((attr.value - 10) / 2);
            modDiv.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
        }
    });

    // Bônus de proficiência
    const profBonus = document.getElementById('proficiency-bonus');
    if (profBonus) {
        profBonus.textContent = `+${this.character.proficiency_bonus}`;
    }

    // Salvaguardas (com tradução)
    const saveMap = {
        'Strength': 'forca',
        'Dexterity': 'destreza',
        'Constitution': 'constituicao',
        'Intelligence': 'inteligencia',
        'Wisdom': 'sabedoria',
        'Charisma': 'carisma'
    };

    if (this.character.saving_throws && Array.isArray(this.character.saving_throws)) {
        this.character.saving_throws.forEach(save => {
            const ptName = saveMap[save];
            const checkbox = document.getElementById(`save-${ptName}`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Perícias (com tradução)
    const skillIdMap = {
        'Acrobacia': 'acrobatics',
        'Lidar com Animais': 'animal-handling',
        'Arcanismo': 'arcana',
        'Arcana': 'arcana',
        'Atletismo': 'athletics',
        'Enganação': 'deception',
        'História': 'history',
        'Intuição': 'insight',
        'Intimidação': 'intimidation',
        'Investigação': 'investigation',
        'Medicina': 'medicine',
        'Natureza': 'nature',
        'Percepção': 'perception',
        'Performance': 'performance',
        'Persuasão': 'persuasion',
        'Religião': 'religion',
        'Prestidigitação': 'sleight-of-hand',
        'Furtividade': 'stealth',
        'Sobrevivência': 'survival'
    };

    if (this.character.skills && Array.isArray(this.character.skills)) {
        this.character.skills.forEach(skill => {
            const skillId = skillIdMap[skill] || skill.toLowerCase().replace(/\s+/g, '-');
            const checkbox = document.getElementById(`skill-${skillId}`);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Campos de texto opcionais
    if (this.character.proficiencies) {
        const profText = Array.isArray(this.character.proficiencies) 
            ? this.character.proficiencies.join(', ') 
            : this.character.proficiencies;
        this.setInputValue('proficiencies', profText);
    }

    if (this.character.languages) {
        const langText = Array.isArray(this.character.languages) 
            ? this.character.languages.join(', ') 
            : this.character.languages;
        this.setInputValue('languages', langText);
    }

    this.setInputValue('backstory', this.character.backstory);
    this.setInputValue('appearance', this.character.appearance);
    this.setInputValue('personality-traits', this.character.personality_traits);
    this.setInputValue('ideals', this.character.ideals);
    this.setInputValue('bonds', this.character.bonds);
    this.setInputValue('flaws', this.character.flaws);

    console.log('✅ populateSheet() completo');
}
```

## 🧪 Como Testar

1. Abrir `character-sheet.html` no navegador
2. Clicar em "Criar Personagem" (wizard)
3. Preencher todas as etapas do wizard:
   - Nome
   - Raça e sub-raça
   - Classe e subclasse
   - Perícias
   - Atributos
   - Alinhamento
   - Antecedente
   - Equipamento
   - Imagem
4. Clicar em "Finalizar"
5. **VERIFICAR**: Todos os campos devem estar preenchidos nas abas:
   - ✅ Identidade: Nome, Classe, Raça, Antecedente, Alinhamento, Nível, HP
   - ✅ Combate: AC, Velocidade, Iniciativa, HP, Dado de Vida
   - ✅ Atributos: Valores e modificadores dos 6 atributos
   - ✅ Salvaguardas: Checkboxes marcados corretamente
   - ✅ Perícias: Checkboxes marcados corretamente
   - ✅ Bônus de Proficiência: Calculado corretamente

## 📊 Resultados Esperados

Antes da correção:
- ✅ Nome preenchido
- ❌ Todos os outros campos vazios

Depois da correção:
- ✅ Nome preenchido
- ✅ Classe preenchida
- ✅ Raça preenchida
- ✅ Atributos preenchidos com valores e modificadores calculados
- ✅ HP, AC, velocidade, iniciativa preenchidos
- ✅ Salvaguardas marcadas
- ✅ Perícias marcadas
- ✅ Todos os campos do wizard transferidos para a ficha

## 🔄 Próximos Passos (Se Necessário)

Se ainda houver campos não preenchidos, verificar:

1. **Console do navegador** (F12 → Console)
   - Procurar mensagens `⚠️ Checkbox não encontrado`
   - Procurar mensagens `⚠️ Element não encontrado`

2. **IDs duplicados**
   - Alguns campos têm IDs duplicados (ex: HP em duas abas)
   - Garantir que ambos sejam preenchidos

3. **Campos calculados**
   - Modificadores de atributos
   - Iniciativa
   - Bônus de proficiência
   - Dados de vida

4. **Tradução de nomes**
   - Verificar se perícias/salvaguardas estão sendo traduzidas corretamente
   - Consultar `skillIdMap` e `saveMap`

## 📝 Notas Técnicas

- **Elementos div vs input**: Atributos são divs (usar `textContent`), não inputs (que usariam `value`)
- **IDs duplicados**: HP existe em 2 abas com IDs diferentes - preencher ambos
- **Tradução**: Banco usa inglês/português misturado, HTML usa português com IDs em inglês
- **Arrays vs strings**: Proficiências e idiomas podem ser arrays - converter para string com join()
- **Campos opcionais**: Usar verificação `if (this.character.campo)` antes de preencher
