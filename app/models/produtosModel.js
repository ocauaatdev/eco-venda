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
        const [linhas] = await pool.query(
          `SELECT p.*, e.razaoSocial FROM produtos_das_empresas p
           JOIN empresas e ON p.Empresas_idEmpresas = e.idEmpresas
           WHERE p.idProd = ?`,
          [idProd]
        );
        return linhas;
      } catch (error) {
        return error;
      }
    },

    // Buscar produtos por categoria
 
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

};
    

module.exports = produtosModel;