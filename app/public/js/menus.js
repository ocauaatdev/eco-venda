// ============Barra de pesquisa==============
let boxBuscar = document.querySelector('.buscar-box');
let lupa = document.querySelector('.lupa-buscar');
let btnFechar = document.querySelector('.btn-fechar');

lupa.addEventListener('click', ()=>{
    boxBuscar.classList.add('ativar')
})
btnFechar.addEventListener('click', ()=>{
    boxBuscar.classList.remove('ativar')
})
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
