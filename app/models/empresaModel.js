var pool = require("../../config/pool-conexoes");

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
    findUser: async (razaoSocial) => {
        const [resultados] = await pool.query(
            "SELECT * FROM empresas WHERE razaoSocial = ?", 
            [razaoSocial]
        );
        return resultados;
    },
    findByEmail: async (emailEmpresa) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM empresas WHERE emailEmpresa = ?",
                [emailEmpresa]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    findByCnpj: async (cpnjempresa) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM empresas WHERE cpnjempresa = ?",
                [cpnjempresa]
            );
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

    update: async (id, dadosForm) => {
        try {
            const [linhas] = await pool.query('UPDATE empresas SET razaoSocial = ?, emailEmpresa = ?, celularEmpresa = ?, cepEmpresa = ?, logradouroEmpresa = ?, bairroEmpresa = ?, cidadeEmpresa = ?, ufEmpresa = ? WHERE idEmpresas = ?', [
                dadosForm.razaoSocial,
                dadosForm.emailEmpresa,
                dadosForm.celularEmpresa,
                dadosForm.cepEmpresa,
                dadosForm.logradouroEmpresa,
                dadosForm.bairroEmpresa,
                dadosForm.cidadeEmpresa,
                dadosForm.ufEmpresa,
                id
            ]);
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