var express = require("express");
var router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const empresaController = require("../controllers/empresaController");
const produtosController = require("../controllers/produtosController");
const { verificarUsuAutenticado,gravarUsuAutenticado,limparSessao,verificarUsuAutorizado } = require("../models/autenticador");
const uploadFile = require("../util/uploader")();


// Rotas de páginas
router.get('/', (req, res) => {
  res.render('pages/home-page', { query: req.query, autenticado: req.session.autenticado });
});

router.get('/home-page', (req, res) => {
  res.render('pages/home-page', { query: req.query, autenticado: req.session.autenticado });
});

router.get('/ecopremium', (req, res) => {
  res.render('pages/ecopremium', { query: req.query, autenticado: req.session.autenticado });
});

router.get('/catalogo', (req, res) => {
  // res.render('pages/catalogo', { query: req.query, autenticado: req.session.autenticado });
  produtosController.listarProdutos(req,res)
});

// ======== CADASTRO E LOGIN DO CLIENTE ==========

router.get('/cadastro', (req, res) => {
  const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão, se existirem
  req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los
  res.render('pages/cadastro', { listaErros: [], valores });
});

router.post('/cadastro',
  usuarioController.regrasValidacaoFormCad,
  async (req, res) => {
    usuarioController.cadastrar(req, res);
  });

router.get('/login', (req, res) => {
  res.render('pages/login', { listaErros: [], query: req.query });
});

router.post('/login',
  usuarioController.regrasValidacaoFormLogin,gravarUsuAutenticado,
  async (req, res) => {
    usuarioController.logar(req, res);
  });

  router.get('/cadastro-empresa', (req, res) => {
    const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão, se existirem
    req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los
    res.render('pages/cadastro-empresa', { listaErros: [], valores });
  });
// Rotas de cadastro e login de empresa
// ============= Rotas de cadastro e login de empresa ================
router.get('/cadastro-empresa', (req, res) => {
  const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão, se existirem
  req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los
  res.render('pages/cadastro-empresa', { listaErros: [], valores });
});

router.post('/cadastro-empresa',
  empresaController.regrasValidacaoFormCad,
  async (req, res) => {
    empresaController.cadastrar(req, res);
  });

router.get('/login-empresa', (req, res) => {
  res.render('pages/login-empresa', { listaErros: [], query: req.query });
});

router.post('/login-empresa',
  empresaController.regrasValidacaoFormLogin,gravarUsuAutenticado,
  async (req, res) => {
    empresaController.logar(req, res);
  });

// ==============================

// ========== DESLOGAR USUARIO ATUAL ===========
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).send('Erro ao deslogar');
      }
      res.redirect('/'); // Redireciona para a página de login ou outra página de sua escolha
  });
});
// ======================================

router.get('/carrinho', (req, res) => {
  res.render('pages/carrinho', { query: req.query, autenticado: req.session.autenticado });
});

router.get('/redirecionamento', (req, res) => {
  res.render('pages/redirecionamento');
});

// ==========PERFIS=================

  // router.get('/perfil-usuario', (req, res) => {
  //   res.render('pages/perfil-usuario');
  // });

  router.get('/perfil-usuario', usuarioController.perfil);

  router.post('/usuario/atualizar', usuarioController.atualizarPerfil);

// ===========================

router.get('/cadastro-produto', verificarUsuAutenticado, (req, res) => {
  const valores = {
    produtoNome: '',
    descricaoProduto: '',
    precoProduto: '',
    qtdeEstoque: '',
    tamanhoProduto: '',
    imagemProduto:'',
  };
  
  res.render('pages/cadastro-produto', { listaErros: [], valores });
});

router.post('/cadastro-produto',
  produtosController.regrasValidacaoFormProd, verificarUsuAutenticado,uploadFile("imagemProduto"),
  async (req, res) => {
    produtosController.cadastrarProduto(req, res);
  });

  // ===========

  router.get('/individual-produto', (req, res) => {
    res.render('pages/individual-produto', { query: req.query, autenticado: req.session.autenticado });
  });

  // Rota para exibir o produto individualmente
router.get('/produto/:idProd', produtosController.exibirProduto);

module.exports = router;
