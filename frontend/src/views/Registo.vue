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

      <h2 class="formulario-titulo">Criar Conta</h2>

      <!-- Mensagem de sucesso -->
      <div v-if="registoSucesso" class="alerta alerta-sucesso">
        <strong>Registo realizado com sucesso!</strong>
        <p>A sua conta foi criada e aguarda aprovação do administrador. Receberá uma notificação quando for aprovada.</p>
        <router-link to="/" class="btn btn-contorno margem-topo">
          Voltar ao Início
        </router-link>
      </div>

      <!-- Formulário de registo -->
      <template v-else>
        <div v-if="mensagemErro" class="alerta alerta-erro">
          {{ mensagemErro }}
        </div>

        <form @submit.prevent="fazerRegisto" class="formulario-autenticacao">
          <div class="formulario-grupo">
            <label for="nome" class="formulario-label">Nome Completo</label>
            <input
              type="text"
              id="nome"
              v-model="dados.nome"
              class="formulario-input"
              placeholder="João Silva"
              required
            />
          </div>

          <div class="formulario-grupo">
            <label for="email" class="formulario-label">Email</label>
            <input
              type="email"
              id="email"
              v-model="dados.email"
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
              v-model="dados.palavra_passe"
              class="formulario-input"
              placeholder="••••••••"
              required
              minlength="6"
            />
            <small class="texto-ajuda">Mínimo de 6 caracteres</small>
          </div>

          <!-- Campos específicos para Aluno -->
          <template v-if="tipoUtilizador === 'aluno'">
            <div class="formulario-grupo">
              <label for="numero_aluno" class="formulario-label">Número de Aluno</label>
              <input
                type="text"
                id="numero_aluno"
                v-model="dados.numero_aluno"
                class="formulario-input"
                placeholder="2021001"
                required
              />
            </div>

            <div class="formulario-grupo">
              <label for="curso" class="formulario-label">Curso</label>
              <input
                type="text"
                id="curso"
                v-model="dados.curso"
                class="formulario-input"
                placeholder="Engenharia Informática"
              />
            </div>
          </template>

          <!-- Campos específicos para Docente -->
          <template v-if="tipoUtilizador === 'docente'">
            <div class="formulario-grupo">
              <label for="gabinete" class="formulario-label">Gabinete</label>
              <input
                type="text"
                id="gabinete"
                v-model="dados.gabinete"
                class="formulario-input"
                placeholder="Gab. 201"
              />
            </div>

            <div class="formulario-grupo">
              <label for="departamento" class="formulario-label">Departamento</label>
              <input
                type="text"
                id="departamento"
                v-model="dados.departamento"
                class="formulario-input"
                placeholder="Departamento de Informática"
              />
            </div>
          </template>

          <button type="submit" class="btn btn-primario largura-total" :disabled="carregando">
            <span v-if="carregando" class="indicador-carregamento"></span>
            {{ carregando ? 'A registar...' : 'Criar Conta' }}
          </button>

          <div class="separador-texto">
            <span>ou</span>
          </div>

          <p class="texto-centro texto-secundario">
            Já tem conta?
            <router-link :to="'/login/' + tipoUtilizador" class="ligacao-destaque">Iniciar sessão</router-link>
          </p>

          <p class="texto-centro texto-secundario margem-topo">
            <router-link to="/" class="ligacao-voltar">
              <span class="seta-voltar">←</span> Escolher outro perfil
            </router-link>
          </p>
        </form>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAutenticacaoStore } from '../store/autenticacao';

export default {
  name: 'Registo',
  setup() {
    const route = useRoute();
    const autenticacaoStore = useAutenticacaoStore();

    const tipoUtilizador = computed(() => route.params.tipo || 'docente');

    const nomeTipo = computed(() => {
      const tipos = {
        aluno: 'Aluno',
        docente: 'Docente'
      };
      return tipos[tipoUtilizador.value] || 'Utilizador';
    });

    const iconeTipo = computed(() => {
      const icones = {
        aluno: '◈',
        docente: '◎'
      };
      return icones[tipoUtilizador.value] || '○';
    });

    const dados = ref({
      nome: '',
      email: '',
      palavra_passe: '',
      numero_aluno: '',
      curso: '',
      gabinete: '',
      departamento: ''
    });

    const mensagemErro = ref('');
    const carregando = ref(false);
    const registoSucesso = ref(false);

    const fazerRegisto = async () => {
      mensagemErro.value = '';
      carregando.value = true;

      // Preparar dados com tipo
      const dadosRegisto = {
        nome: dados.value.nome,
        email: dados.value.email,
        palavra_passe: dados.value.palavra_passe,
        tipo: tipoUtilizador.value
      };

      // Adicionar campos específicos
      if (tipoUtilizador.value === 'aluno') {
        dadosRegisto.numero_aluno = dados.value.numero_aluno;
        dadosRegisto.curso = dados.value.curso;
      } else if (tipoUtilizador.value === 'docente') {
        dadosRegisto.gabinete = dados.value.gabinete;
        dadosRegisto.departamento = dados.value.departamento;
      }

      const resultado = await autenticacaoStore.registar(dadosRegisto);

      carregando.value = false;

      if (resultado.sucesso) {
        registoSucesso.value = true;
      } else {
        mensagemErro.value = resultado.mensagem;
      }
    };

    return {
      dados,
      mensagemErro,
      carregando,
      fazerRegisto,
      tipoUtilizador,
      nomeTipo,
      iconeTipo,
      registoSucesso
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

.texto-ajuda {
  color: var(--cor-texto-terciario);
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
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

/* Alerta de sucesso customizado */
.alerta-sucesso {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.alerta-sucesso::before {
  display: none;
}

.alerta-sucesso p {
  margin: 0.5rem 0 0 0;
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
