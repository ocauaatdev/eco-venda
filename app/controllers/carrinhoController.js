const { carrinho } = require("../util/carrinho");
const clientesModel = require("../models/usuarioModel");  // Certifique-se de usar o caminho correto
const cuponsModel = require('../models/cuponsModel')
const produtosModel = require("../models/produtosModel");

const carrinhoController = {
    aplicarCupom: async (req, res) => {
        try {
            let carrinho = req.session.carrinho; 
            // Garante que o carrinho é um array, mesmo se não estiver definido
            if (!carrinho) {
                carrinho = [];
                req.session.carrinho = carrinho; // Inicializa o carrinho vazio na sessão
            }
    
            // Salva o código do cupom na sessão
            const codigoCupom = req.body.cupom;
    
            if (carrinho.length === 0) {
                return res.render("pages/carrinho", {
                    autenticado: req.session.autenticado,
                    carrinho: req.session.carrinho,
                    listaErros: ["Carrinho está vazio"],
                    qtdItensCarrinho: 0
                });
            }
    
            // Busca o cupom no banco de dados
            const cupom = await cuponsModel.findByCodigo(codigoCupom);
    
            if (!cupom) {
                return res.render("pages/carrinho", {
                    autenticado: req.session.autenticado,
                    endereco: req.session.endereco,
                    carrinho: req.session.carrinho,
                    listaErros: ["Cupom inválido ou expirado"],
                    qtdItensCarrinho: carrinho.length
                });
            }
            carrinho.forEach(item => {
                console.log(`categoria: ${item.categoriaProd}`)
            });
            
            // Verifica se há produtos no carrinho com a mesma categoria do cupom
            const categoriaCupom = cupom.categoriaCupom;
            const temProdutoDaMesmaCategoria = carrinho.some(item => {
                console.log(`Categoria do produto: ${item.categoriaProd}, Categoria do cupom: ${categoriaCupom}`);
                return item.categoriaProd === categoriaCupom; // Verifica se a categoria do produto no carrinho é igual à do cupom
            });
    
            if (!temProdutoDaMesmaCategoria) {
                return res.render("pages/carrinho", {
                    autenticado: req.session.autenticado,
                    endereco: req.session.endereco,
                    carrinho: req.session.carrinho,
                    listaErros: ["Não há produtos da mesma categoria do cupom."],
                    qtdItensCarrinho: carrinho.length
                });
            }
    
            // Calcula o total do carrinho
            const totalCarrinho = carrinho.reduce((total, item) => total + (item.qtde * item.preco), 0);
            let desconto = 0;
    
            if (cupom && typeof cupom.tipoCupom === "number" && typeof cupom.descontoCupons === "string") {
                const valorDesconto = parseFloat(cupom.descontoCupons);
    
                if (cupom.tipoCupom === 1) {
                    desconto = totalCarrinho * (valorDesconto / 100);
                } else if (cupom.tipoCupom === 2) {
                    desconto = valorDesconto;
                }
            }
    
            const totalComDesconto = Math.max(totalCarrinho - desconto, 0);
    
            req.session.totalComDesconto = totalComDesconto;
            req.session.cupomAplicado = {
                codigo: cupom.nomeCupom,
                desconto: desconto,
                categoria: cupom.categoriaCupom
            };
            console.log("Cupom salvo na sessão:", req.session.cupomAplicado);
    
            res.render("pages/carrinho", {
                autenticado: req.session.autenticado,
                carrinho: req.session.carrinho,
                listaErros: null,
                endereco: req.session.endereco,
                qtdItensCarrinho: carrinho.length,
                totalCarrinho: totalCarrinho,
                totalComDesconto: req.session.totalComDesconto ? req.session.totalComDesconto.toFixed(2) : '0.00',
                cupom: cupom.nomeCupom
            });
    
        } catch (error) {
            console.error(error);
            res.render("pages/carrinho", {
                autenticado: req.session.autenticado,
                carrinho: req.session.carrinho,
                listaErros: ["Erro ao aplicar o cupom. Tente novamente mais tarde."],
                qtdItensCarrinho: carrinho.length
            });
        }
    
    },

    addItem: async (req, res) => {
        try {
            let id = req.query.id;
            let preco = req.query.preco;
            let redirectToCart = req.query.redirect === 'true'; // Verifica se o redirecionamento foi solicitado
    
            await carrinho.addItem(id, 1, preco);
            carrinho.atualizarCarrinho(req);
            res.locals.qtdItensCarrinho = carrinho.getQtdeItens();  // Atualiza a quantidade de itens
    
            // Redireciona para a página do carrinho se 'redirect=true', caso contrário, redireciona para a página anterior
            if (redirectToCart) {
                res.redirect('/carrinho');
            } else {
                let referer = req.get('Referer') || '/';
                res.redirect(referer);
            }
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
            
            res.redirect("/carrinho");
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
            
            res.redirect("/carrinho");
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