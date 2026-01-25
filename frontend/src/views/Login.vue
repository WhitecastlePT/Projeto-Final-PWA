<template>
  <div class="contentor-autenticacao">
    <div class="painel-autenticacao">
      <div class="painel-cabecalho">
        <h1 class="painel-titulo">SGP</h1>
        <p class="painel-subtitulo">Sistema de Gestão de Propostas</p>
      </div>

      <!-- Indicador de tipo de utilizador -->
      <div class="tipo-utilizador-badge" :class="'tipo-' + tipoUtilizador">
        <span class="tipo-icone">{{ iconeTipo }}</span>
        <span class="tipo-nome">{{ nomeTipo }}</span>
      </div>

      <h2 class="formulario-titulo">Iniciar Sessão</h2>

      <div v-if="mensagemErro" class="alerta alerta-erro">
        {{ mensagemErro }}
      </div>

      <div v-if="mensagemPendente" class="alerta alerta-aviso">
        {{ mensagemPendente }}
      </div>

      <form @submit.prevent="fazerLogin" class="formulario-autenticacao">
        <div class="formulario-grupo">
          <label for="email" class="formulario-label">Email</label>
          <input
            type="email"
            id="email"
            v-model="credenciais.email"
            class="formulario-input"
            placeholder="exemplo@email.com"
            required
          />
        </div>

        <div class="formulario-grupo">
          <label for="palavra_passe" class="formulario-label">Palavra-passe</label>
          <input
            type="password"
            id="palavra_passe"
            v-model="credenciais.palavra_passe"
            class="formulario-input"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn btn-primario largura-total" :disabled="carregando">
          <span v-if="carregando" class="indicador-carregamento"></span>
          {{ carregando ? 'A entrar...' : 'Entrar' }}
        </button>

        <div class="separador-texto">
          <span>ou</span>
        </div>

        <!-- Botão Google (não mostrar para admin) -->
        <a
          v-if="tipoUtilizador !== 'administrador'"
          :href="googleAuthUrl"
          class="btn btn-google largura-total"
        >
          <svg class="google-icone" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </a>

        <!-- Não mostrar registo para admin -->
        <p v-if="tipoUtilizador !== 'administrador'" class="texto-centro texto-secundario">
          Não tem conta?
          <router-link :to="'/registo/' + tipoUtilizador" class="ligacao-destaque">Criar conta</router-link>
        </p>

        <p class="texto-centro texto-secundario margem-topo">
          <router-link to="/" class="ligacao-voltar">
            <span class="seta-voltar">←</span> Escolher outro perfil
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAutenticacaoStore } from '../store/autenticacao';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const autenticacaoStore = useAutenticacaoStore();

    const tipoUtilizador = computed(() => route.params.tipo || 'docente');

    const nomeTipo = computed(() => {
      const tipos = {
        aluno: 'Aluno',
        docente: 'Docente',
        administrador: 'Administrador'
      };
      return tipos[tipoUtilizador.value] || 'Utilizador';
    });

    const iconeTipo = computed(() => {
      const icones = {
        aluno: '◈',
        docente: '◎',
        administrador: '◉'
      };
      return icones[tipoUtilizador.value] || '○';
    });

    const credenciais = ref({
      email: '',
      palavra_passe: ''
    });

    const mensagemErro = ref('');
    const mensagemPendente = ref('');
    const carregando = ref(false);

    // URL da API para autenticação Google (passa o tipo de utilizador)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const googleAuthUrl = computed(() => `${API_URL}/auth/google?tipo=${tipoUtilizador.value}`);

    // Verificar query params (erro do Google ou conta pendente)
    onMounted(() => {
      if (route.query.erro === 'google') {
        mensagemErro.value = 'Não foi possível autenticar com o Google. Tente novamente.';
      }
      if (route.query.pendente === 'true') {
        mensagemPendente.value = 'A sua conta foi criada com sucesso! Aguarde a aprovação de um administrador.';
      }
    });

    const fazerLogin = async () => {
      mensagemErro.value = '';
      carregando.value = true;

      const resultado = await autenticacaoStore.login(credenciais.value);

      carregando.value = false;

      if (resultado.sucesso) {
        // Redirecionar baseado no tipo de utilizador
        const tipo = autenticacaoStore.tipoUtilizador;
        if (tipo === 'administrador') {
          router.push('/admin/utilizadores');
        } else if (tipo === 'docente') {
          router.push('/minhas-propostas');
        } else if (tipo === 'aluno') {
          router.push('/ucs-disponiveis');
        } else {
          router.push('/');
        }
      } else {
        mensagemErro.value = resultado.mensagem;
      }
    };

    return {
      credenciais,
      mensagemErro,
      mensagemPendente,
      carregando,
      fazerLogin,
      tipoUtilizador,
      nomeTipo,
      iconeTipo,
      googleAuthUrl
    };
  }
};
</script>

