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

        findClienteId: async (idPedido) => {
            const query = `SELECT Clientes_idClientes FROM pedidos WHERE idPedidos = ?`;
            const [result] = await pool.query(query, [idPedido]);
            return result[0];  // Certifique-se de que ele está retornando o objeto correto
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
                    "INSERT INTO item_pedido SET ?",
                    [camposJson]
                );
                console.log('Item do pedido inserido no banco:', resultados); // Log para verificar o sucesso da inserção
                return resultados;
            } catch (error) {
                console.log('Erro ao inserir item do pedido:', error); // Log de erro
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
        findPedidosByEmpresa: async (empresaId, filtro) => {
            try {
                const ordem = filtro === 'antigo' ? 'ASC' : 'DESC'; // Define a ordem com base no filtro
                const [resultados] = await pool.query(
                    `SELECT 
                        p.idPedidos, 
                        p.data_pedido, 
                        c.nomeCliente, 
                        (SELECT SUM(ip.subtotal) 
                         FROM item_pedido ip 
                         JOIN produtos_das_empresas prod 
                         ON ip.produtos_das_empresas_idProd = prod.idProd 
                         WHERE ip.pedidos_idPedidos = p.idPedidos 
                         AND prod.empresas_idEmpresas = ?) AS total_pedido, 
                        MAX(orast.descricao) AS ocorrenciaDescricao
                    FROM pedidos p
                    JOIN clientes c ON p.Clientes_idClientes = c.idClientes
                    LEFT JOIN rastreio r ON p.idPedidos = r.pedidos_idPedidos AND r.empresas_idEmpresas = ?
                    LEFT JOIN ocorrencias_rastreio orast ON r.ocorrencias_rastreio_idocorrencias_rastreio = orast.idocorrencias_rastreio
                    WHERE EXISTS (SELECT 1 FROM item_pedido ip 
                                  JOIN produtos_das_empresas prod 
                                  ON ip.produtos_das_empresas_idProd = prod.idProd 
                                  WHERE ip.pedidos_idPedidos = p.idPedidos 
                                  AND prod.empresas_idEmpresas = ?)
                    GROUP BY p.idPedidos, c.nomeCliente
                    ORDER BY p.data_pedido ${ordem}`, // Ordena conforme a ordem definida
                    [empresaId, empresaId, empresaId]
                );
                return resultados;
            } catch (error) {
                console.error('Erro ao buscar pedidos por empresa:', error);
                return error;
            }
        },

    // Retorna todos os itens de um pedido que pertencem a uma empresa específica
    findItensByPedidoAndEmpresa: async (pedidoId, empresaId) => {
        try {
            const [resultados] = await pool.query(`
                SELECT 
                    ip.iditem_pedido, 
                    ip.qtde, 
                    ip.subtotal, 
                    ip.tamanho_itemPedido, 
                    p.tituloProd
                FROM item_pedido ip
                JOIN produtos_das_empresas p ON ip.produtos_das_empresas_idProd = p.idProd
                WHERE ip.pedidos_idPedidos = ? AND p.empresas_idEmpresas = ?
            `, [pedidoId, empresaId]);
            return resultados;
        } catch (error) {
            console.error('Erro ao buscar itens do pedido:', error);
            return [];
        }
    },
    findPedidosByCliente: async (clienteId, filtro) => {
        try {
            const ordem = filtro === 'antigo' ? 'ASC' : 'DESC';
            
            const [resultados] = await pool.query(`
                SELECT 
                    p.idPedidos, 
                    p.data_pedido, 
                    p.total_pedido, 
                    MAX(r.codigo_rastreio) AS codigo_rastreio,
                    MAX(o.descricao) AS andamento
                FROM pedidos p
                LEFT JOIN rastreio r ON p.idPedidos = r.pedidos_idPedidos
                LEFT JOIN ocorrencias_rastreio o ON r.ocorrencias_rastreio_idocorrencias_rastreio = o.idocorrencias_rastreio
                WHERE p.clientes_idClientes = ?
                GROUP BY p.idPedidos
                ORDER BY p.data_pedido ${ordem}
            `, [clienteId]);
    
            return resultados;
        } catch (error) {
            console.error("Erro ao buscar pedidos por cliente:", error);
            return [];
        }
    },
    findPedidosWithRastreiosAndOcorrencias: async (clienteId) => {
        try {
            const [resultados] = await pool.query(`
                SELECT 
    p.idPedidos, 
    p.data_pedido, 
    p.total_pedido, 
    e.idEmpresas,
    e.razaoSocial,
    GROUP_CONCAT(DISTINCT r.codigo_rastreio ORDER BY r.dataocorrencia ASC SEPARATOR ', ') AS codigos_rastreio, 
    GROUP_CONCAT(DISTINCT o.descricao ORDER BY r.dataocorrencia ASC SEPARATOR ', ') AS ocorrencias
FROM pedidos p
LEFT JOIN rastreio r ON p.idPedidos = r.pedidos_idPedidos
LEFT JOIN ocorrencias_rastreio o ON r.ocorrencias_rastreio_idocorrencias_rastreio = o.idocorrencias_rastreio
LEFT JOIN empresas e ON r.empresas_idEmpresas = e.idEmpresas
WHERE p.clientes_idClientes = ?
GROUP BY p.idPedidos, e.idEmpresas
            `, [clienteId]);
    
            return resultados;
        } catch (error) {
            console.error("Erro ao buscar pedidos com rastreios e ocorrências:", error);
            return [];
        }
    },

    atualizarEstoque: async(idProduto, quantidadeComprada) => {
        const query = `
            UPDATE produtos_das_empresas 
            SET qtdeEstoque = qtdeEstoque - ? 
            WHERE idProd = ? AND qtdeEstoque >= ?`; // Verifica se tem estoque suficiente
    
        const [result] = await pool.query(query, [quantidadeComprada, idProduto, quantidadeComprada]);
    
        // Retorna verdadeiro se o estoque foi atualizado, caso contrário, retorna falso
        return result.affectedRows > 0;
    },
     
    };
    

module.exports = PedidoModel