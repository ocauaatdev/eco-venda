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
    updateStatus: async (idCupons, novoStatus) => {
        const query = `UPDATE cupons SET statusCupom = ? WHERE idCupons = ?`;
        await pool.query(query, [novoStatus, idCupons]);
    },

    getCuponsExpirados: async () => {
        const query = 
            `SELECT idCupons, DATEDIFF(prazoCupons, NOW()) AS diasRestantes 
            FROM cupons
            WHERE DATEDIFF(prazoCupons, NOW()) < 0 AND statusCupom != 'expirado';`;
    
        try {
            const [result] = await pool.query(query);
            return result;
        } catch (err) {
            console.error("Erro ao buscar cupons expirados:", err);
            throw err;
        }
      },

     verificarCupomUsado: async (usuarioId, codigoCupom) => {
        const query = 'SELECT * FROM cupons_usados WHERE usuarioId = ? AND cupomCodigo = ?';
        const [result] = await pool.query(query, [usuarioId, codigoCupom]);
        return result.length > 0; // Retorna true se o cupom já foi usado
    },
    
     marcarCupomComoUsado: async(usuarioId, codigoCupom) => {
        const query = 'INSERT INTO cupons_usados (usuarioId, cupomCodigo) VALUES (?, ?)';
        await pool.query(query, [usuarioId, codigoCupom]);
    }
    ,
    findById: async (idCupons) => {
        try {
            const query = 'SELECT * FROM cupons WHERE id = ?';
            const [cupom] = await pool.query(query, [idCupons]);
            return cupom.length > 0 ? cupom[0] : null;
        } catch (error) {
            return error;
        }
    },

    findByCodigo: async (codigoCupom) => {
        try {
            const query = 'SELECT * FROM cupons WHERE nomeCupom = ? AND prazoCupons >= NOW()';
            const [result] = await pool.query(query, [codigoCupom]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Erro ao buscar cupom:", error);
            return null;
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
        tipoCupom: dadosForm.tipoCupom
    };

    return pool.query(query, valores);
    },

    update: async (idCupons, cupom) => {
        const sql = `UPDATE cupons 
                     SET nomeCupom = ?, descontoCupom = ?, prazoCupom = ?, statusCupom = ? 
                     WHERE id = ?`;
        const params = [
            cupom.nomeCupom,
            cupom.descontoCupom,
            cupom.prazoCupom,
            cupom.statusCupom,
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
