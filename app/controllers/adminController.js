const Admin = require("../models/adminModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const produtosModel = require("../models/produtosModel");
const empresaModel = require("../models/empresaModel");
const usuarioModel = require("../models/usuarioModel");
const solicitacoesProdutoModel = require('../models/solicitacoesProdutoModel');
const moment = require('moment');
const { regrasValidacaoFormCad } = require("./usuarioController");
const cuponsModel = require("../models/cuponsModel")

const saltRounds = 12;
const salt = bcrypt.genSaltSync(saltRounds);

const adminController = {
    regrasValidacaoFormLogin: [
        body("adm")
            .isLength({ min: 3, max: 45 })
            .withMessage("O nome de usuário deve ter de 3 a 45 caracteres"),
        body("senha")
            .isStrongPassword()
            .withMessage("A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)")
    ],
    regrasValidacaoFormCup:[

    ],

    logar: async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.render('pages/login-adm', { listaErros: erros.array(), query: req.query });
        }

        const { adm, senha } = req.body;

        try {
            const [admin] = await Admin.findAdmin(adm);

            if (!admin) {
                return res.render('pages/login-adm', { listaErros: [{ msg: 'Nome de usuário ou senha inválidos' }], query: req.query });
            }

            const isMatch = await bcrypt.compare(senha, admin.senhaAdmin);
            if (!isMatch) {
                return res.render('pages/login-adm', { listaErros: [{ msg: 'Nome de usuário ou senha inválidos' }], query: req.query });
            }

            req.session.admin = {
                id: admin.idAdmin,
                nomeAdmin: admin.nomeAdmin,
                tipo: 'admin'
            };
            return res.redirect(`/?login=sucesso&nome=${admin.nomeAdmin}`);
        } catch (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor');
        }
    },
    aprovarProduto: async (req, res) => {
        const { idSolicitacao } = req.params;
  try {
    // Lógica para rejeitar o pedido (e.g., delete na tabela)
    await solicitacoesProdutoModel.aprovar(idSolicitacao);
    
    // Redirecionar após rejeição

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao rejeitar o produto');
    }
}  
,
rejeitarProduto: async (req, res) => {
    const { idSolicitacao } = req.params;
  try {
    // Lógica para rejeitar o pedido (e.g., delete na tabela)
    await solicitacoesProdutoModel.delete(idSolicitacao);
    
    // Redirecionar após rejeição

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao rejeitar o produto');
    }
}
,
excluirUsuario: async (req, res) => {
    const { idClientes } = req.params;

    try {
        // Lógica para excluir o usuário com base no idClientes
        await usuarioModel.delete(idClientes);
        res.redirect('/perfil-adm');  // Redireciona para o perfil do admin após a exclusão
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir o usuário');
    }
},
cadastrarCupom: async (req, res) => {
    const erros = validationResult(req);
    

    var dadosForm = {
      nomeCupom: req.body.nomeCupom,
      descontoCupons: req.body.descontoCupons,
      prazoCupons: moment(req.body.prazoCupons, "YYYY-MM-DD").format("YYYY-MM-DD"),
      categoriaCupom: req.body.categoriaCupom,
      planoCupom: req.body.planoCupom,
      tipoCupom: req.body.tipoCupom,
    };
    console.log('Dados recebidos:', req.body);  // Adicione este log

    if (!erros.isEmpty()) {
      return res.render("pages/cadastro-cupom", { listaErros: erros.array(), values: req.body });
    }

    try {
      let create = await cuponsModel.create(dadosForm);
      console.log('Cupom cadastrado com sucesso:', create);
      res.redirect("/");
    } catch (e) {
      console.log('Erro no cadastro do cupom:', e.message);
      res.render("pages/cadastro-cupom", { listaErros: [{ msg: e.message }], valores: req.body });
    }
}
,


excluirEmpresa: async (req, res) => {
    const { idEmpresas } = req.params;

    try {
        // Lógica para excluir a empresa com base no idEmpresa
        await empresaModel.delete(idEmpresas);
        res.redirect('/perfil-adm');  // Redireciona para o perfil do admin após a exclusão
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao excluir a empresa');
    }
},

perfilAdm: async (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/login-adm');
    }

    try {
        const admin = await Admin.findId(req.session.admin.id);
        if (admin.length === 0) {
            return res.status(404).send('Administrador não encontrado');
        }

        // Busca todas as solicitações de produtos pendentes
        const solicitacoes = await solicitacoesProdutoModel.findByStatus('pendente');
        solicitacoes.forEach((produto) => {
            if (produto.imagemProd) {
                produto.imagemProd = `data:image/png;base64,${produto.imagemProd.toString('base64')}`;
            }
        });

        // Obter todas as empresas e usuários
        const empresas = await empresaModel.findAll();  // Armazena as empresas
        const usuarios = await usuarioModel.findAll();  // Armazena os usuários
        const cupons = await cuponsModel.findAll()

        // Renderiza a página com os dados do administrador, empresas, usuários e produtos
        res.render('pages/perfil-adm', {
            admin: admin[0],
            empresas,  // Passa as empresas para a view
            usuarios,
            cupons,
            moment,  // Passa os usuários para a view
            solicitacoes,  // Passa os produtos para a view
            autenticado: req.session.autenticado,
            tipo: 'admin'
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar o perfil');
    }
},


    atualizarPerfil: async (req, res) => {
        if (!req.session.admin) {
            return res.redirect('/login-admin');
        }

        try {
            const { nomeAdmin, emailAdmin } = req.body;

            // Verifica se o novo nome já está em uso
            const existingAdmin = await Admin.findAdmin(nomeAdmin);
            if (existingAdmin.length > 0 && existingAdmin[0].idAdmin !== req.session.admin.id) {
                return res.status(400).send('Nome de administrador já está em uso. Por favor, escolha outro.');
            }

            // Atualiza as informações do perfil no banco de dados
            await Admin.update(req.session.admin.id, {
                nomeAdmin,
                emailAdmin,
            });

            res.redirect('/perfil-admin?update=sucesso');
        } catch (err) {
            console.error(err);
            res.status(500).send('Erro ao atualizar o perfil.');
        }
    }
};

module.exports = adminController;
