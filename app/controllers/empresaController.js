const empresa = require("../models/empresaModel");
const produtosModel = require("../models/produtosModel");
const validarCEP = require("../public/js/validarCEP")
const validarCnpj = require("../public/js/validarCnpj")
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const moment = require('moment');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const enviarEmail = require("../public/js/email");

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
    regrasValidacaoFormRecSenha:[
        body('email')
          .isEmail()
          .withMessage('Por favor, insira um e-mail válido.'),
    ],
      regrasValidacaoFormNovaSenha:[
        body("senha_empresa")
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

                let create = await empresa.create(dadosForm);
       
        // Gerar token JWT
        const token = jwt.sign(
            { userId: create.insertId },
            process.env.SECRET_KEY,
            { expiresIn: '1h' } // Defina o tempo de expiração conforme necessário
        );
        console.log(token);
 
        const url = `${process.env.URL_BASE}/ativar-conta-empresa?token=${token}`;  //`localhost:3000/ativar-conta?token=${token}`
        console.log(url)
        // Gerar HTML para o e-mail
        const html = require('../util/email-ativar-conta-empre')(url, token);
 
        // Enviar e-mail
        enviarEmail(dadosForm.emailEmpresa, "Cadastro no site exemplo", null, html, () => {
            return res.redirect('/cadastro-empresa?cadastro-empresa=sucesso');
        });
       
        } catch (e) {
            console.log(e);
        }
    },
    recuperarSenha:async(req,res) =>{
        const erros = validationResult(req);
 
        if (!erros.isEmpty()) {
            req.session.dadosForm = req.body;
            res.render("pages/rec-senha",
                erros.array()
            )
            // return res.render('pages/cadastro', { listaErros: erros.array(), valores: req.body });
        };

        try{
            const user = await empresa.findEmpresaCustom({
                emailEmpresa: req.body.e_mail,
            });
            if (!user || user.length === 0) {
                return res.render("pages/rec-senha-empresa", { erros: [{ msg: 'Usuário não encontrado com este e-mail.' }] });
            }
    
            // Gera o token JWT usando o ID do usuário
            const token = jwt.sign(
                { userId: user[0].idEmpresas }, // Certifique-se de usar o campo correto do banco de dados
                process.env.SECRET_KEY,
                { expiresIn: '40m' } // Define o tempo de expiração
            );
    
            // Gera o link de recuperação de senha
            const url = `${process.env.URL_BASE}/resetar-senha-empresa?token=${token}`;
            const html = require('../util/email-reset-senha-empresa')(url, token);
 
        // Enviar e-mail
        enviarEmail(req.body.e_mail, "Pedido de recuperação de senha", null, html, () => {
            return res.redirect('/recuperar-senha-empresa?recuperar-senha-empresa=senha');
        });
       
        } catch (e) {
            console.log(e);
        }

    },

    validarTokenNovaSenha: async(req, res)=>{
        const token = req.query.token;
        console.log(token);

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) =>{
            if(err){
                res.render("pages/rec-senha-empresa")
            } else{
                res.render("pages/resetar-senha-empresa",{
                    autenticado: req.session.autenticado,
                    idEmpresas: decoded.userId,
                })
            }
        })
    },

    resetarSenha: async(req,res) =>{
        const erros = validationResult(req);
        console.log(erros);
        if(!erros.isEmpty()){
        };

        try {
            const { idEmpresas, senha_empresa } = req.body;

        // Verifique se idEmpresas e senha foram fornecidos

        // Criptografa a senha. Verifique se a variável 'senha' está corretamente preenchida
        const senhaHash = bcrypt.hashSync(senha_empresa, 10); 

        // Confirme se a senha foi criptografada corretamente
        console.log("Senha criptografada:", senhaHash);

        // Atualiza a senha do cliente no banco de dados usando o ID
        const resultado = await empresa.atualizarSenhaEmpresa(idEmpresas, senhaHash);

        if (resultado.affectedRows > 0) {
            res.redirect("/login-empresa?login-empresa=alteracao");
        } else {
            res.status(400).send("Nenhum cliente encontrado com esse ID.");
        }
        } catch (error) {
            console.log("Erro ao atualizar a senha:", error);
            res.status(500).send("Erro no servidor.");
        }        
        
    },
    perfilEmpresa: async (req, res) => {
        if (!req.session.autenticado) {
            return res.redirect('/login-empresa');
        }
        try {
            const empresaId = req.session.autenticado.id;

            // Busca os dados da empresa
            const Empresa = await empresa.findId(empresaId);
            if (Empresa.length === 0) {
                return res.status(404).send('Empresa não encontrada');
            }

            // Busca os produtos da empresa
            const produtos = await produtosModel.findByEmpresaId(empresaId);

            produtos.forEach((produto) => {
                if (produto.imagemProd) {
                  produto.imagemProd = `data:image/png;base64,${produto.imagemProd.toString('base64')}`;
                }
              });

            // Renderiza a página de perfil da empresa com os dados
            res.render('pages/perfil-empresa', {
                Empresa: Empresa[0],
                autenticado: req.session.autenticado,
                produtos // Adiciona a lista de produtos
            });
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
