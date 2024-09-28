const assinaturaModel = require("../models/assinaturaModel");
const { MercadoPagoConfig, Preference } = require('mercadopago'); // Importa o SDK do Mercado Pago

const client = new MercadoPagoConfig({
    accessToken: process.env.accessToken
  });

// Rota POST para criar a preferência de pagamento
const criarPreferencia = async (req, res) => {
    if (!req.session.autenticado || !req.session.autenticado.id) {
      return res.redirect('/login'); // Redireciona se não estiver autenticado
    }
  
    const userId = req.session.autenticado.id;
  
    try {
      // Verifica se já há uma assinatura ativa
      const assinatura = await assinaturaModel.getAssinatura(userId);
  
      if (assinatura) {
        return res.redirect("/ecopremium?assinante=true"); // Usuário já é assinante
      }
  
      const planoId = req.body.planoId;
      const preference = new Preference(client);
  
      // Cria a preferência de pagamento
      const preferenceResponse = await preference.create({
        body: {
          items: req.body.items,
          external_reference: planoId,
          back_urls: {
            success: process.env.URL_BASE + "/feedback-a",
            failure: process.env.URL_BASE + "/feedback-a",
            pending: process.env.URL_BASE + "/feedback-a"
          },
          auto_return: "approved",
        }
      });
  
      res.json(preferenceResponse);
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      res.status(500).send('Erro ao processar a solicitação');
    }
  };
  
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
        const Plano_idPlano = external_reference;
        const ini_vigencia = new Date(); // Início da vigência
        const fim_vigencia = new Date();
        fim_vigencia.setMonth(ini_vigencia.getMonth() + 1); // Vigência de 1 mês
  
        // Grava a assinatura no banco de dados
        await AssinaturaModel.gravarAssinatura(Clientes_idClientes, Plano_idPlano, ini_vigencia, fim_vigencia);
  
        res.redirect('/?assinatura=sucesso');
      } else {
        res.redirect('/falha'); // Redireciona em caso de falha
      }
    } catch (error) {
      console.error('Erro ao processar o pagamento:', error);
      res.redirect('/erro');
    }
  };
  
  module.exports = {
    criarPreferencia,
    feedbackPagamento,
  };