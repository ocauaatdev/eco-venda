document.addEventListener("DOMContentLoaded", function() {
    let cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
    const carrinhoSection = document.querySelector('.produtoCarrinho');
    const precoTotalElement = document.querySelector('.precoTotal');

    // Limpa a seção antes de preencher
    carrinhoSection.innerHTML = '';

    let totalPreco = 0;

    if (cartItems.length === 0) {
        carrinhoSection.innerHTML = '<h2 class="vazio">Seu carrinho está vazio.</h2>';
    } else {
        cartItems.forEach((item, index) => {
            const quantidade = item.quantidade || 1;
            const precoNumerico = parseFloat(item.preco.replace('R$', '').replace(',', '.'));

            // Calcula o preço total do item (preço * quantidade)
            totalPreco += precoNumerico * quantidade;

            const productHTML = `
                <section class="itemCarrinho">
                    <section class="imagemContainer">
                        <img src="${item.imagem}" alt="${item.nome}" class="imgCarrinho">
                    </section>

                    <section class="infoProdutoCarrinho">
                        <h3>${item.nome}</h3>
                        <p>R$${precoNumerico.toFixed(2)}</p>

                        <section class="quantidadeProduto">
                            <button class="decreaseQty" data-index="${index}">-</button>
                            <span class="itemQuantity">${quantidade}</span>
                            <button class="increaseQty" data-index="${index}">+</button>
                        </section>

                        <i class="fa-solid fa-trash delProduto" data-index="${index}"></i>
                    </section>
                </section>
            `;
            carrinhoSection.innerHTML += productHTML;
        });

        // Atualiza o total de itens
        document.getElementById('contador').textContent = cartItems.length;

        // Exibe o preço total formatado
        precoTotalElement.textContent = `R$${totalPreco.toFixed(2).replace('.', ',')}`;

        // Adiciona os eventos para aumentar e diminuir quantidade
        document.querySelectorAll('.increaseQty').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                cartItems[index].quantidade = (cartItems[index].quantidade || 1) + 1;
                sessionStorage.setItem('cart', JSON.stringify(cartItems));
                location.reload(); // Recarrega a página para refletir a mudança
            });
        });

        document.querySelectorAll('.decreaseQty').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                if (cartItems[index].quantidade > 1) {
                    cartItems[index].quantidade -= 1;
                    sessionStorage.setItem('cart', JSON.stringify(cartItems));
                    location.reload(); // Recarrega a página para refletir a mudança
                }
            });
        });

        // Adiciona o evento para deletar item
        document.querySelectorAll('.delProduto').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                cartItems.splice(index, 1); // Remove o item do array
                sessionStorage.setItem('cart', JSON.stringify(cartItems));
                location.reload(); // Recarrega a página para refletir a mudança
            });
        });
    }
});
