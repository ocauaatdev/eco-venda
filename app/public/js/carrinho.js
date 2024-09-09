// Alterar Quantidade no Carrinho
document.addEventListener('DOMContentLoaded', () => {
    const aumentarBotoes = document.querySelectorAll('.aumentar');
    const diminuirBotoes = document.querySelectorAll('.diminuir');
    const delProdutoIcons = document.querySelectorAll('.delProduto');
  
    aumentarBotoes.forEach(botao => {
      botao.addEventListener('click', () => {
        const productId = botao.getAttribute('data-id');
        atualizarQuantidade(productId, 'aumentar');
      });
    });
  
    diminuirBotoes.forEach(botao => {
      botao.addEventListener('click', () => {
        const productId = botao.getAttribute('data-id');
        atualizarQuantidade(productId, 'diminuir');
      });
    });
  
    delProdutoIcons.forEach(icon => {
      icon.addEventListener('click', () => {
        const productId = icon.closest('.produtoItem').querySelector('.aumentar').getAttribute('data-id');
        excluirProduto(productId);
      });
    });
  
    function atualizarQuantidade(productId, acao) {
      fetch('/atualizar-quantidade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, acao: acao })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          location.reload(); // Recarrega a página para refletir a alteração
        }
      })
      .catch(error => console.error('Erro:', error));
    }
  
    function excluirProduto(productId) {
      fetch('/excluir-produto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          location.reload(); // Recarrega a página para refletir a alteração
        }
      })
      .catch(error => console.error('Erro:', error));
    }
  });
  
  // =============================

  // ESVAZIA CARRINHO ASSIM QUE O USUARIO FECHA A ABA DO SITE
  // SÓ ESTÁ FUNCIONANDO NA PAGINA carrinho.ejs

  // Detecta o carregamento da página e cria uma chave no sessionStorage
window.addEventListener('load', function () {
  sessionStorage.setItem('isTabOpen', 'true'); // Define que a aba está aberta
});

// Detecta o fechamento da aba usando 'pagehide'
window.addEventListener('pagehide', function (e) {
  // O evento 'pagehide' é disparado quando a aba é fechada ou o usuário navega para outra página
  if (e.persisted === false) { // Verifica se a página está sendo realmente descarregada (não em cache)
    // Envia requisição para esvaziar o carrinho na sessão
    fetch('/esvaziar-carrinho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    sessionStorage.removeItem('isTabOpen'); // Remove o indicador de aba aberta
  }
});

// Detecta a transição de visibilidade (quando a aba se torna oculta ou visível)
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'hidden') {
    // Quando a aba se torna invisível, podemos marcar que ela está prestes a ser fechada
    sessionStorage.setItem('isTabClosing', 'true');
  } else {
    // Se a aba volta a ser visível, significa que ela não foi fechada
    sessionStorage.removeItem('isTabClosing');
  }
});

// Detecta o evento 'unload', que ocorre quando a página está sendo descarregada
window.addEventListener('unload', function () {
  // Verifica se a aba realmente foi fechada e não apenas recarregada
  if (sessionStorage.getItem('isTabClosing')) {
    // Envia requisição para esvaziar o carrinho na sessão do servidor
    fetch('/esvaziar-carrinho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    sessionStorage.removeItem('isTabOpen'); // Remove o indicador de aba aberta
  }
});



// document.addEventListener("DOMContentLoaded", function() {
//     let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
//     const carrinhoSection = document.querySelector('.produtoCarrinho');
//     const precoTotalElement = document.querySelector('.precoTotal');

//     // Limpa a seção antes de preencher
//     carrinhoSection.innerHTML = '';

//     let totalPreco = 0;

//     if (cartItems.length === 0) {
//         carrinhoSection.innerHTML = '<h2 class="vazio">Seu carrinho está vazio.</h2>';
//     } else {
//         cartItems.forEach((item, index) => {
//             const quantidade = item.quantidade || 1;
//             const precoNumerico = parseFloat(item.preco.replace('R$', '').replace(',', '.'));

//             // Calcula o preço total do item (preço * quantidade)
//             totalPreco += precoNumerico * quantidade;

//             const productHTML = `
//                 <section class="itemCarrinho">
//                     <section class="imagemContainer">
//                         <img src="${item.imagem}" alt="${item.nome}" class="imgCarrinho">
//                     </section>

//                     <section class="infoProdutoCarrinho">
//                         <h3>${item.nome}</h3>
//                         <p>R$${precoNumerico.toFixed(2)}</p>

//                         <section class="quantidadeProduto">
//                             <button class="decreaseQty" data-index="${index}">-</button>
//                             <span class="itemQuantity">${quantidade}</span>
//                             <button class="increaseQty" data-index="${index}">+</button>
//                         </section>

//                         <i class="fa-solid fa-trash delProduto" data-index="${index}"></i>
//                     </section>
//                 </section>
//             `;
//             carrinhoSection.innerHTML += productHTML;
//         });

//         // Atualiza o total de itens
//         document.getElementById('contador').textContent = cartItems.length;

//         // Exibe o preço total formatado
//         precoTotalElement.textContent = `R$${totalPreco.toFixed(2).replace('.', ',')}`;

//         // Adiciona os eventos para aumentar e diminuir quantidade
//         document.querySelectorAll('.increaseQty').forEach(button => {
//             button.addEventListener('click', function() {
//                 const index = this.getAttribute('data-index');
//                 cartItems[index].quantidade = (cartItems[index].quantidade || 1) + 1;
//                 sessionStorage.setItem('cart', JSON.stringify(cartItems));
//                 location.reload(); // Recarrega a página para refletir a mudança
//             });
//         });

//         document.querySelectorAll('.decreaseQty').forEach(button => {
//             button.addEventListener('click', function() {
//                 const index = this.getAttribute('data-index');
//                 if (cartItems[index].quantidade > 1) {
//                     cartItems[index].quantidade -= 1;
//                     sessionStorage.setItem('cart', JSON.stringify(cartItems));
//                     location.reload(); // Recarrega a página para refletir a mudança
//                 }
//             });
//         });

//         // Adiciona o evento para deletar item
//         document.querySelectorAll('.delProduto').forEach(button => {
//             button.addEventListener('click', function() {
//                 const index = this.getAttribute('data-index');
//                 cartItems.splice(index, 1); // Remove o item do array
//                 sessionStorage.setItem('cart', JSON.stringify(cartItems));
//                 location.reload(); // Recarrega a página para refletir a mudança
//             });
//         });
//     }
// });
