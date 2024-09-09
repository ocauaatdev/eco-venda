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

// ======== CARRINHO ============
// router.get('/carrinho', (req, res) => {
//   const cart = req.session.cart || [];
//   res.render('pages/carrinho', { cart, query: req.query, autenticado: req.session.autenticado });
// });
router.get('/carrinho', (req, res) => {
  const cart = req.session.cart || [];

  // Calcula o preço total
  const precoTotal = cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);

  res.render('pages/carrinho', { cart, precoTotal, query: req.query, autenticado: req.session.autenticado });
});

router.post('/add-to-cart', (req, res) => {
  const produto = req.body;
  
  if (!req.session.cart) {
      req.session.cart = [];
  }

  // Adiciona o produto ao carrinhoz
  req.session.cart.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      quantidade: 1, // Valor inicial de quantidade
      tamanho: produto.tamanho
  });

  res.json({ success: true, message: "Produto adicionado ao carrinho!" });
});

router.get('/cart-item-count', (req, res) => {
  const cart = req.session.cart || [];
  const itemCount = cart.reduce((count, item) => count + item.quantidade, 0);
  res.json({ count: itemCount });
});

// Rota para atualizar a quantidade de um item no carrinho
router.post('/atualizar-quantidade', (req, res) => {
  const { id, acao } = req.body;
  const cart = req.session.cart || [];

  const produto = cart.find(item => item.id === id);

  if (produto) {
    if (acao === 'aumentar') {
      produto.quantidade += 1;
    } else if (acao === 'diminuir' && produto.quantidade > 1) {
      produto.quantidade -= 1;
    }
  }

  req.session.cart = cart; // Atualiza a sessão
  res.json({ success: true });
});

// Rota para excluir um produto do carrinho
router.post('/excluir-produto', (req, res) => {
  const { id } = req.body;
  let cart = req.session.cart || [];

  cart = cart.filter(item => item.id !== id);

  req.session.cart = cart; // Atualiza a sessão
  res.json({ success: true });
});

// Rota para esvaziar o carrinho quando a aba é fechada
// SÓ ESTÁ FUNCIONANDO NA PAGINA carrinho.ejs
router.post('/esvaziar-carrinho', (req, res) => {
  req.session.cart = []; // Limpa o carrinho
  res.json({ success: true, message: "Carrinho esvaziado com sucesso!" });
});

// ==============================

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
