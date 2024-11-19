var express = require("express");
var router = express.Router();
const pool = require("../../config/pool-conexoes");
const usuarioController = require('../controllers/usuarioController');
const empresaController = require("../controllers/empresaController");
const produtosController = require("../controllers/produtosController");
const notificacaoController = require("../controllers/notificacaoController");
const assinaturaController = require("../controllers/assinaturaController");
const adminController = require("../controllers/adminController");
const Usuario = require('../models/usuarioModel');
const empresa = require('../models/empresaModel');
const assinaturaModel = require('../models/assinaturaModel')
const notificacaoModel = require("../models/notificacaoModel");
const produtosModel = require('../models/produtosModel');
const pedidoModel = require('../models/pedidoModel');
const solicitacoesProdutoModel = require('../models/solicitacoesProdutoModel')
const { verificarUsuAutenticado,gravarUsuAutenticado,limparSessao,verificarUsuAutorizado } = require("../models/autenticador");
const uploadFile = require("../util/uploader")();
const { carrinhoController } = require("../controllers/carrinhoController");
const jwt = require('jsonwebtoken');
const cron = require('node-cron');

cron.schedule('0 0 * * *', () => {
  assinaturaController.criarNotificacao();
});

// SDK do Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { pedidoController } = require("../controllers/pedidoController");
// Adicione as credenciais
const client = new MercadoPagoConfig({
  accessToken: process.env.accessToken
});

function verificaEmpresa(req, res, next){
  if(req.session && req.session.autenticado && req.session.autenticado.id && req.session.autenticado.tipo === 'empresa'){
    next();
  }else{
    res.redirect('/?acesso=negado')
  }
}
function verificaAdmin(req, res, next){
  if(req.session && req.session.autenticado && req.session.autenticado.id && req.session.autenticado.tipo === 'admin'){
    next();
  }else{
    res.redirect('/?acessoadm=negado')
  }
}

router.post('/aplicar-cupom', carrinhoController.aplicarCupom);
router.get('/aplicar-cupom', (req, res) => {
  const erro = req.query.erro;

  // Verifique o tipo de erro e redirecione ou exiba mensagens específicas
  if (erro === 'expirado') {
    return res.redirect('/carrinho?cupom=expirado'); // Exemplo: Cupom expirado
  } else if (erro === 'invalido') {
    return res.redirect('/carrinho?cupom=invalido'); // Exemplo: Cupom não encontrado
  } else if (erro === 'categoria') {
    return res.redirect('/carrinho?cupom=categoria'); // Exemplo: Cupom inválido
  } else if (erro === 'usado'){
    return res.redirect('/carrinho?cupom=usado');
  } else {
    // Caso não seja nenhum erro específico, redirecione para o carrinho normalmente
    return res.redirect('/carrinho');
  }
});


// Middleware para inicializar o carrinho
router.use((req, res, next) => {
  if (!req.session.carrinho) {
    req.session.carrinho = [];
  }
  res.locals.qtdItensCarrinho = req.session.carrinho.length;
  next();
});

// Middleware para configurar o estado autenticado
router.use((req, res, next) => {
  if (req.session.autenticado && req.session.autenticado.id) {
    res.locals.autenticado = req.session.autenticado;
  } else {
    res.locals.autenticado = null; // Explicitamente "não autenticado"
  }
  next();
});


// Rotas de páginas
// router.get('/', (req, res) => {
//   const categoria = req.query.categoria || null; // Obtém a categoria da query string
//   produtosController.listarProdutos(req, res, { categoria, autenticado: req.session.autenticado });
// });
router.get('/', (req, res) => {
  res.render('pages/home-page', { query: req.query, autenticado: req.session.autenticado });
});

router.get('/home-page', (req, res) => {
  res.render('pages/home-page', { query: req.query, autenticado: req.session.autenticado });
});
// router.get('/home-page', (req, res) => {
//   const categoria = req.query.categoria || null; // Obtém a categoria da query string
//   produtosController.listarProdutos(req, res, { categoria, autenticado: req.session.autenticado });
// });

