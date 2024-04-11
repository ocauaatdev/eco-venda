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
    window.location.href = '../pages/pagamento.html'
  }