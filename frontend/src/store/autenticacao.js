import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAutenticacaoStore = defineStore('autenticacao', {
  state: () => ({
    utilizador: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    estaAutenticado: (state) => !!state.token,
    utilizadorAtual: (state) => state.utilizador,
    tipoUtilizador: (state) => state.utilizador?.tipo || null,
    estaAprovado: (state) => state.utilizador?.aprovado || false,
    eAdmin: (state) => state.utilizador?.tipo === 'administrador',
    eDocente: (state) => state.utilizador?.tipo === 'docente',
    eAluno: (state) => state.utilizador?.tipo === 'aluno',
    // Compatibilidade com código antigo
    docenteAtual: (state) => state.utilizador
  },

  actions: {
    /**
     * Registar novo utilizador (docente ou aluno)
     */
    async registar(dados) {
      try {
        const resposta = await axios.post(`${API_URL}/auth/registar`, dados);

        if (resposta.data.sucesso) {
          // Não fazer login automático - aguardar aprovação
          return { sucesso: true, mensagem: resposta.data.mensagem };
        }

        return { sucesso: false, mensagem: resposta.data.mensagem };
      } catch (erro) {
        console.error('Erro ao registar:', erro);
        return {
          sucesso: false,
          mensagem: erro.response?.data?.mensagem || 'Erro ao registar utilizador'
        };
      }
    },

    /**
     * Fazer login
     */
    async login(credenciais) {
      try {
        const resposta = await axios.post(`${API_URL}/auth/login`, credenciais);

        if (resposta.data.sucesso) {
          this.token = resposta.data.dados.token;
          this.utilizador = resposta.data.dados.utilizador;
          localStorage.setItem('token', this.token);
          this.configurarAxios();
          return { sucesso: true };
        }

        return { sucesso: false, mensagem: resposta.data.mensagem };
      } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        return {
          sucesso: false,
          mensagem: erro.response?.data?.mensagem || 'Erro ao fazer login'
        };
      }
    },

    /**
     * Obter perfil do utilizador autenticado
     */
    async obterPerfil() {
      try {
        this.configurarAxios();
        const resposta = await axios.get(`${API_URL}/auth/perfil`);

        if (resposta.data.sucesso) {
          this.utilizador = resposta.data.dados.utilizador;
          return { sucesso: true, dados: resposta.data.dados };
        }

        return { sucesso: false, mensagem: resposta.data.mensagem };
      } catch (erro) {
        console.error('Erro ao obter perfil:', erro);
        if (erro.response?.status === 401) {
          this.terminarSessao();
        }
        return {
          sucesso: false,
          mensagem: erro.response?.data?.mensagem || 'Erro ao obter perfil'
        };
      }
    },

    /**
     * Atualizar perfil
     */
    async atualizarPerfil(dados) {
      try {
        this.configurarAxios();
        const resposta = await axios.put(`${API_URL}/auth/perfil`, dados);

        if (resposta.data.sucesso) {
          this.utilizador = resposta.data.dados.utilizador;
          return { sucesso: true, mensagem: resposta.data.mensagem };
        }

        return { sucesso: false, mensagem: resposta.data.mensagem };
      } catch (erro) {
        console.error('Erro ao atualizar perfil:', erro);
        return {
          sucesso: false,
          mensagem: erro.response?.data?.mensagem || 'Erro ao atualizar perfil'
        };
      }
    },

    /**
     * Terminar sessão (logout)
     */
    terminarSessao() {
      this.token = null;
      this.utilizador = null;
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    },

    /**
     * Configurar axios com token de autenticação
     */
    configurarAxios() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    },

    /**
     * Verificar se token é válido
     */
    async verificarToken() {
      if (!this.token) {
        return false;
      }

      const resultado = await this.obterPerfil();
      return resultado.sucesso;
    }
  }
});
