/**
 * Sistema de Dados 3D para Rolagem 4d6
 * Rola 4 dados, remove o menor, retorna soma dos 3 maiores
 */

export class Dice3DRoller {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.diceValues = [];
        this.isRolling = false;
        this.onComplete = null;
    }

    /**
     * Rola 4 dados e retorna a soma dos 3 maiores
     */
    async roll() {
        if (this.isRolling) return;
        
        this.isRolling = true;
        this.diceValues = [];
        
        // Limpar container
        this.container.innerHTML = '';
        
        // Criar 4 dados
        const diceElements = [];
        for (let i = 0; i < 4; i++) {
            const diceWrapper = this.createDiceElement(i);
            this.container.appendChild(diceWrapper);
            diceElements.push(diceWrapper);
        }

        // Gerar valores aleatórios
        const rolls = [];
        for (let i = 0; i < 4; i++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }

        // Animar cada dado
        await Promise.all(rolls.map((value, index) => 
            this.animateDice(diceElements[index], value)
        ));

        this.diceValues = rolls;

        // Aguardar 500ms antes de remover o menor
        await this.wait(500);

        // Encontrar e remover o menor valor
        const minValue = Math.min(...rolls);
        const minIndex = rolls.indexOf(minValue);
        
        await this.removeDice(diceElements[minIndex], minIndex);

        // Calcular soma dos 3 maiores
        const remainingValues = rolls.filter((_, idx) => idx !== minIndex);
        const sum = remainingValues.reduce((a, b) => a + b, 0);

        // Mostrar resultado
        await this.showResult(sum);

        this.isRolling = false;

        if (this.onComplete) {
            this.onComplete(sum);
        }

        return sum;
    }

    createDiceElement(index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'dice-wrapper';
        wrapper.dataset.index = index;

        const dice = document.createElement('div');
        dice.className = 'dice-cube';

        // Criar as 6 faces
        const faces = ['front', 'back', 'top', 'bottom', 'right', 'left'];
        const numbers = [1, 6, 2, 5, 3, 4];

        faces.forEach((face, idx) => {
            const faceDiv = document.createElement('div');
            faceDiv.className = `dice-face ${face}`;
            faceDiv.textContent = numbers[idx];
            dice.appendChild(faceDiv);
        });

        wrapper.appendChild(dice);
        return wrapper;
    }

    async animateDice(wrapper, finalValue) {
        const dice = wrapper.querySelector('.dice-cube');
        
        // Rotações extras para animação
        const extraRotations = 3 + Math.floor(Math.random() * 3); // 3-5 voltas extras
        
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
        const rotateX = finalRotation.x + (extraRotations * 360);
        const rotateY = finalRotation.y + (extraRotations * 360);

        dice.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Aguardar animação terminar (2s)
        await this.wait(2000);

        // Mostrar valor na wrapper
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'dice-value-display';
        valueDisplay.textContent = finalValue;
        wrapper.appendChild(valueDisplay);
    }

    async removeDice(wrapper, index) {
        wrapper.classList.add('dice-removing');
        
        // Adicionar indicador de "menor"
        const label = document.createElement('div');
        label.className = 'dice-label';
        label.textContent = 'Menor';
        wrapper.appendChild(label);

        await this.wait(800);
        
        wrapper.classList.add('dice-removed');
        await this.wait(500);
    }

    async showResult(sum) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'dice-result';
        resultDiv.innerHTML = `
            <div class="result-value">${sum}</div>
            <div class="result-label">Soma dos 3 maiores</div>
        `;
        this.container.appendChild(resultDiv);
        
        await this.wait(300);
        resultDiv.classList.add('show');
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setOnComplete(callback) {
        this.onComplete = callback;
    }
}
