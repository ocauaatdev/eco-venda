var pool = require("../../config/pool-conexoes");

const categoriasMap = {
  camiseta: 1,
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

};
    

module.exports = produtosModel