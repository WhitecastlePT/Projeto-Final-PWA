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
import { ref, computed } from 'vue';
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
    const carregando = ref(false);

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
      carregando,
      fazerLogin,
      tipoUtilizador,
      nomeTipo,
      iconeTipo
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
