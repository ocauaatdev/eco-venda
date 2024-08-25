const empresa = require("../models/empresaModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
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
        body("e_mail")
            .isEmail().withMessage("Digite um e_mail válido!"),
        body("telefone")
            .isLength({min: 11,max: 14}).withMessage("Minimo 11 caracteres"),
        body("cnpj")
            .isLength({min:14, max:18}).withMessage("Minimo 14 caracteres"),
        body("cep")
            .isLength({min:8, max:9}).withMessage("Minimo 8 caracteres"),
        body("senha_empresa")
            .isStrongPassword()
            .withMessage("A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)"),
        body("confirm_senha")
            .custom((value, { req }) => {
                if (value !== req.body.senha_empresa) {
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
        console.log('Erros no cadastro:', erros.array());
    
        // Gere o salt
        const salt = bcrypt.genSaltSync(10); // 10 é o número de rounds para gerar o salt
    
        var dadosForm = {
            razaoSocial: req.body.empresa,
            senhaEmpresa: bcrypt.hashSync(req.body.senha_empresa, salt), // Agora `salt` está definido
            emailEmpresa: req.body.e_mail, 
            celularEmpresa: req.body.telefone,
            cpnjempresa: req.body.cnpj,
            cepEmpresa: req.body.cep,
        };
    
        if (!erros.isEmpty()) {
            console.log('Erros no cadastro:', erros.array());
            return res.render("pages/cadastro-empresa", { listaErros: erros.array(), valores: req.body });
        }
        try {
            let create = await empresa.create(dadosForm);
            console.log('Cadastro bem-sucedido:', create);
            res.redirect("/login-empresa");
        } catch (e) {
            console.log('Erro no cadastro:', e.message);
            res.render("pages/cadastro-empresa", { listaErros: [{ msg: e.message }], valores: req.body });
        }
    }
}

module.exports = empresaController;
