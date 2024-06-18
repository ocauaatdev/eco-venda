var btnMostrarSenha = document.querySelector('#btn-senha')
var inputSenha = document.querySelector('#senha')

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
// ============ Fim Mostrar Senha =============