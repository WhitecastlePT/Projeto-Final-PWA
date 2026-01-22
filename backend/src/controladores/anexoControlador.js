import path from 'path';
import {
    criarAnexo,
    buscarAnexoPorId,
    listarAnexosProposta,
    eliminarAnexo,
    contarAnexosProposta,
    obterTamanhoTotalAnexos
} from '../modelos/anexoModelo.js';
import { buscarPropostaPorId, verificarPermissaoDocente } from '../modelos/propostaModelo.js';
import { eliminarFicheiro, ficheiroExiste } from '../middlewares/upload.js';

/**
 * Controlador para operações com Anexos
 */

/**
 * Fazer upload de anexo para proposta
 * POST /api/propostas/:id/anexos
 */
export const fazerUpload = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar se proposta existe
        const proposta = await buscarPropostaPorId(id);

        if (!proposta) {
            // Eliminar ficheiro enviado
            if (req.file) {
                await eliminarFicheiro(req.file.path);
            }

            return res.status(404).json({
                sucesso: false,
                mensagem: 'Proposta não encontrada'
            });
        }

        // Verificar permissão
        const temPermissao = await verificarPermissaoDocente(id, req.docenteId);

        if (!temPermissao) {
            // Eliminar ficheiro enviado
            if (req.file) {
                await eliminarFicheiro(req.file.path);
            }

            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para adicionar anexos a esta proposta'
            });
        }

        // Criar registo do anexo na base de dados
        const novoAnexo = await criarAnexo({
            nome_ficheiro: req.ficheiro.nome_original,
            caminho: req.ficheiro.caminho,
            tipo: req.ficheiro.tipo,
            tamanho_bytes: req.ficheiro.tamanho_bytes,
            proposta_id: id
        });

        res.status(201).json({
            sucesso: true,
            mensagem: 'Anexo enviado com sucesso',
            dados: {
                anexo: {
                    id: novoAnexo.id,
                    nome_ficheiro: novoAnexo.nome_ficheiro,
                    tipo: novoAnexo.tipo,
                    tamanho_bytes: novoAnexo.tamanho_bytes,
                    data_upload: novoAnexo.data_upload
                }
            }
        });
    } catch (erro) {
        // Em caso de erro, eliminar ficheiro se foi enviado
        if (req.file) {
            await eliminarFicheiro(req.file.path);
        }

        next(erro);
    }
};

/**
 * Listar anexos de uma proposta
 * GET /api/propostas/:id/anexos
 */
export const listar = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar se proposta existe
        const proposta = await buscarPropostaPorId(id);

        if (!proposta) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Proposta não encontrada'
            });
        }

        const anexos = await listarAnexosProposta(id);
        const totalAnexos = await contarAnexosProposta(id);
        const tamanhoTotal = await obterTamanhoTotalAnexos(id);

        res.json({
            sucesso: true,
            dados: {
                total: totalAnexos,
                tamanho_total_bytes: tamanhoTotal,
                anexos
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Fazer download de anexo
 * GET /api/anexos/:id/download
 */
export const fazerDownload = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Buscar anexo
        const anexo = await buscarAnexoPorId(id);

        if (!anexo) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Anexo não encontrado'
            });
        }

        // Verificar se ficheiro existe
        const existe = await ficheiroExiste(anexo.caminho);

        if (!existe) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ficheiro não encontrado no servidor'
            });
        }

        // Definir headers para download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${anexo.nome_ficheiro}"`);

        // Enviar ficheiro
        res.download(anexo.caminho, anexo.nome_ficheiro, (erro) => {
            if (erro) {
                console.error('Erro ao fazer download:', erro);
                if (!res.headersSent) {
                    res.status(500).json({
                        sucesso: false,
                        mensagem: 'Erro ao fazer download do ficheiro'
                    });
                }
            }
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Eliminar anexo
 * DELETE /api/anexos/:id
 */
export const eliminar = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Buscar anexo
        const anexo = await buscarAnexoPorId(id);

        if (!anexo) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Anexo não encontrado'
            });
        }

        // Verificar permissão
        const temPermissao = await verificarPermissaoDocente(anexo.proposta_id, req.docenteId);

        if (!temPermissao) {
            return res.status(403).json({
                sucesso: false,
                mensagem: 'Não tem permissão para eliminar este anexo'
            });
        }

        // Eliminar da base de dados
        await eliminarAnexo(id);

        // Eliminar ficheiro do sistema
        await eliminarFicheiro(anexo.caminho);

        res.json({
            sucesso: true,
            mensagem: 'Anexo eliminado com sucesso'
        });
    } catch (erro) {
        next(erro);
    }
};

/**
 * Obter informações de um anexo
 * GET /api/anexos/:id
 */
export const obterPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const anexo = await buscarAnexoPorId(id);

        if (!anexo) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Anexo não encontrado'
            });
        }

        // Remover caminho completo do sistema por segurança
        const { caminho, orientador_id, ...anexoInfo } = anexo;

        res.json({
            sucesso: true,
            dados: {
                anexo: anexoInfo
            }
        });
    } catch (erro) {
        next(erro);
    }
};
