var express = require("express");
var router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const empresaController = require("../controllers/empresaController");
const { verificarUsuAutenticado, limparSessao, gravarUsuAutenticado, verificarUsuAutorizado } = require("../models/autenticador");


// Rotas de páginas
router.get('/', (req, res) => {
  res.render('pages/home-page', { query: req.query });
});

router.get('/home-page', (req, res) => {
  res.render('pages/home-page');
});

router.get('/ecopremium', (req, res) => {
  res.render('pages/ecopremium');
});

router.get('/catalogo', (req, res) => {
  res.render('pages/catalogo');
});

router.get('/cadastro', (req, res) => {
  const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão, se existirem
  req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los
  res.render('pages/cadastro', { listaErros: [], valores });
});

// Rotas de cadastro e login de usuário
router.get('/cadastro', (req, res) => {
res.render('pages/cadastro', { listaErros: [], query: req.query });
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
  usuarioController.regrasValidacaoFormLogin,
  async (req, res) => {
      usuarioController.logar(req, res);
  });

  router.get('/cadastro-empresa', (req, res) => {
    const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão, se existirem
    req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los
    res.render('pages/cadastro-empresa', { listaErros: [], valores });
  });
// Rotas de cadastro e login de empresa
router.get('/cadastro-empresa', (req, res) => {
  res.render('pages/cadastro-empresa', { listaErros: null, valores: { empresa: '', e_mail: '', senha: '', telefone: '', cnpj: '', cep: '', confirm_senha: '' } });
});

router.post('/cadastro-empresa',
  empresaController.regrasValidacaoFormCad,
  async (req, res) => {
      empresaController.cadastrar(req, res);
  });

  router.get('/carrinho', (req, res) => {
    res.render('pages/carrinho');
  });

  router.get('/redirecionamento', (req, res) => {
    res.render('pages/redirecionamento');
  });
  
  router.get('/perfil-usuario', (req, res) => {
    res.render('pages/perfil-usuario');
  });
module.exports = router;
