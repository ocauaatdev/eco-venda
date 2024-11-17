const { carrinho } = require("../util/carrinho");
const clientesModel = require("../models/usuarioModel");  // Certifique-se de usar o caminho correto
const cuponsModel = require('../models/cuponsModel')
const produtosModel = require("../models/produtosModel");
const produtosController = require("../controllers/produtosController");

const carrinhoController = {
    aplicarCupom: async (req, res) => {
        try {
            let carrinho = req.session.carrinho;
            const userId = req.session.autenticado ? req.session.autenticado.id : null; 
            // Garante que o carrinho é um array, mesmo se não estiver definido
            if (!carrinho) {
                carrinho = [];
                req.session.carrinho = carrinho; // Inicializa o carrinho vazio na sessão
            }
    
            // Salva o código do cupom na sessão
            const cuponsExpirados = await cuponsModel.getCuponsExpirados();

        if (cuponsExpirados.length > 0) {
            // Para cada cupom expirado, atualiza o status para "expirado"
            for (const cupom of cuponsExpirados) {
                await cuponsModel.updateStatus(cupom.idCupons, 'expirado');
                console.log(`Cupom com ID ${cupom.idCupons} foi marcado como expirado.`);
            }
        }

        // Lógica para aplicar o cupom no carrinho
        const codigoCupom = req.body.cupom;

        const cupom = await cuponsModel.findByCodigo(codigoCupom);
        if (cupom && cupom.statusCupom === 'expirado') {
            return res.redirect('/aplicar-cupom?erro=expirado');
        } else if (!cupom) {
            // Redireciona ou retorna uma resposta caso o cupom não seja encontrado
            return res.redirect('/aplicar-cupom?erro=invalido');
        }
    
            if (!cupom) {
                return res.render("pages/carrinho", {
                    autenticado: req.session.autenticado,
                    endereco: req.session.endereco,
                    carrinho: req.session.carrinho,
                    listaErros: ["Cupom inválido ou expirado"],
                    qtdItensCarrinho: carrinho.length
                });
            }

            const cupomUsado = await cuponsModel.verificarCupomUsado(userId, codigoCupom);
            if (cupomUsado) {
                return res.render("pages/carrinho", {
                    autenticado: req.session.autenticado,
                    endereco: req.session.endereco,
                    carrinho: req.session.carrinho,
                    listaErros: ["Cupom já utilizado anteriormente"],
                    qtdItensCarrinho: carrinho.length
                });
            }
            

            // Verifica se há produtos no carrinho com a mesma categoria do cupom
            const categoriaCupom = cupom.categoriaCupom;
            const temProdutoDaMesmaCategoria = carrinho.some(item => {
                
                return item.categoriaProd === categoriaCupom; // Verifica se a categoria do produto no carrinho é igual à do cupom
            });
    
            if (!temProdutoDaMesmaCategoria) {
                console.log("Não há produtos da mesma categoria do cupom.")
                return res.redirect('/aplicar-cupom?erro=categoria')
            }
    
            // Calcula o total do carrinho
            const totalCarrinho = carrinho.reduce((total, item) => total + (item.qtde * item.preco), 0);
            let desconto = 0;
            req.session.carrinho.total = totalCarrinho 
            req.session.carrinho.totalComDesconto = 0;
    
            if (cupom && typeof cupom.tipoCupom === "number" && typeof cupom.descontoCupons === "string") {
                const valorDesconto = parseFloat(cupom.descontoCupons);
    
                if (cupom.tipoCupom === 1) {
                    desconto = totalCarrinho * (valorDesconto / 100);
                } else if (cupom.tipoCupom === 2) {
                    desconto = valorDesconto;
                }

                req.session.carrinho.totalComDesconto = Math.max(totalCarrinho - desconto, 0);
            }
    
            console.log("Valor total salvo na sessão:", req.session.carrinho.totalComDesconto);
            console.log(req.session.carrinho)

            
    
            
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
                desconto: desconto,
                endereco: req.session.endereco,
                qtdItensCarrinho: carrinho.length,
                cupom: cupom.nomeCupom,
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
    
            // Obtém a quantidade atual do item no carrinho
            const quantidadeAtual = req.session.carrinho.find(item => item.codproduto === id)?.qtde || 0;
            const novaQuantidade = quantidadeAtual + 1;
    
            // Verifica o estoque disponível antes de adicionar ao carrinho
            const estoqueDisponivel = await produtosController.verificarEstoque(id, novaQuantidade);
            if (!estoqueDisponivel) {
                // Retorna uma mensagem de erro se o estoque for insuficiente
                return res.status(400).json({ error: "Estoque insuficiente." });
            }
    
            // Adiciona o item ao carrinho somente se houver estoque
            await carrinho.addItem(id, 1, preco);
    
            // Atualiza o carrinho e a quantidade total de itens na sessão
            carrinho.atualizarCarrinho(req);
            res.locals.qtdItensCarrinho = carrinho.getQtdeItens();
    
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
            carrinho.atualizarCarrinho(req);
            
            const totalCarrinho = req.session.carrinho.reduce((total, item) => {
                return total + (item.qtde * item.preco);
            }, 0);
            
            req.session.carrinho.total = totalCarrinho;
    
            res.render("pages/carrinho", {
                autenticado: req.session.autenticado,
                carrinho: req.session.carrinho,
                listaErros: null,
                qtdItensCarrinho: carrinho.getQtdeItens(),
                total: totalCarrinho,
                totalComDesconto: req.session.carrinho.totalComDesconto || null,
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
            });
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
                    numeroCliente: cliente.numeroCliente,
                    complementoCliente: cliente.complementoCliente
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