const produtosModel = require("../models/produtosModel");

const carrinho = {
    itensCarrinho: [],

    atualizarCarrinho: (req) => {
        req.session.carrinho = carrinho.itensCarrinho;
    },

    removeItem: (codItem, qtde) => {
        try {
            let indice = carrinho.itensCarrinho.findIndex(
                (element) => element.codproduto === codItem);
            if (indice !== -1) {
                carrinho.itensCarrinho[indice].qtde -= qtde;
                if (carrinho.itensCarrinho[indice].qtde <= 0) {
                    carrinho.itensCarrinho.splice(indice, 1);
                }
            }
        } catch (error) {
            console.error(error);
        }
    },

    excluirItem: (codItem) => {
        try {
            let indice = carrinho.itensCarrinho.findIndex(
                (element) => element.codproduto === codItem);
            if (indice !== -1) {
                carrinho.itensCarrinho.splice(indice, 1);
            }
        } catch (error) {
            console.error(error);
        }
    },

    getQtdeItens: () => {
        return carrinho.itensCarrinho.length;
    },

    addItem: async (codItem, qtde, preco) => {
        try {
            // Verifica se o carrinho está vazio
            if (carrinho.itensCarrinho.length === 0) {
                const produtos = await produtosModel.findById(codItem);
                if (produtos.length > 0) {
                    carrinho.itensCarrinho.push({
                        "codproduto": codItem,
                        "qtde": qtde,
                        "preco": parseFloat(produtos[0].valorProd),
                        "nome_produto": produtos[0].tituloProd,
                        "imagemProduto": produtos[0].imagemProd.toString('base64'), // Converte o buffer para base64
                        "tamanhoProd": produtos[0].tamanhoProd // Adicionando tamanho ao item
                    });
                }
            } else {
                let indice = carrinho.itensCarrinho.findIndex(
                    (element) => element.codproduto === codItem);
                if (indice === -1) {
                    const produtos = await produtosModel.findById(codItem);
                    if (produtos.length > 0) {
                        carrinho.itensCarrinho.push({
                            "codproduto": codItem,
                            "qtde": qtde,
                            "preco": parseFloat(produtos[0].valorProd),
                            "nome_produto": produtos[0].tituloProd,
                            "imagemProduto": produtos[0].imagemProd.toString('base64'), // Converte o buffer para base64
                            "tamanhoProd": produtos[0].tamanhoProd // Adicionando tamanho ao item
                        });
                    }
                } else {
                    carrinho.itensCarrinho[indice].qtde += qtde;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
module.exports = { carrinho };
