const pool = require("../../config/pool-conexoes");
const bcrypt = require('bcryptjs');

const clientesModel = {
    findAll: async () => {
        try {
            const [linhas] = await pool.query('SELECT * FROM clientes');
            return linhas;
        } catch (error) {
            return error;
        }
    },

    findUser: async (nomeCliente) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM clientes WHERE nomeCliente = ?",
                [nomeCliente]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },

    findByEmail: async (emailCliente) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM clientes WHERE emailCliente = ?",
                [emailCliente]
            );
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
