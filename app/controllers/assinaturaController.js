const assinaturaModel = require("../models/assinaturaModel");
const { MercadoPagoConfig, Preference } = require('mercadopago'); // Importa o SDK do Mercado Pago

const client = new MercadoPagoConfig({
    accessToken: process.env.accessToken
  });

  
  // Rota GET para feedback de pagamento
  const feedbackPagamento = async (req, res) => {
    try {
        const paymentStatus = req.query.status;
        if (paymentStatus === 'approved') {
            const { payment_id, external_reference } = req.query;

            if (!req.session.user || !req.session.user.id) {
                return res.redirect('/login'); // Redireciona se não estiver autenticado
            }

            const Clientes_idClientes = req.session.user.id;
            const Plano_idPlano = external_reference; // Aqui você salva o plano escolhido
            const ini_vigencia = new Date();
            const fim_vigencia = new Date();
            fim_vigencia.setMonth(ini_vigencia.getMonth() + 1); // Vigência de 1 mês

            // Grava a assinatura no banco de dados
            await assinaturaModel.gravarAssinatura(Clientes_idClientes, Plano_idPlano, ini_vigencia, fim_vigencia, payment_id);

            res.redirect('/?assinatura=sucesso');
        } else {
            res.redirect('/falha'); // Redireciona em caso de falha no pagamento
        }
    } catch (error) {
        console.error('Erro ao processar o pagamento:', error);
        res.redirect('/erro');
    }
};


  const criarNotificacao = async (req, res) => {
    try {
      const assinaturasExpirando = await assinaturaModel.getAssinaturasExpirando();

      // Enviar notificação para os usuários cujas assinaturas estão para expirar
      assinaturasExpirando.forEach(async assinatura => {
          const usuarioId = assinatura.Clientes_idClientes;
          // Lógica para enviar notificação (email, inserção no banco de dados, etc.)
          await assinaturaModel.enviarNotificacao(usuarioId, 'Sua assinatura expira em 5 dias!');
      });

      console.log('Notificações enviadas para assinaturas prestes a expirar.');
  } catch (error) {
      console.error('Erro ao processar notificações de assinaturas expirando:', error);
  }
  }

  const cancelarAssinatura = async (req, res) => {
    try {
        if (!req.session.user || !req.session.user.id) {
            return res.redirect('/login'); // Redireciona se o usuário não estiver logado
        }

        const clienteId = req.session.user.id;
        const assinaturaCancelada = await assinaturaModel.cancelarAssinatura(clienteId);

        if (assinaturaCancelada) {
            // Notificar ou registrar o cancelamento (opcional)
            await assinaturaModel.enviarNotificacao(clienteId, 'Sua assinatura foi cancelada com sucesso.');

            res.redirect('/perfil-usuario?cancelamento=sucesso');
        } else {
            res.redirect('/perfil-usuario?cancelamento=erro'); // Nenhuma assinatura ativa encontrada
        }
    } catch (error) {
        console.error("Erro ao cancelar assinatura:", error);
        res.redirect('/erro');
    }
};

  
  module.exports = {
    feedbackPagamento,
    criarNotificacao,
    cancelarAssinatura,
  };
