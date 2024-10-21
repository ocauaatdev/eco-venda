const pool = require("../../config/pool-conexoes");

const notificacaoModel = {
  criarNotificacaoPedido: async (notificacaoData) => {
    const { Pedidos_idPedidos, Empresas_idEmpresas, Clientes_idClientes, mensagem } = notificacaoData;
    const query = `
        INSERT INTO notificacoes (Pedidos_idPedidos, Empresas_idEmpresas, Clientes_idClientes, mensagem)
        VALUES (?, ?, ?, ?)
    `;
    await pool.query(query, [Pedidos_idPedidos, Empresas_idEmpresas, Clientes_idClientes, mensagem]);
},

criarNotificacaoCompra: async (clienteId, mensagem) => {
  try {
      const query = 'INSERT INTO notificacoes (clientes_idClientes, mensagem, lida, dataNotificacao) VALUES (?, ?, false, NOW())';
      await pool.query(query, [clienteId, mensagem]);
      console.log('Notificação criada com sucesso');
  } catch (error) {
      console.error('Erro ao criar notificação:', error);
  }
},

criarNotificacaoCupom: async (dados) => {
  const query = 'INSERT INTO notificacoes (mensagem, plano_id) VALUES (?, ?)';
  try {
      await pool.query(query, [dados.mensagem, dados.plano_id]);
  } catch (error) {
      console.error("Erro ao criar notificação:", error);
      throw error;
  }
},

  // Busca todas as notificações do usuário, podendo filtrar por lidas ou não lidas
  buscarNotificacoes: async (usuarioId, status) => {
    const query = 'SELECT * FROM notificacoes WHERE Clientes_idClientes = ? ORDER BY lida ASC, dataNotificacao DESC' + (status !== null ? ' AND lida = ?' : '');
    const params = [usuarioId];
    if (status !== null) params.push(status);
    
    const [notificacoes] = await pool.query(query, params);
    return notificacoes;
},

  // Envia uma nova notificação
  enviarNotificacao: async (usuarioId, mensagem) => {
    const query = `INSERT INTO notificacoes (Clientes_idClientes, mensagem, lida, dataNotificacao) VALUES (?, ?, false, NOW())`;
    await pool.query(query, [usuarioId, mensagem]);
  },

  // Atualiza o status de uma notificação para lida
  marcarComoLida: async (notificacaoId) => {
    const query = `UPDATE notificacoes SET lida = true WHERE id = ?`;
    await pool.query(query, [notificacaoId]);
  },

  excluirNotificacao: async(req,res) => {
    const notificacaoId = req.params.id;
  
      try {
          await pool.query('DELETE FROM notificacoes WHERE idNotificacoes = ?', [notificacaoId]);
          res.redirect('/perfil-usuario?notificacaoRemovida=true');
      } catch (error) {
          console.error('Erro ao remover notificacao:', error);
          res.status(500).send('Erro ao remover notificacao');
      }
  }
};

module.exports = notificacaoModel;
