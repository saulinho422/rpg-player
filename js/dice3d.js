/**
 * Sistema de Dados 3D para Rolagem 4d6
 * Baseado no código de referência de .github/Dados 3D
 */

export class Dice3DRoller {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container não encontrado:', containerId);
        }
    }

    /**
     * Rola 4 dados, remove o menor, retorna a soma dos 3 maiores
     */
    async roll() {
        // Limpar container
        this.container.innerHTML = '';
        this.container.style.display = 'flex';
        this.container.style.gap = '20px';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        this.container.style.padding = '40px 20px';
        this.container.style.minHeight = '200px';
        
        // Criar 4 dados
        const diceElements = [];
        const diceValues = [];
        
        for (let i = 0; i < 4; i++) {
            const result = Math.floor(Math.random() * 6) + 1;
            diceValues.push(result);
            
            const diceContainer = this.createDice(i, result);
            this.container.appendChild(diceContainer);
            diceElements.push(diceContainer);
        }
        
        // Animar todos os dados
        await Promise.all(diceElements.map((dice, idx) => 
            this.animateDice(dice, diceValues[idx])
        ));
        
        // Aguardar animação terminar
        await this.wait(2000);
        
        // Encontrar o menor valor
        const minValue = Math.min(...diceValues);
        const minIndex = diceValues.indexOf(minValue);
        
        // Marcar o menor para remoção
        diceElements[minIndex].classList.add('dice-removing');
        
        await this.wait(800);
        
        // Remover o menor
        diceElements[minIndex].style.opacity = '0.3';
        diceElements[minIndex].style.transform = 'scale(0.8)';
        
        await this.wait(500);
        
        // Calcular soma dos 3 maiores
        const remainingValues = diceValues.filter((_, idx) => idx !== minIndex);
        const sum = remainingValues.reduce((a, b) => a + b, 0);
        
        // Mostrar resultado
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = `
            position: absolute;
            top: 10px;
            background: linear-gradient(135deg, #d4af37, #f4d03f);
            color: #1a1a2e;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: 700;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
        `;
        resultDiv.textContent = sum;
        this.container.style.position = 'relative';
        this.container.appendChild(resultDiv);
        
        return sum;
    }

    createDice(index, finalValue) {
        const wrapper = document.createElement('div');
        wrapper.className = 'dice-wrapper';
        wrapper.style.cssText = `
            width: 80px;
            height: 80px;
            perspective: 1000px;
            transition: all 0.5s ease;
        `;
        
        const cube = document.createElement('div');
        cube.className = 'dice-cube';
        cube.style.cssText = `
            width: 80px;
            height: 80px;
            position: relative;
            transform-style: preserve-3d;
            transition: transform 2s cubic-bezier(0.25, 0.1, 0.25, 1);
        `;
        
        // Criar as 6 faces
        const faces = [
            { name: 'front', value: 1, transform: 'translateZ(40px)' },
            { name: 'back', value: 6, transform: 'translateZ(-40px) rotateY(180deg)' },
            { name: 'top', value: 2, transform: 'translateY(-40px) rotateX(90deg)' },
            { name: 'bottom', value: 5, transform: 'translateY(40px) rotateX(-90deg)' },
            { name: 'right', value: 3, transform: 'translateX(40px) rotateY(90deg)' },
            { name: 'left', value: 4, transform: 'translateX(-40px) rotateY(-90deg)' }
        ];
        
        faces.forEach(face => {
            const faceDiv = document.createElement('div');
            faceDiv.className = `dice-face ${face.name}`;
            faceDiv.style.cssText = `
                position: absolute;
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                border: 2px solid #922b21;
                border-radius: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 36px;
                font-weight: 700;
                color: white;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
                box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
                transform: ${face.transform};
            `;
            faceDiv.textContent = face.value;
            cube.appendChild(faceDiv);
        });
        
        wrapper.appendChild(cube);
        return wrapper;
    }

    animateDice(wrapper, finalValue) {
        const cube = wrapper.querySelector('.dice-cube');
        
        // Mapeamento de valor para rotação
        const rotations = {
            1: { x: 0, y: 0 },
            6: { x: 0, y: 180 },
            2: { x: -90, y: 0 },
            5: { x: 90, y: 0 },
            3: { x: 0, y: 90 },
            4: { x: 0, y: -90 }
        };
        
        const finalRotation = rotations[finalValue];
        
        // Adicionar rotações extras para animação
        const randomRotationsX = Math.floor(Math.random() * 5 + 2) * 360;
        const randomRotationsY = Math.floor(Math.random() * 5 + 2) * 360;
        
        const rotateX = finalRotation.x + randomRotationsX;
        const rotateY = finalRotation.y + randomRotationsY;
        
        cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        return this.wait(100);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
