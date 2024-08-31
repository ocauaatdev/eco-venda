const empresa = require("../models/empresaModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const moment = require('moment');
const validarCnpj = require("../public/js/validarCnpj");
const validarCEP = require("../public/js/validarCEP");

const saltRounds = 12; // Número de rounds para o bcrypt
const salt = bcrypt.genSaltSync(saltRounds);

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
        body("e_mail")
            .isEmail().withMessage("Digite um e_mail válido!"),
        body("telefone")
            .isLength({min: 11,max: 14}).withMessage("Minimo 11 caracteres"),
            body("cnpj")
            .isLength({min:14, max:18}).withMessage("Mínimo 14 caracteres")
            .custom(value => {
                if (!validarCnpj(value)) {
                    throw new Error('CNPJ inválido');
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
        body("senhaEmpresa")
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
            console.log('Erros no login:', erros.array());
            return res.render("pages/login-empresa", { listaErros: erros.array() });
        }

        const { empresa: nomeEmpresa, senha } = req.body;

        try {
            // Busca a empresa no banco de dados pelo nome
            const empresaEncontrada = await empresa.findUser({ razaoSocial: nomeEmpresa });

            if (empresaEncontrada.length === 0) {
                // Empresa não encontrada
                throw new Error('Nome de empresa ou senha inválidos');
            }

            const empresaData = empresaEncontrada[0];

            // Verifica se a senha está correta
            const senhaCorreta = await bcrypt.compare(senha, empresaData.senhaEmpresa);

            if (!senhaCorreta) {
                // Senha incorreta
                throw new Error('Nome de empresa ou senha inválidos');
            }

            // Se tudo estiver correto, define a sessão como autenticada
            req.session.autenticado = {
                autenticado: empresaData.razaoSocial,
                id: empresaData.idEmpresas
            };
            console.log('Login bem-sucedido');
            res.redirect("/");
        } catch (e) {
            console.log('Erro no login:', e.message);
            res.render("pages/login-empresa", { listaErros: [{ msg: e.message }] });
        }
    },
    cadastrar: async (req, res) => {
        const erros = validationResult(req);

        // Inicializa `valores` com todos os valores enviados no form
        if (!erros.isEmpty()) {
            req.session.dadosForm = req.body; // Armazena os dados do formulário na sessão
        }
        
        console.log('Erros no cadastro:', erros.array());
    
        // Gere o salt    
        var dadosForm = {
            razaoSocial: req.body.empresa,
            senhaEmpresa: bcrypt.hashSync(req.body.senhaEmpresa, salt), // Agora `salt` está definido
            emailEmpresa: req.body.e_mail, 
            celularEmpresa: req.body.telefone,
            cpnjempresa: req.body.cnpj,
            cepEmpresa: req.body.cep,
        };
        try {
            const cnpjValido = validarCnpj(req.body.cnpj);
            if (!cnpjValido) {
                req.session.dadosForm = req.body; // Armazena os dados do formulário na sessão
                return res.redirect('/cadastro-empresa?cadastro-empresa=cnpjInvalido');
            }

            if (req.body.senha !== req.body.confirm_senha) {
                req.session.dadosForm = req.body; // Armazena os dados do formulário na sessão
                return res.redirect('/cadastro-empresa?cadastro-empresa=senha_invalida');
            }

            // Verifica se o nome de usuário, e-mail ou CPF já existem
            const existingUser = await empresa.findUser(req.body.empresa);
            const existingEmail = await empresa.findByEmail(req.body.e_mail);
            const existingCnpj = await empresa.findByCnpj(req.body.cnpj);

            if (existingUser.length > 0 && existingEmail.length > 0 && existingCnpj.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro-empresa?cadastro-empresa=usuarioemailcnpj');
            } else if (existingUser.length > 0 && existingEmail.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro-empresa?cadastro-empresa=usuarioemail');
            } else if (existingUser.length > 0 && existingCnpj.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro-empresa?cadastro-empresa=usuariocnpj');
            } else if (existingEmail.length > 0 && existingCnpj.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro-empresa?cadastro-empresa=emailcnpj');
            } else if (existingUser.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro-empresa?cadastro-empresa=usuario');
            } else if (existingEmail.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro-empresa?cadastro-empresa=email');
            } else if (existingCnpj.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro-empresa?cadastro-empresa=cnpj');
            }

            const cepValido = await validarCEP(req.body.cep.replace('-', ''));
            if (cepValido) {
                let create = await empresa.create(dadosForm);
                req.session.dadosForm = null; // Limpa os dados do formulário na sessão após o sucesso
                return res.redirect("/login-empresa?cadastro-empresa=sucesso");
            } else {
                req.session.dadosForm = req.body; // Armazena os dados do formulário na sessão
                return res.redirect('/cadastro-cadastro?cadastro-empresa=cep');
            }
        }catch (e) {
            console.log('Erro no cadastro:', e.message);
            res.render("pages/cadastro-empresa", { listaErros: [{ msg: e.message }], valores: req.body });
        }
    }
}

module.exports = empresaController;