router.get('/ecopremium', (req, res) => {
  res.render('pages/ecopremium', { query: req.query, autenticado: req.session.autenticado });
});


router.get('/catalogo', (req, res) => {
  const categoria = req.query.categoria || null; // Obtém a categoria da query string
  produtosController.listarProdutos(req, res, { categoria, autenticado: req.session.autenticado });
});
// router.get('/catalogo', (req, res) => {
//   // res.render('pages/catalogo', { query: req.query, autenticado: req.session.autenticado });
//   produtosController.listarProdutos(req, res, { autenticado: req.session.autenticado });
// });

// ======== CADASTRO E LOGIN DO CLIENTE ==========

// Rota de cadastro do usuário
router.get('/cadastro', (req, res) => {
  const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão
  req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los

  // Se o usuario estiver logado, não permite acessar a pagina de cadastro
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado'); // Verifica explicitamente o ID
  }
  res.render('pages/cadastro', { listaErros: [], valores });
});

router.post('/cadastro',
  usuarioController.regrasValidacaoFormCad,
  async (req, res) => {
    usuarioController.cadastrar(req, res);
  });

  router.get('/ativar-conta', async (req, res) => {
    const { token } = req.query;
 
    try {
        // Verificar e decodificar o token JWT
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.userId;
 
        // Ativar a conta do usuário
        await Usuario.atualizarStatusAtivo(userId); // Supondo que você tenha uma função para isso
        console.log('Conta ativada com sucesso!')
        return res.redirect("/login?cadastro=sucesso");
    } catch (e) {
        console.log(e);
        return res.redirect('/login?ativar-conta=erro');
    }
});

router.get('/ativar-conta-empresa', async (req, res) => {
  const { token } = req.query;

  try {
      // Verificar e decodificar o token JWT
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const userId = decoded.userId;

      // Ativar a conta do usuário
      await empresa.atualizarStatusAtivoEmpre(userId); // Supondo que você tenha uma função para isso
      console.log('Conta ativada com sucesso!')
      return res.redirect("/login-empresa?cadastro=sucesso");
  } catch (e) {
      console.log(e);
      return res.redirect('/login-empresa?ativar-conta=erro');
  }
});

router.get('/login', (req, res) => {
  // Se o usuario estiver logado, não permite acessar a pagina de login da empresa
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado');
  }
  res.render('pages/login', { listaErros: [], query: req.query });
});

router.post('/login',
  usuarioController.regrasValidacaoFormLogin,gravarUsuAutenticado,
  async (req, res) => {
    usuarioController.logar(req, res);
  });

  router.get("/recuperar-senha",
      verificarUsuAutenticado,
      function (req, res){
        res.render("pages/rec-senha",
          {listaErros:[]}
        )
      }
);

router.post("/recuperar-senha",
  verificarUsuAutenticado,
  usuarioController.regrasValidacaoFormRecSenha,
  function(req,res){
    usuarioController.recuperarSenha(req,res);
  }
);
router.get("/resetar-senha",
  function(req,res){
    usuarioController.validarTokenNovaSenha(req,res);
  }
);
router.post("/reset-senha",
  usuarioController.regrasValidacaoFormNovaSenha,
  function (req, res){
    usuarioController.resetarSenha(req,res);
  }
);


router.get("/recuperar-senha-empresa",
  verificarUsuAutenticado,
  function (req, res){
    res.render("pages/rec-senha-empresa",
      {listaErros:[]}
    )
  }
);

router.post("/recuperar-senha-empresa",
verificarUsuAutenticado,
empresaController.regrasValidacaoFormRecSenha,
function(req,res){
empresaController.recuperarSenha(req,res);
}
);
router.get("/resetar-senha-empresa",
function(req,res){
empresaController.validarTokenNovaSenha(req,res);
}
);
router.post("/reset-senha-empresa",
empresaController.regrasValidacaoFormNovaSenha,
function (req, res){
empresaController.resetarSenha(req,res);
}
);
// ============= Rotas de cadastro e login de empresa ================

