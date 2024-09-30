const pool = require("../../config/pool-conexoes");

const adminModel = {
    findAll: async () => {
        try {
            const [linhas] = await pool.query('SELECT * FROM admin');
            return linhas;
        } catch (error) {
            return error;
        }
    },
    findAdmin: async (nomeAdmin) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM admin WHERE nomeAdmin = ?",
                [nomeAdmin]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    findByEmail: async (emailAdmin) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM admin WHERE emailAdmin = ?",
                [emailAdmin]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    findId: async (id) => {
        try {
            const [linhas] = await pool.query('SELECT * FROM admin WHERE idAdmin = ?', [id]);
            return linhas;
        } catch (error) {
            return error;
        }
    },
    create: async (dadosForm) => {
        try {
            const [linhas] = await pool.query('INSERT INTO admin SET ?', [dadosForm]);
            return linhas;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
    update: async (id, dadosForm) => {
        try {
            const [linhas] = await pool.query('UPDATE admin SET nomeAdmin = ?, emailAdmin = ?, celularAdmin = ?, cepAdmin = ?, logradouroAdmin = ?, bairroAdmin = ?, cidadeAdmin = ?, ufAdmin = ? WHERE idAdmin = ?', [
                dadosForm.nomeAdmin,
                dadosForm.emailAdmin,
                dadosForm.celularAdmin,
                dadosForm.cepAdmin,
                dadosForm.logradouroAdmin,
                dadosForm.bairroAdmin,
                dadosForm.cidadeAdmin,
                dadosForm.ufAdmin,
                id
            ]);
            return linhas;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    delete: async (id) => {
        try {
            const [linhas] = await pool.query('DELETE FROM admin WHERE idAdmin = ?', [id]);
            return linhas;
        } catch (error) {
            return error;
        }
    },
    findAdminCustom: async (filter) => {
        const sql = "SELECT * FROM admin WHERE emailAdmin = ?";
        const [linhas] = await pool.query(sql, [filter.emailAdmin]);
        return linhas;
    }
};

module.exports = adminModel;
