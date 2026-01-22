<template>
  <div class="minhas-propostas-aluno">
    <div class="pagina-cabecalho">
      <h1 class="pagina-titulo">Minhas Propostas</h1>
      <p class="pagina-subtitulo">Propostas de projeto a que foi atribuído</p>
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
      <span>A carregar propostas...</span>
    </div>

    <!-- Lista de propostas -->
    <div v-else-if="propostas.length > 0" class="propostas-lista">
      <div v-for="proposta in propostas" :key="proposta.id" class="proposta-cartao">
        <div class="proposta-cabecalho">
          <div class="proposta-info">
            <span v-if="proposta.uc_codigo" class="uc-codigo">{{ proposta.uc_codigo }}</span>
            <h3 class="proposta-titulo">{{ proposta.titulo }}</h3>
          </div>
          <div class="proposta-badges">
            <span class="proposta-estado" :class="'estado-' + proposta.estado">
              {{ formatarEstado(proposta.estado) }}
            </span>
            <span v-if="obterCandidatura(proposta.id)" class="candidatura-estado" :class="'estado-' + obterCandidatura(proposta.id).estado">
              Candidatura: {{ formatarEstadoCandidatura(obterCandidatura(proposta.id).estado) }}
            </span>
          </div>
        </div>

        <p class="proposta-descricao">
          {{ truncarTexto(proposta.descricao_objetivos, 200) }}
        </p>

        <div class="proposta-detalhes">
          <div class="detalhe">
            <span class="detalhe-label">Orientador:</span>
            <span class="detalhe-valor">{{ proposta.orientador_nome }}</span>
          </div>
          <div v-if="proposta.uc_nome" class="detalhe">
            <span class="detalhe-label">UC:</span>
            <span class="detalhe-valor">{{ proposta.uc_nome }}</span>
          </div>
          <div class="detalhe">
            <span class="detalhe-label">Atribuído em:</span>
            <span class="detalhe-valor">{{ formatarData(proposta.data_associacao) }}</span>
          </div>
        </div>

        <!-- Feedback do docente (se candidatura foi decidida) -->
        <div v-if="obterCandidatura(proposta.id) && obterCandidatura(proposta.id).estado !== 'pendente' && obterCandidatura(proposta.id).feedback_docente" class="candidatura-feedback">
          <strong>Feedback do docente:</strong>
          <p>{{ obterCandidatura(proposta.id).feedback_docente }}</p>
        </div>

        <div class="proposta-acoes">
          <router-link :to="'/propostas/' + proposta.id" class="btn btn-secundario">
            Ver Detalhes
          </router-link>
          <button
            v-if="!obterCandidatura(proposta.id) && proposta.estado === 'publicada'"
            @click="abrirModalCandidatura(proposta)"
            class="btn btn-primario"
          >
            Candidatar-me
          </button>
        </div>
      </div>
    </div>

    <!-- Vazio -->
    <div v-else class="estado-vazio">
      <span class="estado-vazio-icone">◇</span>
      <h3>Sem Propostas Atribuídas</h3>
      <p>Ainda não foi atribuído a nenhuma proposta de projeto.</p>
      <router-link to="/ucs-disponiveis" class="btn btn-primario">
        Explorar UC's
      </router-link>
    </div>

    <!-- Modal Candidatura -->
    <div v-if="modalCandidaturaAberto" class="modal-overlay" @click.self="fecharModalCandidatura">
      <div class="modal">
        <div class="modal-cabecalho">
          <h3 class="modal-titulo">Candidatar-me à Proposta</h3>
          <button @click="fecharModalCandidatura" class="modal-fechar">✕</button>
        </div>
        <div class="modal-corpo">
          <p><strong>{{ propostaSelecionada?.titulo }}</strong></p>
          <div class="formulario-grupo">
            <label class="formulario-label">Observações (opcional)</label>
            <textarea
              v-model="observacoesCandidatura"
              class="formulario-input formulario-textarea"
              placeholder="Apresente-se e explique porque está interessado nesta proposta..."
              rows="4"
            ></textarea>
          </div>
        </div>
        <div class="modal-rodape">
          <button @click="fecharModalCandidatura" class="btn btn-secundario">Cancelar</button>
          <button @click="submeterCandidatura" class="btn btn-primario" :disabled="submetendo">
            {{ submetendo ? 'A submeter...' : 'Submeter Candidatura' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { propostasAPI, candidaturasAPI } from '../../services/api';

export default {
  name: 'MinhasPropostasAluno',
  setup() {
    const propostas = ref([]);
    const minhasCandidaturas = ref([]);
    const carregando = ref(true);
    const mensagemErro = ref('');
    const mensagemSucesso = ref('');

    // Modal candidatura
    const modalCandidaturaAberto = ref(false);
    const propostaSelecionada = ref(null);
    const observacoesCandidatura = ref('');
    const submetendo = ref(false);

    const carregarPropostas = async () => {
      carregando.value = true;
      mensagemErro.value = '';

      try {
        // Carregar propostas atribuídas
        const resposta = await propostasAPI.listarAtribuidas();
        if (resposta.data.sucesso) {
          propostas.value = resposta.data.dados.propostas;
        }

        // Carregar candidaturas para saber quais propostas já têm candidatura
        const respostaCandidaturas = await candidaturasAPI.listarMinhas();
        if (respostaCandidaturas.data.sucesso) {
          minhasCandidaturas.value = respostaCandidaturas.data.dados.candidaturas;
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao carregar propostas';
      } finally {
        carregando.value = false;
      }
    };

    // Verificar se já tem candidatura para uma proposta
    const obterCandidatura = (propostaId) => {
      return minhasCandidaturas.value.find(c => c.proposta_id === propostaId);
    };

    // Modal candidatura
    const abrirModalCandidatura = (proposta) => {
      propostaSelecionada.value = proposta;
      observacoesCandidatura.value = '';
      modalCandidaturaAberto.value = true;
    };

    const fecharModalCandidatura = () => {
      modalCandidaturaAberto.value = false;
      propostaSelecionada.value = null;
      observacoesCandidatura.value = '';
    };

    const submeterCandidatura = async () => {
      submetendo.value = true;
      mensagemErro.value = '';

      try {
        const resposta = await candidaturasAPI.submeter({
          proposta_id: propostaSelecionada.value.id,
          observacoes: observacoesCandidatura.value
        });

        if (resposta.data.sucesso) {
          const candidatura = resposta.data.dados.candidatura;
          // Adicionar à lista de candidaturas localmente
          minhasCandidaturas.value.push({
            ...candidatura,
            proposta_id: propostaSelecionada.value.id
          });
          mensagemSucesso.value = 'Candidatura submetida com sucesso!';
          setTimeout(() => mensagemSucesso.value = '', 3000);
          fecharModalCandidatura();
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao submeter candidatura';
      } finally {
        submetendo.value = false;
      }
    };

    const formatarEstado = (estado) => {
      const estados = {
        rascunho: 'Rascunho',
        publicada: 'Publicada',
        aprovada: 'Aprovada',
        arquivada: 'Arquivada'
      };
      return estados[estado] || estado;
    };

    const formatarEstadoCandidatura = (estado) => {
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
      carregarPropostas();
    });

    return {
      propostas,
      carregando,
      mensagemErro,
      mensagemSucesso,
      modalCandidaturaAberto,
      propostaSelecionada,
      observacoesCandidatura,
      submetendo,
      obterCandidatura,
      abrirModalCandidatura,
      fecharModalCandidatura,
      submeterCandidatura,
      formatarEstado,
      formatarEstadoCandidatura,
      formatarData,
      truncarTexto
    };
  }
};
</script>

<style scoped>
.minhas-propostas-aluno {
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

/* Lista de propostas */
.propostas-lista {
  display: grid;
  gap: 1.5rem;
}

.proposta-cartao {
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  padding: 1.5rem;
}

.proposta-cabecalho {
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

.proposta-estado {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.proposta-estado.estado-rascunho {
  background: var(--cor-texto-terciario);
  color: #000;
}

.proposta-estado.estado-publicada {
  background: var(--cor-destaque-primario);
  color: #000;
}

.proposta-estado.estado-aprovada {
  background: var(--cor-sucesso);
  color: #000;
}

.proposta-estado.estado-arquivada {
  background: var(--cor-borda);
  color: var(--cor-texto-secundario);
}

.proposta-descricao {
  color: var(--cor-texto-secundario);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.proposta-detalhes {
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

.proposta-acoes {
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

/* Alertas */
.alerta-erro {
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid var(--cor-erro);
  color: var(--cor-erro);
}

/* Badges */
.proposta-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.candidatura-estado {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.7rem;
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

/* Feedback do docente */
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 500px;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
}

.modal-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--cor-borda);
}

.modal-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-texto-principal);
  margin: 0;
}

.modal-fechar {
  background: transparent;
  border: none;
  color: var(--cor-texto-terciario);
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-fechar:hover {
  color: var(--cor-erro);
}

.modal-corpo {
  padding: 1.5rem;
}

.modal-corpo p {
  margin: 0 0 1rem 0;
  color: var(--cor-texto-principal);
}

.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--cor-borda);
}

/* Formulário */
.formulario-grupo {
  margin-bottom: 1rem;
}

.formulario-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--cor-texto-secundario);
  margin-bottom: 0.5rem;
}

.formulario-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--cor-fundo-input);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto-principal);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.formulario-input:focus {
  outline: none;
  border-color: var(--cor-destaque-primario);
}

.formulario-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Botão secundário */
.btn-secundario {
  background: transparent;
  border-color: var(--cor-borda);
  color: var(--cor-texto-secundario);
}

.btn-secundario:hover {
  border-color: var(--cor-texto-secundario);
  color: var(--cor-texto-principal);
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alerta sucesso */
.alerta-sucesso {
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid var(--cor-sucesso);
  color: var(--cor-sucesso);
}

/* Responsividade */
@media (max-width: 768px) {
  .proposta-cabecalho {
    flex-direction: column;
  }

  .proposta-badges {
    align-items: flex-start;
  }

  .proposta-detalhes {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
