Como Funciona e Como Personalizar a Animação de Dado 3D
Este projeto utiliza a combinação de HTML, CSS e JavaScript puros para criar e animar um objeto 3D interativo no navegador.
1. Como Funciona
O núcleo da funcionalidade reside na manipulação de transformações CSS 3D via JavaScript.
1.1. A Estrutura (HTML)
O HTML fornece o esqueleto. A chave é o uso do transform-style: preserve-3d; no elemento .cube. Isso garante que os elementos filhos (.face) posicionados em 3D mantenham sua posição dentro do espaço tridimensional do pai.
html
<!-- O contêiner define a perspectiva da câmera -->
<div class="container">
    <!-- O cubo que será animado -->
    <div id="dice" class="cube">
        <!-- As faces que são rotacionadas e transladadas para formar o cubo -->
        <div class="face front">1</div>
        <!-- ... outras faces ... -->
    </div>
</div>
Use o código com cuidado.

1.2. O Estilo e o 3D (CSS)
O CSS é onde a mágica 3D acontece:
perspective: 1000px;: Isso é aplicado ao .container e simula uma câmera. Sem isso, os elementos 3D seriam renderizados como 2D.
transform-style: preserve-3d;: Permite que os filhos do .cube sejam posicionados em 3D.
Posicionamento das Faces: Cada face é um quadrado simples que é transladado (translateZ, translateX, translateY) para fora do centro do cubo e rotacionado (rotateY, rotateX) para ficar na orientação correta.
transform: translateZ(50px); move a face frontal 50px para frente do centro (metade do tamanho do cubo, que é 100px).
A Animação (Transição): A propriedade transition: transform 2s ... no .cube é crucial. Ela suaviza a mudança de uma rotação para outra ao longo de 2 segundos, em vez de uma mudança instantânea.
1.3. A Lógica (JavaScript)
O JavaScript controla a ação e o resultado:
Geração Aleatória: Math.floor(Math.random() * 6) + 1; gera um número aleatório de 1 a 6.
Mapeamento de Rotação: Um switch mapeia o número do resultado para os ângulos X e Y necessários para que aquela face fique visível.
Adição de Aleatoriedade na Rolagem: Adicionamos randomRotationsX e randomRotationsY (múltiplos de 360 graus) para que o dado dê várias voltas antes de parar. Isso faz a animação parecer uma "rolagem" e não apenas um "giro direto" para o resultado.
Aplicação do Estilo: dice.style.transform = ... atualiza o CSS do elemento, acionando a transição/animação definida anteriormente.
2. Como Personalizar o Seu Dado
Você pode alterar a aparência e a sensação do seu dado ajustando o CSS e o HTML.
2.1. Alterar Cores e Tamanho
Tamanho: Mude o width e height do .cube e do .face no CSS (ex: para 150px). Lembre-se de ajustar as translações (translateZ, translateX, translateY) para metade do novo tamanho (ex: 75px) para manter o cubo fechado.
Cores: Altere background-color e border na classe .face no CSS.
2.2. Substituir Números por Imagens/Pontos
Em vez de números simples, você pode usar SVGs ou divs para criar os pontos de um dado tradicional.
No HTML, substitua o número 1 por divs com pontos:
html
<div class="face front">
    <div class="dot center"></div>
</div>
Use o código com cuidado.

No CSS, estilize os pontos (.dot) e use posicionamento absoluto para colocá-los onde quiser:
css
.dot {
    width: 10px;
    height: 10px;
    background-color: white;
    border-radius: 50%;
    position: absolute;
}
.front .center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
/* Adicione mais regras para faces com 2, 3, 4, 5 e 6 pontos */
Use o código com cuidado.

2.3. Ajustar a Animação (Velocidade e Suavidade)
Velocidade: Altere a duração em transition: transform 2s (ex: 1s para mais rápido, 4s para mais lento).
Suavidade (Easing Function): cubic-bezier(0.25, 0.1, 0.25, 1) controla a aceleração e desaceleração. Você pode usar valores predefinidos como ease-out ou linear, ou gerar seu próprio cubic-bezier online.
3. Como Fazer Outros Tipos de Dados (D4, D8, D20)
Criar outros formatos de dados requer uma compreensão mais profunda da geometria 3D e do posicionamento de vértices, o que é significativamente mais complexo do que um cubo (D6).
D4 (Tetraedro): É um desafio com puro CSS/HTML porque não é composto por faces planas fáceis de posicionar. Geralmente requer bibliotecas como Three.js.
D20 (Icosaedro): Possui 20 faces triangulares. Posicionar isso com CSS puro é extremamente complexo devido à matemática envolvida nas rotações e translações para cada face.
Para D20s ou D8s:
A melhor abordagem é utilizar uma biblioteca JavaScript especializada em gráficos 3D, como o Three.js. Essas bibliotecas abstraem a complexidade da geometria e permitem que você crie e manipule objetos 3D de forma muito mais eficiente e precisa.
O código fornecido é otimizado especificamente para a simplicidade e a viabilidade do formato de cubo (D6) usando apenas CSS e JavaScript nativos.