const pedidoModel  = require("../models/pedidoModel");
const { carrinho } = require("../util/carrinho");
const rastreioModel = require('../models/rastreioModel');  // Importando o modelo de rastreio
const moment = require("moment");
const cuponsModel = require('../models/cuponsModel')
const notificacaoModel = require("../models/notificacaoModel");

const pedidoController = {

    gravarPedido: async (req, res) => {
        try {
            const carrinhoSession = req.session.carrinho;
            console.log('Sessão do carrinho:', carrinhoSession);
    
            // Verifica se o carrinho está vazio
            if (!carrinhoSession || carrinhoSession.length === 0) {
                return res.redirect("/carrinho"); // Redireciona o usuário para o carrinho se não houver itens
            }
    
            // Verifica se há um cupom aplicado na sessão
            const cupomAplicado = req.session.cupomAplicado;
            let desconto = 0;
    
            // Se houver um cupom, define o valor do desconto
            if (cupomAplicado && typeof cupomAplicado.desconto === 'number') {
                desconto = cupomAplicado.desconto;
                console.log(`Desconto aplicado: ${desconto}`);
            }
    
            // Calcula o total do pedido somando os produtos no carrinho
            const totalSemDesconto = carrinhoSession.reduce((acc, item) => acc + (item.preco * item.qtde), 0);
            console.log(`Total sem desconto: ${totalSemDesconto}`);
    
            // Calcula o total com desconto (se houver)
            const totalComDesconto = Math.max(totalSemDesconto - desconto, 0);
            console.log(`Total com desconto: ${totalComDesconto}`);
    
            // Prepara os dados do pedido
            const camposJsonPedido = {
                data_pedido: moment().format("YYYY-MM-DD"),
                clientes_idClientes: req.session.autenticado.id,
                statusPedido: 1, // Status inicial do pedido
                total_pedido: totalComDesconto.toFixed(2), // Total com desconto aplicado
                status_pagamento: req.query.status,
                id_pagamento: req.query.payment_id,
                local_entrega: req.session.endereco ? req.session.endereco.cep : null // Verifica se o endereço foi inserido
            };
    
            // Cria o pedido no banco de dados
            const create = await pedidoModel.createPedido(camposJsonPedido);
            console.log('Pedido salvo no banco de dados:', create);
    
            // Salva os itens do pedido
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

            // Adicionar notificação ao banco de dados
            const mensagemNotificacao = "Sua compra foi realizada com sucesso! Aguarde que a empresa responsável pelo produto irá enviar as ocorrências e informações de rastreio.";
            const clienteId = req.session.autenticado.id;
            await notificacaoModel.criarNotificacaoCompra(clienteId, mensagemNotificacao);
    
            // Redirecionar após o sucesso
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
