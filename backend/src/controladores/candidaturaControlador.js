import * as candidaturaModelo from '../modelos/candidaturaModelo.js';
import { buscarPropostaPorId, associarAluno } from '../modelos/propostaModelo.js';
import path from 'path';
import fs from 'fs';

/**
 * Submeter nova candidatura (aluno)
 */
export const submeterCandidatura = async (req, res) => {
    try {
        const { proposta_id, observacoes } = req.body;
        const alunoId = req.utilizador.id;

        // Validar proposta_id
        if (!proposta_id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID da proposta é obrigatório'
            });
        }

        // Verificar se proposta existe e está publicada
        const proposta = await buscarPropostaPorId(proposta_id);
        if (!proposta) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Proposta não encontrada'
            });
        }

        if (proposta.estado !== 'publicada') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Só é possível candidatar-se a propostas publicadas'
            });
        }

        // Verificar se já existe candidatura
        const candidaturaExistente = await candidaturaModelo.verificarCandidaturaExistente(alunoId, proposta_id);
        if (candidaturaExistente) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Já submeteu uma candidatura a esta proposta'
            });
        }

        // Criar candidatura
        const novaCandidatura = await candidaturaModelo.criarCandidatura({
            aluno_id: alunoId,
            proposta_id,
            observacoes
        });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Candidatura submetida com sucesso',
            dados: { candidatura: novaCandidatura }
        });
    } catch (erro) {
        console.error('Erro ao submeter candidatura:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao submeter candidatura'
        });
    }
};

/**
 * Listar candidaturas do aluno autenticado
 */
export const listarMinhasCandidaturas = async (req, res) => {
    try {
        const alunoId = req.utilizador.id;
        const candidaturas = await candidaturaModelo.listarCandidaturasPorAluno(alunoId);

        res.json({
            sucesso: true,
            dados: { candidaturas }
        });
    } catch (erro) {
        console.error('Erro ao listar candidaturas:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao listar candidaturas'
        });
    }
};

/**
 * Listar candidaturas de uma proposta (docente)
 */
export const listarCandidaturasProposta = async (req, res) => {
    try {
        const { propostaId } = req.params;
        const docenteId = req.utilizador.id;

        // Verificar se proposta existe e pertence ao docente
        const proposta = await buscarPropostaPorId(propostaId);
        if (!proposta) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Proposta não encontrada'
            });
        }

        if (proposta.orientador_id !== docenteId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para ver as candidaturas desta proposta'
            });
        }

        const candidaturas = await candidaturaModelo.listarCandidaturasPorProposta(propostaId);

        res.json({
            sucesso: true,
            dados: { candidaturas }
        });
    } catch (erro) {
        console.error('Erro ao listar candidaturas da proposta:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao listar candidaturas'
        });
    }
};

/**
 * Alterar estado da candidatura (docente)
 */
export const alterarEstadoCandidatura = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observacoes } = req.body;
        const docenteId = req.utilizador.id;

        // Validar estado
        const estadosValidos = ['aceite', 'rejeitada', 'pendente'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Estado inválido. Use: aceite, rejeitada ou pendente'
            });
        }

        // Obter candidatura
        const candidatura = await candidaturaModelo.obterCandidaturaPorId(id);
        if (!candidatura) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Candidatura não encontrada'
            });
        }

        // Verificar se proposta pertence ao docente
        if (candidatura.orientador_id !== docenteId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para alterar esta candidatura'
            });
        }

        const candidaturaAtualizada = await candidaturaModelo.atualizarEstadoCandidatura(id, estado, observacoes);

        // Se a candidatura foi aceite, atribuir automaticamente o aluno à proposta
        if (estado === 'aceite') {
            try {
                await associarAluno(candidatura.proposta_id, candidatura.aluno_id);
            } catch (erroAssociacao) {
                // Não falhar se já existir a associação (ON CONFLICT DO NOTHING cuida disso)
                console.log('Aluno já estava associado à proposta ou erro na associação:', erroAssociacao.message);
            }
        }

        res.json({
            sucesso: true,
            mensagem: `Candidatura ${estado === 'aceite' ? 'aceite' : estado === 'rejeitada' ? 'rejeitada' : 'atualizada'} com sucesso`,
            dados: { candidatura: candidaturaAtualizada }
        });
    } catch (erro) {
        console.error('Erro ao alterar estado da candidatura:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao alterar estado da candidatura'
        });
    }
};

/**
 * Upload de anexo para candidatura (aluno)
 */
