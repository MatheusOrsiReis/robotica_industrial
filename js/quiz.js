// Perguntas e respostas estão no HTML. Aqui fica apenas o funcionamento do jogo.
const inicio = document.getElementById('inicio');
const partida = document.getElementById('partida');
const resultado = document.getElementById('resultado');
const perguntas = document.querySelectorAll('.question');
const confirmar = document.getElementById('confirmar');
const proxima = document.getElementById('proxima');
const retorno = document.getElementById('retorno');
const premios = ['1.000', '2.000', '5.000', '10.000', '20.000', '50.000', '100.000', '200.000', '300.000', '500.000', '1.000.000'];
const meioAMeio = document.getElementById('meio-a-meio');
const pedirDica = document.getElementById('pedir-dica');
const ajudaTexto = document.getElementById('ajuda-texto');
let usouMeioAMeio = false;
let usouDica = false;
let rodada = 0;
let acertos = 0;
let escolha = null;
let respondeu = false;
let acertou = false;

function jogar() {
    rodada = 0;
    acertos = 0;
    usouMeioAMeio = false;
    usouDica = false;
    meioAMeio.textContent = "50/50";
    pedirDica.textContent = "Dica";
    inicio.hidden = true;
    resultado.hidden = true;
    partida.hidden = false;
    document.getElementById('trilha').hidden = false;
    document.querySelector('.quiz-main').classList.add('with-trail');
    mostrarPergunta();
}

function mostrarPergunta() {
    escolha = null;
    respondeu = false;
    retorno.textContent = '';
    ajudaTexto.textContent = '';
    meioAMeio.disabled = usouMeioAMeio;
    pedirDica.disabled = usouDica;
    confirmar.hidden = false;
    confirmar.disabled = true;
    proxima.hidden = true;
    document.getElementById('contador').textContent = 'Pergunta ' + (rodada + 1) + ' de 11';
    document.getElementById('premio').textContent = 'Vale R$ ' + premios[rodada] + ' fictícios';
    perguntas.forEach(function (pergunta, indice) {
        pergunta.hidden = indice !== rodada;
    });
    perguntas[rodada].querySelectorAll('.answer').forEach(function (botao) {
        botao.disabled = false;
        botao.className = 'answer';
        botao.setAttribute('aria-pressed', 'false');
    });
    atualizarTrilha();
    perguntas[rodada].querySelector('h2').focus();
}

// Clicar seleciona; confirmar mostra a correção.
document.querySelectorAll('.answer').forEach(function (botao) {
    botao.addEventListener('click', function () {
        if (respondeu) return;
        if (escolha) escolha.setAttribute('aria-pressed', 'false');
        escolha = botao;
        botao.setAttribute('aria-pressed', 'true');
        confirmar.disabled = false;
    });
});

confirmar.addEventListener('click', function () {
    if (!escolha || respondeu) return;
    respondeu = true;
    meioAMeio.disabled = true;
    pedirDica.disabled = true;
    const pergunta = perguntas[rodada];
    acertou = escolha.dataset.choice === pergunta.dataset.answer;
    if (acertou) acertos++;
    else escolha.classList.add('incorrect');
    pergunta.querySelectorAll('.answer').forEach(function (botao) {
        botao.disabled = true;
        if (botao.dataset.choice === pergunta.dataset.answer) botao.classList.add('correct');
    });
    retorno.textContent = (acertou ? 'Certa resposta! ' : 'Que pena, você errou! ') + 'Resposta ' + pergunta.dataset.answer + '. ' + pergunta.querySelector('.explanation').textContent;
    confirmar.hidden = true;
    proxima.hidden = false;
    proxima.textContent = acertou && rodada < 10 ? 'Próxima pergunta' : 'Ver resultado';
    atualizarTrilha();
    proxima.focus();
});

proxima.addEventListener('click', function () {
    if (!respondeu) return;
    if (acertou && rodada < 10) {
        rodada++;
        mostrarPergunta();
    } else {
        partida.hidden = true;
        resultado.hidden = false;
        document.getElementById('titulo-resultado').textContent = acertos === 11 ? 'Você chegou ao milhão!' : 'Fim da partida';
        document.getElementById('resumo').textContent = 'Você acertou ' + acertos + ' de 11 perguntas.';
        document.getElementById('premio-final').textContent = 'R$ ' + (acertos ? premios[acertos - 1] : '0');
        document.getElementById('titulo-resultado').focus();
    }
});

document.getElementById('jogar').addEventListener('click', jogar);
document.getElementById('recomecar').addEventListener('click', jogar);
document.getElementById('jogar').disabled = false;

// Cada ajuda pode ser usada uma vez por partida, antes de confirmar.
meioAMeio.addEventListener('click', function () {
    if (respondeu || usouMeioAMeio) return;
    const pergunta = perguntas[rodada];
    const erradas = Array.from(pergunta.querySelectorAll('.answer')).filter(function (botao) {
        return botao.dataset.choice !== pergunta.dataset.answer;
    });
    // Sorteia a alternativa errada que continua disponível.
    erradas.splice(Math.floor(Math.random() * erradas.length), 1);
    erradas.forEach(function (botao) {
        botao.disabled = true;
        botao.classList.add('eliminated');
        botao.setAttribute('aria-pressed', 'false');
        if (escolha === botao) escolha = null;
    });
    confirmar.disabled = escolha === null;
    usouMeioAMeio = true;
    meioAMeio.disabled = true;
    meioAMeio.textContent = '50/50 usada';
    ajudaTexto.textContent = 'Duas alternativas erradas foram eliminadas.' + (usouDica && ajudaTexto.dataset.rodada === String(rodada) ? ' Dica: ' + pergunta.dataset.dica : '');
});

pedirDica.addEventListener('click', function () {
    if (respondeu || usouDica) return;
    ajudaTexto.textContent = 'Dica: ' + perguntas[rodada].dataset.dica;
    ajudaTexto.dataset.rodada = rodada;
    usouDica = true;
    pedirDica.disabled = true;
    pedirDica.textContent = 'Dica usada';
});

// A trilha usa os mesmos valores e o mesmo placar da partida.
function atualizarTrilha() {
    document.getElementById('valor-conquistado').textContent = 'Conquistado: R$ ' + (acertos ? premios[acertos - 1] : '0');
    document.querySelectorAll('.gold-step').forEach(function (barra, indice) {
        barra.className = 'gold-step';
        barra.removeAttribute('aria-current');
        let estado = 'A alcançar';
        if (indice < acertos) {
            barra.classList.add('won');
            estado = '✓ Conquistado';
        } else if (indice === rodada) {
            if (respondeu && !acertou) {
                barra.classList.add('missed');
                estado = 'Não alcançado';
            } else {
                barra.classList.add('current');
                barra.setAttribute('aria-current', 'step');
                estado = 'Rodada atual';
            }
        }
        barra.querySelector('.gold-status').textContent = estado;
    });
}