router.get('/cadastro-empresa', (req, res) => {
  const valores = req.session.dadosForm || {}; // Carrega os dados do formulário armazenados na sessão
  req.session.dadosForm = null; // Limpa os dados da sessão após carregá-los

  // Se o usuario estiver logado, não permite acessar a pagina de cadastro da empresa
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado');
  }
  res.render('pages/cadastro-empresa', { listaErros: [], valores });
});

router.post('/cadastro-empresa',
  empresaController.regrasValidacaoFormCad,
  async (req, res) => {
    empresaController.cadastrar(req, res);
  });


router.get('/login-empresa', (req, res) => {
  // Se o usuario estiver logado, não permite acessar a pagina de login da empresa
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado');
  }
  res.render('pages/login-empresa', { listaErros: [], query: req.query });
});

router.post('/login-empresa',
  empresaController.regrasValidacaoFormLogin,gravarUsuAutenticado,
  async (req, res) => {
    empresaController.logar(req, res);
  });

// ADM
router.get('/login-adm', (req, res) => {
  // Se o usuario estiver logado, não permite acessar a pagina de login da adm
  if (req.session.autenticado && req.session.autenticado.id) {
    return res.redirect('/?erro=logado');
  }
  res.render('pages/login-adm', { listaErros: [], query: req.query });
});

router.post('/login-adm',
  adminController.regrasValidacaoFormLogin,gravarUsuAutenticado,
  async (req, res) => {
    adminController.logar(req, res);
  });

// ========== DESLOGAR USUARIO ATUAL ===========
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).send('Erro ao deslogar');
      }
      res.redirect('/'); // Redireciona para a página de login ou outra página de sua escolha
  });
});
// ======================================

router.get('/redirecionamento', (req, res) => {
  res.render('pages/redirecionamento');
});


// ==============Notificação=============
router.post("/notificacao/marcar-como-lida/:id", async (req, res) => {
  const idNotificacoes = req.params.id;
  console.log(idNotificacoes)
  try {
      await pool.query('UPDATE notificacoes SET lida = true WHERE idNotificacoes = ?', [idNotificacoes]);
      console.log("lida2")
      res.json({ sucesso: true });
  } catch (error) {
      console.error(error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar notificação' });
  }
});

router.post('/notificacao/excluir/:idNotificacoes', notificacaoModel.excluirNotificacao);

router.get("/notificacoes", async (req, res) => {
  const usuarioId = req.session.user.id; // Captura o ID do usuário logado
  const lidas = req.query.lidas;

  try {
      let status = null;
      if (lidas === 'true') {
          status = true;
      } else if (lidas === 'false') {
          status = false;
      }

      // Busca as notificações considerando Clientes_idClientes ou plano_id
      const notificacoes = await notificacaoModel.buscarNotificacoes(usuarioId, status);

      res.json({ notificacoes });
  } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar notificações' });
  }
});

router.get("/notifica", notificacaoController.exibirNotificacoes);

router.delete("/notificacao/excluir/:id", async (req, res) => {
  const idNotificacoes = req.params.id;
  console.log(idNotificacoes)
  try {
      await pool.query('DELETE FROM notificacoes WHERE idNotificacoes = ?', [idNotificacoes]);
      console.log("excluida")
      res.json({ sucesso: true });
  } catch (error) {
      console.error(error);
      res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir notificação' });
  }
})

// ==========PERFIS=================

  router.get('/perfil-usuario', usuarioController.perfil);
  // Rota para visualizar pedidos do usuário
router.get('/perfil-usuario', pedidoController.listarPedidosUsuario);
  // router.get('/perfil-usuario/pedidos', pedidoController.visualizarPedidosCliente);

  router.post('/usuario/atualizar', usuarioController.atualizarPerfil);

  // Visualizar perfil empresa 
  router.get('/perfil-empresa', empresaController.perfilEmpresa);
  // Visualizar perfil adm
  router.get('/perfil-adm', adminController.perfilAdm);

  // Adiciona a rota para pedidos vendidos
  // router.get('/perfil-empresa', pedidoController.visualizarPedidosVendidos);

  // Rota para enviar a notificação do pedido
