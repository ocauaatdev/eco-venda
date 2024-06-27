var express = require("express");
var router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const empresaController = require("../controllers/empresaController");
const { verificarUsuAutenticado, limparSessao, gravarUsuAutenticado, verificarUsuAutorizado } = require("../models/autenticador");


router.get('/login', (req, res) => {
  res.render('pages/login', { query: req.query });
});

// Rota para a página principal
router.get('/', (req, res) => {
  res.render('pages/home-page', { query: req.query });
});

router.get("/", function (req, res) {
res.render('pages/home-page')
});

router.get('/home-page',function(req,res){
    res.render('pages/home-page')
})

router.get('/ecopremium',function(req,res){
    res.render('pages/ecopremium')
})
router.get('/catalogo',function(req,res){
    res.render('pages/catalogo')
})

// =======Cadastro e Login Usuario =========
router.get("/cadastro", function (req, res) {
  res.render("pages/cadastro", { listaErros: null, valores: { usuario: "", usuario: "", e_mail: "", senha: "",telefone:"", cpf:"", nascimento:"", cep:"", confirm_senha:"" } });
});

router.post("/cadastro",
  usuarioController.regrasValidacaoFormCad,
  async function (req, res) {
    usuarioController.cadastrar(req, res);
  });

router.get('/login',function(req,res){
    res.render('pages/login')
})

router.post(
  "/login",
  usuarioController.regrasValidacaoFormLogin,
  gravarUsuAutenticado,
  function (req, res) {
    usuarioController.logar(req, res);
  });
// =======Cadastro e Login Usuario =========

// =======Cadastro e Login Empresa =========
router.get("/cadastro-empresa",function(req,res){
  res.render("pages/cadastro-empresa", {listaErros: null, valores: {empresa:"",empresa:"",e_mail:"",senha:"",telefone:"",cnpj:"",cep:"",confirm_senha:""}})
});

router.post("/cadastro-empresa",
  empresaController.regrasValidacaoFormCad,
  async function(req,res){
    empresaController.cadastrar(req,res);
  }
);
// =======Cadastro e Login Empresa =========

module.exports = router;
