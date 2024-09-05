function validarNascimento(nascimento) {
    const valor = typeof nascimento === 'string' ? nascimento : nascimento.value;

    if (!isValidDate(valor) || !isOldEnough(valor)) {
        if (typeof document !== 'undefined') {
            nascimento.classList.add('erro');
            // Opcional: exibir uma mensagem para o usuário
        }
        return false; // Indica que a validação falhou
    } else {
        if (typeof document !== 'undefined') {
            nascimento.classList.remove('erro');
        }
        return true; // Indica que a validação foi bem-sucedida
    }
}

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function isOldEnough(dateString) {
    let date = new Date(dateString);
    let today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    let monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
    }
    return age >= 18; // Supondo uma idade mínima de 18 anos
}

module.exports = validarNascimento;