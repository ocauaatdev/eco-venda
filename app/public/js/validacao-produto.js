// document.addEventListener("DOMContentLoaded", function() {
//     // Função para validar o campo de tamanho do produto
//     function validarTamanhoProduto(tamanho) {
//         // Expressões regulares para verificar formatos válidos
//         const formatosValidos = [
//             /^(Pequeno|Médio|Grande)$/i,
//             /^(Pequeno, Médio, Grande)$/i,
//             /^(P|M|G|GG)$/i,
//             /^(P,M,G,GG)$/i,
//             /^(Sem tamanho específico)$/i
//         ];

//         // Verifica se o tamanho corresponde a qualquer um dos formatos válidos
//         return formatosValidos.some(formato => formato.test(tamanho.trim()));
//     }

//     // Função para exibir notificação de erro
//     function exibirErro(mensagem) {
//         new Notify({
//             status: 'error',
//             title: 'Erro',
//             text: mensagem,
//             effect: 'fade',
//             speed: 300,
//             customClass: '',
//             customIcon: '',
//             showIcon: true,
//             showCloseButton: true,
//             autoclose: true,
//             autotimeout: 3000,
//             gap: 10,
//             distance: 10,
//             type: 3,
//             position: 'right top'
//         });
//     }

//     // Função para validar o formulário
//     function validarFormulario(event) {
//         const tamanhoProduto = document.getElementById("tamanhoProduto").value;

//         if (!validarTamanhoProduto(tamanhoProduto)) {
//             event.preventDefault(); // Impede o envio do formulário
//             exibirErro('Por favor, preencha o tamanho do produto corretamente conforme as instruções.');
//         }
//     }

//     // Associa a função de validação ao evento de submissão do formulário
//     const formulario = document.querySelector('form');
//     formulario.addEventListener('submit', validarFormulario);
// });

document.addEventListener("DOMContentLoaded", function() {
    // Função para validar o campo de tamanho do produto
    function validarTamanhoProduto(tamanho) {
        // Expressões regulares para verificar formatos válidos
        const formatosValidos = [
            /^(Pequeno|Médio|Grande)$/i,
            /^(Pequeno, Médio, Grande)$/i,
            /^(P|M|G|GG)$/i,
            /^(P,M,G,GG)$/i,
            /^(Sem tamanho específico)$/i
        ];

        // Verifica se o tamanho corresponde a qualquer um dos formatos válidos
        return formatosValidos.some(formato => formato.test(tamanho.trim()));
    }

    // Função para exibir notificação de erro
    function exibirErro(mensagem) {
        new Notify({
            status: 'error',
            title: 'Erro',
            text: mensagem,
            effect: 'fade',
            speed: 300,
            customClass: '',
            customIcon: '',
            showIcon: true,
            showCloseButton: true,
            autoclose: true,
            autotimeout: 3000,
            gap: 10,
            distance: 10,
            type: 3,
            position: 'right top'
        });
    }

    // Função para validar a seleção da categoria
    function validarCategoriaSelecionada() {
        const categoriaSelecionada = document.getElementById("Categorias_idCategorias").value;
        return categoriaSelecionada !== "";
    }

    // Função para validar o formulário
    function validarFormulario(event) {
        const tamanhoProduto = document.getElementById("tamanhoProduto").value;

        // Valida o campo de tamanho do produto
        if (!validarTamanhoProduto(tamanhoProduto)) {
            event.preventDefault(); // Impede o envio do formulário
            exibirErro('Por favor, preencha o tamanho do produto corretamente conforme as instruções.');
            return;
        }

        // Valida a categoria selecionada
        if (!validarCategoriaSelecionada()) {
            event.preventDefault(); // Impede o envio do formulário
            exibirErro('Por favor, selecione uma categoria.');
        }
    }

    // Associa a função de validação ao evento de submissão do formulário
    const formulario = document.querySelector('form');
    formulario.addEventListener('submit', validarFormulario);
});
