var pool = require("../../config/pool-conexoes");

const rastreioModel = {
    atualizarRastreio: async (idPedido, idOcorrencia, dataOcorrencia, codigoRastreio) => {
        try {
            // Atualizar o código de rastreio na tabela pedidos, se fornecido
            if (codigoRastreio) {
                await pool.query(
                    "UPDATE pedidos SET codigorastreio = ? WHERE idPedidos = ?",
                    [codigoRastreio, idPedido]
                );
            }

            // Inserir a ocorrência na tabela rastreio e capturar o ID gerado
            const [result] = await pool.query(
                `INSERT INTO rastreio (dataocorrencia, ocorrencias_rastreio_idocorrencias_rastreio)
                VALUES (?, ?)`,
                [dataOcorrencia, idOcorrencia]
            );

            const idRastreioGerado = result.insertId;

            // Atualizar a tabela pedidos com o idRastreio gerado
            await pool.query(
                "UPDATE pedidos SET rastreio_idrastreio = ? WHERE idPedidos = ?",
                [idRastreioGerado, idPedido]
            );
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
    // buscarOcorrenciasPorPedido: async (idPedido) => {
    //     try {
    //         const [ocorrencias] = await pool.query(
    //             `SELECT r.dataocorrencia, o.descricao 
    //              FROM rastreio r 
    //              INNER JOIN ocorrencias_rastreio o ON r.ocorrencias_rastreio_idocorrencias_rastreio = o.idocorrencias_rastreio
    //              WHERE r.idrastreio IN (SELECT rastreio_idrastreio FROM pedidos WHERE idPedidos = ?)`,
    //             [idPedido]
    //         );
    //         return ocorrencias;
    //     } catch (error) {
    //         console.error(error);
    //         throw error;
    //     }
    // },
    buscarOcorrenciasPorPedido: async (idPedido) => {
        try {
            const [ocorrencias] = await pool.query(
                `SELECT r.dataocorrencia, o.descricao 
                 FROM rastreio r 
                 INNER JOIN ocorrencias_rastreio o ON r.ocorrencias_rastreio_idocorrencias_rastreio = o.idocorrencias_rastreio
                 WHERE r.idrastreio IN (SELECT rastreio_idrastreio FROM pedidos WHERE idPedidos = ?)`,
                [idPedido]
            );
            return ocorrencias;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
};

module.exports = rastreioModel;