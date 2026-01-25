<template>
  <div class="propostas-uc">
    <div class="pagina-cabecalho">
      <router-link to="/ucs-disponiveis" class="ligacao-voltar">
        <span class="seta-voltar">←</span> Voltar às UC's
      </router-link>
      <div v-if="uc" class="uc-info">
        <span class="uc-codigo">{{ uc.codigo }}</span>
        <h1 class="pagina-titulo">{{ uc.nome }}</h1>
        <p class="pagina-subtitulo">Docente: {{ uc.docente_nome }}</p>
      </div>
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
          <h3 class="proposta-titulo">{{ proposta.titulo }}</h3>
          <span v-if="candidaturaSubmetida(proposta.id)" class="badge-candidatura">
            Candidatura Submetida
          </span>
        </div>

        <p class="proposta-descricao">{{ truncarTexto(proposta.descricao, 200) }}</p>

        <div class="proposta-detalhes">
          <div class="detalhe">
            <span class="detalhe-label">Orientador:</span>
            <span class="detalhe-valor">{{ proposta.orientador_nome }}</span>
          </div>
          <div v-if="proposta.vagas" class="detalhe">
            <span class="detalhe-label">Vagas:</span>
            <span class="detalhe-valor">{{ proposta.vagas }}</span>
          </div>
        </div>

        <div class="proposta-acoes">
          <router-link :to="'/propostas/' + proposta.id" class="btn btn-secundario">
            Ver Detalhes
          </router-link>
          <button
            v-if="!candidaturaSubmetida(proposta.id)"
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
      <h3>Sem Propostas</h3>
      <p>Esta UC ainda não tem propostas publicadas.</p>
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
              placeholder="Indique ao professor o que pensa usar neste projeto..."
              rows="4"
            ></textarea>
          </div>

          <div class="formulario-grupo">
            <label class="formulario-label">Anexos (opcional)</label>
            <p class="formulario-ajuda">PDF, DOC, DOCX, ZIP ou TXT (máx. 5MB cada)</p>
            <div class="upload-zona" @click="$refs.inputFicheiros.click()">
              <input
                ref="inputFicheiros"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.zip,.txt"
                @change="adicionarFicheiros"
                style="display: none"
              />
              <span class="upload-icone">+</span>
              <span class="upload-texto">Clique para selecionar ficheiros</span>
            </div>

            <div v-if="ficheirosSelecionados.length > 0" class="ficheiros-lista">
              <div v-for="(ficheiro, index) in ficheirosSelecionados" :key="index" class="ficheiro-item">
                <span class="ficheiro-nome">{{ ficheiro.name }}</span>
                <span class="ficheiro-tamanho">{{ formatarTamanho(ficheiro.size) }}</span>
                <button @click="removerFicheiro(index)" class="ficheiro-remover" type="button">✕</button>
              </div>
            </div>
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
import { useRoute } from 'vue-router';
import { ucsAPI, candidaturasAPI } from '../../services/api';

