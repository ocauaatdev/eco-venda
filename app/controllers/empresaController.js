const empresa = require("../models/empresaModel");
const validarCEP = require("../public/js/validarCEP")
const validarCnpj = require("../public/js/validarCnpj")
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
            const empresaEncontrada = await empresa.findUser(nomeEmpresa); // Agora passando apenas o valor

            if (empresaEncontrada.length === 0) {
                // Empresa não encontrada
                return res.render("pages/login-empresa", { listaErros: [{ msg: 'Nome de empresa ou senha inválidos' }] });
            }

            const empresaData = empresaEncontrada[0];

            // Verifica se a senha está correta
            const senhaCorreta = await bcrypt.compare(senha, empresaData.senhaEmpresa);

            if (!senhaCorreta) {
                // Senha incorreta
                return res.render("pages/login-empresa", { listaErros: [{ msg: 'Nome de empresa ou senha inválidos' }] });
            }

            // Se tudo estiver correto, define a sessão como autenticada
            req.session.autenticado = {
                autenticado: empresaData.razaoSocial,
                id: empresaData.idEmpresas,
                tipo: 'empresa' // Adicionado tipo para facilitar a identificação
            };
            console.log(`Login de empresa bem-sucedido: ${empresaData.razaoSocial}`);
            return res.redirect(`/home-page?login=sucesso&nome=${empresaData.razaoSocial}`);
        } catch (e) {
            console.log('Erro no login:', e.message);
            res.render("pages/login-empresa", { listaErros: [{ msg: 'Erro interno no servidor, tente novamente mais tarde.' }] });
        }
    },
    cadastrar: async (req, res) => {
        const erros = validationResult(req);
        console.log('Erros no cadastro:', erros.array());
        req.session.dadosForm = req.body;
    
        // Gere o salt
        const salt = bcrypt.genSaltSync(10); // 10 é o número de rounds para gerar o salt
    
        
    
        if (!erros.isEmpty()) {
            console.log('Erros no cadastro:', erros.array());
            return res.render("pages/cadastro-empresa", { listaErros: erros.array(), valores: req.body });
        }
            try {
                const cnpjValido = validarCnpj(req.body.cnpj);
                if (!cnpjValido) {
                    req.session.dadosForm = req.body; // Armazena os dados do formulário na sessão
                    return res.redirect('/cadastro-empresa?cadastro-empresa=cnpjInvalido');
                }
                const cepValido = await validarCEP(req.body.cep.replace('-', ''));
                if (!cepValido) {
                    req.session.dadosForm = req.body;
                    console.log('Redirecionando por CEP inválido');
                    return res.redirect('/cadastro-empresa?cadastro-empresa=cep');
                }
    
                if (req.body.senha_empresa !== req.body.confirm_senha) {
                    req.session.dadosForm = req.body; // Armazena os dados do formulário na sessão
                    return res.redirect('/cadastro-empresa?cadastro-empresa=senha_invalida');
                }

                var dadosForm = {
                    razaoSocial: req.body.empresa,
                    senhaEmpresa: bcrypt.hashSync(req.body.senha_empresa, salt), // Agora `salt` está definido
                    emailEmpresa: req.body.e_mail, 
                    celularEmpresa: req.body.telefone,
                    cpnjempresa: req.body.cnpj,
                    cepEmpresa: req.body.cep,
                    logradouroEmpresa: cepValido.logradouro,
                    bairroEmpresa: cepValido.bairro,
                    cidadeEmpresa: cepValido.localidade,
                    ufEmpresa: cepValido.uf,
                };
    
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

                await empresa.create(dadosForm);
                return res.redirect("/login-empresa?cadastro-empresa=sucesso");
        } catch (e) {
            console.log('Erro no cadastro:', e.message);
            res.render("pages/cadastro-empresa", { listaErros: [{ msg: e.message }], valores: req.body });
        }
    },
    perfilEmpresa: async (req, res) =>{
        if(!req.session.autenticado) {
            return res.redirect('/login-empresa');
        }
        try {
            console.log('ID da empresa na sessão:', req.session.autenticado.id);
 
            // Verifica se o usuario é do tipo 'empresa'
            if (req.session.autenticado.tipo !== 'empresa') {
                return res.redirect('/login-empresa');
            }
 
            const Empresa = await empresa.findId(req.session.autenticado.id);
            if (Empresa.length === 0) {
                return res.status(404).send('Empresa não encontrada');
            }
            // Renderiza a página de perfil da empresa com os dados
            res.render('pages/perfil-empresa', { Empresa: Empresa[0], autenticado: req.session.autenticado, tipo: 'empresa' });
           
 
       
        } catch (error) {
            console.error('Erro ao carregar perfil da empresa:', error);
            res.status(500).send('Erro ao carregar perfil');
        }
    },
    atualizarPerfilEmpresa: async (req, res) => {
        if (!req.session.autenticado) {
            return res.redirect('/login-empresa');
        }
   
        try {
            const { razaoSocial, emailEmpresa, celularEmpresa, cpnjempresa, cepEmpresa } = req.body;
            const endereco = await validarCEP(cepEmpresa.replace('-', ''));
            if (!endereco) {
                return res.status(400).send('CEP inválido.');
            }
   
            // Atualizar as informações da empresa
            const result = await empresa.update(req.session.autenticado.id, {
                razaoSocial,
                emailEmpresa,
                celularEmpresa,
                cpnjempresa,
                cepEmpresa,
                logradouroEmpresa: endereco.logradouro,
                bairroEmpresa: endereco.bairro,
                cidadeEmpresa: endereco.localidade,
                ufEmpresa: endereco.uf,
            });
   
            console.log('Resultado da atualização no controller:', result); // Adicione isso para depuração
            res.redirect('/perfil-empresa?update=sucesso');
        } catch (error) {
            console.error('Erro ao atualizar perfil da empresa:', error);
            res.status(500).send('Erro ao atualizar perfil');
        }
    }
}

module.exports = empresaController;
