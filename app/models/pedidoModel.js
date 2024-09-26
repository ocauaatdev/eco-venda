var pool = require("../../config/pool-conexoes");

    const PedidoModel = {
        findAll: async () => {
            try {
                const [resultados] = await pool.query(
                    'SELECT * FROM pedidos'
                )
                return resultados;
            } catch (error) {
                return error;
            }
        },
        
        findId: async (id) => {
            try {
                const [resultados] = await pool.query(
                    "select * from pedidos where idPedidos = ?",
                    [id]
                )
                return resultados;
            } catch (error) {
                return error;
            }
        },

        createPedido: async (camposJson) => {
            try {
                const [resultados] = await pool.query(
                    "insert into pedidos set ?",
                    [camposJson]
                )
                return resultados;
            } catch (error) {
                return error;
            }
        },
        
        createItemPedido: async (camposJson) => {
            try {
                const [resultados] = await pool.query(
                    "insert into item_pedido set ?",
                    [camposJson]
                )
                return resultados;
            } catch (error) {
                return error;
            }
        },

        update: async (camposJson, id) => {
            try {
                const [resultados] = await pool.query(
                    "UPDATE pedidos SET  ? WHERE idPedidos = ?",
                    [camposJson, id],
                )
                return resultados;
            } catch (error) {
                return error;
            }
        },
        
        delete: async (id) => {
            try {
                const [resultados] = await pool.query(
                    "UPDATE pedidos SET statusPedido = 0 WHERE idPedidos = ?", [id]
                )
                return resultados;
            } catch (error) {
                return error;
            }
        },
        findPedidosPorEmpresa: async (idEmpresa) => {
            try {
                const [resultados] = await pool.query(
                    `SELECT 
                        p.idPedidos, 
                        p.data_pedido, 
                        p.total_pedido, 
                        c.nomeCliente, 
                        p.codigorastreio, 
                        r.dataocorrencia, 
                        o.descricao AS ocorrenciaDescricao
                    FROM pedidos p 
                    INNER JOIN clientes c ON p.clientes_idClientes = c.idClientes 
                    INNER JOIN item_pedido ip ON ip.pedidos_idPedidos = p.idPedidos 
                    INNER JOIN produtos_das_empresas pe ON pe.idProd = ip.produtos_das_empresas_idProd 
                    LEFT JOIN rastreio r ON p.rastreio_idrastreio = r.idrastreio
                    LEFT JOIN ocorrencias_rastreio o ON r.ocorrencias_rastreio_idocorrencias_rastreio = o.idocorrencias_rastreio
                    WHERE pe.empresas_idEmpresas = ?`,
                    [idEmpresa]
                );
                return resultados;
            } catch (error) {
                return error;
            }
        },
        findPedidosPorUsuario: async (idUsuario) => {
            try {
                const [resultados] = await pool.query(
                    `SELECT 
                        p.idPedidos, 
                        p.data_pedido, 
                        p.total_pedido, 
                        p.codigorastreio 
                    FROM pedidos p
                    WHERE p.clientes_idClientes = ?`,
                    [idUsuario]
                );
                return resultados;
            } catch (error) {
                return error;
            }
        },
    };

module.exports = PedidoModel