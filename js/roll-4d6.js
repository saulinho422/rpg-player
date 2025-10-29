// =====================================
// SISTEMA DE ROLAGEM 4D6
// =====================================

class DiceRoller {
    constructor() {
        this.rollCount = 0;
        this.maxRolls = 6;
        this.storedValues = [];
        this.isRolling = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateProgress();
    }
    
    setupEventListeners() {
        document.getElementById('backBtn').addEventListener('click', () => {
            window.history.back();
        });
        
        document.getElementById('rollBtn').addEventListener('click', () => {
            if (!this.isRolling && this.rollCount < this.maxRolls) {
                this.rollDice();
            }
        });
        
        document.getElementById('distributeBtn').addEventListener('click', () => {
            this.distributeValues();
        });
    }
    
    async rollDice() {
        this.isRolling = true;
        const rollBtn = document.getElementById('rollBtn');
        rollBtn.disabled = true;
        rollBtn.textContent = '🎲 Rolando...';
        
        // Limpa dados anteriores
        const diceContainer = document.getElementById('diceContainer');
        diceContainer.innerHTML = '';
        
        // Limpa resultado anterior
        document.getElementById('currentResult').textContent = '--';
        
        // Gera 4 valores aleatórios
        const rolls = [];
        for (let i = 0; i < 4; i++) {
            const value = Math.floor(Math.random() * 6) + 1;
            rolls.push(value);
        }
        
        // Cria elementos dos dados com animação
        rolls.forEach((value, index) => {
            setTimeout(() => {
                const die = document.createElement('div');
                die.className = 'die';
                die.textContent = value;
                die.dataset.value = value;
                diceContainer.appendChild(die);
                
                // Som (opcional)
                this.playDiceSound();
            }, index * 150);
        });
        
        // Aguarda animações
        await this.sleep(600 + (4 * 150));
        
        // Encontra e descarta o menor valor
        const minValue = Math.min(...rolls);
        const minIndex = rolls.indexOf(minValue);
        
        await this.sleep(500);
        
        // Marca o dado descartado
        const dice = diceContainer.querySelectorAll('.die');
        dice[minIndex].classList.add('discarded');
        
        await this.sleep(1000);
        
        // Calcula resultado (soma dos 3 maiores)
        const remaining = rolls.filter((_, index) => index !== minIndex);
        const result = remaining.reduce((sum, val) => sum + val, 0);
        
        // Exibe resultado com animação
        const resultDisplay = document.getElementById('currentResult');
        resultDisplay.textContent = result;
        resultDisplay.style.animation = 'none';
        setTimeout(() => {
            resultDisplay.style.animation = 'popIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }, 10);
        
        // Armazena o resultado
        this.storedValues.push(result);
        this.rollCount++;
        
        // Atualiza displays
        this.updateProgress();
        this.updateStoredResults();
        
        // Reabilita botão ou finaliza
        if (this.rollCount < this.maxRolls) {
            rollBtn.disabled = false;
            rollBtn.textContent = '🎲 Rolar Dados';
        } else {
            rollBtn.textContent = '✓ Todas as rolagens completas!';
            document.getElementById('distributeBtn').style.display = 'block';
        }
        
        this.isRolling = false;
    }
    
    updateProgress() {
        document.getElementById('rollCount').textContent = this.rollCount;
    }
    
    updateStoredResults() {
        const container = document.getElementById('storedResults');
        container.innerHTML = '';
        
        // Cria slots para todos os 6 valores
        for (let i = 0; i < this.maxRolls; i++) {
            const slot = document.createElement('div');
            
            if (i < this.storedValues.length) {
                slot.className = 'filled-result';
                slot.textContent = this.storedValues[i];
            } else {
                slot.className = 'empty-result';
                slot.textContent = '?';
            }
            
            container.appendChild(slot);
        }
    }
    
    distributeValues() {
        // Ordena valores do maior para o menor
        const sortedValues = [...this.storedValues].sort((a, b) => b - a);
        
        // Salva no localStorage
        localStorage.setItem('attributeValues', JSON.stringify(sortedValues));
        localStorage.setItem('attributeMethod', '4d6');
        
        // Redireciona para página de distribuição
        window.location.href = 'distribute-attributes.html';
    }
    
    playDiceSound() {
        // Cria um som simples de clique
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 100;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new DiceRoller();
});
