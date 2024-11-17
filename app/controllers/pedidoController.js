const pedidoModel  = require("../models/pedidoModel");
const { carrinho } = require("../util/carrinho");
const rastreioModel = require('../models/rastreioModel');  // Importando o modelo de rastreio
const moment = require("moment");
const cuponsModel = require('../models/cuponsModel')
const notificacaoModel = require("../models/notificacaoModel");

const pedidoController = {

    gravarPedido: async (req, res) => {
        try {
            // Verifica o status do pagamento
        const statusPagamento = req.query.status;
        const userId = req.session.autenticado ? req.session.autenticado.id : null;

        // Apenas continua se o status do pagamento for aprovado
        if (statusPagamento !== 'approved') {
            return res.redirect("/"); // Redireciona para a página inicial ou outra página apropriada para falha/pendência
        }
        
            const carrinhoSession = req.session.carrinho;
    
            if (!carrinhoSession || carrinhoSession.length === 0) {
                return res.redirect("/carrinho");
            }
    
            const cupomAplicado = req.session.cupomAplicado;
            let desconto = 0;
            
            console.log("Código do cupom: ", cupomAplicado.codigo);

            if (cupomAplicado) {
                await cuponsModel.marcarCupomComoUsado(userId, cupomAplicado.codigo);
            }

            if (cupomAplicado && typeof cupomAplicado.desconto === 'number') {
                desconto = cupomAplicado.desconto;
            }
    
            // Calcula o total sem desconto
            const totalSemDesconto = carrinhoSession.reduce((acc, item) => acc + (item.preco * item.qtde), 0);
    
            // Calcula o total dos produtos elegíveis ao desconto
            const totalProdutosDesconto = carrinhoSession.reduce((acc, item) => {
                if (item.categoriaProd === cupomAplicado?.categoria) {
                    return acc + (item.preco * item.qtde);
                }
                return acc;
            }, 0);
    
            // Define os dados do pedido para salvar no banco de dados
            const camposJsonPedido = {
                data_pedido: moment().format("YYYY-MM-DD"),
                clientes_idClientes: req.session.autenticado.id,
                statusPedido: 1,
                total_pedido: Math.max(totalSemDesconto - desconto, 0).toFixed(2),
                status_pagamento: req.query.status,
                id_pagamento: req.query.payment_id,
                local_entrega: req.session.endereco ? JSON.stringify({
                    cep: req.session.endereco.cep || req.session.autenticado.cepCliente,
                    logradouro: req.session.endereco.logradouro || req.session.autenticado.logradouroCliente,
                    bairro: req.session.endereco.bairro || req.session.autenticado.bairroCliente,
                    cidade: req.session.endereco.cidade || req.session.autenticado.cidadeCliente,
                    uf: req.session.endereco.uf || req.session.autenticado.ufCliente,
                    numeroCliente: req.session.endereco.numeroCliente || req.session.autenticado.numeroCliente,
                    complementoCliente: req.session.endereco.complementoCliente || req.session.autenticado.complementoCliente
                }) : null
            };
    
            const create = await pedidoModel.createPedido(camposJsonPedido);
    
            // Salva cada item do pedido com o desconto proporcional, se aplicável
            for (const element of carrinhoSession) {
                let subtotalComDesconto = element.preco * element.qtde;
    
                // Aplica o desconto proporcional ao subtotal dos produtos elegíveis
                if (cupomAplicado && element.categoriaProd === cupomAplicado.categoria && totalProdutosDesconto > 0) {
                    const proporcaoDesconto = (element.preco * element.qtde) / totalProdutosDesconto;
                    subtotalComDesconto -= desconto * proporcaoDesconto;
                }
    
                const camposJsonItemPedido = {
                    pedidos_idPedidos: create.insertId,
                    produtos_das_empresas_idProd: element.codproduto,
                    qtde: element.qtde,
                    subtotal: subtotalComDesconto.toFixed(2),
                    tamanho_itemPedido: element.tamanho || 'Sem tamanho específico'
                };
    
                await pedidoModel.createItemPedido(camposJsonItemPedido);
    
                // Atualiza o estoque do produto
                const estoqueAtualizado = await pedidoModel.atualizarEstoque(element.codproduto, element.qtde);
                if (!estoqueAtualizado) {
                    console.log(`Estoque insuficiente para o produto com ID ${element.codproduto}`);
                }
            }
    
            await notificacaoModel.criarNotificacaoCompra(req.session.autenticado.id, "Sua compra foi realizada com sucesso!");
    
            // Limpa o cupom aplicado e o desconto após a conclusão do pedido
            delete req.session.cupomAplicado;
            delete req.session.carrinho.totalComDesconto;

            //Limpa o carrinho
            carrinho.limparCarrinho(req);
            res.redirect("/");
        } catch (e) {
            console.log(e);
        }
    },
    // Método para visualizar os produtos vendidos pela empresa
visualizarItensPedido: async (req, res) => {
    try {
        const { pedidoId } = req.params;
        const empresaId = req.session.autenticado.id;

        // Busca os itens do pedido
        const itensPedido = await pedidoModel.findItensByPedidoAndEmpresa(pedidoId, empresaId);

        // Busca o código de rastreio e o histórico
        const rastreio = await rastreioModel.findRastreioByPedidoAndEmpresa(pedidoId, empresaId);
        const historicoRastreios = await rastreioModel.findAllRastreiosByPedidoAndEmpresa(pedidoId, empresaId);

        // Busca todos os status dos rastreios relacionados ao pedido
        const statusRastreios = await rastreioModel.findAllStatusByPedidoAndEmpresa(pedidoId, empresaId);

        // Verifica se algum status é "Pedido Entregue" (ocorrencias_rastreio_idocorrencias_rastreio === 3)
        const pedidoEntregue = statusRastreios.some(status => status.ocorrencias_rastreio_idocorrencias_rastreio === 3);

        res.json({ itensPedido, rastreio, historicoRastreios, pedidoEntregue });
    } catch (error) {
        console.error("Erro ao buscar itens do pedido:", error);
        res.status(500).json({ error: "Erro ao buscar itens do pedido" });
    }
},

    // Método para atualizar o rastreio e ocorrências do pedido
atualizarPedido: async (req, res) => {
    try {
        const { idPedido, codigo_rastreio, andamentoPedido } = req.body;
        console.log("Dados recebidos no formulário:", req.body);

        const empresaId = req.session.autenticado.id;

        // Captura a data e horário atual no momento da notificação
        const dataOcorrencia = moment().format('YYYY-MM-DD HH:mm:ss');

        const rastreioData = {
            codigo_rastreio,
            dataocorrencia: dataOcorrencia,
            ocorrencias_rastreio_idocorrencias_rastreio: andamentoPedido,
            pedidos_idPedidos: idPedido,
            empresas_idEmpresas: empresaId
        };

        await rastreioModel.updateRastreio(rastreioData);
        
        // Buscar o ID do cliente associado ao pedido
        const pedido = await pedidoModel.findClienteId(idPedido);
        const clienteId = pedido.Clientes_idClientes;

        // Criar a mensagem de notificação
        const mensagem = `A empresa (ID ${empresaId}) atualizou o pedido ${idPedido}.`;

        // Inserir notificação no banco de dados
        await notificacaoModel.criarNotificacaoPedido({
            pedidos_idPedidos: idPedido,
            empresas_idEmpresas: empresaId,
            Clientes_idClientes: clienteId,
            mensagem
        });

        // Redireciona após atualizar
        res.redirect('/perfil-empresa');
    } catch (error) {
        console.error("Erro ao atualizar o pedido:", error);
        res.status(500).send("Erro ao atualizar o pedido");
    }
},
// Método para listar pedidos do usuário com filtro de data
listarPedidosUsuario: async (req, res) => {
    try {
        const clienteId = req.session.autenticado.id;
        const filtro = req.query.filtro || 'recente'; // Padrão para "recente" se não houver filtro
        
        const pedidos = await pedidoModel.findPedidosByCliente(clienteId, filtro);
        
        res.render('perfil-usuario', {
            pedidos,
            moment
        });
    } catch (error) {
        console.error("Erro ao buscar pedidos do usuário:", error);
        res.status(500).send("Erro ao buscar pedidos.");
    }
},
// Método para listar pedidos do usuário com filtro de data
listarPedidosEmpresa: async (req, res) => {
    try {
        const empresaId = req.session.autenticado.id;
        const filtro = req.query.filtro || 'recente'; // Padrão para "recente" se não houver filtro
        
        // Chame a função do modelo, passando o filtro de ordenação
        const pedidos = await pedidoModel.findPedidosByEmpresa(empresaId, filtro);
        
        res.render('perfil-empresa', {
            pedidos,
            moment
        });
    } catch (error) {
        console.error("Erro ao buscar pedidos da empresa:", error);
        res.status(500).send("Erro ao buscar pedidos.");
    }
}
    
    
}

module.exports = { pedidoController };
