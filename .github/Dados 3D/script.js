function rollDice() {
    const dice = document.getElementById('dice');
    // Gera um número aleatório de 1 a 6
    const result = Math.floor(Math.random() * 6) + 1; 

    // Define os valores de rotação para cada face (exemplo simplificado)
    // Rotações para resultados específicos (ajustes finos podem ser necessários para realismo)
    let rotationX = 0;
    let rotationY = 0;

    switch (result) {
        case 1:
            rotationX = 0;
            rotationY = 0;
            break;
        case 6:
            rotationX = 0;
            rotationY = 180;
            break;
        case 2:
            rotationX = -90;
            rotationY = 0;
            break;
        case 5:
            rotationX = 90;
            rotationY = 0;
            break;
        case 3:
            rotationX = 0;
            rotationY = 90;
            break;
        case 4:
            rotationX = 0;
            rotationY = -90;
            break;
    }
    
    // Adiciona rotações extras para a animação parecer uma "rolagem"
    // Valores aleatórios para tornar cada rolagem única e mais animada
    const randomRotationsX = Math.floor(Math.random() * 5 + 2) * 360; 
    const randomRotationsY = Math.floor(Math.random() * 5 + 2) * 360;

    // Aplica a transformação final
    dice.style.transform = `rotateX(${rotationX + randomRotationsX}deg) rotateY(${rotationY + randomRotationsY}deg)`;
}
