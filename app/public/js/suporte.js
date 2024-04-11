function exibirResposta(respostaId) {
    var resposta = document.getElementById(respostaId);

    // Verifica qual estilo esta na resposta "display none ou block"
    var estadoAtual = resposta.style.display;

    // Se estiver block ele fica none
    if (estadoAtual === 'block') {
        resposta.style.display = 'none';
    } else {
        // Se não oculta todas as respostas antes de mostrar a resposta atual
        var todasAsRespostas = document.querySelectorAll('.suporte div');
        todasAsRespostas.forEach(function (outraResposta) {
            outraResposta.style.display = 'none';
        });
        
        resposta.style.display = 'block';
    }
}