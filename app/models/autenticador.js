// AUTENTICADOR COM AUTENTICAÇÃO DA EMPRESA
const { validationResult } = require("express-validator");
const usuario = require("./usuarioModel");
const empresa = require("./empresaModel");
const bcrypt = require("bcryptjs");

verificarUsuAutenticado = (req, res, next) => {
    if (req.session.autenticado) {
        var autenticado = req.session.autenticado;
    } else {
        var autenticado = { autenticado: null, id: null, tipo: null };
    }
    req.session.autenticado = autenticado;
    next();
};

limparSessao = (req, res, next) => {
    req.session.destroy();
    next();
};

gravarUsuAutenticado = async (req, res, next) => {
    let erros = validationResult(req);
    let autenticado = { autenticado: null, id: null }; // Inicializa a variável autenticado

    if (erros.isEmpty()) {
        var dadosForm = {
            nomeCliente: req.body.usuario,
            senhaCliente: req.body.senha,
        };

        // Verificação de cliente
        var results = await usuario.findUser(dadosForm);
        var total = Object.keys(results).length;

        if (total == 1) {
            if (bcrypt.compareSync(dadosForm.senhaCliente, results[0].senhaCliente)) {
                autenticado = {
                    autenticado: results[0].nomeCliente,
                    id: results[0].idClientes,
                };
                console.log("Login de cliente feito com sucesso");
            }
        } else {
            // Verificação de empresa
            var dadosEmpresa = {
                razaoSocial: req.body.empresa,
                senhaEmpresa: req.body.senha_empresa,
            };

            var resultsEmpresa = await empresa.findUser(dadosEmpresa);
            var totalEmpresa = Object.keys(resultsEmpresa).length;

            if (totalEmpresa == 1) {
                if (bcrypt.compareSync(dadosEmpresa.senhaEmpresa, resultsEmpresa[0].senhaEmpresa)) {
                    autenticado = {
                        autenticado: resultsEmpresa[0].razaoSocial,
                        id: resultsEmpresa[0].idEmpresas,
                    };
                    console.log("Login de empresa feito com sucesso");
                }
            }
        }
    } else {
        console.log("Erro de validação");
    }

    req.session.autenticado = autenticado;
    next();
};

verificarUsuAutorizado = (tipoPermitido, destinoFalha) => {
    return (req, res, next) => {
        if (req.session.autenticado.autenticado != null &&
            tipoPermitido.find(function (element) { return element == req.session.autenticado.tipo }) != undefined) {
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