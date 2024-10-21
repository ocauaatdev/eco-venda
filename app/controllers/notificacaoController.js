// controllers/notificacaoController.js
const notificacaoModel = require("../models/notificacaoModel");
const pool = require ("../../config/pool-conexoes")

const exibirNotificacoes = async (req, res) => {
  try {
    const usuarioId = req.session.user.id;
    const status = req.query.lidas === 'true' ? true : req.query.lidas === 'false' ? false : null;
    const notificacoes = await notificacaoModel.buscarNotificacoes(usuarioId, status);
    
    res.render("pages/perfil-usuario", { user: req.session.user, notificacoes, status });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.redirect("/erro");
  }
};

const marcarNotificacaoComoLida = async (req, res) => {
  const notificacaoId = req.params.id;
  try {
      await pool.query('UPDATE notificacoes SET lida = true WHERE idNotificacoes = ?', [notificacaoId]);
      res.json({ sucesso: true });
  } catch (error) {
      console.error(error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar notificação' });
  }
};

module.exports = {
  exibirNotificacoes,
  marcarNotificacaoComoLida,
};
