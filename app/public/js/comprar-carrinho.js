document.addEventListener("DOMContentLoaded", function (e) {
  const mercadopago = new MercadoPago('APP_USR-ab564d70-69f7-4a77-88ac-6b2aef4cac76', {
    locale: 'pt-BR'
  });

  document.getElementById("checkout-btn").addEventListener("click", function () {
    $('#checkout-btn').attr("disabled", true);

    const items = document.querySelectorAll(".products .item");
    const tamanhosSelect = document.querySelectorAll(".produtoItem select.tamanhos");
    let todosTamanhosSelecionados = true; // Flag para verificar se todos os tamanhos foram selecionados
    let produtosSemTamanho = [];

    tamanhosSelect.forEach((select, index) => {
      if (!select.value || select.value === "") {
        todosTamanhosSelecionados = false;
        produtosSemTamanho.push(index); // Armazena o índice dos produtos sem tamanho
        select.classList.add("highlight"); // Adiciona destaque ao produto sem tamanho
      } else {
        select.classList.remove("highlight"); // Remove destaque caso o tamanho esteja selecionado
      }
    });

    if (!todosTamanhosSelecionados) {
      $('#checkout-btn').attr("disabled", false);
      Swal.fire({
        icon: 'error',
        title: 'Selecione o tamanho',
        text: 'Você precisa selecionar o tamanho para todos os produtos antes de prosseguir com a compra.',
      });
      return; // Interrompe o processo caso algum tamanho não esteja selecionado
    }

    // Array para armazenar os dados extraídos
    const extractedData = [];

    // Itera sobre cada item para extrair os dados, incluindo o tamanho selecionado
    items.forEach((item, index) => {
      const price = parseFloat(item.querySelector("#summary-price").innerText.trim().replace('R$', '').trim());
      const unit_price = Number(price.toFixed(2));
      const nameElement = item.querySelector(".item-name");
      const description = nameElement.childNodes[0].nodeValue.trim();
      const quantity = Number(nameElement.querySelector("#summary-quantity").innerText.trim());
      const currency_id = "BRL";
      const tamanhoSelecionado = tamanhosSelect[index].value; // Captura o tamanho selecionado

      extractedData.push({ 
        unit_price, 
        description, 
        quantity, 
        currency_id, 
        tamanho: tamanhoSelecionado // Adiciona o tamanho ao item
      });
    });

    const orderData = { items: extractedData };

    fetch("/create-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (preference) {
        createCheckoutButton(preference.id);

        $(".carrinho").fadeOut(500);
        setTimeout(() => {
          $(".container_payment").show(500).fadeIn();
        }, 500);
      })
      .catch(function () {
        alert("Erro inesperado");
        $('#checkout-btn').attr("disabled", false);
      });
  });

  function createCheckoutButton(preferenceId) {
    const bricksBuilder = mercadopago.bricks();

    const renderComponent = async (bricksBuilder) => {
      if (window.checkoutButton) window.checkoutButton.unmount();
      await bricksBuilder.create(
        'wallet',
        'button-checkout',
        {
          initialization: {
            preferenceId: preferenceId
          },
          callbacks: {
            onError: (error) => console.error(error),
            onReady: () => {}
          }
        }
      );
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