export const adicionarAnexo = async (req, res) => {
    try {
        const { id } = req.params;
        const alunoId = req.utilizador.id;

        if (!req.file) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Nenhum ficheiro enviado'
            });
        }

        // Obter candidatura
        const candidatura = await candidaturaModelo.obterCandidaturaPorId(id);
        if (!candidatura) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Candidatura não encontrada'
            });
        }

        // Verificar se candidatura pertence ao aluno
        if (candidatura.aluno_id !== alunoId) {
            // Remover ficheiro já uploadado
            fs.unlinkSync(req.file.path);
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para adicionar anexos a esta candidatura'
            });
        }

        // Determinar tipo do ficheiro (deve corresponder ao enum tipo_ficheiro no SQL)
        const ext = path.extname(req.file.originalname).toLowerCase();
        let tipo = 'txt'; // valor por defeito
        if (ext === '.pdf') tipo = 'pdf';
        else if (ext === '.zip') tipo = 'zip';
        else if (ext === '.doc') tipo = 'doc';
        else if (ext === '.docx') tipo = 'docx';
        else if (ext === '.txt') tipo = 'txt';

        // Criar registo do anexo
        const anexo = await candidaturaModelo.adicionarAnexoCandidatura({
            candidatura_id: id,
            nome_ficheiro: req.file.originalname,
            caminho: req.file.path,
            tipo,
            tamanho_bytes: req.file.size
        });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Anexo adicionado com sucesso',
            dados: { anexo }
        });
    } catch (erro) {
        console.error('Erro ao adicionar anexo:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao adicionar anexo'
        });
    }
};

/**
 * Listar anexos de uma candidatura
 */
export const listarAnexos = async (req, res) => {
    try {
        const { id } = req.params;
        const utilizadorId = req.utilizador.id;
        const tipoUtilizador = req.utilizador.tipo;

        // Obter candidatura
        const candidatura = await candidaturaModelo.obterCandidaturaPorId(id);
        if (!candidatura) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Candidatura não encontrada'
            });
        }

        // Verificar permissões (aluno dono ou docente da proposta)
        if (tipoUtilizador === 'aluno' && candidatura.aluno_id !== utilizadorId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para ver os anexos desta candidatura'
            });
        }

        if (tipoUtilizador === 'docente' && candidatura.orientador_id !== utilizadorId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para ver os anexos desta candidatura'
            });
        }

        const anexos = await candidaturaModelo.listarAnexosCandidatura(id);

        res.json({
            sucesso: true,
            dados: { anexos }
        });
    } catch (erro) {
        console.error('Erro ao listar anexos:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao listar anexos'
        });
    }
};

/**
 * Download de anexo de candidatura
 */
export const downloadAnexo = async (req, res) => {
    try {
        const { anexoId } = req.params;
        const utilizadorId = req.utilizador.id;
        const tipoUtilizador = req.utilizador.tipo;

        // Obter anexo
        const anexo = await candidaturaModelo.obterAnexoPorId(anexoId);
        if (!anexo) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Anexo não encontrado'
            });
        }

        // Obter candidatura para verificar permissões
        const candidatura = await candidaturaModelo.obterCandidaturaPorId(anexo.candidatura_id);
        if (!candidatura) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Candidatura não encontrada'
            });
        }

        // Verificar permissões (aluno dono ou docente da proposta)
        if (tipoUtilizador === 'aluno' && candidatura.aluno_id !== utilizadorId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para descarregar este anexo'
            });
        }

        if (tipoUtilizador === 'docente' && candidatura.orientador_id !== utilizadorId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para descarregar este anexo'
            });
        }

        // Verificar se ficheiro existe
        if (!fs.existsSync(anexo.caminho)) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ficheiro não encontrado no servidor'
            });
        }

        // Enviar ficheiro para download
        res.download(anexo.caminho, anexo.nome_ficheiro);
    } catch (erro) {
        console.error('Erro ao descarregar anexo:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao descarregar anexo'
        });
    }
};

/**
 * Eliminar anexo (aluno)
 */
export const eliminarAnexo = async (req, res) => {
    try {
        const { candidaturaId, anexoId } = req.params;
        const alunoId = req.utilizador.id;

        // Obter anexo
        const anexo = await candidaturaModelo.obterAnexoPorId(anexoId);
        if (!anexo) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Anexo não encontrado'
            });
        }

        // Verificar se pertence ao aluno
        if (anexo.aluno_id !== alunoId) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para eliminar este anexo'
            });
        }

        // Remover ficheiro físico
        if (fs.existsSync(anexo.caminho)) {
            fs.unlinkSync(anexo.caminho);
        }

        // Remover registo
        await candidaturaModelo.eliminarAnexo(anexoId);

        res.json({
            sucesso: true,
            mensagem: 'Anexo eliminado com sucesso'
        });
    } catch (erro) {
        console.error('Erro ao eliminar anexo:', erro);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao eliminar anexo'
        });
    }
};
