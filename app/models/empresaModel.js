var pool = require("../../config/pool_conexoes");

const empresaModel = {
    findAll: async () => {
        try {
            const [linhas] = await pool.query('SELECT * FROM empresas');
            return linhas;
        } catch (error) {
            return error;
        }
    },

    // SE DER ERRO, TIRAR ISSO
    findUser: async (camposForm) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM empresas WHERE razaoSocial = ?",
                [camposForm.razaoSocial, camposForm.razaoSocial]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    findId: async (id) => {
        try {
            const [linhas] = await pool.query('SELECT * FROM empresas WHERE idEmpresas = ?', [id]);
            return linhas;
        } catch (error) {
            return error;
        }
    },

    create: async (dadosForm) => {
        try {
            const [linhas] = await pool.query('INSERT INTO empresas SET ?', [dadosForm]);
            return linhas;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    update: async (dadosForm, id) => {
        try {
            const [linhas] = await pool.query('UPDATE empresas SET ? WHERE idEmpresas = ?', [dadosForm, id]);
            return linhas;
        } catch (error) {
            return error;
        }
    },

    delete: async (id) => {
        try {
            const [linhas] = await pool.query('DELETE FROM empresas WHERE idEmpresas = ?', [id]);
            return linhas;
        } catch (error) {
            return error;
        }
    }
};

module.exports = empresaModel;