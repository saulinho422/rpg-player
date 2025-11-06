# 🎲 Tutorial Completo: Sistema de Dados 3D com CSS e JavaScript

> Documentação baseada no código de referência em `.github/Dados 3D`

## 📋 Índice

1. [Fundamentos](#fundamentos)
2. [Como Funciona](#como-funciona)
3. [Criando um D6 Básico](#criando-um-d6-básico)
4. [Personalização Visual](#personalização-visual)
5. [Outros Tipos de Dados](#outros-tipos-de-dados)
6. [Animações Avançadas](#animações-avançadas)

---

## Fundamentos

### O que você precisa saber

Este sistema usa **CSS 3D Transforms** puro, sem bibliotecas externas. Os conceitos-chave são:

- `perspective`: Cria a ilusão de profundidade 3D
- `transform-style: preserve-3d`: Mantém elementos filhos no espaço 3D
- `transform`: Rotaciona e posiciona elementos no espaço 3D
- `transition`: Anima suavemente as transformações

---

## Como Funciona

### 1. Estrutura HTML

```html
<div class="container">
    <!-- Container com perspective -->
    <div id="dice" class="cube">
        <!-- Cubo com preserve-3d -->
        <div class="face front">1</div>
        <div class="face back">6</div>
        <div class="face top">2</div>
        <div class="face bottom">5</div>
        <div class="face right">3</div>
        <div class="face left">4</div>
    </div>
</div>
```

### 2. CSS: Criando o Espaço 3D

```css
.container {
    width: 200px;
    height: 200px;
    perspective: 1000px; /* ⭐ Define a "câmera" */
    display: flex;
    justify-content: center;
    align-items: center;
}

.cube {
    width: 100px;
    height: 100px;
    position: relative;
    transform-style: preserve-3d; /* ⭐ Ativa 3D para filhos */
    transition: transform 2s cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### 3. Posicionamento das Faces

Cada face é posicionada no espaço 3D:

```css
.face {
    position: absolute;
    width: 100px;
    height: 100px;
    background-color: #e74c3c;
    border: 1px solid #c0392b;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 40px;
    color: white;
}

/* Face frontal: empurrada 50px para frente */
.front  { transform: translateZ(50px); }

/* Face traseira: empurrada 50px para trás + girada 180° */
.back   { transform: translateZ(-50px) rotateY(180deg); }

/* Face superior: movida 50px para cima + girada 90° no eixo X */
.top    { transform: translateY(-50px) rotateX(90deg); }

/* Face inferior: movida 50px para baixo + girada -90° no eixo X */
.bottom { transform: translateY(50px) rotateX(-90deg); }

/* Face direita: movida 50px para direita + girada 90° no eixo Y */
.right  { transform: translateX(50px) rotateY(90deg); }

/* Face esquerda: movida 50px para esquerda + girada -90° no eixo Y */
.left   { transform: translateX(-50px) rotateY(-90deg); }
```

**Nota:** O valor de translação (50px) é sempre **metade do tamanho** do cubo (100px).

### 4. JavaScript: Animação de Rolagem

```javascript
function rollDice() {
    const dice = document.getElementById('dice');
    const result = Math.floor(Math.random() * 6) + 1; // 1-6
    
    // Mapear resultado para rotação
    let rotationX = 0;
    let rotationY = 0;
    
    switch (result) {
        case 1: rotationX = 0;    rotationY = 0;    break; // front
        case 6: rotationX = 0;    rotationY = 180;  break; // back
        case 2: rotationX = -90;  rotationY = 0;    break; // top
        case 5: rotationX = 90;   rotationY = 0;    break; // bottom
        case 3: rotationX = 0;    rotationY = 90;   break; // right
        case 4: rotationX = 0;    rotationY = -90;  break; // left
    }
    
    // Adicionar voltas extras para efeito de rolagem
    const extraRotationsX = Math.floor(Math.random() * 5 + 2) * 360;
    const extraRotationsY = Math.floor(Math.random() * 5 + 2) * 360;
    
    // Aplicar transformação
    dice.style.transform = `rotateX(${rotationX + extraRotationsX}deg) rotateY(${rotationY + extraRotationsY}deg)`;
}
```

---

## Criando um D6 Básico

### Passo 1: HTML

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>D6 3D</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div id="dice" class="cube">
            <div class="face front">⚀</div>
            <div class="face back">⚅</div>
            <div class="face top">⚁</div>
            <div class="face bottom">⚄</div>
            <div class="face right">⚂</div>
            <div class="face left">⚃</div>
        </div>
    </div>
    <button onclick="rollDice()">Rolar D6</button>
    <script src="script.js"></script>
</body>
</html>
```

### Passo 2: CSS (style.css)

```css
body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: Arial, sans-serif;
}

.container {
    width: 200px;
    height: 200px;
    perspective: 1000px;
    margin-bottom: 30px;
}

.cube {
    width: 100px;
    height: 100px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 2s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.face {
    position: absolute;
    width: 100px;
    height: 100px;
    background: linear-gradient(145deg, #e74c3c, #c0392b);
    border: 2px solid #922b21;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 50px;
    color: white;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
}

.front  { transform: translateZ(50px); }
.back   { transform: translateZ(-50px) rotateY(180deg); }
.top    { transform: translateY(-50px) rotateX(90deg); }
.bottom { transform: translateY(50px) rotateX(-90deg); }
.right  { transform: translateX(50px) rotateY(90deg); }
.left   { transform: translateX(-50px) rotateY(-90deg); }

button {
    padding: 15px 40px;
    font-size: 18px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    transition: all 0.3s;
}

button:hover {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}
```

### Passo 3: JavaScript (script.js)

```javascript
function rollDice() {
    const dice = document.getElementById('dice');
    const result = Math.floor(Math.random() * 6) + 1;
    
    let rotationX = 0;
    let rotationY = 0;
    
    switch (result) {
        case 1: rotationX = 0;    rotationY = 0;    break;
        case 6: rotationX = 0;    rotationY = 180;  break;
        case 2: rotationX = -90;  rotationY = 0;    break;
        case 5: rotationX = 90;   rotationY = 0;    break;
        case 3: rotationX = 0;    rotationY = 90;   break;
        case 4: rotationX = 0;    rotationY = -90;  break;
    }
    
    const extraRotationsX = Math.floor(Math.random() * 5 + 2) * 360;
    const extraRotationsY = Math.floor(Math.random() * 5 + 2) * 360;
    
    dice.style.transform = `rotateX(${rotationX + extraRotationsX}deg) rotateY(${rotationY + extraRotationsY}deg)`;
}
```

---

## Personalização Visual

### 1. Texturas com Imagens

```css
.face {
    background-image: url('textura-madeira.jpg');
    background-size: cover;
    background-position: center;
}
```

### 2. Gradientes Personalizados

```css
/* Dado de ouro */
.face {
    background: linear-gradient(145deg, #f4d03f, #d4af37);
    border: 2px solid #a67c00;
}

/* Dado de gelo */
.face {
    background: linear-gradient(145deg, #e0f7fa, #80deea);
    border: 2px solid #00acc1;
}

/* Dado de fogo */
.face {
    background: linear-gradient(145deg, #ff6b6b, #ee5a24);
    border: 2px solid #c0392b;
}
```

### 3. Pontos ao Invés de Números

```html
<!-- Face com 1 ponto -->
<div class="face front">
    <div class="dot center"></div>
</div>

<!-- Face com 2 pontos -->
<div class="face top">
    <div class="dot top-left"></div>
    <div class="dot bottom-right"></div>
</div>
```

```css
.face {
    position: relative;
    background: #ecf0f1;
}

.dot {
    width: 15px;
    height: 15px;
    background: #2c3e50;
    border-radius: 50%;
    position: absolute;
}

.dot.center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
.dot.top-left { top: 20%; left: 20%; }
.dot.top-right { top: 20%; right: 20%; }
.dot.bottom-left { bottom: 20%; left: 20%; }
.dot.bottom-right { bottom: 20%; right: 20%; }
.dot.middle-left { top: 50%; left: 20%; transform: translateY(-50%); }
.dot.middle-right { top: 50%; right: 20%; transform: translateY(-50%); }
```

### 4. Efeitos de Brilho

```css
.face {
    box-shadow: 
        inset 0 0 20px rgba(255, 255, 255, 0.2),
        inset 10px 10px 20px rgba(255, 255, 255, 0.1),
        0 5px 15px rgba(0, 0, 0, 0.4);
}

.face::before {
    content: '';
    position: absolute;
    top: 10%;
    left: 10%;
    width: 30%;
    height: 30%;
    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
    border-radius: 50%;
}
```

---

## Outros Tipos de Dados

### D4 (Tetraedro)

```html
<div class="d4">
    <div class="d4-face face1">1</div>
    <div class="d4-face face2">2</div>
    <div class="d4-face face3">3</div>
    <div class="d4-face face4">4</div>
</div>
```

```css
.d4 {
    width: 0;
    height: 0;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 2s;
}

.d4-face {
    position: absolute;
    width: 0;
    height: 0;
    border-left: 60px solid transparent;
    border-right: 60px solid transparent;
    border-bottom: 104px solid #e74c3c;
}

.face1 { transform: rotateX(0deg); }
.face2 { transform: rotateX(120deg); }
.face3 { transform: rotateX(240deg); }
.face4 { transform: rotateY(90deg) rotateZ(120deg); }
```

### D8 (Octaedro)

```css
.d8 {
    width: 80px;
    height: 80px;
    position: relative;
    transform-style: preserve-3d;
}

.d8-face {
    position: absolute;
    width: 0;
    height: 0;
    border-left: 40px solid transparent;
    border-right: 40px solid transparent;
    border-bottom: 70px solid #3498db;
}

/* 8 faces triangulares posicionadas */
.face1 { transform: rotateX(0deg) translateZ(40px); }
.face2 { transform: rotateX(180deg) translateZ(40px); }
.face3 { transform: rotateY(90deg) translateZ(40px); }
.face4 { transform: rotateY(-90deg) translateZ(40px); }
.face5 { transform: rotateY(45deg) rotateX(45deg) translateZ(40px); }
.face6 { transform: rotateY(135deg) rotateX(45deg) translateZ(40px); }
.face7 { transform: rotateY(225deg) rotateX(45deg) translateZ(40px); }
.face8 { transform: rotateY(315deg) rotateX(45deg) translateZ(40px); }
```

### D10 (Trapezoedro Pentagonal)

```css
.d10 {
    width: 100px;
    height: 120px;
    position: relative;
    transform-style: preserve-3d;
}

.d10-face {
    position: absolute;
    width: 50px;
    height: 80px;
    background: #9b59b6;
    clip-path: polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%);
}

/* 10 faces distribuídas */
.face1 { transform: rotateY(0deg) translateZ(50px); }
.face2 { transform: rotateY(36deg) translateZ(50px); }
.face3 { transform: rotateY(72deg) translateZ(50px); }
.face4 { transform: rotateY(108deg) translateZ(50px); }
.face5 { transform: rotateY(144deg) translateZ(50px); }
.face6 { transform: rotateY(180deg) translateZ(50px); }
.face7 { transform: rotateY(216deg) translateZ(50px); }
.face8 { transform: rotateY(252deg) translateZ(50px); }
.face9 { transform: rotateY(288deg) translateZ(50px); }
.face10 { transform: rotateY(324deg) translateZ(50px); }
```

### D12 (Dodecaedro)

```css
.d12 {
    width: 100px;
    height: 100px;
    position: relative;
    transform-style: preserve-3d;
}

.d12-face {
    position: absolute;
    width: 60px;
    height: 60px;
    background: #e67e22;
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}

/* 12 faces pentagonais */
.face1  { transform: rotateX(0deg) translateZ(50px); }
.face2  { transform: rotateX(72deg) translateZ(50px); }
.face3  { transform: rotateX(144deg) translateZ(50px); }
.face4  { transform: rotateX(216deg) translateZ(50px); }
.face5  { transform: rotateX(288deg) translateZ(50px); }
.face6  { transform: rotateY(90deg) translateZ(50px); }
.face7  { transform: rotateY(90deg) rotateX(72deg) translateZ(50px); }
.face8  { transform: rotateY(90deg) rotateX(144deg) translateZ(50px); }
.face9  { transform: rotateY(90deg) rotateX(216deg) translateZ(50px); }
.face10 { transform: rotateY(90deg) rotateX(288deg) translateZ(50px); }
.face11 { transform: rotateY(180deg) translateZ(50px); }
.face12 { transform: rotateY(270deg) translateZ(50px); }
```

### D20 (Icosaedro)

```css
.d20 {
    width: 100px;
    height: 100px;
    position: relative;
    transform-style: preserve-3d;
}

.d20-face {
    position: absolute;
    width: 0;
    height: 0;
    border-left: 30px solid transparent;
    border-right: 30px solid transparent;
    border-bottom: 52px solid #1abc9c;
}

/* 20 faces triangulares - exemplo simplificado */
.face1  { transform: rotateX(0deg) rotateZ(0deg) translateZ(60px); }
.face2  { transform: rotateX(36deg) rotateZ(0deg) translateZ(60px); }
.face3  { transform: rotateX(72deg) rotateZ(0deg) translateZ(60px); }
.face4  { transform: rotateX(108deg) rotateZ(0deg) translateZ(60px); }
.face5  { transform: rotateX(144deg) rotateZ(0deg) translateZ(60px); }
/* ... continue para as 20 faces */
```

---

## Animações Avançadas

### 1. Bounce Effect

```css
.cube {
    animation: bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-30px); }
}
```

### 2. Glow ao Rolar

```css
.cube.rolling {
    box-shadow: 0 0 30px rgba(52, 152, 219, 0.8);
    animation: glow 0.5s ease-in-out infinite;
}

@keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(52, 152, 219, 0.6); }
    50% { box-shadow: 0 0 40px rgba(52, 152, 219, 1); }
}
```

### 3. Som ao Rolar

```javascript
function rollDice() {
    // Tocar som
    const audio = new Audio('dice-roll.mp3');
    audio.play();
    
    // ... resto do código de rolagem
}
```

### 4. Múltiplos Dados

```javascript
function rollMultipleDice(numDice) {
    const container = document.getElementById('diceContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < numDice; i++) {
        const diceDiv = createDice(i);
        container.appendChild(diceDiv);
        
        setTimeout(() => {
            animateDice(diceDiv);
        }, i * 100); // Delay progressivo
    }
}
```

---

## Dicas e Truques

### Performance

1. Use `will-change: transform` para melhor performance:
```css
.cube {
    will-change: transform;
}
```

2. Limite o número de dados simultâneos (máximo 10)

3. Use `requestAnimationFrame` para animações complexas

### Responsividade

```css
@media (max-width: 768px) {
    .container {
        width: 150px;
        height: 150px;
        perspective: 800px;
    }
    
    .cube {
        width: 75px;
        height: 75px;
    }
    
    .face {
        width: 75px;
        height: 75px;
    }
    
    .front  { transform: translateZ(37.5px); }
    .back   { transform: translateZ(-37.5px) rotateY(180deg); }
    /* ... ajustar todas as faces */
}
```

### Acessibilidade

```html
<button onclick="rollDice()" aria-label="Rolar dado de 6 faces">
    🎲 Rolar D6
</button>

<div role="status" aria-live="polite" id="resultado">
    <!-- Resultado será anunciado por leitores de tela -->
</div>
```

```javascript
function rollDice() {
    // ... animação
    
    // Anunciar resultado
    document.getElementById('resultado').textContent = 
        `Resultado: ${result}`;
}
```

---

## Recursos Adicionais

- **CSS Transforms**: https://developer.mozilla.org/en-US/docs/Web/CSS/transform
- **3D Perspective**: https://3dtransforms.desandro.com/
- **Cubic Bezier**: https://cubic-bezier.com/

---

## Exemplo Completo: D20 com Som e Partículas

```javascript
class DiceRoller {
    constructor(container, sides = 6) {
        this.container = container;
        this.sides = sides;
        this.dice = this.createDice();
    }
    
    createDice() {
        const dice = document.createElement('div');
        dice.className = `dice d${this.sides}`;
        // ... criar faces
        this.container.appendChild(dice);
        return dice;
    }
    
    async roll() {
        const result = Math.floor(Math.random() * this.sides) + 1;
        
        // Som
        new Audio('roll.mp3').play();
        
        // Partículas
        this.createParticles();
        
        // Animação
        await this.animate(result);
        
        // Som de resultado
        if (result === this.sides) {
            new Audio('critical.mp3').play();
        }
        
        return result;
    }
    
    createParticles() {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 0.3}s`;
            this.container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }
    
    async animate(result) {
        const rotation = this.getRotationForResult(result);
        const extraRotations = (Math.random() * 3 + 2) * 360;
        
        this.dice.style.transform = 
            `rotateX(${rotation.x + extraRotations}deg) 
             rotateY(${rotation.y + extraRotations}deg)`;
        
        return new Promise(resolve => {
            setTimeout(resolve, 2000);
        });
    }
    
    getRotationForResult(result) {
        // Mapeamento específico para cada tipo de dado
        // ... implementação
    }
}

// Uso
const roller = new DiceRoller(document.getElementById('container'), 20);
document.getElementById('rollBtn').addEventListener('click', async () => {
    const result = await roller.roll();
    console.log(`Você rolou: ${result}`);
});
```

---

## Conclusão

Este tutorial fornece tudo que você precisa para criar dados 3D incríveis! Experimente combinar técnicas, adicionar seus próprios estilos e criar experiências únicas para seus jogadores.

**Boa sorte e bons rolls! 🎲**
