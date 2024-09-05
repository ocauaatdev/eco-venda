const { body, validationResult } = require('express-validator');
const produtosModel = require("../models/produtosModel");

const produtosController = {
  regrasValidacaoFormProd: [
    // Adicione aqui as validações necessárias para o formulário de produto.
  ],

  cadastrarProduto: async (req, res) => {
    const erros = validationResult(req);
    
    // Prepara os dados do formulário para o banco de dados
    var dadosForm = {
      tituloProd: req.body.produtoNome,
      descricaoProd: req.body.descricaoProduto,
      valorProd: req.body.precoProduto,
      qtdeEstoque: req.body.qtdeEstoque,
      tamanhoProd: req.body.tamanhoProduto,
      Categorias_idCategorias: req.body.Categorias_idCategorias,
      Empresas_idEmpresas: req.session.autenticado.id,
      imagemProd: req.file ? req.file.buffer : null, // A imagem é capturada do req.file
    };

    // Se houver erros de validação, renderiza novamente o formulário com erros
    if (!erros.isEmpty()) {
      return res.render("pages/cadastro-produto", { listaErros: erros.array(), valores: req.body });
    }

    try {
      // Insere o produto no banco de dados
      let create = await produtosModel.create(dadosForm);
      console.log('Cadastro bem-sucedido:', create);
      res.redirect("/");
    } catch (e) {
      console.log('Erro no cadastro:', e.message);
      res.render("pages/cadastro-produto", { listaErros: [{ msg: e.message }], valores: req.body });
    }
  },

  listarProdutos: async (req, res) => {
    try {
      const results = await produtosModel.findAll();
  
      // Converte a imagem BLOB para Base64
      results.forEach((produto) => {
        if (produto.imagemProd) {
          produto.imagemProd = `data:image/png;base64,${produto.imagemProd.toString('base64')}`;
        }
      });
  
      res.render("pages/catalogo", { listarProdutos: results });
    } catch (e) {
      console.log(e);
      res.json({ erro: "Falha ao acessar dados" });
    }
  },
};

module.exports = produtosController;
