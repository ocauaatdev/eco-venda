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

  atualizarEstoqueProduto: async (idProduto, quantidadeComprada) => {
    try {
      // Busca o produto pelo ID e verifica a quantidade atual em estoque
      const [produto] = await produtosModel.findById(idProduto);
      if (!produto) throw new Error("Produto não encontrado");

      // Calcula a nova quantidade em estoque
      const novaQuantidadeEstoque = produto.qtdeEstoque - quantidadeComprada;

      // Garante que a quantidade de estoque não fique negativa
      if (novaQuantidadeEstoque < 0) {
        throw new Error("Estoque insuficiente para a quantidade comprada");
      }

      novaQuantidadeEstoque = Math.max(novaQuantidadeEstoque, 0);

      // Atualiza a quantidade em estoque no banco de dados
      await produtosModel.updateEstoque(idProduto, novaQuantidadeEstoque);
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error.message);
      throw error;
    }
  },

  finalizarCompra: async (req, res) => {
    const carrinho = req.session.carrinho || [];
  
    try {
      // Atualiza o estoque para cada item no carrinho
      for (const item of carrinho) {
        await produtosController.atualizarEstoqueProduto(item.codproduto, item.qtde);
      }
  
      // Limpa o carrinho após a compra
      req.session.carrinho = [];
    } catch (error) {
      console.error("Erro ao finalizar compra:", error.message);
      res.status(500).send("Erro ao processar a compra. Tente novamente.");
    }
  },

  verificarEstoque: async (idProduto, quantidadeDesejada) => {
    const [produto] = await produtosModel.findById(idProduto);
    return produto && produto.qtdeEstoque >= quantidadeDesejada;
  },
  

};

module.exports = produtosController;
