<template>
  <div class="contentor-callback">
    <div class="painel-callback">
      <div v-if="carregando" class="estado-carregando">
        <div class="spinner"></div>
        <p>A processar autenticação...</p>
      </div>

      <div v-else-if="erro" class="estado-erro">
        <span class="icone-erro">!</span>
        <h2>Erro na Autenticação</h2>
        <p>{{ mensagemErro }}</p>
        <router-link to="/" class="btn btn-primario">
          Voltar ao Início
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAutenticacaoStore } from '../store/autenticacao';

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAutenticacaoStore();

    const carregando = ref(true);
    const erro = ref(false);
    const mensagemErro = ref('');

    onMounted(async () => {
      const token = route.query.token;

      if (token) {
        try {
          // Guardar token
          localStorage.setItem('token', token);
          authStore.token = token;
          authStore.configurarAxios();

          // Obter dados do perfil
          const resultado = await authStore.obterPerfil();

          if (resultado.sucesso) {
            // Redirecionar baseado no tipo de utilizador
            const tipo = authStore.tipoUtilizador;

            if (tipo === 'administrador') {
              router.push('/admin/utilizadores');
            } else if (tipo === 'docente') {
              router.push('/minhas-propostas');
            } else if (tipo === 'aluno') {
              router.push('/ucs-disponiveis');
            } else {
              router.push('/perfil');
            }
          } else {
            erro.value = true;
            mensagemErro.value = resultado.mensagem || 'Não foi possível obter os dados do perfil.';
            carregando.value = false;
          }
        } catch (e) {
          console.error('Erro no callback:', e);
          erro.value = true;
          mensagemErro.value = 'Ocorreu um erro ao processar a autenticação.';
          carregando.value = false;
        }
      } else {
        erro.value = true;
        mensagemErro.value = 'Token de autenticação não recebido.';
        carregando.value = false;
      }
    });

    return {
      carregando,
      erro,
      mensagemErro
    };
  }
};
</script>

<style scoped>
.contentor-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.painel-callback {
  width: 100%;
  max-width: 400px;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  padding: 3rem;
  text-align: center;
}

.estado-carregando {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--cor-borda);
  border-top-color: var(--cor-destaque-primario);
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

.estado-carregando p {
  color: var(--cor-texto-secundario);
  font-size: 1rem;
}

.estado-erro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.icone-erro {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-erro);
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 50%;
}

.estado-erro h2 {
  color: var(--cor-texto-principal);
  font-size: 1.25rem;
  margin: 0;
}

.estado-erro p {
  color: var(--cor-texto-secundario);
  margin: 0 0 1rem 0;
}
</style>