export default {
  name: 'PropostasUC',
  setup() {
    const route = useRoute();
    const ucId = route.params.id;

    const uc = ref(null);
    const propostas = ref([]);
    const minhasCandidaturas = ref([]);
    const carregando = ref(true);
    const mensagemSucesso = ref('');
    const mensagemErro = ref('');

    // Modal candidatura
    const modalCandidaturaAberto = ref(false);
    const propostaSelecionada = ref(null);
    const observacoesCandidatura = ref('');
    const submetendo = ref(false);
    const ficheirosSelecionados = ref([]);

    // Carregar dados
    const carregarDados = async () => {
      carregando.value = true;
      mensagemErro.value = '';

      try {
        // Carregar UC e propostas
        const respostaUC = await ucsAPI.obterPorId(ucId);
        if (respostaUC.data.sucesso) {
          uc.value = respostaUC.data.dados.uc;
        }

        // Carregar propostas da UC
        const respostaPropostas = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/ucs/${ucId}/propostas`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const dadosPropostas = await respostaPropostas.json();
        if (dadosPropostas.sucesso) {
          propostas.value = dadosPropostas.dados.propostas;
        }

        // Carregar minhas candidaturas
        const respostaCandidaturas = await candidaturasAPI.listarMinhas();
        if (respostaCandidaturas.data.sucesso) {
          minhasCandidaturas.value = respostaCandidaturas.data.dados.candidaturas;
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao carregar dados';
      } finally {
        carregando.value = false;
      }
    };

    // Verificar se já tem candidatura submetida
    const candidaturaSubmetida = (propostaId) => {
      return minhasCandidaturas.value.some(c => c.proposta_id === propostaId);
    };

    // Modal candidatura
    const abrirModalCandidatura = (proposta) => {
      propostaSelecionada.value = proposta;
      observacoesCandidatura.value = '';
      ficheirosSelecionados.value = [];
      modalCandidaturaAberto.value = true;
    };

    const fecharModalCandidatura = () => {
      modalCandidaturaAberto.value = false;
      propostaSelecionada.value = null;
      observacoesCandidatura.value = '';
      ficheirosSelecionados.value = [];
    };

    // Gestão de ficheiros
    const adicionarFicheiros = (evento) => {
      const ficheiros = Array.from(evento.target.files);
      const tamanhoMaximo = 5 * 1024 * 1024; // 5MB

      for (const ficheiro of ficheiros) {
        if (ficheiro.size > tamanhoMaximo) {
          mensagemErro.value = `O ficheiro "${ficheiro.name}" excede o tamanho máximo de 5MB`;
          setTimeout(() => mensagemErro.value = '', 3000);
          continue;
        }
        ficheirosSelecionados.value.push(ficheiro);
      }

      evento.target.value = '';
    };

    const removerFicheiro = (index) => {
      ficheirosSelecionados.value.splice(index, 1);
    };

    const formatarTamanho = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

          // Upload dos anexos se existirem
          if (ficheirosSelecionados.value.length > 0) {
            for (const ficheiro of ficheirosSelecionados.value) {
              try {
                await candidaturasAPI.adicionarAnexo(candidatura.id, ficheiro);
              } catch (erroAnexo) {
                console.error('Erro ao fazer upload de anexo:', erroAnexo);
              }
            }
          }

          minhasCandidaturas.value.push(candidatura);
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

    const truncarTexto = (texto, max) => {
      if (!texto) return '';
      if (texto.length <= max) return texto;
      return texto.substring(0, max) + '...';
    };

    onMounted(() => {
      carregarDados();
    });

    return {
      uc,
      propostas,
      carregando,
      mensagemSucesso,
      mensagemErro,
      modalCandidaturaAberto,
      propostaSelecionada,
      observacoesCandidatura,
      submetendo,
      ficheirosSelecionados,
      candidaturaSubmetida,
      abrirModalCandidatura,
      fecharModalCandidatura,
      adicionarFicheiros,
      removerFicheiro,
      formatarTamanho,
      submeterCandidatura,
      truncarTexto
    };
  }
};
</script>

<style scoped>
.propostas-uc {
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

.uc-codigo {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.2rem 0.5rem;
  background: var(--cor-destaque-primario);
  color: #000;
  margin-bottom: 0.5rem;
}

.pagina-titulo {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--cor-texto-principal);
  margin-bottom: 0.25rem;
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

.proposta-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-texto-principal);
  margin: 0;
}

.badge-candidatura {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  background: var(--cor-sucesso);
  color: #000;
  white-space: nowrap;
}

.proposta-descricao {
  color: var(--cor-texto-secundario);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.proposta-detalhes {
  display: flex;
  gap: 2rem;
  padding: 1rem 0;
  border-top: 1px solid var(--cor-borda);
  border-bottom: 1px solid var(--cor-borda);
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
  min-height: 100px;
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

.btn-primario:hover:not(:disabled) {
  background: transparent;
  color: var(--cor-destaque-primario);
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* Upload de ficheiros */
.formulario-ajuda {
  font-size: 0.8rem;
  color: var(--cor-texto-terciario);
  margin: 0 0 0.5rem 0;
}

.upload-zona {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px dashed var(--cor-borda);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.upload-zona:hover {
  border-color: var(--cor-destaque-primario);
  background: rgba(0, 255, 136, 0.05);
}

.upload-icone {
  font-size: 1.5rem;
  color: var(--cor-destaque-primario);
}

.upload-texto {
  font-size: 0.9rem;
  color: var(--cor-texto-secundario);
}

.ficheiros-lista {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ficheiro-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--cor-fundo-secundario);
  border: 1px solid var(--cor-borda);
}

.ficheiro-nome {
  flex: 1;
  font-size: 0.85rem;
  color: var(--cor-texto-principal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ficheiro-tamanho {
  font-size: 0.75rem;
  color: var(--cor-texto-terciario);
  white-space: nowrap;
}

.ficheiro-remover {
  background: transparent;
  border: none;
  color: var(--cor-texto-terciario);
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.ficheiro-remover:hover {
  color: var(--cor-erro);
}
</style>
