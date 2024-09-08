// document.addEventListener("DOMContentLoaded", function() {
//     // Cria uma nova "sessão" no carrinho ao carregar a página
//     if (!sessionStorage.getItem('cart')) {
//         sessionStorage.setItem('cart', JSON.stringify([]));
//     }

//     // Função para exibir a notificação
//     function showNotification(message) {
//         new Notify({
//             status: 'success',
//             title: 'Produto Adicionado!',
//             text: message,
//             effect: 'slide',
//             speed: 500,
//             autoplay: true,
//             showIcon: true,
//             showCloseButton: true,
//             showDuration: 3000,
//             theme: 'dark',
//             position: 'right top'
//         });
//     }

//     // Função para adicionar produto ao carrinho
//     const addButtons = document.querySelectorAll('.addCart');
//     addButtons.forEach(button => {
//         button.addEventListener('click', function(event) {
//             const product = event.target.closest('.product');
//             const productName = product.querySelector('#nomeProduct').textContent;
//             const productPrice = product.querySelector('#precoReal').textContent;
//             const productImage = product.querySelector('.images').src;

//             // Objeto do produto
//             const productData = {
//                 nome: productName,
//                 preco: productPrice,
//                 imagem: productImage
//             };

//             // Adiciona o produto ao sessionStorage
//             let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
//             cart.push(productData);
//             sessionStorage.setItem('cart', JSON.stringify(cart));

//             // Atualiza contador de itens no carrinho
//             updateCartCount();

//             // Exibe a notificação
//             showNotification(`"${productName}" foi adicionado ao seu carrinho.`);
//         });
//     });

//     // Função para atualizar o contador de itens no carrinho em todas as páginas, incluindo o header
//     function updateCartCount() {
//         const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
//         const itemCount = cart.length;

//         // Atualiza o contador no header
//         const cartItemCountElement = document.getElementById('cart-item-count');
//         if (cartItemCountElement) {
//             cartItemCountElement.textContent = itemCount;
//         }
        
//         // Atualiza o contador em outras partes da página
//         const otherCartCountElement = document.getElementById('contador');
//         if (otherCartCountElement) {
//             otherCartCountElement.textContent = itemCount;
//         }
//     }

//     // Atualiza o contador ao carregar a página
//     updateCartCount();
// });


// =============ADICIONAR CARRINHO COM BACKEND ================
// document.querySelectorAll('.addCart').forEach(button => {
//     button.addEventListener('click', (e) => {
//         const id = button.getAttribute('data-id');
//         const nome = button.getAttribute('data-nome');
//         const preco = button.getAttribute('data-preco');
//         const imagem = button.getAttribute('data-imagem');
//         const tamanho = button.getAttribute('data-tamanho');

//         // Envia os dados do produto para o backend
//         fetch('/add-to-cart', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ id, nome, preco, imagem, tamanho })
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.success) {
//                 showNotification("Produto adicionado ao carrinho!");
//             }
//         })
//         .catch(err => console.error("Erro ao adicionar ao carrinho:", err));
//     });
// });

// // Função de notificação
// function showNotification(message) {
//     new Notify({
//         status: 'success',
//         title: 'Produto Adicionado!',
//         text: message,
//         effect: 'slide',
//         speed: 500,
//         autoplay: true,
//         showIcon: true,
//         showCloseButton: true,
//         showDuration: 3000,
//         theme: 'dark',
//         position: 'right top'
//     });
// }

document.querySelectorAll('.addCart').forEach(button => {
    button.addEventListener('click', (e) => {
        const id = button.getAttribute('data-id');
        const nome = button.getAttribute('data-nome');
        const preco = button.getAttribute('data-preco');
        const imagem = button.getAttribute('data-imagem');
        const tamanho = button.getAttribute('data-tamanho');

        // Envia os dados do produto para o backend
        fetch('/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, nome, preco, imagem, tamanho })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification("Produto adicionado ao carrinho!");

                // Atualiza a quantidade de itens no carrinho
                updateCartItemCount();
            }
        })
        .catch(err => console.error("Erro ao adicionar ao carrinho:", err));
    });
});

// Função para atualizar a quantidade de itens no carrinho
function updateCartItemCount() {
    fetch('/cart-item-count')
        .then(response => response.json())
        .then(data => {
            document.getElementById('cart-item-count').textContent = data.count;
            document.getElementById('contador').textContent = `${data.count} Itens`;
        })
        .catch(err => console.error("Erro ao atualizar o contador do carrinho:", err));
}

// Função de notificação
function showNotification(message) {
    new Notify({
        status: 'success',
        title: 'Produto Adicionado!',
        text: message,
        effect: 'slide',
        speed: 500,
        autoplay: true,
        showIcon: true,
        showCloseButton: true,
        showDuration: 3000,
        theme: 'dark',
        position: 'right top'
    });
}

