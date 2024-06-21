const empresa = require("../models/empresaModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(12);
const moment = require('moment');

const empresaController = {
    regrasValidacaoFormLogin: [
        body("empresa")
            .isLength({ min: 3, max: 45 })
            .withMessage("O nome da empresa deve ter de 3 a 45 caracteres"),
        body("senha")
            .isStrongPassword()
            .withMessage("A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)")
    ],
    regrasValidacaoFormCad: [
        body("empresa")
            .isLength({ min: 3, max: 45 }).withMessage("Mínimo de 3 letras e máximo de 45!"),
        body("empresa")
            .isLength({ min: 3, max: 45 }).withMessage("Nome da empresa deve ter de 3 a 45 caracteres!"),
        body("e_mail")
            .isEmail().withMessage("Digite um e_mail válido!"),
        body("telefone")
            .isLength({min: 11,max: 14}).withMessage("Minimo 11 caracteres"),
        body("cnpj")
            .isLength({min:14, max:18}).withMessage("Minimo 14 caracteres"),
        body("cep")
            .isLength({min:8, max:9}).withMessage("Minimo 8 caracteres"),
        body("senha")
            .isStrongPassword()
            .withMessage("A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)"),
        body("confirm_senha")
            .custom((value, { req }) => {
                if (value !== req.body.senha) {
                    throw new Error('A confirmação de senha deve ser igual à senha.');
                }
                return true;
            })

    ],
    logar: (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.render("pages/login", { listaErros: erros })
        }
        if (req.session.autenticado != null) {
            res.redirect("/");
        } else {
            res.render("/", { listaErros: erros })
        }
    },
    cadastrar: async (req, res) => {
        const erros = validationResult(req);
        console.log(erros);
        var dadosForm = {
            razaoSocial: req.body.empresa,
            senhaEmpresa: bcrypt.hashSync(req.body.senha, salt), 
            razaoSocial: req.body.empresa, 
            emailEmpresa: req.body.e_mail, 
            celularEmpresa: req.body.telefone,
            cpnjempresa: req.body.cnpj,
            cepEmpresa: req.body.cep,
        };
        if (!erros.isEmpty()) {
            console.log(erros);
            return res.render("pages/cadastro-empresa", { listaErros: erros, valores: req.body })
        }
        try {
            let create = await empresa.create(dadosForm);
            console.log(create)
            res.redirect("/")
        } catch (e) {
            console.log(e);
            res.render("pages/cadastro-empresa", { listaErros: erros, valores: req.body })
        }
    }

}

module.exports = empresaController;