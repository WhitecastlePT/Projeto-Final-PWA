<template>
  <div class="minhas-candidaturas">
    <div class="pagina-cabecalho">
      <h1 class="pagina-titulo">Minhas Candidaturas</h1>
      <p class="pagina-subtitulo">Acompanhe o estado das suas candidaturas</p>
    </div>

    <!-- Mensagens -->
    <div v-if="mensagemSucesso" class="alerta alerta-sucesso">
      {{ mensagemSucesso }}
    </div>
    <div v-if="mensagemErro" class="alerta alerta-erro">
      {{ mensagemErro }}
    </div>

    <!-- Carregando -->
    <div v-if="carregando" class="carregando-container">
      <div class="indicador-carregamento"></div>
      <span>A carregar candidaturas...</span>
    </div>

    <!-- Lista de candidaturas -->
    <div v-else-if="candidaturas.length > 0" class="candidaturas-lista">
      <div v-for="candidatura in candidaturas" :key="candidatura.id" class="candidatura-cartao">
        <div class="candidatura-cabecalho">
          <div class="candidatura-info">
            <span v-if="candidatura.uc_codigo" class="uc-codigo">{{ candidatura.uc_codigo }}</span>
            <h3 class="proposta-titulo">{{ candidatura.proposta_titulo }}</h3>
          </div>
          <span class="candidatura-estado" :class="'estado-' + candidatura.estado">
            {{ formatarEstado(candidatura.estado) }}
          </span>
        </div>

        <p v-if="candidatura.proposta_descricao" class="proposta-descricao">
          {{ truncarTexto(candidatura.proposta_descricao, 150) }}
        </p>

        <div class="candidatura-detalhes">
          <div class="detalhe">
            <span class="detalhe-label">Orientador:</span>
            <span class="detalhe-valor">{{ candidatura.orientador_nome }}</span>
          </div>
          <div v-if="candidatura.uc_nome" class="detalhe">
            <span class="detalhe-label">UC:</span>
            <span class="detalhe-valor">{{ candidatura.uc_nome }}</span>
          </div>
          <div class="detalhe">
            <span class="detalhe-label">Submetida:</span>
            <span class="detalhe-valor">{{ formatarData(candidatura.data_submissao) }}</span>
          </div>
        </div>

        <!-- Feedback do docente (se houver) -->
        <div v-if="candidatura.feedback_docente && candidatura.estado !== 'pendente'" class="candidatura-feedback">
          <strong>Feedback do docente:</strong>
          <p>{{ candidatura.feedback_docente }}</p>
        </div>

        <div class="candidatura-acoes">
          <router-link :to="'/propostas/' + candidatura.proposta_id" class="btn btn-secundario">
            Ver Proposta
          </router-link>
        </div>
      </div>
    </div>

    <!-- Vazio -->
    <div v-else class="estado-vazio">
      <span class="estado-vazio-icone">◇</span>
      <h3>Sem Candidaturas</h3>
      <p>Ainda não submeteu nenhuma candidatura.</p>
      <router-link to="/ucs-disponiveis" class="btn btn-primario">
        Ver UC's Disponíveis
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { candidaturasAPI } from '../../services/api';

export default {
  name: 'MinhasCandidaturas',
  setup() {
    const candidaturas = ref([]);
    const carregando = ref(true);
    const mensagemSucesso = ref('');
    const mensagemErro = ref('');

    const carregarCandidaturas = async () => {
      carregando.value = true;
      mensagemErro.value = '';

      try {
        const resposta = await candidaturasAPI.listarMinhas();
        if (resposta.data.sucesso) {
          candidaturas.value = resposta.data.dados.candidaturas;
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao carregar candidaturas';
      } finally {
        carregando.value = false;
      }
    };

    const formatarEstado = (estado) => {
      const estados = {
        pendente: 'Pendente',
        aceite: 'Aceite',
        rejeitada: 'Rejeitada'
      };
      return estados[estado] || estado;
    };

    const formatarData = (data) => {
      if (!data) return '-';
      return new Date(data).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const truncarTexto = (texto, max) => {
      if (!texto) return '';
      if (texto.length <= max) return texto;
      return texto.substring(0, max) + '...';
    };

    onMounted(() => {
      carregarCandidaturas();
    });

    return {
      candidaturas,
      carregando,
      mensagemSucesso,
      mensagemErro,
      formatarEstado,
      formatarData,
      truncarTexto
    };
  }
};
</script>

<style scoped>
.minhas-candidaturas {
  max-width: 900px;
  margin: 0 auto;
}

.pagina-cabecalho {
  margin-bottom: 2rem;
}

.pagina-titulo {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--cor-destaque-primario);
  margin-bottom: 0.5rem;
}

.pagina-subtitulo {
  color: var(--cor-texto-secundario);
  font-size: 0.95rem;
  margin: 0;
}

/* Carregando */
.carregando-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--cor-texto-secundario);
}

