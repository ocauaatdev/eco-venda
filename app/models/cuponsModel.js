var pool = require("../../config/pool-conexoes");

const cuponsModel = {
    findAll: async () => {
        try {
            const [linhas] = await pool.query('SELECT * FROM cupons');
            return linhas;
        } catch (error) {
            return error;
        }
    },

    findById: async (idCupons) => {
        try {
            const query = 'SELECT * FROM cupons WHERE id = ?';
            const [cupom] = await pool.query(query, [idCupons]);
            return cupom.length > 0 ? cupom[0] : null;
        } catch (error) {
            return error;
        }
    },

    create: async (dadosForm) => {
        const query = 'INSERT INTO cupons SET ?';
        const valores = {
        nomeCupom: dadosForm.nomeCupom,
        descontoCupons: dadosForm.descontoCupons,
        prazoCupons: dadosForm.prazoCupons,
        categoriaCupom: dadosForm.categoriaCupom,
        planoCupom: dadosForm.planoCupom,
    };

    return pool.query(query, valores);
    },

    update: async (idCupons, cupom) => {
        const sql = `UPDATE cupons 
                     SET nomeCupom = ?, descontoCupom = ?, prazoCupom = ?, status = ? 
                     WHERE id = ?`;
        const params = [
            cupom.nomeCupom,
            cupom.descontoCupom,
            cupom.prazoCupom,
            cupom.status,
            idCupons
        ];
        try {
            await pool.query(sql, params);
            return true;
        } catch (error) {
            return error;
        }
    },

    delete: async (idCupons) => {
        try {
            await pool.query('DELETE FROM cupons WHERE id = ?', [idCupons]);
            return true;
        } catch (error) {
            return error;
        }
    }
};

module.exports = cuponsModel;
