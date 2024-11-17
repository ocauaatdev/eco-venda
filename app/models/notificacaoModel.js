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

criarNotificacaoCupom: async (clienteId, planoId, mensagem) => {
  try {
    const query = 'INSERT INTO notificacoes (Clientes_idClientes, plano_id, mensagem, lida, dataNotificacao) VALUES (?, ?, ?, false, NOW())';
    await pool.query(query, [clienteId, planoId, mensagem]);
    console.log('Notificação criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
},

  // Busca todas as notificações do usuário, podendo filtrar por lidas ou não lidas
  buscarNotificacoes: async (usuarioId, status) => {
    let query = `
        SELECT * FROM notificacoes 
        WHERE (Clientes_idClientes = ? OR plano_id = (SELECT Plano_idPlano FROM assinatura WHERE Clientes_idClientes = ?)) 
    `;
    const params = [usuarioId, usuarioId];
    
    if (status !== null) {
        query += ' AND lida = ?';
        params.push(status);
    }
    
    query += ' ORDER BY lida ASC, dataNotificacao DESC';
  
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