router.post('/atualizar-pedido', pedidoController.atualizarPedido);

// Nova rota para buscar os itens do pedido
router.get('/itens-pedido/:pedidoId', pedidoController.visualizarItensPedido);

// Nova rota para fornecer os itens do pedido
router.get('/api/pedido-entrega', async (req, res) => {
  try {
      const { pedidoId } = req.query;
      const pedido = await pedidoModel.findId(pedidoId);  // Buscar detalhes do pedido, como local de entrega

      res.json({
          localEntrega: pedido[0].local_entrega
      });
  } catch (error) {
      console.error("Erro ao carregar o local de entrega:", error);
      res.status(500).json({ error: "Erro ao carregar o local de entrega" });
  }
});

// router.get('/ocorrencias/:idPedido', pedidoController.buscarOcorrencias);

  // Atualizar perfil empresa
  router.post('/empresa/atualizar', empresaController.atualizarPerfilEmpresa);
  // Rota para remover produto
  router.post('/empresa/remover-produto/:id', produtosModel.removerProduto);
  // Rota para editar produto
  router.post('/empresa/editar-produto/:id', produtosModel.editarProduto);

  router.get('/empresa/:empresaId/produtos/categoria/:categoria', empresaController.filtrarPorCategoria);
  router.get('/empresa/:empresaId/produtos/ordenar/:criterio', empresaController.ordenarProdutos);


// ===========================
router.get('/cadastro-cupom', verificarUsuAutenticado,verificaAdmin, (req, res) => {
  const valores = {
    nomeCupom: '',
    descontoCupons: '',
    prazoCupons: '',
    planoCupom: '',
    categoriaCupom: '',
    tipoCupom: '',
  };
  
  res.render('pages/cadastro-cupom', { listaErros: [], valores });
});

router.post('/cadastro-cupom',
  adminController.regrasValidacaoFormCup, verificarUsuAutenticado,
  async (req, res) => {
    adminController.cadastrarCupom(req, res);
  });


router.get('/cadastro-produto', verificarUsuAutenticado,verificaEmpresa, (req, res) => {
  const valores = {
    produtoNome: '',
    descricaoProduto: '',
    precoProduto: '',
    qtdeEstoque: '',
    tamanhoProduto: '',
    imagemProduto:'',
  };
  
  res.render('pages/cadastro-produto', { listaErros: [], valores });
});

router.post('/cadastro-produto',
  produtosController.regrasValidacaoFormProd, verificarUsuAutenticado,uploadFile("imagemProduto"),
  async (req, res) => {
    produtosController.cadastrarProduto(req, res);
  });

  // ===========

  router.get('/individual-produto', (req, res) => {
    res.render('pages/individual-produto', { query: req.query, autenticado: req.session.autenticado });
  });

  // Rota para exibir o produto individualmente
router.post('/excluir-conta/usuario/:idClientes', adminController.excluirUsuario);

// Rota para excluir conta de empresa
router.post('/excluir-conta/empresa/:idEmpresas', adminController.excluirEmpresa);

  // Rota para exibir o produto individualmente
router.get('/produto/:idProd', produtosController.exibirProduto);

router.post('/aprovar-produto/:idSolicitacao', solicitacoesProdutoModel.aprovar);

router.post('/rejeitar-produto/:id', solicitacoesProdutoModel.delete);
// CARRINHO
router.get("/addItem", function (req, res) {
  carrinhoController.addItem(req, res);
});

router.get("/removeItem", function (req, res) {
  carrinhoController.removeItem(req, res);
});

router.get("/excluirItem", function (req, res) {
  carrinhoController.excluirItem(req, res);
});

// router.get("/carrinho", verificarUsuAutenticado, function (req, res) {
//   carrinhoController.listarcarrinho(req, res);
// });
router.get('/carrinho', verificarUsuAutenticado, carrinhoController.enderecoCliente, function(req,res){
  carrinhoController.listarcarrinho(req, res);
});

