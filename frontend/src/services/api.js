import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (erro) => {
    return Promise.reject(erro);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (erro.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(erro);
  }
);

/**
 * Serviço de API para Propostas
 */
export const propostasAPI = {
  listar: (filtros = {}) => api.get('/propostas', { params: filtros }),
  obterPorId: (id) => api.get(`/propostas/${id}`),
  listarMinhas: () => api.get('/propostas/minhas'),
  listarAtribuidas: () => api.get('/propostas/atribuidas'),
  criar: (dados) => api.post('/propostas', dados),
  atualizar: (id, dados) => api.put(`/propostas/${id}`, dados),
  eliminar: (id) => api.delete(`/propostas/${id}`),

  // Coorientadores
  adicionarCoorientador: (id, coorientadorId) =>
    api.post(`/propostas/${id}/coorientadores`, { coorientador_id: coorientadorId }),
  removerCoorientador: (id, coorientadorId) =>
    api.delete(`/propostas/${id}/coorientadores/${coorientadorId}`),

  // Alunos
  adicionarAluno: (id, alunoId) =>
    api.post(`/propostas/${id}/alunos`, { aluno_id: alunoId }),
  removerAluno: (id, alunoId) =>
    api.delete(`/propostas/${id}/alunos/${alunoId}`),

  // Palavras-chave
  adicionarPalavraChave: (id, palavraChaveId) =>
    api.post(`/propostas/${id}/palavras-chave`, { palavra_chave_id: palavraChaveId }),
  removerPalavraChave: (id, palavraChaveId) =>
    api.delete(`/propostas/${id}/palavras-chave/${palavraChaveId}`)
};

/**
 * Serviço de API para Anexos
 */
export const anexosAPI = {
  listar: (propostaId) => api.get(`/propostas/${propostaId}/anexos`),
  obterPorId: (id) => api.get(`/anexos/${id}`),
  fazerUpload: (propostaId, ficheiro) => {
    const formData = new FormData();
    formData.append('ficheiro', ficheiro);
    return api.post(`/propostas/${propostaId}/anexos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  fazerDownload: (id) => api.get(`/anexos/${id}/download`, { responseType: 'blob' }),
  eliminar: (id) => api.delete(`/anexos/${id}`)
};

/**
 * Serviço de API para Docentes
 */
export const docentesAPI = {
  listar: () => api.get('/docentes'),
  obterPorId: (id) => api.get(`/docentes/${id}`)
};

/**
 * Serviço de API para Alunos
 */
export const alunosAPI = {
  listar: () => api.get('/alunos'),
  obterPorId: (id) => api.get(`/alunos/${id}`),
  criar: (dados) => api.post('/alunos', dados),
  atualizar: (id, dados) => api.put(`/alunos/${id}`, dados),
  eliminar: (id) => api.delete(`/alunos/${id}`)
};

/**
 * Serviço de API para Palavras-chave
 */
export const palavrasChaveAPI = {
  listar: () => api.get('/palavras-chave'),
  obterPorId: (id) => api.get(`/palavras-chave/${id}`),
  criar: (termo) => api.post('/palavras-chave', { termo }),
  atualizar: (id, termo) => api.put(`/palavras-chave/${id}`, { termo }),
  eliminar: (id) => api.delete(`/palavras-chave/${id}`)
};

/**
 * Serviço de API para Administração
 */
export const adminAPI = {
  listarUtilizadores: () => api.get('/admin/utilizadores'),
  listarPendentes: () => api.get('/admin/utilizadores/pendentes'),
  obterUtilizador: (id) => api.get(`/admin/utilizadores/${id}`),
  atualizarUtilizador: (id, dados) => api.put(`/admin/utilizadores/${id}`, dados),
  aprovarUtilizador: (id) => api.put(`/admin/utilizadores/${id}/aprovar`),
  rejeitarUtilizador: (id) => api.put(`/admin/utilizadores/${id}/rejeitar`),
  alterarTipoUtilizador: (id, tipo) => api.put(`/admin/utilizadores/${id}/tipo`, { tipo }),
  eliminarUtilizador: (id) => api.delete(`/admin/utilizadores/${id}`)
};

/**
 * Serviço de API para Unidades Curriculares
 */
export const ucsAPI = {
  listar: () => api.get('/ucs'),
  obterPorId: (id) => api.get(`/ucs/${id}`),
  listarMinhas: () => api.get('/ucs/minhas'),
  criar: (dados) => api.post('/ucs', dados),
  atualizar: (id, dados) => api.put(`/ucs/${id}`, dados),
  eliminar: (id) => api.delete(`/ucs/${id}`)
};

/**
 * Serviço de API para Candidaturas
 */
export const candidaturasAPI = {
  submeter: (dados) => api.post('/candidaturas', dados),
  listarMinhas: () => api.get('/candidaturas/minhas'),
  listarPorProposta: (propostaId) => api.get(`/candidaturas/proposta/${propostaId}`),
  alterarEstado: (id, estado, observacoes) => api.put(`/candidaturas/${id}/estado`, { estado, observacoes }),
  listarAnexos: (candidaturaId) => api.get(`/candidaturas/${candidaturaId}/anexos`),
  downloadAnexo: (anexoId) => api.get(`/candidaturas/anexos/${anexoId}/download`, { responseType: 'blob' }),
  adicionarAnexo: (id, ficheiro) => {
    const formData = new FormData();
    formData.append('ficheiro', ficheiro);
    return api.post(`/candidaturas/${id}/anexos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  eliminarAnexo: (candidaturaId, anexoId) => api.delete(`/candidaturas/${candidaturaId}/anexos/${anexoId}`)
};

export default api;
