//FUNCTION PARA EXIBIR A CAIXA DE CONFIRMAÇÃO DE COMPRA DO PREMIUM
function assinatura() {
    var opcoesDiv = document.getElementById("opcoes");
    if (opcoesDiv.style.display === "" || opcoesDiv.style.display === "none") {
      opcoesDiv.style.display = "block";
      // MOVER A TELA SUAVEMENTE
      $('html, body').animate({
        scrollTop: $("#opcoes").offset().top
      }, 1000); // A animação dura 1segundo
    } else {
      opcoesDiv.style.display = "none";
    }
  }
  
  //FUNCTION PARA FECHAR A CAIXA DE CONFIRMAÇÃO DE COMPRA DO PREMIUM
  function fechar() {
    var opcoesDiv = document.getElementById("opcoes");
      if (opcoesDiv.style.display === "none") {
        opcoesDiv.style.display = "block";
      } else {
        opcoesDiv.style.display = "none";
      }
  }
  
  document.querySelector('.assinarBtn').addEventListener('click',redirecionarCompra);
  
  function redirecionarCompra() {
    const selectedPlan = document.querySelector('select').value;
    let item = {};
    let planoId = '';

    if (selectedPlan === "opção1") {
        item = { title: "Plano Básico", unit_price: 10.00, quantity: 1 };
        planoId = 1; // ID do plano Básico
    } else if (selectedPlan === "opção2") {
        item = { title: "Plano Médio", unit_price: 18.00, quantity: 1 };
        planoId = 2; // ID do plano Médio
    } else if (selectedPlan === "opção3") {
        item = { title: "Plano Pro", unit_price: 26.00, quantity: 1 };
        planoId = 3; // ID do plano Pro
    }

    fetch('/create-preference-az', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [item], planoId: planoId })
    })
    .then(response => response.json())
    .then(data => {
        window.location.href = data.init_point;
    })
    .catch(error => console.error('Error:', error));
  }