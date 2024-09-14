var express = require("express");
var router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const empresaController = require("../controllers/empresaController");
const produtosController = require("../controllers/produtosController");
const { verificarUsuAutenticado,gravarUsuAutenticado,limparSessao,verificarUsuAutorizado } = require("../models/autenticador");
const uploadFile = require("../util/uploader")();
const { carrinhoController } = require("../controllers/carrinhoController");


// Middleware para inicializar o carrinho
router.use((req, res, next) => {
  if (!req.session.carrinho) {
    req.session.carrinho = [];
  }
  res.locals.qtdItensCarrinho = req.session.carrinho.length;
  next();
});

// Middleware para configurar o estado autenticado
router.use((req, res, next) => {
  if (req.session.autenticado && req.session.autenticado.id) {
    res.locals.autenticado = req.session.autenticado;
  } else {
    res.locals.autenticado = null; // Explicitamente "não autenticado"
  }
  next();
});


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
  produtosController.listarProdutos(req, res, { autenticado: req.session.autenticado });
});

// ======== CADASTRO E LOGIN DO CLIENTE ==========

// router.get('/cadastro', (req, res) => {
//   const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão, se existirem
//   req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los

//   // Se o usuario estiver logado não permite acessar a pagina
//   if(req.session.user || req.session.autenticado){
//     return res.redirect('/?erro=logado');
//   }
//   res.render('pages/cadastro', { listaErros: [], valores });
// });
// Rota de cadastro do usuário
router.get('/cadastro', (req, res) => {
  const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão
  req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los

  // Se o usuario estiver logado, não permite acessar a pagina de cadastro
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado'); // Verifica explicitamente o ID
  }
  res.render('pages/cadastro', { listaErros: [], valores });
});

router.post('/cadastro',
  usuarioController.regrasValidacaoFormCad,
  async (req, res) => {
    usuarioController.cadastrar(req, res);
  });

// router.get('/login', (req, res) => {
//   if(req.session.user || req.session.autenticado){
//     return res.redirect('/?erro=logado');
//   }
//   res.render('pages/login', { listaErros: [], query: req.query });
// });
router.get('/login', (req, res) => {
  // Se o usuario estiver logado, não permite acessar a pagina de login
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado'); // Verifica explicitamente o ID
  }
  res.render('pages/login', { listaErros: [], query: req.query });
});

router.post('/login',
  usuarioController.regrasValidacaoFormLogin,gravarUsuAutenticado,
  async (req, res) => {
    usuarioController.logar(req, res);
  });

// ============= Rotas de cadastro e login de empresa ================
// router.get('/cadastro-empresa', (req, res) => {
//   const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão, se existirem
//   req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los

//   // Se o usuario estiver logado não permite acessar a pagina
//   if(req.session.autenticado || req.session.user){
//     return res.redirect('/?erro=logado');
//   }
//   res.render('pages/cadastro-empresa', { listaErros: [], valores });
// });
router.get('/cadastro-empresa', (req, res) => {
  const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão
  req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los

  // Se o usuario estiver logado, não permite acessar a pagina de cadastro da empresa
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado');
  }
  res.render('pages/cadastro-empresa', { listaErros: [], valores });
});

router.post('/cadastro-empresa',
  empresaController.regrasValidacaoFormCad,
  async (req, res) => {
    empresaController.cadastrar(req, res);
  });


// router.get('/login-empresa', (req, res) => {
//   if(req.session.autenticado || req.session.user){
//     return res.redirect('/?erro=logado');
//   }
//   res.render('pages/login-empresa', { listaErros: [], query: req.query });
// });
router.get('/login-empresa', (req, res) => {
  // Se o usuario estiver logado, não permite acessar a pagina de login da empresa
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado');
  }
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


// ==============================

router.get('/redirecionamento', (req, res) => {
  res.render('pages/redirecionamento');
});

// ==========PERFIS=================

  router.get('/perfil-usuario', usuarioController.perfil);

  router.post('/usuario/atualizar', usuarioController.atualizarPerfil);

  // Visualizar perfil empresa 
  router.get('/perfil-empresa', empresaController.perfilEmpresa);
  // Atualizar perfil empresa
  router.post('/empresa/atualizar', empresaController.atualizarPerfilEmpresa);

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

// CARRINHO
router.get("/addItem", function (req, res) {
  carrinhoController.addItem(req, res);
});

router.get("/removeItem", function (req, res) {
  carrinhoController.removeItem(req, res);
});

router.get("/excluirItem", function (req, res) {
  carrinhoController.excluirItem(req, res);
});

router.get("/carrinho", verificarUsuAutenticado, function (req, res) {
  carrinhoController.listarcarrinho(req, res);
});

module.exports = router;
