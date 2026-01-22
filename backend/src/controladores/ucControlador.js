import * as ucModelo from '../modelos/ucModelo.js';

/**
 * Listar todas as UCs (público)
 */
export const listarUCs = async (req, res) => {
    try {
        const ucs = await ucModelo.listarUCs();
        res.json({
            sucesso: true,
            dados: { ucs }
        });
    } catch (erro) {
        console.error('Erro ao listar UCs:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao listar unidades curriculares'
        });
    }
};

/**
 * Listar UCs com propostas publicadas (para alunos)
 */
export const listarUCsDisponiveis = async (req, res) => {
    try {
        const ucs = await ucModelo.listarUCsComPropostas();
        res.json({
            sucesso: true,
            dados: { ucs }
        });
    } catch (erro) {
        console.error('Erro ao listar UCs disponíveis:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao listar unidades curriculares'
        });
    }
};

/**
 * Listar UCs do docente autenticado
 */
export const listarMinhasUCs = async (req, res) => {
    try {
        const docenteId = req.utilizador.id;
        const ucs = await ucModelo.listarUCsPorDocente(docenteId);
        res.json({
            sucesso: true,
            dados: { ucs }
        });
    } catch (erro) {
        console.error('Erro ao listar minhas UCs:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao listar unidades curriculares'
        });
    }
};

/**
 * Obter UC por ID
 */
export const obterUC = async (req, res) => {
    try {
        const { id } = req.params;
        const uc = await ucModelo.obterUCPorId(id);

        if (!uc) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Unidade curricular não encontrada'
            });
        }

        res.json({
            sucesso: true,
            dados: { uc }
        });
    } catch (erro) {
        console.error('Erro ao obter UC:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao obter unidade curricular'
        });
    }
};

/**
 * Listar propostas de uma UC (para alunos)
 */
export const listarPropostasUC = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se UC existe
        const uc = await ucModelo.obterUCPorId(id);
        if (!uc) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Unidade curricular não encontrada'
            });
        }

        const propostas = await ucModelo.listarPropostasUC(id);
        res.json({
            sucesso: true,
            dados: { uc, propostas }
        });
    } catch (erro) {
        console.error('Erro ao listar propostas da UC:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao listar propostas'
        });
    }
};

/**
 * Criar nova UC (docente)
 */
export const criarUC = async (req, res) => {
    try {
        const { nome, codigo, descricao, ano_letivo } = req.body;
        const docenteId = req.utilizador.id;

        // Validações
        if (!nome || !codigo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome e código são obrigatórios'
            });
        }

        // Verificar se código já existe
        const ucExistente = await ucModelo.obterUCPorCodigo(codigo);
        if (ucExistente) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Já existe uma UC com este código'
            });
        }

        const novaUC = await ucModelo.criarUC({
            nome,
            codigo,
            descricao,
            docente_id: docenteId,
            ano_letivo
        });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Unidade curricular criada com sucesso',
            dados: { uc: novaUC }
        });
    } catch (erro) {
        console.error('Erro ao criar UC:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao criar unidade curricular'
        });
    }
};

/**
 * Atualizar UC (docente proprietário)
 */
export const atualizarUC = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, codigo, descricao, ano_letivo } = req.body;
        const docenteId = req.utilizador.id;

        // Verificar se UC existe e pertence ao docente
        const eProprietario = await ucModelo.verificarProprietarioUC(id, docenteId);
        if (!eProprietario) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para editar esta UC'
            });
        }

        // Validações
        if (!nome || !codigo) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nome e código são obrigatórios'
            });
        }

        // Verificar se código já existe (excluindo a própria UC)
        const ucExistente = await ucModelo.obterUCPorCodigo(codigo);
        if (ucExistente && ucExistente.id !== parseInt(id)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Já existe uma UC com este código'
            });
        }

        const ucAtualizada = await ucModelo.atualizarUC(id, {
            nome,
            codigo,
            descricao,
            ano_letivo
        });

        res.json({
            sucesso: true,
            mensagem: 'Unidade curricular atualizada com sucesso',
            dados: { uc: ucAtualizada }
        });
    } catch (erro) {
        console.error('Erro ao atualizar UC:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao atualizar unidade curricular'
        });
    }
};

/**
 * Eliminar UC (docente proprietário)
 */
export const eliminarUC = async (req, res) => {
    try {
        const { id } = req.params;
        const docenteId = req.utilizador.id;

        // Verificar se UC existe e pertence ao docente
        const eProprietario = await ucModelo.verificarProprietarioUC(id, docenteId);
        if (!eProprietario) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para eliminar esta UC'
            });
        }

        await ucModelo.eliminarUC(id);

        res.json({
            sucesso: true,
            mensagem: 'Unidade curricular eliminada com sucesso'
        });
    } catch (erro) {
        console.error('Erro ao eliminar UC:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao eliminar unidade curricular'
        });
    }
};
