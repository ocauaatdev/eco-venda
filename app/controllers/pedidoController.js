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
                total_pedido: carrinhoSession.reduce((acc, item) => acc + (item.preco * item.qtde), 0).toFixed(2), // Calculando o total do pedido
                status_pagamento: req.query.status,
                id_pagamento: req.query.payment_id
            }
            var create = await pedidoModel.createPedido(camposJsonPedido);
            console.log(create);

            carrinhoSession.forEach(async element => {
                const camposJsonItemPedido = {
                    pedidos_idPedidos: create.insertId,
                    produtos_das_empresas_idProd: element.codproduto,
                    qtde: element.qtde,
                    subtotal: (element.preco * element.qtde).toFixed(2) // Subtotal para cada item
                }
                await pedidoModel.createItemPedido(camposJsonItemPedido);
            });

            // Corrigir para chamar a função corretamente
            carrinho.limparCarrinho(req);

            res.redirect("/");
        } catch (e) {
            console.log(e);
        }
    },
    
    pedidosVendidosPorEmpresa: async (req, res) => {
        try {
            const idEmpresa = req.session.autenticado.id; // Assumindo que o id da empresa está na sessão
    
            const pedidosVendidos = await pedidoModel.findPedidosPorEmpresa(idEmpresa);
    
            // Buscar todas as ocorrências relacionadas a cada pedido
            for (let pedido of pedidosVendidos) {
                const ocorrencias = await rastreioModel.buscarOcorrenciasPorPedido(pedido.idPedidos);
                pedido.ocorrencias = ocorrencias.length > 0 ? ocorrencias : []; // Garante que sempre haja um array
            }
    
            res.render("perfil-empresa", {
                Empresa: req.session.autenticado,
                pedidos: pedidosVendidos,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send("Erro ao buscar pedidos");
        }
    },

    atualizarPedido: async (req, res) => {
        const { idPedido, andamentoPedido, dataOcorrencia, codigoRastreio } = req.body;
    
        try {
            // Se o código de rastreio já estiver presente, não permitir alterar
            const pedidoExistente = await pedidoModel.findId(idPedido);
            if (!pedidoExistente.codigorastreio) {
                await rastreioModel.atualizarRastreio(idPedido, andamentoPedido, dataOcorrencia, codigoRastreio);
            } else {
                // Atualizar apenas a ocorrência, sem o código de rastreio
                await rastreioModel.atualizarRastreio(idPedido, andamentoPedido, dataOcorrencia, null);
            }
    
            res.redirect('/perfil-empresa'); // Redirecionar de volta após sucesso
        } catch (error) {
            console.log(error);
            res.status(500).send("Erro ao atualizar o pedido.");
        }
    },
    buscarOcorrencias: async (req, res) => {
        try {
            const idPedido = req.params.idPedido;
            const ocorrencias = await rastreioModel.buscarOcorrenciasPorPedido(idPedido);
            res.json(ocorrencias); // Retornar as ocorrências em formato JSON
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Erro ao buscar ocorrências' });
        }
    },
}

module.exports = { pedidoController };
