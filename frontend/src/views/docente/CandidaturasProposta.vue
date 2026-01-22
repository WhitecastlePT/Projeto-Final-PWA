<template>
  <div class="candidaturas-proposta">
    <div class="pagina-cabecalho">
      <router-link to="/minhas-propostas" class="ligacao-voltar">
        <span class="seta-voltar">←</span> Voltar às Propostas
      </router-link>
      <h1 class="pagina-titulo">Candidaturas à Proposta</h1>
      <p v-if="proposta" class="pagina-subtitulo">{{ proposta.titulo }}</p>
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
          <div class="candidatura-aluno">
            <span class="aluno-icone">◈</span>
            <div class="aluno-info">
              <h3 class="aluno-nome">{{ candidatura.aluno_nome }}</h3>
              <p class="aluno-numero">Nº {{ candidatura.numero_aluno }} - {{ candidatura.aluno_email }}</p>
            </div>
          </div>
          <span class="candidatura-estado" :class="'estado-' + candidatura.estado">
            {{ formatarEstado(candidatura.estado) }}
          </span>
        </div>

        <div v-if="candidatura.observacoes" class="candidatura-observacoes">
          <strong>Observações do aluno:</strong> {{ candidatura.observacoes }}
        </div>

        <div v-if="candidatura.feedback_docente && candidatura.estado !== 'pendente'" class="candidatura-feedback">
          <strong>Seu feedback:</strong> {{ candidatura.feedback_docente }}
        </div>

        <div class="candidatura-data">
          Submetida em {{ formatarData(candidatura.data_submissao) }}
        </div>

        <!-- Anexos -->
        <div class="candidatura-anexos">
          <div class="anexos-cabecalho">
            <strong>Anexos do Aluno:</strong>
          </div>
          <div class="anexos-lista">
            <div v-if="candidatura.anexos && candidatura.anexos.length > 0">
              <div v-for="anexo in candidatura.anexos" :key="anexo.id" class="anexo-item">
                <span class="anexo-icone">📄</span>
                <span class="anexo-nome">{{ anexo.nome_ficheiro }}</span>
                <span class="anexo-tamanho">({{ formatarTamanho(anexo.tamanho_bytes) }})</span>
                <button
                  @click="descarregarAnexo(anexo)"
                  class="btn btn-pequeno btn-primario"
                  :disabled="anexo.aDescarregar"
                >
                  {{ anexo.aDescarregar ? '...' : 'Download' }}
                </button>
              </div>
            </div>
            <p v-else class="sem-anexos">Nenhum anexo submetido</p>
          </div>
        </div>

        <!-- Ações -->
        <div v-if="candidatura.estado === 'pendente'" class="candidatura-acoes">
          <button @click="abrirModalDecisao(candidatura, 'aceite')" class="btn btn-sucesso">
            Aceitar
          </button>
          <button @click="abrirModalDecisao(candidatura, 'rejeitada')" class="btn btn-erro">
            Rejeitar
          </button>
        </div>
      </div>
    </div>

    <!-- Vazio -->
    <div v-else class="estado-vazio">
      <span class="estado-vazio-icone">◇</span>
      <h3>Sem Candidaturas</h3>
      <p>Esta proposta ainda não recebeu nenhuma candidatura.</p>
    </div>

    <!-- Modal Decisão -->
    <div v-if="modalDecisaoAberto" class="modal-overlay" @click.self="fecharModalDecisao">
      <div class="modal">
        <div class="modal-cabecalho">
          <h3 class="modal-titulo">
            {{ decisaoTipo === 'aceite' ? 'Aceitar Candidatura' : 'Rejeitar Candidatura' }}
          </h3>
          <button @click="fecharModalDecisao" class="modal-fechar">✕</button>
        </div>
        <div class="modal-corpo">
          <p>Candidatura de: <strong>{{ candidaturaSelecionada?.aluno_nome }}</strong></p>
          <div class="formulario-grupo">
            <label class="formulario-label">Observações (opcional)</label>
            <textarea
              v-model="observacoesDecisao"
              class="formulario-input formulario-textarea"
              :placeholder="decisaoTipo === 'aceite' ? 'Mensagem para o aluno selecionado...' : 'Motivo da rejeição...'"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-rodape">
          <button @click="fecharModalDecisao" class="btn btn-secundario">Cancelar</button>
          <button
            @click="processarDecisao"
            class="btn"
            :class="decisaoTipo === 'aceite' ? 'btn-sucesso' : 'btn-erro'"
          >
            {{ decisaoTipo === 'aceite' ? 'Confirmar Aceitação' : 'Confirmar Rejeição' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { candidaturasAPI, propostasAPI } from '../../services/api';

export default {
  name: 'CandidaturasProposta',
  setup() {
    const route = useRoute();
    const propostaId = route.params.id;

    const proposta = ref(null);
    const candidaturas = ref([]);
    const carregando = ref(true);
    const mensagemSucesso = ref('');
    const mensagemErro = ref('');

    // Modal decisão
    const modalDecisaoAberto = ref(false);
    const candidaturaSelecionada = ref(null);
    const decisaoTipo = ref('');
    const observacoesDecisao = ref('');

    // Carregar dados
    const carregarDados = async () => {
      carregando.value = true;
      mensagemErro.value = '';

      try {
        // Carregar proposta
        const respostaProposta = await propostasAPI.obterPorId(propostaId);
        if (respostaProposta.data.sucesso) {
          proposta.value = respostaProposta.data.dados.proposta;
        }

        // Carregar candidaturas
        const respostaCandidaturas = await candidaturasAPI.listarPorProposta(propostaId);
        if (respostaCandidaturas.data.sucesso) {
          const listaCandidaturas = respostaCandidaturas.data.dados.candidaturas;

          // Carregar anexos de cada candidatura
          for (const candidatura of listaCandidaturas) {
            try {
              const respostaAnexos = await candidaturasAPI.listarAnexos(candidatura.id);
              if (respostaAnexos.data.sucesso) {
                candidatura.anexos = respostaAnexos.data.dados.anexos;
              } else {
                candidatura.anexos = [];
              }
            } catch {
              candidatura.anexos = [];
            }
          }

          candidaturas.value = listaCandidaturas;
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao carregar dados';
      } finally {
        carregando.value = false;
      }
    };

    // Modal decisão
    const abrirModalDecisao = (candidatura, tipo) => {
      candidaturaSelecionada.value = candidatura;
      decisaoTipo.value = tipo;
      observacoesDecisao.value = '';
      modalDecisaoAberto.value = true;
    };

    const fecharModalDecisao = () => {
      modalDecisaoAberto.value = false;
      candidaturaSelecionada.value = null;
      decisaoTipo.value = '';
      observacoesDecisao.value = '';
    };

    const processarDecisao = async () => {
      try {
        const resposta = await candidaturasAPI.alterarEstado(
          candidaturaSelecionada.value.id,
          decisaoTipo.value,
          observacoesDecisao.value
        );

        if (resposta.data.sucesso) {
          candidaturaSelecionada.value.estado = decisaoTipo.value;
          if (observacoesDecisao.value) {
            candidaturaSelecionada.value.feedback_docente = observacoesDecisao.value;
          }
          mensagemSucesso.value = `Candidatura ${decisaoTipo.value === 'aceite' ? 'aceite' : 'rejeitada'} com sucesso`;
          setTimeout(() => mensagemSucesso.value = '', 3000);
          fecharModalDecisao();
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao processar decisão';
      }
    };

    // Descarregar anexo
    const descarregarAnexo = async (anexo) => {
      anexo.aDescarregar = true;
      try {
        const resposta = await candidaturasAPI.downloadAnexo(anexo.id);
        // Criar link temporário para download
        const url = window.URL.createObjectURL(new Blob([resposta.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', anexo.nome_ficheiro);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao descarregar anexo';
      } finally {
        anexo.aDescarregar = false;
      }
    };

    // Formatar tamanho de ficheiro
    const formatarTamanho = (bytes) => {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Formatadores
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      carregarDados();
    });

    return {
      proposta,
      candidaturas,
      carregando,
      mensagemSucesso,
      mensagemErro,
      modalDecisaoAberto,
      candidaturaSelecionada,
      decisaoTipo,
      observacoesDecisao,
      abrirModalDecisao,
      fecharModalDecisao,
      processarDecisao,
      descarregarAnexo,
      formatarEstado,
      formatarData,
      formatarTamanho
    };
  }
};
</script>

<style scoped>
.candidaturas-proposta {
  max-width: 900px;
  margin: 0 auto;
}

.pagina-cabecalho {
  margin-bottom: 2rem;
}

.ligacao-voltar {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--cor-texto-terciario);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: color 0.2s;
}

.ligacao-voltar:hover {
  color: var(--cor-destaque-primario);
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
  gap: 1rem;
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
  margin-bottom: 1rem;
}

.candidatura-aluno {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.aluno-icone {
  font-size: 2rem;
  color: var(--cor-destaque-terciario);
}

.aluno-nome {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-texto-principal);
  margin: 0 0 0.25rem 0;
}

.aluno-numero {
  font-size: 0.85rem;
  color: var(--cor-texto-secundario);
  margin: 0;
}

.candidatura-estado {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.candidatura-observacoes {
  background: var(--cor-fundo-input);
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--cor-texto-secundario);
}

.candidatura-feedback {
  background: var(--cor-fundo-input);
  padding: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--cor-texto-secundario);
  border-left: 3px solid var(--cor-destaque-primario);
}

.candidatura-data {
  font-size: 0.85rem;
  color: var(--cor-texto-terciario);
  margin-bottom: 1rem;
}

/* Anexos */
.candidatura-anexos {
  background: var(--cor-fundo-input);
  padding: 1rem;
  margin-bottom: 1rem;
}

.anexos-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.anexos-cabecalho strong {
  font-size: 0.9rem;
  color: var(--cor-texto-secundario);
}

.anexos-lista {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.anexo-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
}

.anexo-icone {
  font-size: 1.2rem;
}

.anexo-nome {
  flex: 1;
  font-size: 0.9rem;
  color: var(--cor-texto-principal);
  word-break: break-all;
}

.anexo-tamanho {
  font-size: 0.8rem;
  color: var(--cor-texto-terciario);
}

.sem-anexos {
  font-size: 0.85rem;
  color: var(--cor-texto-terciario);
  font-style: italic;
  margin: 0;
}

.btn-pequeno {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

.candidatura-acoes {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--cor-borda);
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
  margin: 0;
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
  min-height: 80px;
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
}

.btn-sucesso {
  background: var(--cor-sucesso);
  border-color: var(--cor-sucesso);
  color: #000;
}

.btn-sucesso:hover {
  background: transparent;
  color: var(--cor-sucesso);
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

.btn-erro {
  background: var(--cor-erro);
  border-color: var(--cor-erro);
  color: #fff;
}

.btn-erro:hover {
  background: transparent;
  color: var(--cor-erro);
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
</style>
