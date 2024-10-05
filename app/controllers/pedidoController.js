const pedidoModel  = require("../models/pedidoModel");
const { carrinho } = require("../util/carrinho");
const rastreioModel = require('../models/rastreioModel');  // Importando o modelo de rastreio
const moment = require("moment");

const pedidoController = {

    gravarPedido: async (req, res) => {
        try {
            const carrinhoSession = req.session.carrinho;
    
            const camposJsonPedido = {
                data_pedido: moment().format("YYYY-MM-DD"),
                clientes_idClientes: req.session.autenticado.id,
                statusPedido: 1,
                total_pedido: carrinhoSession.reduce((acc, item) => acc + (item.preco * item.qtde), 0).toFixed(2),
                status_pagamento: req.query.status,
                id_pagamento: req.query.payment_id,
                local_entrega: req.session.endereco ? req.session.endereco.cep : null // Verifica se o endereço existe
            };
    
            var create = await pedidoModel.createPedido(camposJsonPedido);
            console.log('Pedido no banco de dados:', create);
    
            carrinhoSession.forEach(async element => {
                const camposJsonItemPedido = {
                    pedidos_idPedidos: create.insertId,
                    produtos_das_empresas_idProd: element.codproduto,
                    qtde: element.qtde,
                    subtotal: (element.preco * element.qtde).toFixed(2),
                    tamanho_itemPedido: element.tamanho || 'Sem tamanho específico' // Pegando o tamanho da sessão
                };
    
                console.log('Salvando item do pedido:', camposJsonItemPedido);
                await pedidoModel.createItemPedido(camposJsonItemPedido);
            });
    
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
        const { idPedido, codigo_rastreio, andamentoPedido, dataOcorrencia } = req.body;
        console.log("Dados recebidos no formulário:", req.body); // Log para verificar os dados

        const empresaId = req.session.autenticado.id; // ID da empresa logada

        // Apenas atualize o rastreio e o andamento do pedido, sem tocar no total_pedido
        const rastreioData = {
            codigo_rastreio,
            dataocorrencia: dataOcorrencia,
            ocorrencias_rastreio_idocorrencias_rastreio: andamentoPedido,
            pedidos_idPedidos: idPedido,
            empresas_idEmpresas: empresaId
        };

        await rastreioModel.updateRastreio(rastreioData);
        res.redirect('/perfil-empresa');  // Redireciona após atualizar
    } catch (error) {
        console.error("Erro ao atualizar o pedido:", error);
        res.status(500).send("Erro ao atualizar o pedido");
    }
},
// Método para listar pedidos do usuário
listarPedidosUsuario: async (req, res) => {
    try {
        const clienteId = req.session.autenticado.id;  // Pegando o ID do cliente logado
        const pedidos = await pedidoModel.findPedidosWithRastreiosAndOcorrencias(clienteId);

        res.render('perfil-usuario', {
            pedidos,
            moment
        });
    } catch (error) {
        console.error("Erro ao buscar pedidos do usuário:", error);
        res.status(500).send("Erro ao buscar pedidos.");
    }
},
    
    
}

module.exports = { pedidoController };
