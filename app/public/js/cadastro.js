// INPUTS E BOTÕES
var inputUsuario = document.querySelector('#usuario')
var inputEmail = document.querySelector('#e-mail')
var inputTelefone = document.querySelector('#telefone')
var inputCPF = document.querySelector('#cpf')
var inputNascimento = document.querySelector('#nascimento')
var inputCEP = document.querySelector('#cep')
var btnConfirmSenha = document.querySelector('#btn-confirm-senha')
var inputConfirm = document.querySelector('#confirm-senha')
var btnMostrarSenha = document.querySelector('#btn-senha')
var inputSenha = document.querySelector('#senha')

// H3 COM TEXTOS DAS AREAS PARA SEREM PREENCHIDAS
var usuario = document.querySelector('#usuarioTxt')
var email = document.querySelector('#emailTxt')
var telefone = document.querySelector('#telTxt')
var cpf = document.querySelector('#cpfTxt')
var nascimento = document.querySelector('#nascTxt')
var cep = document.querySelector('#cepTxt')
var senha = document.querySelector('#senhaTxt')
var confirmSenha = document.querySelector('#confirmTxt')

// ==========EMPRESA=============
// INPUTS
var inputNomeEmpresa = document.querySelector('#empresa')
var inputCnpj = document.querySelector('#cnpj')
// H3 EMPRESAS
var empresa = document.querySelector('#empresaTxt')
var cnpj = document.querySelector('#cnpjTxt')
// VALIDAÇÕES
var validEmpresa = false
var validCnpj = false
// ==========EMPRESA=============

// VARIAVEIS COM VALIDAÇÕES
var validUsuario = false
var validEmail = false
var validTelefone = false
var validCPF = false
var validNascimento = false
var validCEP = false
var validSenha = false
var validConfirm = false


// ============Mascaras================
$('#nascimento').mask('00/00/0000');
$('#cep').mask('00000-000');
$('#telefone').mask('(00)00000-0000');
$('#cpf').mask('000.000.000-00', {reverse: true});
$('#cnpj').mask('00.000.000/0000-00', {reverse: true});
// ===========Fim Mascaras================

// ============ Mostrar Senha =============

function mostrarSenha() {
    if (inputSenha.type === 'password') {
        inputSenha.setAttribute('type','text');
        btnMostrarSenha.classList.replace('fa-eye','fa-eye-slash')
    }else{
        inputSenha.setAttribute('type','password');
        btnMostrarSenha.classList.replace('fa-eye-slash','fa-eye')
    }
}

function mostrarConfirmSenha() {
    if (inputConfirm.type === 'password') {
        inputConfirm.setAttribute('type','text');
        btnConfirmSenha.classList.replace('fa-eye','fa-eye-slash')
    }else{
        inputConfirm.setAttribute('type','password');
        btnConfirmSenha.classList.replace('fa-eye-slash','fa-eye')
    }
}
// ============ Fim Mostrar Senha =============

// ============ Validações ===================

// ------------Nome de Usuario------------
inputUsuario.addEventListener('keyup', ()=>{
if (inputUsuario.value.length <= 2) {
    usuario.setAttribute('style', 'background-color:red')
    usuario.innerHTML = 'Nome de Usuário: <span>*Insira no mínimo 3 caracteres</span>'
    validUsuario = false;
} else {
    usuario.setAttribute('style', 'color:#16CF8C')
    usuario.innerHTML = 'Nome de Usuário:'
    validUsuario = true;
}
}) // ======> O usuario deve preencher com um nome de no minimo 2 caracteres

// ---------Email-------------
inputEmail.addEventListener('keyup', () => {
    var emailValue = inputEmail.value;
    var emailPattern = /.+@.+\..+/; 

    if (emailValue.length <= 3) {
        email.setAttribute('style', 'background-color:red');
        email.innerHTML = 'E-mail <span>*Insira no mínimo 3 caracteres</span>';
        validEmail = false;
    } else if (emailPattern.test(emailValue)) {
        email.setAttribute('style', 'color:#16CF8C');
        email.innerHTML = 'E-mail:';
        validEmail = true;
    } else {
        email.setAttribute('style', 'background-color:red');
        email.innerHTML = 'E-mail <span>*E-mail inválido</span>';
        validEmail = false;
    }
});

// ---------Telefone-------------
inputTelefone.addEventListener('keyup', ()=>{
    if (inputTelefone.value.length <= 11) {
        telefone.setAttribute('style', 'background-color:red')
        telefone.innerHTML = 'Telefone <span>*Insira no mínimo 11 (com o DDD) caracteres</span>'
        validTelefone = false;
    } else {
        telefone.setAttribute('style', 'color:#16CF8C')
        telefone.innerHTML = 'Telefone:'
        validTelefone = true;
    }
    })