router.post('/atualizar-tamanho-carrinho', (req, res) => {
  const { produtoId, tamanhoSelecionado } = req.body;

  // Atualizar o tamanho no carrinho na sessão
  const carrinho = req.session.carrinho;
  const item = carrinho.find(item => item.codproduto === produtoId);
  if (item) {
      item.tamanho = tamanhoSelecionado;
  }

  res.json({ message: 'Tamanho atualizado com sucesso!' });
});

// ================================= Assinatura ==========================================
router.post("/create-preference-a", async function (req, res) {
  if (!req.session.autenticado || !req.session.autenticado.id) {
    return res.redirect('/login'); // Redireciona se não estiver autenticado
  }

  const userId = req.session.autenticado.id;

    // Verifica se já há uma assinatura ativa
    const assinatura = await assinaturaModel.getAssinatura(userId);

    if (assinatura) {
      return res.redirect("/ecopremium?assinante=true"); // Usuário já é assinante
    }

    const { planoId, items } = req.body;
    const preference = new Preference(client);

    console.log("Os itens escolhidos são:", items)

    // Cria a preferência de pagamento
    preference.create({
      body: {
        items: items,
        external_reference: planoId,
        back_urls: {
          success: process.env.URL_BASE + "/feedback-a",
          failure: process.env.URL_BASE + "/feedback-a",
          pending: process.env.URL_BASE + "/feedback-a"
        },
        auto_return: "approved",
      }
    })
    .then((value) => {
      res.json(value)
    })
    .catch(console.log)
});

// Rota para o feedback de pagamento da assinatura
router.get("/feedback-a", function (req, res) {
  assinaturaController.feedbackPagamento(req, res);
});

router.post("/cancelar-assinatura", function (req, res) {
  assinaturaController.cancelarAssinatura(req, res);
});

router.post('/finalizar-compra', produtosController.finalizarCompra);

// =================================== Produtos ==========================================
router.post("/create-preference", function (req, res) {
  const preference = new Preference(client);

  // Cria a preferência no Mercado Pago
  preference.create({
    body: {
      items: req.body.items.map(item => ({
        title: item.description,
        unit_price: parseFloat(item.unit_price), // Usar o preço com desconto aqui
        quantity: item.quantity,
        currency_id: item.currency_id
      })),
      back_urls: {
        success: process.env.URL_BASE + "/feedback",
        failure: process.env.URL_BASE + "/feedback",
        pending: process.env.URL_BASE + "/feedback"
      },
      auto_return: "approved"
    }
  })
    .then((value) => {
      res.json(value);
    })
    .catch(console.log);
});

router.get("/feedback", function (req, res) {
  pedidoController.gravarPedido(req, res);
});

router.get('/checkout', verificarUsuAutenticado, carrinhoController.enderecoCliente, function(req, res) {
  // Carregar os dados do carrinho e endereço
  const carrinho = req.session.carrinho;

  // Calcular o total do carrinho
  const totalCarrinho = carrinho.reduce((total, item) => total + (item.qtde * item.preco), 0);

  // Calcular o total com desconto
  const totalComDesconto = req.session.totalComDesconto || totalCarrinho; // Usa o total sem desconto caso não tenha desconto

  // Renderizar a página e passar os valores calculados
  res.render('pages/checkout', {
      autenticado: req.session.autenticado,
      carrinho: carrinho,
      totalCarrinho: totalCarrinho.toFixed(2), // Envia o total do carrinho
      totalComDesconto: totalComDesconto.toFixed(2), // Envia o total com desconto
      endereco: req.session.endereco, // Passa o endereço para o EJS
      listaErros: null
  });
});

// ----------
router.get('/buscar-produtos', async (req, res) => {
  const query = req.query.q;
  if (!query) {
      return res.status(400).json([]);
  }

  try {
      const produtos = await produtosModel.findByNome(query);
      produtos.forEach(produto => {
          if (produto.imagemProd) {
              produto.imagemProd = `data:image/png;base64,${produto.imagemProd.toString('base64')}`;
          }
      });
      res.json(produtos); // Incluindo as categorias nos produtos
  } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
});

module.exports = router;
