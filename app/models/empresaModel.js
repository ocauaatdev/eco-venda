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
            const [linhas] = await pool.query('UPDATE empresas SET razaoSocial = ?, emailEmpresa = ?, celularEmpresa = ?, cepEmpresa = ?, logradouroEmpresa = ?, bairroEmpresa = ?, cidadeEmpresa = ?, ufEmpresa = ?, numeroEmpresa = ?, complementoEmpresa = ? WHERE idEmpresas = ?', [
                dadosForm.razaoSocial,
                dadosForm.emailEmpresa,
                dadosForm.celularEmpresa,
                dadosForm.cepEmpresa,
                dadosForm.logradouroEmpresa,
                dadosForm.bairroEmpresa,
                dadosForm.cidadeEmpresa,
                dadosForm.ufEmpresa,
                dadosForm.numeroEmpresa,
                dadosForm.complementoEmpresa,
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
    },
    findEmpresaCustom: async(filter) => {
        const sql = "SELECT * FROM empresas WHERE emailEmpresa = ?";
        const [linhas] = await pool.query(sql, [filter.emailEmpresa]);
        return linhas;
    },
    atualizarSenhaEmpresa: async (id, senhaEmpresa) => { 
        try {
            // Verifique se a senhaCliente não é null ou undefined
            if (!senhaEmpresa) {
                throw new Error('Senha não pode ser null ou undefined');
            }
    
            const [resultados] = await pool.query(
                'UPDATE empresas SET senhaEmpresa = ? WHERE idEmpresas = ?',
                [senhaEmpresa, id]
            );
    
            return resultados;
        } catch (error) {
            console.log(error);
            throw error; // Propaga o erro para tratamento posterior
        }
    },
    
    // Adicionando a função para ativar a conta
    atualizarStatusAtivoEmpre: async (id) => {
        try {
            const [linhas] = await pool.query(
                'UPDATE empresas SET status = "ativo" WHERE idEmpresas = ?',
                [id]
            );
            return linhas;
        } catch (error) {
            console.log(error);
            throw error; // Propaga o erro para tratamento posterior
        }
    },
 
    // Função para verificar se a conta está ativa
    verificarStatusAtivoEmpre: async (id) => {
        try {
            const [resultados] = await pool.query(
                'SELECT status FROM empresas WHERE idEmpresas = ?',
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

module.exports = empresaModel;