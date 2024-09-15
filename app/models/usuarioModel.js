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
    findByCpf: async (cpfCliente) => {
        try {
            const [resultados] = await pool.query(
                "SELECT * FROM clientes WHERE cpfCliente = ?",
                [cpfCliente]
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

    
    update: async (id, dadosForm) => {
        try {
            const [linhas] = await pool.query('UPDATE clientes SET nomeCliente = ?, emailCliente = ?, celularCliente = ?, cpfCliente = ?, cepCliente = ?, logradouroCliente = ?, bairroCliente = ?, cidadeCliente = ?, ufCliente = ? WHERE idClientes = ?', [
                dadosForm.nomeCliente,
                dadosForm.emailCliente,
                dadosForm.celularCliente,
                dadosForm.cpfCliente,
                dadosForm.cepCliente,
                dadosForm.logradouroCliente,
                dadosForm.bairroCliente,
                dadosForm.cidadeCliente,
                dadosForm.ufCliente,
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
            const [linhas] = await pool.query('DELETE FROM clientes WHERE idClientes = ?', [id]);
            return linhas;
        } catch (error) {
            return error;
        }
    },
    findUserCustom: async(filter) => {
        const sql = "SELECT * FROM clientes WHERE emailCliente = ?";
        const [linhas] = await pool.query(sql, [filter.emailCliente]);
        return linhas;
    },
    atualizarSenhaUser: async (id, senhaCliente) => { 
        try {
            // Verifique se a senhaCliente não é null ou undefined
            if (!senhaCliente) {
                throw new Error('Senha não pode ser null ou undefined');
            }
    
            const [resultados] = await pool.query(
                'UPDATE clientes SET senhaCliente = ? WHERE idClientes = ?',
                [senhaCliente, id]
            );
    
            return resultados;
        } catch (error) {
            console.log(error);
            throw error; // Propaga o erro para tratamento posterior
        }
    },
    
    // Adicionando a função para ativar a conta
    atualizarStatusAtivo: async (id) => {
        try {
            const [linhas] = await pool.query(
                'UPDATE clientes SET status = "ativo" WHERE idClientes = ?',
                [id]
            );
            return linhas;
        } catch (error) {
            console.log(error);
            throw error; // Propaga o erro para tratamento posterior
        }
    },
 
    // Função para verificar se a conta está ativa
    verificarStatusAtivo: async (id) => {
        try {
            const [resultados] = await pool.query(
                'SELECT status FROM clientes WHERE idClientes = ?',
                [id]
            );
            if (resultados.length > 0) {
                return resultados[0].status === 'ativo';
            }
            return false;
        } catch (error) {
            console.log(error);
            throw error; // Propaga o erro para tratamento posterior
        }
    }
};

module.exports = clientesModel;
