var senha = document.querySelector('#senha');
var confirmSenha = document.querySelector('#confirmSenha');
var btnMostrar = document.querySelector('#btn-senha');
var btnMostrarConfirm = document.querySelector('#btn-confirm-senha');
var senhaEmpresa = document.querySelector('#senha_empresa'); // Adicionado
var btnMostrarSenhaEmpresa = document.querySelector('#btn-senha-empresa'); // Adicionado

function mostrarSenha() {
    if (senha.type === 'password') {
        senha.setAttribute('type','text');
        btnMostrar.classList.replace('fa-eye','fa-eye-slash');
    } else {
        senha.setAttribute('type','password');
        btnMostrar.classList.replace('fa-eye-slash','fa-eye');
    }
}

function mostrarConfirmSenha() {
    if (confirmSenha.type === 'password') {
        confirmSenha.setAttribute('type','text');
        btnMostrarConfirm.classList.replace('fa-eye','fa-eye-slash');
    } else {
        confirmSenha.setAttribute('type','password');
        btnMostrarConfirm.classList.replace('fa-eye-slash','fa-eye');
    }
}

// Função para mostrar senha da empresa
function mostrarSenhaEmpresa() {
    if (senhaEmpresa.type === 'password') {
        senhaEmpresa.setAttribute('type','text');
        btnMostrarSenhaEmpresa.classList.replace('fa-eye','fa-eye-slash');
    } else {
        senhaEmpresa.setAttribute('type','password');
        btnMostrarSenhaEmpresa.classList.replace('fa-eye-slash','fa-eye');
    }
}