// ---------CPF-------------
inputCPF.addEventListener('keyup', ()=>{
    if (inputCPF.value.length <= 11) {
        cpf.setAttribute('style', 'background-color:red')
        cpf.innerHTML = 'CPF <span>*Insira no mínimo 11 caracteres</span>'
        validCPF = false;
    } else {
        cpf.setAttribute('style', 'color:#16CF8C')
        cpf.innerHTML = 'CPF:'
        validCPF = true;
    }
    })

// ---------Nascimento-------------
inputNascimento.addEventListener('keyup', ()=>{
    if (inputNascimento.value.length <= 8) {
        nascimento.setAttribute('style', 'background-color:red')
        nascimento.innerHTML = 'Data de Nascimento <span>*Insira no mínimo 8 caracteres</span>'
        validNascimento = false;
    } else {
        nascimento.setAttribute('style', 'color:#16CF8C')
        nascimento.innerHTML = 'Data de Nascimento:'
        validNascimento = true;
    }
    })

// ---------CEP-------------
inputCEP.addEventListener('keyup', ()=>{
if (inputCEP.value.length <= 8) {
    cep.setAttribute('style', 'background-color:red')
    cep.innerHTML = 'CEP <span>*Insira no mínimo 8 caracteres</span>'
    validCEP = false;
} else {
    cep.setAttribute('style', 'color:#16CF8C')
    cep.innerHTML = 'CEP'
    validCEP = true;
}
})

// ---------Senha-------------
const regexUppercase = /[A-Z]/; // Verifica se há pelo menos uma letra maiúscula
const regexNumber = /\d/; // Verifica se há pelo menos um número
const regexSpecialChar = /[#_]/; // Adicione outros caracteres especiais conforme necessário

inputSenha.addEventListener('keyup', () => {
    const senhaValue = inputSenha.value; // Obter o valor da senha
    let validSenha = true;

    // Verificar se a senha tem pelo menos 8 caracteres
    if (senhaValue.length < 8) {
        senha.setAttribute('style', 'background-color:red');
        senha.innerHTML = 'Senha <span>*Insira no mínimo 8 caracteres</span>';
        validSenha = false;
    } else if (!regexUppercase.test(senhaValue)) { // Verificar se há pelo menos um caractere maiúsculo
        senha.setAttribute('style', 'background-color:red');
        senha.innerHTML = 'Senha <span>*Insira pelo menos uma letra maiúscula</span>';
        validSenha = false;
    } else if (!regexNumber.test(senhaValue)) { // Verificar se há pelo menos um número
        senha.setAttribute('style', 'background-color:red');
        senha.innerHTML = 'Senha <span>*Insira pelo menos um número</span>';
        validSenha = false;
    } else if (!regexSpecialChar.test(senhaValue)) { // Verificar se há pelo menos um caractere especial
        senha.setAttribute('style', 'background-color:red');
        senha.innerHTML = 'Senha <span>*Insira pelo menos um caractere especial</span>';
        validSenha = false;
    } else {
        senha.setAttribute('style', 'color:#16CF8C'); // Definir estilo de texto para verde se a senha for válida
        senha.innerHTML = 'Senha de usuário';
    }
});

// ---------Confirm Senha-------------
inputConfirm.addEventListener('keyup', ()=>{
    if (inputSenha.value != inputConfirm.value) {
        confirmSenha.setAttribute('style', 'background-color:red');
        confirmSenha.innerHTML = 'Confirmar senha <span>*As senhas não coincidem</span>';
        validConfirmSenha = false;
    } else {
        confirmSenha.setAttribute('style', 'color:#16CF8C');
        confirmSenha.innerHTML = 'Confirme sua senha:';
        validConfirmSenha = true;
    }
    })

// ========EMPRESA VALIDAÇÃO=========
// ------------Nome da Empresa------------
inputNomeEmpresa.addEventListener('keyup', ()=>{
    if (inputNomeEmpresa.value.length <= 2) {
        empresa.setAttribute('style', 'background-color:red')
        empresa.innerHTML = 'Nome da Empresa: <span>*Insira no mínimo 3 caracteres</span>'
        validUsuario = false;
    } else {
        empresa.setAttribute('style', 'color:#16CF8C')
        empresa.innerHTML = 'Nome da Empresa:'
        validEmpresa = true;
    }
    }) 

// CNPJ
inputCnpj.addEventListener('keyup', ()=>{
    if (inputCnpj.value.length <= 14) {
        cnpj.setAttribute('style', 'background-color:red')
        cnpj.innerHTML = 'CNPJ <span>*Insira no mínimo 14 caracteres</span>'
        validCnpj = false;
    } else {
        cnpj.setAttribute('style', 'color:#16CF8C')
        cnpj.innerHTML = 'CNPJ:'
        validCEP = true;
    }
    })
    