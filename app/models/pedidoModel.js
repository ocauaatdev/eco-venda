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
        }
    };

module.exports = PedidoModel