// ============Barra de pesquisa==============
let boxBuscar = document.querySelector('.buscar-box');
let lupa = document.querySelector('.lupa-buscar');
let btnFechar = document.querySelector('.btn-fechar');
let resultadoDiv = document.getElementById('resultado-pesquisa');

lupa.addEventListener('click', () => {
    boxBuscar.classList.add('ativar');
    resultadoDiv.style.display = 'block';  // Certifique-se de exibir a div quando clicar na lupa
});

btnFechar.addEventListener('click', () => {
    boxBuscar.classList.remove('ativar');
    resultadoDiv.style.display = 'none';  // Esconder a div de resultados ao fechar
});

// ============Fim Barra de pesquisa============

// ==========Dropdown "Mais"=============
var dropdown = document.querySelector('.dropdown');
var icone = document.querySelector('.btnCategorias');

icone.addEventListener('click', function(event){
    if (dropdown.style.display === 'flex') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'flex';
    }
    event.stopPropagation(); // Impede a propagação do evento de clique para o documento
});

// SE O CLIQUE ACONTECER FORA DA DIV OU DO ICONE O DROPDOWN SOME
document.addEventListener("click", function(event){
    if (event.target !== dropdown && event.target !== icone){
        dropdown.style.display = 'none';
    }
});
// =============Fim Dropdown "Mais"===================

// =============Menu Mobile (Lateral)==================
let menuLateral = document.querySelector('.menuLateral');
let btnMenu = document.querySelector('.menuhamburguer');
let fecharMenu = document.querySelector('.fecharMenu')

// Abrir e fechar menu lateral clicando no menu hamburguer
btnMenu.addEventListener('click', () => {
    if (menuLateral.classList.contains('mostra')) {
        menuLateral.classList.remove('mostra');
    } else {
        menuLateral.classList.add('mostra');
    }
});
// Fechar menu lateral clicando no X
fecharMenu.addEventListener('click',()=>{
    if (menuLateral.classList.contains('mostra')) {
        menuLateral.classList.remove('mostra');
    }
})

// Abrir e fechar opções do menu
let btnCategorias = document.querySelector('.categorias')
let btnAjuda = document.querySelector('.ajudaUsuario')
let categoriasOpcoes = document.querySelector('.firstOption')
let ajudaOpcoes = document.querySelector('.secondOption')

btnCategorias.addEventListener('click',()=>{
    if(categoriasOpcoes.classList.contains('mostra')){
        categoriasOpcoes.classList.remove('mostra')
    }else{
        categoriasOpcoes.classList.add('mostra')
    }
})
btnAjuda.addEventListener('click',()=>{
    if(ajudaOpcoes.classList.contains('mostra')){
        ajudaOpcoes.classList.remove('mostra')
    }else{
        ajudaOpcoes.classList.add('mostra')
    }
})
// =============Fim Menu Mobile (Lateral)==================

// ============Suporte Botao==================
// Ao clicar na opção de Suporte que está no Menu Lateral a pagina rola automaticamente
var btnSuporte = document.querySelector('.btnSuporte')

btnSuporte.addEventListener('click',function(){
    $('html, body').animate({
        scrollTop: $("#suporte").offset().top
      }, 1000); // A animação dura 1segundo
})

// ======= CONTADOR DE ITENS NO CARRINHO ========
document.addEventListener('DOMContentLoaded', (event) => {
    updateCartItemCount();
});

    // ----------- pesquisa.js ---------------
function pesquisarProdutos() {
    const query = document.getElementById('input-pesquisa').value;
    
    if (query.length >= 2) {
        fetch(`/buscar-produtos?q=${query}`)
            .then(response => response.json())
            .then(data => {
                const resultadoDiv = document.getElementById('resultado-pesquisa');
                resultadoDiv.innerHTML = '';

                if (data.length > 0) {
                    const categoriasCount = {};  // Para contar a recorrência de categorias
    
                    data.forEach(produto => {
                        const produtoHTML = `
                            <div class="resultado-item">
                                <img src="${produto.imagemProd}" alt="${produto.tituloProd}">
                                <a href="/produto/${produto.idProd}">
                                    <span>${produto.tituloProd}</span>
                                </a>
                            </div>`;
                        resultadoDiv.innerHTML += produtoHTML;

                        // Incrementar o contador da categoria
                        if (produto.Categorias_idCategorias) {
                            if (!categoriasCount[produto.Categorias_idCategorias]) {
                                categoriasCount[produto.Categorias_idCategorias] = 1;
                            } else {
                                categoriasCount[produto.Categorias_idCategorias]++;
                            }
                        }
                    });
                } else {
                    resultadoDiv.innerHTML = '<p>Nenhum produto encontrado</p>';
                }
            })
            .catch(error => console.error('Erro ao buscar produtos:', error));
    } else {
        document.getElementById('resultado-pesquisa').innerHTML = '';
    }
}

// Captura o evento de pressionar "Enter"
document.getElementById('input-pesquisa').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        pesquisarProdutos();

        const categoriasCount = {};  // Para contar a recorrência de categorias
        
        fetch(`/buscar-produtos?q=${this.value}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    data.forEach(produto => {
                        if (produto.Categorias_idCategorias) {
                            if (!categoriasCount[produto.Categorias_idCategorias]) {
                                categoriasCount[produto.Categorias_idCategorias] = 1;
                            } else {
                                categoriasCount[produto.Categorias_idCategorias]++;
                            }
                        }
                    });
                    
                    const categoriasOrdenadas = Object.entries(categoriasCount).sort((a, b) => b[1] - a[1]);
                    if (categoriasOrdenadas.length > 0) {
                        const categoriaMaisFrequente = categoriasOrdenadas[0][0];

                        // Mapear o ID da categoria para o nome
                        const categoriasMapReverso = {
                            1: 'moda',
                            2: 'bag',
                            3: 'cosmetico',
                            4: 'higiene'
                        };
                        
                        const nomeCategoria = categoriasMapReverso[categoriaMaisFrequente];
                        if (nomeCategoria) {
                            window.location.href = `/catalogo?categoria=${nomeCategoria}`;
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Categoria não encontrada',
                                text: 'Não foi possível encontrar a categoria correspondente.'
                            });
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Nenhum produto encontrado',
                            text: 'Tente outro termo de pesquisa.'
                        });
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Nenhum produto encontrado',
                        text: 'Tente outro termo de pesquisa.'
                    });
                }
            })
            .catch(error => console.error('Erro ao buscar produtos:', error));
    }
});

    
// ============Barra de pesquisa==============

