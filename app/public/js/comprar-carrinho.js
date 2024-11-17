document.addEventListener("DOMContentLoaded", function (e) {
  const mercadopago = new MercadoPago('APP_USR-ab564d70-69f7-4a77-88ac-6b2aef4cac76', { locale: 'pt-BR' });

  document.getElementById("checkout-btn").addEventListener("click", function () {
    $('#checkout-btn').attr("disabled", true);

    const items = document.querySelectorAll(".products .item");
    const tamanhosSelect = document.querySelectorAll(".produtoItem select.tamanhos");
    let todosTamanhosSelecionados = true;
    let produtosSemTamanho = [];

    tamanhosSelect.forEach((select, index) => {
      if (!select.value || select.value === "") {
        todosTamanhosSelecionados = false;
        produtosSemTamanho.push(index);
        select.classList.add("highlight");
      } else {
        select.classList.remove("highlight");
      }
    });

    if (!todosTamanhosSelecionados) {
      $('#checkout-btn').attr("disabled", false);
      Swal.fire({
        icon: 'error',
        title: 'Selecione o tamanho',
        text: 'Você precisa selecionar o tamanho para todos os produtos antes de prosseguir com a compra.',
      });
      return;
    }

    const extractedData = [];
    const totalComDesconto = parseFloat(document.getElementById("totalComDesconto").value || "0"); // valor default
    const totalCarrinho = Array.from(items).reduce((acc, item) => {
      const price = parseFloat(item.querySelector("#summary-price").innerText.trim().replace('R$', '').trim());
      const quantity = Number(item.querySelector("#summary-quantity").innerText.trim());
      return acc + price * quantity;
    }, 0);

    items.forEach((item, index) => {
      const price = parseFloat(item.querySelector("#summary-price").innerText.trim().replace('R$', '').trim());
      const quantity = Number(item.querySelector("#summary-quantity").innerText.trim());
      const unit_price = Number(price.toFixed(2));

      // Corrige o fator de desconto para evitar NaN quando totalComDesconto é 0 ou undefined
      const discountFactor = totalComDesconto && totalCarrinho ? totalComDesconto / totalCarrinho : 1;
      const unit_price_com_desconto = parseFloat((unit_price * discountFactor).toFixed(2));

      const nameElement = item.querySelector(".item-name");
      const description = nameElement.childNodes[0].nodeValue.trim();
      const currency_id = "BRL";
      const tamanhoSelecionado = tamanhosSelect[index].value;

      extractedData.push({
        unit_price: unit_price_com_desconto, // valor ajustado com desconto ou original
        description,
        quantity,
        currency_id,
        tamanho: tamanhoSelecionado
      });
    });

    const orderData = { items: extractedData };

    fetch("/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(preference => {
      createCheckoutButton(preference.id);
      $(".carrinho").fadeOut(500);
      setTimeout(() => {
        $(".container_payment").show(500).fadeIn();
      }, 500);
    })
    .catch(() => {
      alert("Erro inesperado");
      $('#checkout-btn').attr("disabled", false);
    });
  });

  function createCheckoutButton(preferenceId) {
    const bricksBuilder = mercadopago.bricks();
    const renderComponent = async (bricksBuilder) => {
      if (window.checkoutButton) window.checkoutButton.unmount();
      await bricksBuilder.create('wallet', 'button-checkout', {
        initialization: { preferenceId: preferenceId },
        callbacks: { onError: (error) => console.error(error), onSubmit: () => {}, onReady: () => {} }
      });
    };
    window.checkoutButton = renderComponent(bricksBuilder);
  }

  document.getElementById("go-back").addEventListener("click", function () {
    $(".container_payment").fadeOut(500);
    setTimeout(() => {
      $(".carrinho").show(500).fadeIn();
    }, 500);
    $('#checkout-btn').attr("disabled", false);
  });
});
