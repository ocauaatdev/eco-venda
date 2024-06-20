var express = require("express");
var router = express.Router();
const usuarioController = require('../controllers/usuarioController')
var pool = require("../../config/pool-conexoes");


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
router.get('/cadastro-empresa',function(req,res){
  res.render('pages/cadastro-empresa')
})

module.exports = router;
