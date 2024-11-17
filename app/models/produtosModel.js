var pool = require("../../config/pool-conexoes");

const categoriasMap = {
  moda: 1,
  cosmetico: 3,
  higiene: 4,
  bag: 2
};

const produtosModel = {
    findAll: async () => {
        try {
            const [linhas] = await pool.query('SELECT * FROM produtos_das_empresas')
            
            return linhas;
        } catch (error) {
            return error;
        }
    },

    findById: async (idProd) => {
      try {
       
    
        // 2. Caso contrário, tenta buscar o produto na tabela "produtos_das_empresas"
        const queryProdutosEmpresas = `SELECT p.*, e.razaoSocial 
                                       FROM produtos_das_empresas p
                                       JOIN empresas e ON p.Empresas_idEmpresas = e.idEmpresas
                                       WHERE p.idProd = ?`;
        const [produtosEmpresasRows] = await pool.query(queryProdutosEmpresas, [idProd]);
    
        if (produtosEmpresasRows.length > 0) {
          // Se o produto for encontrado na tabela "produtos_das_empresas", retorna o resultado
          return produtosEmpresasRows;
        }
    
        // 3. Caso contrário, busca nas "solicitacoes_produtos"
        const querySolicitacoesProdutos = `SELECT p.*, e.razaoSocial 
                                           FROM solicitacoes_produtos p
                                           JOIN empresas e ON p.Empresas_idEmpresas = e.idEmpresas
                                           WHERE p.idSolicitacao = ?`;
        const [solicitacoesProdutosRows] = await pool.query(querySolicitacoesProdutos, [idProd]);
    
        return solicitacoesProdutosRows;
    
      } catch (error) {
        return error;
      }
    },    
    
 
    findByCategoria: async (categoria) => {
      try {
        const categoriaId = categoriasMap[categoria];
        if (categoriaId === undefined) {
          throw new Error('Categoria inválida');
        }
        console.log('Buscando produtos para a categoria:', categoriaId);
        const [linhas] = await pool.query('SELECT * FROM produtos_das_empresas WHERE Categorias_idCategorias = ?', [categoriaId]);
        console.log('Resultados encontrados:', linhas);
        return linhas;
      } catch (error) {
        console.error('Erro ao buscar produtos por categoria:', error);
        throw error;
      }
    },
  
    create: async (produto) => {

      // Aqui em baixo no const sql preciso adicionar o preco parcelado, qtde de parcelas,empresas_idEmpresas e imagem
        const sql = `INSERT INTO produtos_das_empresas 
          (tituloProd, qtdeEstoque, valorProd, tamanhoProd, Categorias_idCategorias,Empresas_idEmpresas,descricaoProd,imagemProd) 
          VALUES (?, ?, ?, ?, ?,?,?,?)`;
        const params = [
          produto.tituloProd,
          produto.qtdeEstoque,
          produto.valorProd,
          produto.tamanhoProd,
          produto.Categorias_idCategorias,
          produto.Empresas_idEmpresas, 
          produto.descricaoProd,
          produto.imagemProd,
        ];
        return pool.query(sql, params);
      },
      findByEmpresaId: async (empresaId) => {
        try {
            const [linhas] = await pool.query('SELECT * FROM produtos_das_empresas WHERE Empresas_idEmpresas = ?', [empresaId]);
            return linhas;
        } catch (error) {
            console.error('Erro ao buscar produtos por empresa:', error);
            throw error;
        }
    },
    removerProduto: async (req, res) => {
      const produtoId = req.params.id;
  
      try {
          await pool.query('DELETE FROM produtos_das_empresas WHERE idProd = ?', [produtoId]);
          res.redirect('/perfil-empresa?produtoRemovido=true');
      } catch (error) {
          console.error('Erro ao remover produto:', error);
          res.status(500).send('Erro ao remover produto');
      }
    },
    editarProduto: async (req, res) => {
      const produtoId = req.params.id;
      const { tituloProd, descricaoProd, valorProd, qtdeEstoque } = req.body;
  
      console.log('Dados recebidos:', { tituloProd, descricaoProd, valorProd, qtdeEstoque });
      console.log('ID do Produto:', produtoId);

      try {
          await pool.query(
              'UPDATE produtos_das_empresas SET tituloProd = ?, descricaoProd = ?, valorProd = ?, qtdeEstoque = ? WHERE idProd = ?',
              [tituloProd, descricaoProd, valorProd, qtdeEstoque, produtoId]
          );
          res.redirect('/perfil-empresa?produtoAtualizado=true');
      } catch (error) {
          console.error('Erro ao atualizar produto:', error);
          res.status(500).send('Erro ao atualizar produto');
      }
    },
    findByNome: async (nome) => {
      try {
          const [linhas] = await pool.query(
              'SELECT * FROM produtos_das_empresas WHERE tituloProd LIKE ?', 
              [`%${nome}%`]
          );
          return linhas; // A categoria já está nos resultados de "produtos_das_empresas"
      } catch (error) {
          console.error('Erro ao buscar produtos por nome:', error);
          throw error;
      }
  },
   // Buscar por categoria e empresa
   findByCategoriaAndEmpresa: async (categoria, empresaId) => {
    try {
        const categoriaId = categoriasMap[categoria];
        if (categoriaId === undefined) {
            throw new Error('Categoria inválida');
        }
        const [linhas] = await pool.query('SELECT * FROM produtos_das_empresas WHERE Categorias_idCategorias = ? AND Empresas_idEmpresas = ?', [categoriaId, empresaId]);
        return linhas;
    } catch (error) {
        throw error;
    }
},

// Ordenar produtos de uma empresa
ordenarProdutosPorEmpresa: async (criterio, empresaId) => {
    let query;
    switch (criterio) {
        case 'alfabetica':
            query = 'SELECT * FROM produtos_das_empresas WHERE Empresas_idEmpresas = ? ORDER BY tituloProd ASC';
            break;
        case 'menorEstoque':
            query = 'SELECT * FROM produtos_das_empresas WHERE Empresas_idEmpresas = ? ORDER BY qtdeEstoque ASC';
            break;
        case 'maiorEstoque':
            query = 'SELECT * FROM produtos_das_empresas WHERE Empresas_idEmpresas = ? ORDER BY qtdeEstoque DESC';
            break;
        case 'recentes':
            query = 'SELECT * FROM produtos_das_empresas WHERE Empresas_idEmpresas = ? ORDER BY idProd DESC';
            break;
        default:
            throw new Error('Critério de ordenação inválido');
    }

    try {
        const [produtos] = await pool.query(query, [empresaId]);
        return produtos;
    } catch (error) {
        throw error;
    }
},

updateEstoque: async (idProduto, novaQuantidade) => {
  const query = 'UPDATE produtos_das_empresas SET qtdeEstoque = ? WHERE idProd = ?';
  return pool.query(query, [novaQuantidade, idProduto]);
},


};
    

module.exports = produtosModel;