var pool = require("../../config/pool-conexoes");

const produtosModel = {
    findAll: async () => {
        try {
            const [linhas] = await pool.query('SELECT * FROM produtos_das_empresas')
            
            return linhas;
        } catch (error) {
            return error;
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