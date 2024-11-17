var pool = require("../../config/pool-conexoes");

const assinaturaModel = {
    gravarAssinatura: async (clienteId, planoId, iniVigencia, fimVigencia, idPagamento) => {
        const query = `
          INSERT INTO assinatura (ini_vigencia, fim_vigencia, Clientes_idClientes, Plano_idPlano, idPagamento) 
          VALUES (?, ?, ?, ?, ?)
        `;
      
        try {
          await pool.query(query, [iniVigencia, fimVigencia, clienteId, planoId, idPagamento]);
          console.log("Assinatura registrada com sucesso.");
        } catch (err) {
          console.error("Erro ao registrar a assinatura:", err);
        }
      },

      cancelarAssinatura: async (clienteId) => {
        const query = `
            DELETE FROM assinatura 
            WHERE Clientes_idClientes = ?;
        `;

        try {
            const result = await pool.query(query, [clienteId]);
            if (result.affectedRows > 0) {
                console.log("Assinatura cancelada com sucesso.");
                return true;
            } else {
                console.log("Nenhuma assinatura ativa encontrada.");
                return false;
            }
        } catch (err) {
            console.error("Erro ao cancelar assinatura:", err);
            throw err;
        }
    },

      getAssinatura: async (usuarioId) => {
        const query = `
            SELECT p.nome AS planoNome, a.fim_vigencia, DATEDIFF(a.fim_vigencia, NOW()) AS diasRestantes, a.Plano_idPlano
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

    getAssinaturasExpirando: async () => {
      const query = 
          `SELECT Clientes_idClientes, DATEDIFF(fim_vigencia, NOW()) AS diasRestantes 
          FROM assinatura
          WHERE DATEDIFF(fim_vigencia, NOW()) = 5;`;

      try {
          const [result] = await pool.query(query);
          return result;
      } catch (err) {
          console.error("Erro ao buscar assinaturas expirando:", err);
          throw err;
      }
  },

  buscarNotificacoes: async (usuarioId) => {
    const query = `SELECT * FROM notificacoes WHERE Clientes_idClientes = ?`;
    const [result] = await pool.query(query, [usuarioId]);
    return result;
  },

  enviarNotificacao: async (usuarioId, mensagem) => {
    // Lógica para gravar a notificação (por exemplo, gravar no banco)
    const query = `INSERT INTO notificacoes (Clientes_idClientes, mensagem, dataNotificacao) VALUES (?, ?, NOW());`;
    await pool.query(query, [usuarioId, mensagem]);
  }
};

module.exports = assinaturaModel;