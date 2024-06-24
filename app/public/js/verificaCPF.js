// verificaCPF.js
function verificaCPF(valCPF) {
    if (!valCPF) return false; // Verifica se o CPF foi fornecido

    valCPF = valCPF.replace(/[^\d]/g, ''); // Remove caracteres não numéricos

    if (valCPF.length !== 11 ||
        valCPF === "00000000000" ||
        valCPF === "11111111111" ||
        valCPF === "22222222222" ||
        valCPF === "33333333333" ||
        valCPF === "44444444444" ||
        valCPF === "55555555555" ||
        valCPF === "66666666666" ||
        valCPF === "77777777777" ||
        valCPF === "88888888888" ||
        valCPF === "99999999999") {
        return false;
    }

    // Verifica o primeiro dígito verificador
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(valCPF.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(valCPF.substring(9, 10))) {
        return false;
    }

    // Verifica o segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(valCPF.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(valCPF.substring(10, 11))) {
        return false;
    }

    return true;
}

module.exports = verificaCPF;