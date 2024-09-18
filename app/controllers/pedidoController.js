const pedidoModel  = require("../models/pedidoModel");
const moment = require("moment")

const pedidoController = {

    gravarPedido: async (req, res) => {
        try {
            const carrinho = req.session.carrinho;
            const camposJsonPedido = {
                data_pedido: moment().format("YYYY-MM-DD"),
                clientes_idClientes: req.session.autenticado.id,
                statusPedido: 1,
                status_pagamento: req.query.status,
                id_pagamento: req.query.payment_id
            }
            var create = await pedidoModel.createPedido(camposJsonPedido);
            console.log(create);
            carrinho.forEach(async element => {
                camposJsonItemPedido = {
                    pedidos_idPedidos: create.insertId,
                    produtos_das_empresas_idProd: element.codproduto,
                    qtde: element.qtde
                }
                await pedidoModel.createItemPedido(camposJsonItemPedido);
            });
            req.session.carrinho = [];
            res.redirect("/");
        } catch (e) {
            console.log(e);
        }
    }
    
}

module.exports = {pedidoController}