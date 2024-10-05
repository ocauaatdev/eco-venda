var pool = require("../../config/pool-conexoes");

const rastreioModel = {
    // Cria ou atualiza um rastreio para um pedido específico e empresa
    updateRastreio: async (rastreioData) => {
        try {
            console.log("Dados de rastreio recebidos para atualização/inserção:", rastreioData); // Log dos dados
    
            const [resultados] = await pool.query(`
                INSERT INTO rastreio (codigo_rastreio, dataocorrencia, ocorrencias_rastreio_idocorrencias_rastreio, pedidos_idPedidos, empresas_idEmpresas)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    codigo_rastreio = VALUES(codigo_rastreio),
                    dataocorrencia = VALUES(dataocorrencia),
                    ocorrencias_rastreio_idocorrencias_rastreio = VALUES(ocorrencias_rastreio_idocorrencias_rastreio)
            `, [
                rastreioData.codigo_rastreio,
                rastreioData.dataocorrencia,
                rastreioData.ocorrencias_rastreio_idocorrencias_rastreio,
                rastreioData.pedidos_idPedidos,
                rastreioData.empresas_idEmpresas
            ]);
    
            console.log("Resultado da query:", resultados); // Log dos resultados da query
            return resultados;
        } catch (error) {
            console.error("Erro ao atualizar/inserir rastreio:", error); // Log do erro
            return error;
        }
    },
    findRastreioByPedidoAndEmpresa: async (pedidoId, empresaId) => {
        try {
            const [resultados] = await pool.query(`
                SELECT codigo_rastreio FROM rastreio WHERE pedidos_idPedidos = ? AND empresas_idEmpresas = ?
            `, [pedidoId, empresaId]);
    
            return resultados.length > 0 ? resultados[0].codigo_rastreio : null;  // Retorna o código ou null
        } catch (error) {
            console.error("Erro ao buscar código de rastreio:", error);
            return null;
        }
    },
    // Busca todos os rastreios relacionados a um pedido e empresa
    findAllRastreiosByPedidoAndEmpresa: async (pedidoId, empresaId) => {
        try {
            const [resultados] = await pool.query(`
                SELECT r.codigo_rastreio, r.dataocorrencia, o.descricao AS ocorrenciaDescricao
                FROM rastreio r
                INNER JOIN ocorrencias_rastreio o ON r.ocorrencias_rastreio_idocorrencias_rastreio = o.idocorrencias_rastreio
                WHERE r.pedidos_idPedidos = ? AND r.empresas_idEmpresas = ?
                ORDER BY r.dataocorrencia ASC
            `, [pedidoId, empresaId]);

            return resultados; // Retorna todos os rastreios encontrados
        } catch (error) {
            console.error("Erro ao buscar histórico de rastreios:", error);
            return [];
        }
    },
        // Função para buscar todos os status de rastreio de um pedido e empresa
findAllStatusByPedidoAndEmpresa: async (pedidoId, empresaId) => {
    try {
        const [resultados] = await pool.query(`
            SELECT ocorrencias_rastreio_idocorrencias_rastreio 
            FROM rastreio 
            WHERE pedidos_idPedidos = ? AND empresas_idEmpresas = ?
        `, [pedidoId, empresaId]);

        return resultados; // Retorna todos os status
    } catch (error) {
        console.error("Erro ao buscar status dos rastreios:", error);
        return [];
    }
}
};

module.exports = rastreioModel;