.indicador-carregamento {
  width: 24px;
  height: 24px;
  border: 2px solid var(--cor-borda);
  border-top-color: var(--cor-destaque-primario);
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

/* Lista de candidaturas */
.candidaturas-lista {
  display: grid;
  gap: 1.5rem;
}

.candidatura-cartao {
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  padding: 1.5rem;
}

.candidatura-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.uc-codigo {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.15rem 0.4rem;
  background: var(--cor-destaque-primario);
  color: #000;
  margin-bottom: 0.5rem;
}

.proposta-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-texto-principal);
  margin: 0;
}

.candidatura-estado {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.candidatura-estado.estado-pendente {
  background: var(--cor-aviso);
  color: #000;
}

.candidatura-estado.estado-aceite {
  background: var(--cor-sucesso);
  color: #000;
}

.candidatura-estado.estado-rejeitada {
  background: var(--cor-erro);
  color: #fff;
}

.proposta-descricao {
  color: var(--cor-texto-secundario);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.candidatura-detalhes {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid var(--cor-borda);
  margin-bottom: 1rem;
}

.detalhe {
  display: flex;
  gap: 0.5rem;
}

.detalhe-label {
  font-size: 0.85rem;
  color: var(--cor-texto-terciario);
}

.detalhe-valor {
  font-size: 0.85rem;
  color: var(--cor-texto-principal);
  font-weight: 500;
}

.candidatura-feedback {
  background: var(--cor-fundo-input);
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid var(--cor-destaque-primario);
}

.candidatura-feedback strong {
  font-size: 0.85rem;
  color: var(--cor-texto-secundario);
  display: block;
  margin-bottom: 0.5rem;
}

.candidatura-feedback p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--cor-texto-principal);
}

.candidatura-acoes {
  display: flex;
  gap: 1rem;
}

/* Estado vazio */
.estado-vazio {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
}

.estado-vazio-icone {
  font-size: 3rem;
  color: var(--cor-destaque-primario);
  display: block;
  margin-bottom: 1rem;
}

.estado-vazio h3 {
  color: var(--cor-texto-principal);
  margin: 0 0 0.5rem 0;
}

.estado-vazio p {
  color: var(--cor-texto-secundario);
  margin: 0 0 1.5rem 0;
}

/* Botões */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  font-family: inherit;
  text-decoration: none;
}

.btn-primario {
  background: var(--cor-destaque-primario);
  border-color: var(--cor-destaque-primario);
  color: #000;
}

.btn-primario:hover {
  background: transparent;
  color: var(--cor-destaque-primario);
}

.btn-secundario {
  background: transparent;
  border-color: var(--cor-borda);
  color: var(--cor-texto-secundario);
}

.btn-secundario:hover {
  border-color: var(--cor-texto-secundario);
  color: var(--cor-texto-principal);
}

/* Alertas */
.alerta {
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid;
}

.alerta-sucesso {
  background: rgba(0, 255, 136, 0.1);
  border-color: var(--cor-sucesso);
  color: var(--cor-sucesso);
}

.alerta-erro {
  background: rgba(255, 71, 87, 0.1);
  border-color: var(--cor-erro);
  color: var(--cor-erro);
}

/* Responsividade */
@media (max-width: 768px) {
  .candidatura-cabecalho {
    flex-direction: column;
  }

  .candidatura-detalhes {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
