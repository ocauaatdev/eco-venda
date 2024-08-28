const usuario = require("../models/usuarioModel");
const validarCEP = require('../public/js/validarCEP');
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
            .matches(/^\d{5}-\d{3}$/)
            .withMessage("CEP deve estar no formato XXXXX-XXX")
            .custom(async (value) => {
                const cepValido = await validarCEP(value.replace('-', ''));
                if (!cepValido) {
                    console.log('CEP inválido ou não encontrado');
                    throw new Error('CEP inválido ou não encontrado.');
                }
                return true;
            }),
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
        // Primeiro, valida o formulário
        cadastrar: async (req, res) => {
            const erros = validationResult(req);
    
            if (!erros.isEmpty()) {
                req.session.dadosForm = req.body; // Armazena os dados do formulário na sessão
                return res.redirect('/cadastro-empresa?cadastro-empresa=erros');
            }
    
            // Dados do formulário
            const dadosForm = {
                razaoSocial: req.body.empresa,
                senhaEmpresa: bcrypt.hashSync(req.body.senha, salt), 
                emailEmpresa: req.body.e_mail, 
                celularEmpresa: req.body.telefone,
                cnpjEmpresa: req.body.cnpj,
                cepEmpresa: req.body.cep,
            };
    
            try {
                const existingUser = await Usuario.findUser(req.body.empresa);
                const existingEmail = await Usuario.findByEmail(req.body.e_mail);
                const existingCnpj = await Usuario.findByCnpj(req.body.cnpj);
    
                if (existingUser.length > 0 || existingEmail.length > 0 || existingCnpj.length > 0) {
                    req.session.dadosForm = req.body;
                    let erroMsg = '';
                    if (existingUser.length > 0) erroMsg += 'usuario';
                    if (existingEmail.length > 0) erroMsg += 'email';
                    if (existingCnpj.length > 0) erroMsg += 'cnpj';
                    
                    return res.redirect(`/cadastro-empresa?cadastro-empresa=${erroMsg}`);
                }
    
                const cepValido = await validarCEP(req.body.cep.replace('-', ''));
                if (cepValido) {
                    await empresa.create(dadosForm);
                    req.session.dadosForm = null; // Limpa os dados da sessão após sucesso
                    return res.redirect("/login?cadastro=sucesso");
                } else {
                    req.session.dadosForm = req.body;
                    return res.redirect('/cadastro-empresa?cadastro-empresa=cep');
                }

        } catch (e) {
            console.log(e);
            res.render("pages/cadastro", { listaErros: [{ msg: 'Erro ao criar usuário' }], valores: req.body });
        }
    }    
}
}

module.exports = usuarioController;
