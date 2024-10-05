const { carrinho } = require("../util/carrinho");
const clientesModel = require("../models/usuarioModel");  // Certifique-se de usar o caminho correto

const carrinhoController = {

    addItem: async (req, res) => {
        try {
            let id = req.query.id;
            let preco = req.query.preco;
            await carrinho.addItem(id, 1, preco);
            carrinho.atualizarCarrinho(req);
            res.locals.qtdItensCarrinho = carrinho.getQtdeItens();  // Atualiza a quantidade de itens
    
            // Obter o referer (página anterior)
            let referer = req.get('Referer') || '/';
            
            // Redirecionar de volta para a página de onde veio a requisição
            res.redirect(referer);
        } catch (e) {
            console.log(e);
            res.render("pages/home-page", {
                listaErros: erros, 
                dadosNotificacao: {
                    titulo: "Erro ao adicionar o item!",
                    mensagem: "Tente novamente mais tarde!",
                    tipo: "error"
                }
            });
        }
    },

    removeItem: (req, res) => {
        try {
            let id = req.query.id;
            let qtde = req.query.qtde;
            carrinho.removeItem(id, qtde);
            carrinho.atualizarCarrinho(req);
            res.locals.qtdItensCarrinho = carrinho.getQtdeItens();  // Atualiza a quantidade de itens
            let caminho = req.get('Referer').split("/")[3] == ""
                ? "/"
                : "/" + req.get('Referer').split("/")[3];
            res.redirect(caminho);
        } catch (e) {
            console.log(e);
            res.render("pages/home-page", {
                listaErros: erros, 
                dadosNotificacao: {
                    titulo: "Erro ao remover o item!",
                    mensagem: "Tente novamente mais tarde!",
                    tipo: "error"
                }
            })
        }
    },

    excluirItem: (req, res) => {
        try {
            let id = req.query.id;
            carrinho.excluirItem(id);
            carrinho.atualizarCarrinho(req);
            res.locals.qtdItensCarrinho = carrinho.getQtdeItens();  // Atualiza a quantidade de itens
            let caminho = req.get('Referer').split("/")[3] == ""
                ? "/"
                : "/" + req.get('Referer').split("/")[3];
            res.redirect(caminho);
        } catch (e) {
            console.log(e);
            res.render("pages/home-page", {
                listaErros: erros, 
                dadosNotificacao: {
                    titulo: "Erro ao excluir o item!",
                    mensagem: "Tente novamente mais tarde!",
                    tipo: "error"
                }
            })
        }
    },

    listarcarrinho: (req, res) => {
        try {
            // console.log(req.session); // Adicione isso para verificar o conteúdo da sessão
            carrinho.atualizarCarrinho(req);
            res.render("pages/carrinho", {
                autenticado: req.session.autenticado,
                carrinho: req.session.carrinho,
                listaErros: null,
                qtdItensCarrinho: carrinho.getQtdeItens() // Passa a quantidade de itens para a view
            });
        } catch (e) {
            console.log(e);
            res.render("pages/carrinho", {
                autenticado: req.session.autenticado,
                carrinho: null,
                listaErros: null,
                dadosNotificacao: {
                    titulo: "Falha ao Listar Itens!",
                    mensagem: "Tente novamente mais tarde!",
                    tipo: "error"
                }
            })
        }
    },
    enderecoCliente: async (req, res) => {
        try {
            const userId = req.session.autenticado ? req.session.autenticado.id : null;
            
            if (!userId) {
                return res.render('pages/carrinho', {
                    autenticado: req.session.autenticado,
                    carrinho: req.session.carrinho,
                    endereco: null, // Nenhum endereço se o usuário não estiver autenticado
                    listaErros: null,
                });
            }

            // Buscar as informações de endereço do cliente autenticado
            const [cliente] = await clientesModel.findId(userId);

            if (cliente) {
                const endereco = {
                    cep: cliente.cepCliente,
                    logradouro: cliente.logradouroCliente,
                    bairro: cliente.bairroCliente,
                    cidade: cliente.cidadeCliente,
                    uf: cliente.ufCliente,
                };

                // Definindo o endereço na sessão
                req.session.endereco = endereco;

                res.render('pages/carrinho', {
                    autenticado: req.session.autenticado,
                    carrinho: req.session.carrinho,
                    endereco, // Passa o endereço para a view
                    listaErros: null,
                    qtdItensCarrinho: carrinho.getQtdeItens(),  // Quantidade de itens no carrinho
                });
            } else {
                // Caso não encontre o cliente
                res.render('pages/carrinho', {
                    autenticado: req.session.autenticado,
                    carrinho: req.session.carrinho,
                    endereco: null,
                    listaErros: null,
                    qtdItensCarrinho: carrinho.getQtdeItens(),
                });
            }
        } catch (error) {
            console.log(error);
            res.render("pages/carrinho", {
                autenticado: req.session.autenticado,
                carrinho: null,
                listaErros: null,
                dadosNotificacao: {
                    titulo: "Erro ao buscar o endereço!",
                    mensagem: "Tente novamente mais tarde!",
                    tipo: "error"
                }
            });
        }
    },
}

module.exports = { carrinhoController }