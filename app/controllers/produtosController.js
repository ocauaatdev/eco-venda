const { body, validationResult } = require('express-validator');
const produtosModel = require("../models/produtosModel");
const solicitacoesProdutoModel = require('../models/solicitacoesProdutoModel');

const produtosController = {
  regrasValidacaoFormProd: [
    
  ],

  cadastrarProduto: async (req, res) => {
    const erros = validationResult(req);

    var dadosForm = {
        tituloProd: req.body.produtoNome,
        descricaoProd: req.body.descricaoProduto,
        valorProd: req.body.precoProduto,
        qtdeEstoque: req.body.qtdeEstoque,
        tamanhoProd: req.body.tamanhoProduto,
        Categorias_idCategorias: req.body.Categorias_idCategorias,
        Empresas_idEmpresas: req.session.autenticado.id,
        imagemProd: req.file ? req.file.buffer : null
    };

    if (!erros.isEmpty()) {
        return res.render("pages/cadastro-produto", { listaErros: erros.array(), valores: req.body });
    }

    try {
        let create = await solicitacoesProdutoModel.create(dadosForm);
        console.log('Solicitação de produto enviada para aprovação:', create);
        res.redirect("/");
    } catch (e) {
        console.log('Erro no cadastro:', e.message);

        // Se o erro for relacionado ao tamanho da imagem, renderize com uma mensagem apropriada
        let errorMessage = e.message.includes("Data too long for column 'imagemProd'") 
            ? 'A imagem enviada é muito grande. Tente enviar uma imagem menor.' 
            : e.message;

        res.render("pages/cadastro-produto", { listaErros: [{ msg: errorMessage }], valores: req.body, errorMessage });
    }
},

  listarProdutos: async (req, res) => {
    try {
      const categoria = req.query.categoria;
      let results;

      // Verifica se foi passada uma categoria
      if (categoria) {
        results = await produtosModel.findByCategoria(categoria);
      } else {
        results = await produtosModel.findAll();
      }

      // Transforma o buffer de imagem em base64 para exibição
      results.forEach((produto) => {
        if (produto.imagemProd) {
          produto.imagemProd = `data:image/png;base64,${produto.imagemProd.toString('base64')}`;
        }
      });

      // Define qual página será renderizada com base na rota acessada
      const pagina = req.route.path === '/home-page' || req.route.path === '/' ? 'pages/home-page' : 'pages/catalogo';

      // Renderiza a página com os produtos e status de autenticação
      res.render(pagina, { listarProdutos: results, autenticado: req.session.autenticado });
    } catch (e) {
      console.error('Erro ao listar produtos:', e);
      res.json({ erro: "Falha ao acessar dados" });
    }
  },
  exibirProduto: async (req, res) => {
    const idProd = req.params.idProd;

    try {
      const [produto] = await produtosModel.findById(idProd);

      if (produto) {
        // Converte a imagem BLOB para Base64
        if (produto.imagemProd) {
          produto.imagemProd = `data:image/png;base64,${produto.imagemProd.toString('base64')}`;
        }
        res.render("pages/individual-produto", { produto,autenticado: req.session.autenticado });
      } else {
        res.status(404).render("pages/404", { mensagem: "Produto não encontrado." });
      }
    } catch (e) {
      console.log(e);
      res.status(500).render("pages/500", { mensagem: "Erro ao carregar o produto." });
    }
  },
};

module.exports = produtosController;
