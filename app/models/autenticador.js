const { validationResult } = require("express-validator");
const usuario = require("./usuarioModel");
const empresa = require("./empresaModel");
const bcrypt = require("bcryptjs");

const verificarUsuAutenticado = (req, res, next) => {
    // if (req.session.autenticado) {
    //     var autenticado = req.session.autenticado;
    // } else {
    //     var autenticado = { autenticado: null, id: null, tipo: null };
    // }
    // req.session.autenticado = autenticado;
    // next();
    if (!req.session.autenticado) {
        req.session.autenticado = { autenticado: null, id: null, tipo: null };
    }
    next();
};

const limparSessao = (req, res, next) => {
    req.session.destroy();
    next();
};

const gravarUsuAutenticado = async (req, res, next) => {
    let erros = validationResult(req);
    let autenticado = { autenticado: null, id: null, tipo: null };

    if (erros.isEmpty()) {
        // Verificar login de cliente
        const dadosCliente = {
            nomeCliente: req.body.usuario,
            senhaCliente: req.body.senha,
        };

        let resultsCliente = await usuario.findUser(dadosCliente.nomeCliente);
        if (resultsCliente.length === 1) {
            const cliente = resultsCliente[0];
            const senhaValidaCliente = bcrypt.compareSync(dadosCliente.senhaCliente, cliente.senhaCliente);

            if (senhaValidaCliente) {
                autenticado = {
                    autenticado: cliente.nomeCliente,
                    id: cliente.idClientes,
                    tipo: 'usuario',
                };
                req.session.autenticado = autenticado;
                console.log("Login de cliente feito com sucesso");
                console.log(`Usuário/Empresa atualmente logado(a): ${autenticado.autenticado} (${autenticado.tipo})`);
                return next(); // Interrompe a execução aqui se o cliente foi autenticado
            } else {
                console.log("Senha de cliente inválida");
            }
        }

        // Se não encontrou o cliente, tenta verificar a empresa
        const dadosEmpresa = {
            razaoSocial: req.body.empresa || req.body.usuario,
            senha: req.body.senha,
        };

        let resultsEmpresa = await empresa.findUser(dadosEmpresa.razaoSocial);
        if (resultsEmpresa.length === 1) {
            const empresaLogada = resultsEmpresa[0];
            const senhaValidaEmpresa = bcrypt.compareSync(dadosEmpresa.senha, empresaLogada.senhaEmpresa);

            if (senhaValidaEmpresa) {
                autenticado = {
                    autenticado: empresaLogada.razaoSocial,
                    id: empresaLogada.idEmpresas,
                    tipo: 'empresa',
                };
                req.session.autenticado = autenticado;
                console.log("Login de empresa feito com sucesso");
                console.log(`Usuário/Empresa atualmente logado(a): ${autenticado.autenticado} (${autenticado.tipo})`);
                return next(); // Interrompe a execução aqui se a empresa foi autenticada
            } else {
                console.log("Senha de empresa inválida");
            }
        } else {
            console.log("Empresa não encontrada");
        }
    } else {
        console.log("Erro de validação");
    }

    req.session.autenticado = autenticado;

    if (!autenticado.autenticado) {
        console.log("Nenhum usuário ou empresa logado(a).");
    }

    next();
};

const verificarUsuAutorizado = (tipoPermitido, destinoFalha) => {
    return (req, res, next) => {
        if (req.session.autenticado.autenticado != null &&
            tipoPermitido.includes(req.session.autenticado.tipo)) {
            next();
        } else {
            res.render(destinoFalha, req.session.autenticado);
        }
    };
};

module.exports = {
    verificarUsuAutenticado,
    limparSessao,
    gravarUsuAutenticado,
    verificarUsuAutorizado
};
