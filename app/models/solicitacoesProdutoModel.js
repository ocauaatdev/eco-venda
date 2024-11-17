// solicitacoesProdutoModel.js

const pool = require('../../config/pool-conexoes'); // Ou como estiver configurado o seu pool de conexão
const produtosModel = require('../models/produtosModel');

const solicitacoesProdutoModel = {
  
  // Cria uma nova solicitação de produto
  create: async (dadosForm) => {
    const query = `
      INSERT INTO solicitacoes_produtos 
      (tituloProd, descricaoProd, valorProd, qtdeEstoque, tamanhoProd, Categorias_idCategorias, Empresas_idEmpresas, imagemProd, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
    `;

    const values = [
      dadosForm.tituloProd,
      dadosForm.descricaoProd,
      dadosForm.valorProd,
      dadosForm.qtdeEstoque,
      dadosForm.tamanhoProd,
      dadosForm.Categorias_idCategorias,
      dadosForm.Empresas_idEmpresas,
      dadosForm.imagemProd,
    ];

    const result = await pool.query(query, values);
    return result;
  },

  // Lista todas as solicitações com determinado status
  findByStatus: async (status) => {
    const query = `SELECT * FROM solicitacoes_produtos WHERE status = ?`;
    const result = await pool.query(query, [status]);
    return result[0]; // Retorna a lista de solicitações
  },

  // Busca uma solicitação pelo ID
  findById: async (idSolicitacao) => {
    const query = `SELECT * FROM solicitacoes_produtos WHERE idSolicitacao = ?`;
    const result = await pool.query(query, [idSolicitacao]);
    return result[0]; // Retorna a solicitação encontrada
  },

  // Deleta uma solicitação de produto
  delete: async (req, res) => {
    const idSolicitacao = req.params.id; // Verifique se está correto: req.params.id
    if (!idSolicitacao) {
        return res.status(400).send('ID da solicitação não fornecido.');
    }

    try {
        const result = await pool.query('DELETE FROM solicitacoes_produtos WHERE idSolicitacao = ?', [idSolicitacao]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Solicitação não encontrada.');
        }

        res.redirect('/perfil-adm?produto=rejeitado');
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        res.status(500).send('Erro ao remover produto');
    }
},

aprovar: async (req, res) => {
  const idSolicitacao = req.params.idSolicitacao; // Verifique se está correto: req.params.id
  if (!idSolicitacao) {
      return res.status(400).send('ID da solicitação não fornecido.');
  }

  console.log('IDs recebidos ', req.params.idSolicitacao)
  
  try {
    

      // Buscar dados do produto original (pendente de aprovação)
      const resultado = await produtosModel.findById(idSolicitacao);

      if (resultado && resultado.length > 0) {
          const produtoPendente = resultado[0]; // Pega o primeiro produto encontrado

          // Adicionar o produto aprovado à tabela produtos_das_empresas
          await produtosModel.create({
              tituloProd: produtoPendente.tituloProd,
              descricaoProd: produtoPendente.descricaoProd,
              valorProd: produtoPendente.valorProd,
              qtdeEstoque: produtoPendente.qtdeEstoque,
              tamanhoProd: produtoPendente.tamanhoProd,
              Categorias_idCategorias: produtoPendente.Categorias_idCategorias,
              Empresas_idEmpresas: produtoPendente.Empresas_idEmpresas,
              imagemProd: produtoPendente.imagemProd,
              tabelaDestino: 'produtos_das_empresas'
          });

          console.log('Produto aprovado e adicionado à tabela produtos_das_empresas');
          
          // Agora que o produto foi aprovado e adicionado à tabela, podemos remover a solicitação
          const result = await pool.query('DELETE FROM solicitacoes_produtos WHERE idSolicitacao = ?', [idSolicitacao]);

          if (result.affectedRows === 0) {
              return res.status(404).send('Solicitação não encontrada.');
          }

          res.redirect('/perfil-adm?produto=aprovado');
      } else {
          console.log('Produto não encontrado no banco de dados.');
          return res.status(404).send('Produto não encontrado.');
      }
  } catch (error) {
      console.error('Erro ao aprovar o produto:', error);
      res.status(500).send('Erro ao aprovar produto');
  }
},





  findProdutoById: async (idProduto) => {
    const query = 'SELECT * FROM solicitacoes_produtos WHERE id = ?';
    const [result] = await pool.query(query, [idProduto]);
    return result.length ? result[0] : null;
}


};

module.exports = solicitacoesProdutoModel;
