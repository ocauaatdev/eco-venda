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

        console.log('Resposta da API:', responseCep);

        // Verifica se a API retornou um erro indicando que o CEP não foi encontrado
        if (responseCep.erro) {
            console.log('CEP não encontrado na API');
            return false;
        }

        // Verificação adicional para garantir que o CEP retornado seja completo
        if (!responseCep.logradouro || !responseCep.localidade || !responseCep.uf) {
            console.log('CEP incompleto ou não associado a um endereço específico');
            return false;
        }

        console.log('CEP validado com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao validar o CEP:', error);
        return false;
    }
};

module.exports = validarCEP;



























// const cep = document.querySelector('#cep');
// const address = document.querySelector('#address');
// const bairro = document.querySelector('#bairro');
// const cidade = document.querySelector('#cidade');

// cep.addEventListener('focusout',async () => {
//     try {
//         const onlyNumbers = /^[0-9]+$/;
//         const cepValid = /^[0-9]{8}$/;
//         if (!onlyNumbers.test(cep.value) || !cepValid.test(cep.value)) {
//             throw {cep_error: 'Cep invalid'}
//         }
//         const response = await fetch(`https://viacep.com.br/ws/${cep.value}/json/`);

//         if (!response.ok) {
//             throw await response.json();
//         }
//         const responseCep = await response.json();

//         address.value = responseCep.logradouro;   
//         bairro.value = responseCep.bairro;
//         cidade.value = responseCep.localidade;
//     } catch (error) {
//         if (error?.cep_error) {
//             message.textContent = error.cep_error;
//             setTimeout(() =>{
//                 message.textContent = "";
//             },5000) 
//         }
//         console.log(error)
//     }

// })