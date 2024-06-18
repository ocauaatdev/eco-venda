var pool = require("../../config/pool-conexoes");

const clientesModel = {
    findAll: async () => {
        try {
            const [linhas] = await pool.query('SELECT * FROM clientes');
            return linhas;
        } catch (error) {
            return error;
        }
    },

    // SE DER ERRO, TIRAR ISSO
    findUser: async (camposForm) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM clientes WHERE nomeCliente = ?",
                [camposForm.nomeCliente, camposForm.nomeCliente]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    findId: async (id) => {
        try {
            const [linhas] = await pool.query('SELECT * FROM clientes WHERE idClientes = ?', [id]);
            return linhas;
        } catch (error) {
            return error;
        }
    },

    create: async (dadosForm) => {
        try {
            const [linhas] = await pool.query('INSERT INTO clientes SET ?', [dadosForm]);
            return linhas;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    update: async (dadosForm, id) => {
        try {
            const [linhas] = await pool.query('UPDATE clientes SET ? WHERE idClientes = ?', [dadosForm, id]);
            return linhas;
        } catch (error) {
            return error;
        }
    },

    delete: async (id) => {
        try {
            const [linhas] = await pool.query('DELETE FROM clientes WHERE idClientes = ?', [id]);
            return linhas;
        } catch (error) {
            return error;
        }
    }
};

module.exports = clientesModel;