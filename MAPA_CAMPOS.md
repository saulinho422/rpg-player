# 🗺️ MAPA COMPLETO DE CAMPOS - HTML vs JavaScript

## ❌ PROBLEMA IDENTIFICADO

O `populateSheet()` está tentando preencher IDs que **NÃO EXISTEM** no HTML!

---

## 📋 CAMPOS DO WIZARD (wizardData)

```javascript
this.wizardData = {
    name: '', // ✅ "Aragorn"
    race: {}, // ✅ {name_pt: "Elfo", ...}
    subrace: {}, //  {name_pt: "Alto Elfo", ...}
    class: {}, // ✅ {name_pt: "Guerreiro", ...}
    subclass: {}, // {name_pt: "Campeão", ...}
    skills: [], // ✅ ["Acrobatics", "Perception", ...]
    attributes: { // ✅
        str: 15,
        dex: 14,
        con: 13,
        int: 12,
        wis: 10,
        cha: 8
    },
    alignment: '', // ✅ "Lawful Good"
    background: {}, // ✅ {nome: "Soldado", ...}
    equipment: [], // ✅ [...items]
    level: 1, // ✅
    image: null // ✅
}
```

---

## 🎯 MAPEAMENTO CORRETO: WIZARD → HTML

### **ABA COMBATE (`tab-combat`)**
| Dado do Wizard | HTML ID | Tipo | Status |
|---|---|---|---|
| `hit_points_max` | `maxhp` | input | ✅ |
| `hit_points_current` | `currenthp` | input | ✅ |
| 0 (temp) | `temphp` | input | ✅ |
| `armor_class` | `ac` | input | ✅ |
| DEX mod | `initiative` | input | ✅ readonly |
| `speed` | `speed` | input | ✅ |
| `{level}d{hitdie}` | `hitdice` | input | ✅ |

### **ABA ATRIBUTOS (`tab-attributes`)**
| Dado do Wizard | HTML ID | Tipo | Status |
|---|---|---|---|
| `attributes.str` | **NÃO EXISTE `Strengthscore`** | ❌ | **FALTA INPUT** |
| `attributes.dex` | **NÃO EXISTE `Dexterityscore`** | ❌ | **FALTA INPUT** |
| `attributes.con` | **NÃO EXISTE `Constitutionscore`** | ❌ | **FALTA INPUT** |
| `attributes.int` | **NÃO EXISTE `Intelligencescore`** | ❌ | **FALTA INPUT** |
| `attributes.wis` | **NÃO EXISTE `Wisdomscore`** | ❌ | **FALTA INPUT** |
| `attributes.cha` | **NÃO EXISTE `Charismascore`** | ❌ | **FALTA INPUT** |

**IDs QUE EXISTEM NO HTML (só divs de exibição, não inputs):**
- `forca-value` (div readonly)
- `destreza-value` (div readonly)
- `constituicao-value` (div readonly)
- `inteligencia-value` (div readonly)
- `sabedoria-value` (div readonly)
- `carisma-value` (div readonly)

### **SALVAGUARDAS**
| Dado do Wizard | HTML ID | Tipo | Status |
|---|---|---|---|
| `saving_throws` array | `save-forca` | checkbox | ❌ IDs em português |
| | `save-destreza` | checkbox | ❌ IDs em português |
| | `save-constituicao` | checkbox | ❌ IDs em português |
| | `save-inteligencia` | checkbox | ❌ IDs em português |
| | `save-sabedoria` | checkbox | ❌ IDs em português |
| | `save-carisma` | checkbox | ❌ IDs em português |

**PROBLEMA:** Wizard salva `["Strength", "Dexterity"]`, mas HTML usa IDs em português!

### **BÔNUS DE PROFICIÊNCIA**
| Dado do Wizard | HTML ID | Tipo | Status |
|---|---|---|---|
| `proficiency_bonus` | `proficiency-bonus` | span | ✅ |

### **ABA IDENTIDADE (`tab-identity`)**
| Dado do Wizard | HTML ID | Tipo | Status |
|---|---|---|---|
| `name` | `character-name-2` | input | ✅ |
| `character_class` | `character-class-2` | select | ✅ (needs options) |
| `race` | `character-race-2` | select | ✅ (needs options) |
| `background` | `character-background-2` | select | ✅ (needs options) |
| `alignment` | `character-alignment-2` | select | ✅ (needs options) |
| `level` | `character-level-2` | input number | ✅ |
| (subclass) | `character-subclass-2` | select | ⚠️ wizard não salva subclass |

### **HP SECUNDÁRIO (na aba Identidade)**
| Dado do Wizard | HTML ID | Tipo | Status |
|---|---|---|---|
| `hit_points_current` | `current-hp` | input | ✅ |
| 0 (temp) | `temp-hp` | input | ✅ |
| `hit_points_max` | `max-hp` | input | ✅ |

### **HIT DICE (na aba Identidade)**
| Dado do Wizard | HTML ID | Tipo | Status |
|---|---|---|---|
| `{level}d{hitdie}` | `hit-dice` | div | ✅ |

---

## 🔍 CAMPOS QUE O WIZARD NÃO PREENCHE

