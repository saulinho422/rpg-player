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
        
        // Criar 4 dados
        const diceElements = [];
        const diceValues = [];
        
        for (let i = 0; i < 4; i++) {
            const result = Math.floor(Math.random() * 6) + 1;
            diceValues.push(result);
            
            const diceWrapper = this.createDice(i);
            this.container.appendChild(diceWrapper);
            diceElements.push(diceWrapper);
        }
        
        // Pequeno delay para garantir que os elementos foram renderizados
        await this.wait(50);
        
        // Animar todos os dados simultaneamente
        diceElements.forEach((wrapper, idx) => {
            this.animateDice(wrapper, diceValues[idx]);
        });
        
        // Aguardar animação terminar (2 segundos)
        await this.wait(2500);
        
        // Encontrar o menor valor
        const minValue = Math.min(...diceValues);
        const minIndex = diceValues.indexOf(minValue);
        
        // Marcar o menor para remoção
        diceElements[minIndex].classList.add('dice-removing');
        
        await this.wait(1000);
        
        // Calcular soma dos 3 maiores
        const remainingValues = diceValues.filter((_, idx) => idx !== minIndex);
        const sum = remainingValues.reduce((a, b) => a + b, 0);
        
        // Mostrar resultado
        const resultDiv = document.createElement('div');
        resultDiv.className = 'dice-result-badge';
        resultDiv.textContent = sum;
        this.container.appendChild(resultDiv);
        
        return sum;
    }

    createDice(index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'dice-wrapper';
        
        const cube = document.createElement('div');
        cube.className = 'dice-cube';
        
        // Criar as 6 faces com valores corretos
        const faces = [
            { name: 'front', value: 1 },
            { name: 'back', value: 6 },
            { name: 'top', value: 2 },
            { name: 'bottom', value: 5 },
            { name: 'right', value: 3 },
            { name: 'left', value: 4 }
        ];
        
        faces.forEach(face => {
            const faceDiv = document.createElement('div');
            faceDiv.className = `dice-face ${face.name}`;
            faceDiv.textContent = face.value;
            cube.appendChild(faceDiv);
        });
        
        wrapper.appendChild(cube);
        return wrapper;
    }

    animateDice(wrapper, finalValue) {
        const cube = wrapper.querySelector('.dice-cube');
        
        // Mapeamento de valor para rotação (EXATAMENTE como no código de referência)
        const rotations = {
            1: { x: 0, y: 0 },      // front
            6: { x: 0, y: 180 },    // back
            2: { x: -90, y: 0 },    // top
            5: { x: 90, y: 0 },     // bottom
            3: { x: 0, y: 90 },     // right
            4: { x: 0, y: -90 }     // left
        };
        
        const finalRotation = rotations[finalValue];
        
        // Adicionar rotações extras para criar a animação de "rolagem"
        const randomRotationsX = Math.floor(Math.random() * 5 + 2) * 360; // 2-6 voltas
        const randomRotationsY = Math.floor(Math.random() * 5 + 2) * 360; // 2-6 voltas
        
        const rotateX = finalRotation.x + randomRotationsX;
        const rotateY = finalRotation.y + randomRotationsY;
        
        // Aplicar transformação - isso aciona a transição do CSS
        cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
