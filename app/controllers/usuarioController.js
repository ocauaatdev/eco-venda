const usuario = require("../models/usuarioModel");
const validarCEP = require('../public/js/validarCEP');
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const moment = require('moment');
const verificaCPF = require('../public/js/verificaCPF'); // Verifique o caminho correto para o arquivo verificaCPF.js
const Usuario = require('../models/usuarioModel');
const validarNascimento = require('../public/js/validarNascimento');

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
                .withMessage("CEP deve estar no formato XXXXX-XXX"),
            body("nascimento")
                .isDate({ format: 'YYYY-MM-DD' })
                .withMessage('Data de nascimento inválida'),
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

            req.session.user = {
                id: user.idClientes,
                nomeCliente: user.nomeCliente,
                tipo: 'user'
            };
            return res.redirect(`/home-page?login=sucesso&nome=${user.nomeCliente}` );
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor');
        }
    },
    cadastrar: async (req, res) => {
        // Primeiro, valida o formulário
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            req.session.dadosForm = req.body;
            console.log('Erros na validação do formulário:', erros.array());
            // return res.render('pages/cadastro', { listaErros: erros.array(), valores: req.body });
        }

        // Se houver erros, renderiza a página de cadastro com todos os erros
        // Prepara os dados para o cadastr
    
        try {
            const dataValida = validarNascimento(req.body.nascimento)
            if(!dataValida){
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro?cadastro=dataInvalida')
            }
            const cpfValido = verificaCPF(req.body.cpf);
    if (!cpfValido) {
        req.session.dadosForm = req.body;
        return res.redirect('/cadastro?cadastro=cpfInvalido');
    }

    // Validação do CEP
    const cepValido = await validarCEP(req.body.cep.replace('-', ''));
    if (!cepValido) {
        req.session.dadosForm = req.body;
        console.log('Redirecionando por CEP inválido');
        return res.redirect('/cadastro?cadastro=cep');
    }

    // Dados do formulário com CEP válido
    const dadosForm = {
        nomeCliente: req.body.usuario,
        senhaCliente: bcrypt.hashSync(req.body.senha, salt),
        emailCliente: req.body.e_mail,
        celularCliente: req.body.telefone,
        cpfCliente: req.body.cpf,
        cepCliente: req.body.cep,
        logradouroCliente: cepValido.logradouro,  // Acessa corretamente o logradouro
        cidadeCliente: cepValido.localidade,  // Acessa corretamente a cidade
        ufCliente: cepValido.uf,  // Acessa corretamente o estado (UF)
        data_nascCliente: moment(req.body.nascimento, "YYYY-MM-DD").format("YYYY-MM-DD"),
    };
            // Verifica se o nome de usuário, e-mail ou CPF já existem
            const existingUser = await usuario.findUser(req.body.usuario);
            const existingEmail = await usuario.findByEmail(req.body.e_mail);
            const existingCpf = await usuario.findByCpf(req.body.cpf);
    
            if (existingUser.length > 0 && existingEmail.length > 0 && existingCpf.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro?cadastro=usuarioemailcpf');
            } else if (existingUser.length > 0 && existingEmail.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro?cadastro=usuarioemail');
            } else if (existingUser.length > 0 && existingCpf.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro?cadastro=usuariocpf');
            } else if (existingEmail.length > 0 && existingCpf.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro?cadastro=emailcpf');
            } else if (existingUser.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro?cadastro=usuario');
            } else if (existingEmail.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro?cadastro=email');
            } else if (existingCpf.length > 0) {
                req.session.dadosForm = req.body;
                return res.redirect('/cadastro?cadastro=cpf');
            }
    
            // Cria o novo usuário se não houver conflitosconst cpfValido = verificaCPF(req.body.cpf);
            await Usuario.create(dadosForm);
            return res.redirect("/login?cadastro=sucesso");

        } catch (e) {
            console.log(e);
            res.render("pages/cadastro", { listaErros: [{ msg: 'Erro ao criar usuário' }], valores: req.body });
        }
    },
    perfil: async(req, res)=>{
        if(!req.session.user) {
            return res.redirect('/login');
        }

        try {
            console.log('ID do usuário na sessão:', req.session.user.id);

            // Verifica se o usuario é do tipo 'usuario'
            if (req.session.user.tipo !== 'user') {
                return res.redirect('/login');
            }

            const user = await Usuario.findId(req.session.user.id);
            if (user.length === 0) {
                return res.status(404).send('Usuário não encontrado');
            }

            res.render('pages/perfil-usuario', { user: user[0], autenticado: req.session.autenticado, tipo: 'usuario' });
            
        }catch(err){
            console.error(err);
            res.status(500).send('Erro ao carregar o perfil');
        }
    },

    atualizarPerfil: async (req, res) => {
        if (!req.session.user) {
            return res.redirect('/login');
        }
    
        try {
            const { nomeCliente, emailCliente, celularCliente, cpfCliente, cepCliente} = req.body;
    
            // Verifica se o novo nome já está em uso
            const existingUser = await Usuario.findUser(nomeCliente);
            if (existingUser.length > 0 && existingUser[0].idClientes !== req.session.user.id) {
                return res.status(400).send('Nome de usuário já está em uso. Por favor, escolha outro.');
            }

            // Chama a função de validação do CEP para obter os dados
            const endereco = await validarCEP(cepCliente.replace('-', ''));
            if (!endereco) {
                return res.status(400).send('CEP inválido.');
            }
    
            // Atualiza as informações do perfil no banco de dados
            await Usuario.update(req.session.user.id, {
                nomeCliente,
                emailCliente,
                celularCliente,
                cpfCliente,
                cepCliente,
                logradouroCliente: endereco.logradouro,
                bairroCliente: endereco.bairro,
                cidadeCliente: endereco.localidade,
                ufCliente: endereco.uf,
            });
    
            res.redirect('/perfil-usuario?update=sucesso');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao atualizar o perfil.');
        }
    }
};

module.exports = usuarioController;
