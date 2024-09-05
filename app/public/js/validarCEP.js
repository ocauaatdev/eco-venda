const fetch = require('node-fetch');

const validarCEP = async (cep) => {
    try {
        const onlyNumbers = /^[0-9]+$/;
        const cepValid = /^[0-9]{8}$/;

        if (!onlyNumbers.test(cep) || !cepValid.test(cep)) {
            console.log('CEP inválido: formato incorreto');
            return false;
        }

        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        if (!response.ok) {
            console.log('Erro ao tentar validar o CEP com a API');
            return false;
        }

        const responseCep = await response.json();

<<<<<<< HEAD
        if (responseCep.erro || !responseCep.logradouro || !responseCep.bairro || !responseCep.localidade || !responseCep.uf) {
=======
        if (responseCep.erro || !responseCep.logradouro || !responseCep.localidade || !responseCep.uf) {
>>>>>>> f70a5ed754bc489ec0fded3d9f053867d15d848c
            console.log('CEP não encontrado ou incompleto');
            return false;
        }

        return responseCep; // Retorna o objeto completo se for válido

    } catch (error) {
        console.error('Erro ao validar o CEP:', error);
        return false;
    }
};

module.exports = validarCEP; // Certifique-se de que a função está sendo exportada