Estes campos existem no HTML mas o wizard não coleta:

- `proficiencies` (textarea)
- `languages` (textarea)
- `features-traits` (textarea)
- `attacks` (textarea)
- `spell-slots`, `spell-save-dc`, `spell-attack`
- `personality-traits`, `ideals`, `bonds`, `flaws`
- `age`, `height`, `weight`, `eyes`, `skin`, `hair`
- `appearance`, `backstory`
- `cp-2`, `sp-2`, `ep-2`, `gp-2`, `pp-2` (moedas)
- `treasure-2`, `allies-2`

---

## 🚨 PROBLEMAS CRÍTICOS

### 1. **Atributos não têm inputs editáveis**
HTML só tem `<div>` para exibição. Precisamos adicionar inputs ocultos ou editar as divs diretamente.

### 2. **Mapeamento inglês → português**
- Wizard salva: `["Strength", "Dexterity"]`
- HTML precisa: `["forca", "destreza"]`

**Solução:** Criar dicionário de tradução:
```javascript
const attrMap = {
    'Strength': 'forca',
    'Dexterity': 'destreza',
    'Constitution': 'constituicao',
    'Intelligence': 'inteligencia',
    'Wisdom': 'sabedoria',
    'Charisma': 'carisma'
};
```

### 3. **IDs duplicados**
Há 2 campos `maxhp`: linha 86 (tab-combat) e NÃO no tab-identity.
Tab-identity usa `max-hp` (linha 386).

---

## ✅ SOLUÇÃO

1. **Criar inputs ocultos para atributos** (ou preencher divs diretamente)
2. **Traduzir nomes de saving_throws** (inglês → português)
3. **Corrigir populateSheet()** para usar IDs corretos
4. **Garantir que dropdowns tenham options** antes de setar valor

---

## 📝 CÓDIGO CORRETO PARA `populateSheet()`

```javascript
populateSheet() {
    if (!this.character) return;
    
    console.log('📝 Preenchendo ficha com:', this.character);
    
    // === ABA IDENTIDADE ===
    this.setInputValue('character-name-2', this.character.name);
    this.setInputValue('character-class-2', this.character.character_class);
    this.setInputValue('character-race-2', this.character.race);
    this.setInputValue('character-background-2', this.character.background);
    this.setInputValue('character-alignment-2', this.character.alignment);
    this.setInputValue('character-level-2', this.character.level);
    
    // HP (aba Identidade)
    this.setInputValue('max-hp', this.character.hit_points_max);
    this.setInputValue('current-hp', this.character.hit_points_current);
    this.setInputValue('temp-hp', 0);
    
    // Hit Dice (div)
    const hitDiceDiv = document.getElementById('hit-dice');
    if (hitDiceDiv && this.character.character_class) {
        const hitDie = this.getHitDieForClass(this.character.character_class);
        hitDiceDiv.textContent = `${this.character.level}${hitDie}`;
    }
    
    // === ABA COMBATE ===
    this.setInputValue('maxhp', this.character.hit_points_max);
    this.setInputValue('currenthp', this.character.hit_points_current);
    this.setInputValue('temphp', 0);
    this.setInputValue('ac', this.character.armor_class);
    this.setInputValue('speed', this.character.speed);
    this.setInputValue('hitdice', `${this.character.level}${this.getHitDieForClass(this.character.character_class)}`);
    
    // Iniciativa (DEX mod)
    const dexMod = Math.floor((this.character.dexterity - 10) / 2);
    this.setInputValue('initiative', dexMod >= 0 ? `+${dexMod}` : `${dexMod}`);
    
    // === ABA ATRIBUTOS ===
    // Preencher divs de exibição (não há inputs)
    const attrs = [
        {id: 'forca', value: this.character.strength},
        {id: 'destreza', value: this.character.dexterity},
        {id: 'constituicao', value: this.character.constitution},
        {id: 'inteligencia', value: this.character.intelligence},
        {id: 'sabedoria', value: this.character.wisdom},
        {id: 'carisma', value: this.character.charisma}
    ];
    
    attrs.forEach(attr => {
        const valueDiv = document.getElementById(`${attr.id}-value`);
        const modDiv = document.getElementById(`${attr.id}-modifier`);
        
        if (valueDiv) valueDiv.textContent = attr.value;
        
        if (modDiv) {
            const mod = Math.floor((attr.value - 10) / 2);
            modDiv.textContent = mod >= 0 ? `+${mod}` : `${mod}`;
        }
    });
    
    // Bônus de proficiência (span)
    const profBonus = document.getElementById('proficiency-bonus');
    if (profBonus) {
        profBonus.textContent = `+${this.character.proficiency_bonus}`;
    }
    
    // Salvaguardas (marcar checkboxes) - TRADUZIR
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
            const ptName = saveMap[save] || save.toLowerCase();
            const checkbox = document.getElementById(`save-${ptName}`);
            if (checkbox) {
                checkbox.checked = true;
                console.log(`✅ Salvaguarda marcada: ${ptName}`);
            }
        });
    }
    
    // Perícias - TODO: mapear IDs corretos
}
```
