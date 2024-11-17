document.addEventListener('DOMContentLoaded', function() {

    console.log("Arquivo JavaScript carregado!");

// =======INPUTS======
var usuario = document.querySelector('#usuario');
var email = document.querySelector('#e_mail');
var telefone = document.querySelector('#telefone');
var cpf = document.querySelector('#cpf');
var nascimento = document.querySelector('#nascimento');
var cep = document.querySelector('#cep');
var senha = document.querySelector('#senha');
var confirmSenha = document.querySelector('#confirmSenha');
var infosCep = document.querySelector('.infosCep');

// =====Texts=====
var usuarioTxt = document.querySelector('#usuarioTxt');
var emailTxt = document.querySelector('#emailTxt');
var telTxt = document.querySelector('#telTxt');
var cpfTxt = document.querySelector('#cpfTxt');
var nascTxt = document.querySelector('#nascTxt');
var cepTxt = document.querySelector('#cepTxt');
var senhaTxt = document.querySelector('#senhaTxt');
var confirmTxt = document.querySelector('#confirmTxt');

// =====Variaveis de Validações=====
var validUsuario = false;
var validEmail = false;
var validTelefone = false;
var validCPF = false;
var validNascimento = false;
var validCEP = false;
var validSenha = false;
var validConfirm = false;

// ============Mascaras================
// $('#nascimento').mask('00/00/0000');
$('#cep').mask('00000-000');
$('#telefone').mask('(00)00000-0000');
$('#cpf').mask('000.000.000-00', {reverse: true});
// ===========Fim Mascaras================

// ========VALIDAÇÕES=========

// Usuario
usuario.addEventListener('keyup', () => {
    if (usuario.value.length <= 2) {
        usuarioTxt.setAttribute('style', 'background-color:red');
        usuarioTxt.innerHTML = 'Nome de Usuário: <span>*Insira no mínimo 3 caracteres</span>';
        validUsuario = false;
    } else {
        usuarioTxt.setAttribute('style', 'color:#16CF8C');
        usuarioTxt.innerHTML = 'Nome de Usuário:';
        validUsuario = true;
    }
});

// Email
email.addEventListener('keyup',() =>{
    var emailValue = email.value;
    var emailPattern = /.+@.+\..+/;

    if(emailValue.length <=3){
        emailTxt.setAttribute('style', 'background-color:red');
        emailTxt.innerHTML = 'E-mail: <span>*Insira no mínimo 3 caracteres</span>';
        validEmail = false;
    }else if (emailPattern.test(emailValue)){
        emailTxt.setAttribute('style', 'color:#16CF8C');
        emailTxt.innerHTML = 'E-mail:';
        validEmail = true;
    }else{
        emailTxt.setAttribute('style', 'background-color:red');
        emailTxt.innerHTML = 'E-mail <span>*E-mail inválido</span>';
        validEmail = false;
    }
});

// Telefone
telefone.addEventListener('keyup', ()=>{
    if (telefone.value.length <= 13) {
        telTxt.setAttribute('style', 'background-color:red')
        telTxt.innerHTML = 'Telefone <span>*Insira no mínimo 11 (com o DDD) caracteres</span>'
        validTelefone = false;
    } else {
        telTxt.setAttribute('style', 'color:#16CF8C')
        telTxt.innerHTML = 'Telefone:'
        validTelefone = true;
    }
    });

// CPF
cpf.addEventListener('keyup', ()=>{
    if (cpf.value.length <= 13) {
        cpfTxt.setAttribute('style', 'background-color:red')
        cpfTxt.innerHTML = 'CPF <span>*Insira no mínimo 11 caracteres</span>'
        validCPF = false;
    } else {
        cpfTxt.setAttribute('style', 'color:#16CF8C')
        cpfTxt.innerHTML = 'CPF:'
        validCPF = true;
    }
    });

// Nascimento
    // nascimento.addEventListener('keyup', ()=>{
    //     if (nascimento.value.length <= 9) {
    //         nascTxt.setAttribute('style', 'background-color:red')
    //         nascTxt.innerHTML = 'Data de Nascimento <span>*Insira no mínimo 8 caracteres</span>'
    //         validNascimento = false;
    //     } else {
    //         nascTxt.setAttribute('style', 'color:#16CF8C')
    //         nascTxt.innerHTML = 'Data de Nascimento:'
    //         validNascimento = true;
    //     }
    //     });

    // Função para buscar informações do CEP
    function buscarCEP(cep) {
        $.ajax({
            url: `https://viacep.com.br/ws/${cep}/json/`,
            method: "GET",
            dataType: "json",
            success: function(data) {
                if (!data.erro) {
                    infosCep.innerHTML = `
                        <p>Informações do CEP digitado:</p>
                        <p>Endereço: ${data.logradouro}</p>
                        <p>Bairro: ${data.bairro}</p>
                        <p>Cidade: ${data.localidade}</p>
                        <p>Estado: ${data.uf}</p>
                    `;
                    infosCep.style.display = 'block'; // Exibe a div
                } else {
                    infosCep.innerHTML = `<p style="color:red;">CEP não encontrado.</p>`;
                    infosCep.style.display = 'block'; // Exibe a div
                }
            },
            error: function() {
                infosCep.innerHTML = `<p style="color:red;">Erro ao buscar o CEP.</p>`;
                infosCep.style.display = 'block'; // Exibe a div
            }
        });
    }


// CEP
cep.addEventListener('keyup', ()=>{
    if (cep.value.length <= 8) {
        cepTxt.setAttribute('style', 'background-color:red')
        cepTxt.innerHTML = 'CEP <span>*Insira no mínimo 8 caracteres</span>'
        validCEP = false;
    } else {
        cepTxt.setAttribute('style', 'color:#16CF8C')
        cepTxt.innerHTML = 'CEP'
        validCEP = true;
    }
    });

    // Evento ao terminar de digitar o CEP (blur)
    cep.addEventListener('keyup', function() {
        
        var cepValue = cep.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cepValue.length === 8) {
            buscarCEP(cepValue);
        } else {
            infosCep.innerHTML = ''; // Limpa as informações se o CEP for apagado
            infosCep.style.display = 'none'; // Oculta a div
        }
    });

// Senha
    const regexUppercase = /[A-Z]/; // Verifica se há pelo menos uma letra maiúscula
    const regexNumber = /\d/; // Verifica se há pelo menos um número
    const regexSpecialChar = /[!_@#$%&]/; // Adicione outros caracteres especiais conforme necessário

    senha.addEventListener('keyup', () => {
        const senhaValue = senha.value; // Obter o valor da senha
        let validSenha = true;
    
        // Verificar se a senha tem pelo menos 8 caracteres
        if (senhaValue.length < 8) {
            senhaTxt.setAttribute('style', 'background-color:red');
            senhaTxt.innerHTML = 'Senha <span>*Insira no mínimo 8 caracteres</span>';
            validSenha = false;
        } else if (!regexUppercase.test(senhaValue)) { // Verificar se há pelo menos um caractere maiúsculo
            senhaTxt.setAttribute('style', 'background-color:red');
            senhaTxt.innerHTML = 'Senha <span>*Insira pelo menos uma letra maiúscula</span>';
            validSenha = false;
        } else if (!regexNumber.test(senhaValue)) { // Verificar se há pelo menos um número
            senhaTxt.setAttribute('style', 'background-color:red');
            senhaTxt.innerHTML = 'Senha <span>*Insira pelo menos um número</span>';
            validSenha = false;
        } else if (!regexSpecialChar.test(senhaValue)) { // Verificar se há pelo menos um caractere especial
            senhaTxt.setAttribute('style', 'background-color:red');
            senhaTxt.innerHTML = 'Senha <span>*Insira pelo menos um caractere especial</span>';
            validSenha = false;
        } else {
            senhaTxt.setAttribute('style', 'color:#16CF8C'); // Definir estilo de texto para verde se a senha for válida
            senhaTxt.innerHTML = 'Senha de usuário';
            validSenha = true;
        }
    });

// Confirm senha
confirmSenha.addEventListener('keyup', ()=>{
    if (senha.value != confirmSenha.value) {
        confirmTxt.setAttribute('style', 'background-color:red');
        confirmTxt.innerHTML = 'Confirmar senha <span>*As senhas não coincidem</span>';
        validConfirm = false;
    } else {
        confirmTxt.setAttribute('style', 'color:#16CF8C');
        confirmTxt.innerHTML = 'Confirme sua senha:';
        validConfirm = true;
    }
    });


});