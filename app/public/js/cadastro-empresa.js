document.addEventListener('DOMContentLoaded', function() {

    console.log("Arquivo JavaScript carregado!");

    // ======INPUTS=======
    var empresa = document.querySelector('#empresa');
    var email = document.querySelector('#e_mail');
    var telefone = document.querySelector('#telefone');
    var cnpj = document.querySelector('#cnpj');
    var cep = document.querySelector('#cep');
    var senha = document.querySelector('#senha');
    var confirmSenha = document.querySelector('#confirmSenha');

    // =====Texts======
    var empresaTxt = document.querySelector('#empresaTxt');
    var emailTxt = document.querySelector('#emailTxt');
    var telTxt = document.querySelector('#telTxt');
    var cnpjTxt = document.querySelector('#cnpjTxt');
    var cepTxt = document.querySelector('#cepTxt');
    var senhaTxt = document.querySelector('#senhaTxt');
    var confirmTxt = document.querySelector('#confirmTxt')


    // ====Variaveis de Validação=====
    var validEmpresa = false
    var validCnpj = false
    var validEmail = false
    var validTelefone = false
    var validCEP = false
    var validSenha = false
    var validConfirmSenha = false

    // ============Mascaras================
    $('#cep').mask('00000-000');
    $('#telefone').mask('(00)00000-0000');
    $('#cnpj').mask('00.000.000/0000-00', {reverse: true});
    // ===========Fim Mascaras================

    // ========VALIDAÇÕES=========

// Empresa
empresa.addEventListener('keyup', ()=>{
    if (empresa.value.length <= 2) {
        empresaTxt.setAttribute('style', 'background-color:red')
        empresaTxt.innerHTML = 'Nome da Empresa: <span>*Insira no mínimo 3 caracteres</span>'
        validEmpresa = false;
    } else {
        empresaTxt.setAttribute('style', 'color:#16CF8C')
        empresaTxt.innerHTML = 'Nome da Empresa:'
        validEmpresa = true;
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
    if (telefone.value.length <= 11) {
        telTxt.setAttribute('style', 'background-color:red')
        telTxt.innerHTML = 'Telefone <span>*Insira no mínimo 11 (com o DDD) caracteres</span>'
        validTelefone = false;
    } else {
        telTxt.setAttribute('style', 'color:#16CF8C')
        telTxt.innerHTML = 'Telefone:'
        validTelefone = true;
    }
    });

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

// ----------CNPJ---------
cnpj.addEventListener('keyup', ()=>{
    if (cnpj.value.length <= 17) {
        cnpjTxt.setAttribute('style', 'background-color:red')
        cnpjTxt.innerHTML = 'CNPJ <span>*Insira no mínimo 14 caracteres</span>'
        validCnpj = false;
    } else {
        cnpjTxt.setAttribute('style', 'color:#16CF8C')
        cnpjTxt.innerHTML = 'CNPJ:'
        validCnpj = true;
    }
// Senha
const regexUppercase = /[A-Z]/; // Verifica se há pelo menos uma letra maiúscula
const regexNumber = /\d/; // Verifica se há pelo menos um número
const regexSpecialChar = /[#_]/; // Adicione outros caracteres especiais conforme necessário

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
});