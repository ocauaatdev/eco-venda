var pool = require("../../config/pool-conexoes");

const assinaturaModel = {
    gravarAssinatura: async (clienteId, planoId, iniVigencia, fimVigencia) => {
        const query = `
          INSERT INTO assinatura (ini_vigencia, fim_vigencia, Clientes_idClientes, Plano_idPlano) 
          VALUES (?, ?, ?, ?)
        `;
      
        try {
          await pool.query(query, [iniVigencia, fimVigencia, clienteId, planoId]);
          console.log("Assinatura registrada com sucesso.");
        } catch (err) {
          console.error("Erro ao registrar a assinatura:", err);
        }
      },

      getAssinatura: async (usuarioId) => {
        const query = `
            SELECT p.nome AS planoNome, a.fim_vigencia, DATEDIFF(a.fim_vigencia, NOW()) AS diasRestantes
            FROM assinatura a
            JOIN plano p ON a.Plano_idPlano = p.idPlano
            WHERE a.Clientes_idClientes = ?
        `;
    
        try {
            const [result] = await pool.query(query, [usuarioId]);
            return result.length > 0 ? result[0] : null;
        } catch (err) {
            console.error("Erro ao buscar assinatura:", err);
            throw err;
        }
    },
};

module.exports = assinaturaModel;