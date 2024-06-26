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
        var results = await usuario.findUser(dadosForm);
        var total = Object.keys(results).length;
        if (total == 1) {
            if (bcrypt.compareSync(dadosForm.senhaCliente, results[0].senhaCliente)) {
                autenticado = {
                    autenticado: results[0].nomeCliente,
                    id: results[0].idClientes,
                };
                console.log("Login feito com Sucesso");
            }
        } else {
            // VERIFICAR EMPRESA
            console.log("Breve");

            autenticado = {
                autenticado: "empresa",
                id: 111,
            };
        }
    } else {
        console.log("Error");
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