<style scoped>
.contentor-autenticacao {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.painel-autenticacao {
  width: 100%;
  max-width: 420px;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  padding: 2.5rem;
  /* box-shadow: var(--sombra-elevada); */
}

.painel-cabecalho {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--cor-borda);
}

.painel-titulo {
  font-size: 2rem;
  font-weight: 700;
  color: var(--cor-destaque-primario);
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.painel-subtitulo {
  color: var(--cor-texto-secundario);
  font-size: 0.9rem;
  margin: 0;
}

/* Badge de tipo de utilizador */
.tipo-utilizador-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--cor-borda);
  background: var(--cor-fundo-input);
}

.tipo-utilizador-badge.tipo-aluno {
  border-color: var(--cor-destaque-terciario);
}

.tipo-utilizador-badge.tipo-aluno .tipo-icone {
  color: var(--cor-destaque-terciario);
}

.tipo-utilizador-badge.tipo-docente {
  border-color: var(--cor-destaque-primario);
}

.tipo-utilizador-badge.tipo-docente .tipo-icone {
  color: var(--cor-destaque-primario);
}

.tipo-utilizador-badge.tipo-administrador {
  border-color: var(--cor-destaque-secundario);
}

.tipo-utilizador-badge.tipo-administrador .tipo-icone {
  color: var(--cor-destaque-secundario);
}

.tipo-icone {
  font-size: 1.2rem;
}

.tipo-nome {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  color: var(--cor-texto-principal);
}

.formulario-titulo {
  text-align: center;
  color: var(--cor-texto-principal);
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.formulario-autenticacao {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.indicador-carregamento {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  animation: girar 0.8s linear infinite;
  margin-right: 0.5rem;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

.separador-texto {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.separador-texto::before,
.separador-texto::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--cor-borda);
}

.separador-texto span {
  padding: 0 1rem;
  color: var(--cor-texto-terciario);
  font-size: 0.85rem;
  text-transform: uppercase;
}

.ligacao-destaque {
  color: var(--cor-destaque-primario);
  font-weight: 500;
  transition: color var(--transicao-rapida);
}

.ligacao-destaque:hover {
  color: var(--cor-destaque-secundario);
}

.ligacao-voltar {
  color: var(--cor-texto-terciario);
  transition: color var(--transicao-rapida);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.ligacao-voltar:hover {
  color: var(--cor-destaque-primario);
}

.seta-voltar {
  font-size: 1.1rem;
}

.margem-topo {
  margin-top: 1rem;
}

/* Botão Google */
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: var(--cor-fundo-input);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto-principal);
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transicao-rapida);
  margin-bottom: 1rem;
}

.btn-google:hover {
  background: var(--cor-fundo-hover);
  border-color: var(--cor-texto-terciario);
}

.google-icone {
  flex-shrink: 0;
}

/* Alerta de aviso */
.alerta-aviso {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #d97706;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* Responsividade */
@media (max-width: 480px) {
  .contentor-autenticacao {
    padding: 1rem;
  }

  .painel-autenticacao {
    padding: 1.5rem;
  }

  .painel-titulo {
    font-size: 1.75rem;
  }
}
</style>
