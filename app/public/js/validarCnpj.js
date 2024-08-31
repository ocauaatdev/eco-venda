// cnpjValidator.js

function validarCnpj(cnpj) {
    const b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const c = String(cnpj).replace(/[^\d]/g, '');

    if (c.length !== 14) {
        console.log('CNPJ inválido: comprimento incorreto');
        return false;
    }

    if (/0{14}/.test(c)) {
        console.log('CNPJ inválido: todos os dígitos são zeros');
        return false;
    }

    let n = 0;
    for (let i = 0; i < 12; n += c[i] * b[++i]);

    if (c[12] != (((n %= 11) < 2) ? 0 : 11 - n)) {
        console.log('CNPJ inválido: primeiro dígito verificador incorreto');
        return false;
    }

    n = 0;

    for (let i = 0; i <= 12; n += c[i] * b[i++]); 

    if (c[13] != (((n %= 11) < 2) ? 0 : 11 - n)) {
        console.log('CNPJ inválido: segundo dígito verificador incorreto');
        return false;
    }

    console.log('CNPJ válido');
    return true;
}

module.exports = validarCnpj;
