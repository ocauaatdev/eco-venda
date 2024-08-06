const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const moment = require('moment');
const verificaCPF = require('../public/js/verificaCPF'); // Verifique o caminho correto para o arquivo verificaCPF.js
const Usuario = require('../models/usuarioModel');

const saltRounds = 12; // Número de rounds para o bcrypt
const salt = bcrypt.genSaltSync(saltRounds);

const usuarioController = {
    regrasValidacaoFormLogin: [
        body("usuario")
            .isLength({ min: 3, max: 45 })
            .withMessage("O nome de usuário deve ter de 3 a 45 caracteres"),
        body("senha")
            .isStrongPassword()
            .withMessage("A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)")
    ],
    regrasValidacaoFormCad: [
        body("usuario")
            .isLength({ min: 3, max: 45 })
            .withMessage("Mínimo de 3 letras e máximo de 45!"),
        body("e_mail")
            .isEmail()
            .withMessage("Digite um e-mail válido!"),
        body("telefone")
            .isLength({ min: 11, max: 14 })
            .withMessage("Mínimo 11 caracteres"),
        body("cpf")
            .isLength({ min: 11, max: 14 })
            .withMessage("CPF deve ter 11 caracteres")
            .custom(value => {
                if (!verificaCPF(value)) {
                    throw new Error('CPF inválido');
                }
                return true;
            }),
        body("cep")
            .isLength({ min: 8, max: 9 })
            .withMessage("Mínimo 8 caracteres"),
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
    logar: async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.render('pages/login', { listaErros: erros.array(), query: req.query });
        }

        const { usuario, senha } = req.body;

        try {
            const [user] = await Usuario.findUser(usuario);

            if (!user) {
                return res.render('pages/login', { listaErros: [{ msg: 'Nome de usuário ou senha inválidos' }], query: req.query });
            }

            const isMatch = await bcrypt.compare(senha, user.senhaCliente);
            if (!isMatch) {
                return res.render('pages/login', { listaErros: [{ msg: 'Nome de usuário ou senha inválidos' }], query: req.query });
            }

            req.session.user = user;
            return res.redirect('/home-page?login=sucesso');
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor');
        }
    },
    cadastrar: async (req, res) => {
        const erros = validationResult(req);
        console.log(erros);
        var dadosForm = {
            nomeCliente: req.body.usuario,
            senhaCliente: bcrypt.hashSync(req.body.senha, salt),
            emailCliente: req.body.e_mail,
            celularCliente: req.body.telefone,
            cpfCliente: req.body.cpf,
            cepCliente: req.body.cep,
            data_nascCliente: moment(req.body.nascimento, "YYYY-MM-DD").format("YYYY-MM-DD"),
        };
        if (!erros.isEmpty()) {
            console.log(erros);
            return res.render("pages/cadastro", { listaErros: erros, valores: req.body });
        }
        try {
            // Verifica se o nome de usuário já existe
            const existingUser = await usuario.findUser(req.body.usuario);
            // Verifica se o e-mail já existe
            const existingEmail = await usuario.findByEmail(req.body.e_mail);

            if (existingUser.length > 0 && existingEmail.length > 0) {
                return res.redirect('/cadastro?cadastro=usuarioemail');
            } else if (existingUser.length > 0) {
                return res.redirect('/cadastro?cadastro=usuario');
            } else if (existingEmail.length > 0) {
                return res.redirect('/cadastro?cadastro=email');
            }

            let create = await usuario.create(dadosForm);
            console.log(create);
            res.redirect("/login?cadastro=sucesso");
        } catch (e) {
            console.log(e);
            res.render("pages/cadastro", { listaErros: erros.array(), valores: req.body });
        }
    }
};

module.exports = usuarioController;
