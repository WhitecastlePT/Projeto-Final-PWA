<template>
  <div class="unidades-curriculares">
    <div class="pagina-cabecalho">
      <div class="cabecalho-info">
        <h1 class="pagina-titulo">Minhas Unidades Curriculares</h1>
        <p class="pagina-subtitulo">Gerir as suas UC's e propostas associadas</p>
      </div>
      <button @click="abrirModalNova" class="btn btn-primario">
        <span>+</span> Nova UC
      </button>
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
      <span>A carregar unidades curriculares...</span>
    </div>

    <!-- Lista de UCs -->
    <div v-else-if="ucs.length > 0" class="ucs-lista">
      <div v-for="uc in ucs" :key="uc.id" class="uc-cartao">
        <div class="uc-cabecalho">
          <div class="uc-info">
            <span class="uc-codigo">{{ uc.codigo }}</span>
            <h3 class="uc-nome">{{ uc.nome }}</h3>
          </div>
          <div class="uc-acoes">
            <button @click="abrirModalEditar(uc)" class="btn-acao" title="Editar">
              ✎
            </button>
            <button @click="confirmarEliminacao(uc)" class="btn-acao btn-eliminar" title="Eliminar">
              ⌫
            </button>
          </div>
        </div>
        <p v-if="uc.descricao" class="uc-descricao">{{ uc.descricao }}</p>
        <div class="uc-rodape">
          <span class="uc-ano" v-if="uc.ano_letivo">{{ uc.ano_letivo }}</span>
          <span class="uc-propostas">
            {{ uc.total_propostas || 0 }} proposta(s)
          </span>
        </div>
      </div>
    </div>

    <!-- Vazio -->
    <div v-else class="estado-vazio">
      <span class="estado-vazio-icone">◈</span>
      <h3>Sem Unidades Curriculares</h3>
      <p>Crie a sua primeira UC para começar a gerir propostas</p>
      <button @click="abrirModalNova" class="btn btn-primario">
        Criar UC
      </button>
    </div>

    <!-- Modal Criar/Editar UC -->
    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal">
        <div class="modal-cabecalho">
          <h3 class="modal-titulo">{{ modoEdicao ? 'Editar UC' : 'Nova UC' }}</h3>
          <button @click="fecharModal" class="modal-fechar">✕</button>
        </div>
        <form @submit.prevent="guardarUC" class="modal-corpo">
          <div class="formulario-grupo">
            <label class="formulario-label">Código *</label>
            <input
              type="text"
              v-model="formulario.codigo"
              class="formulario-input"
              placeholder="Ex: PWA2024"
              required
            />
          </div>
          <div class="formulario-grupo">
            <label class="formulario-label">Nome *</label>
            <input
              type="text"
              v-model="formulario.nome"
              class="formulario-input"
              placeholder="Nome da unidade curricular"
              required
            />
          </div>
          <div class="formulario-grupo">
            <label class="formulario-label">Descrição</label>
            <textarea
              v-model="formulario.descricao"
              class="formulario-input formulario-textarea"
              placeholder="Descrição da UC (opcional)"
              rows="3"
            ></textarea>
          </div>
          <div class="formulario-grupo">
            <label class="formulario-label">Ano Letivo</label>
            <input
              type="text"
              v-model="formulario.ano_letivo"
              class="formulario-input"
              placeholder="Ex: 2024/2025"
            />
          </div>
          <div class="modal-rodape">
            <button type="button" @click="fecharModal" class="btn btn-secundario">Cancelar</button>
            <button type="submit" class="btn btn-primario" :disabled="guardando">
              {{ guardando ? 'A guardar...' : (modoEdicao ? 'Atualizar' : 'Criar') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Confirmar Eliminação -->
    <div v-if="modalEliminacaoAberto" class="modal-overlay" @click.self="fecharModalEliminacao">
      <div class="modal">
        <div class="modal-cabecalho">
          <h3 class="modal-titulo">Confirmar Eliminação</h3>
          <button @click="fecharModalEliminacao" class="modal-fechar">✕</button>
        </div>
        <div class="modal-corpo">
          <p>Tem certeza que deseja eliminar a UC:</p>
          <p><strong>{{ ucSelecionada?.codigo }} - {{ ucSelecionada?.nome }}</strong>?</p>
          <p class="aviso-eliminacao">Esta ação também eliminará todas as propostas associadas.</p>
        </div>
        <div class="modal-rodape">
          <button @click="fecharModalEliminacao" class="btn btn-secundario">Cancelar</button>
          <button @click="eliminarUC" class="btn btn-erro">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { ucsAPI } from '../../services/api';

export default {
  name: 'UnidadesCurriculares',
  setup() {
    const ucs = ref([]);
    const carregando = ref(true);
    const mensagemSucesso = ref('');
    const mensagemErro = ref('');

    // Modal criar/editar
    const modalAberto = ref(false);
    const modoEdicao = ref(false);
    const guardando = ref(false);
    const ucSelecionada = ref(null);
    const formulario = ref({
      codigo: '',
      nome: '',
      descricao: '',
      ano_letivo: ''
    });

    // Modal eliminação
    const modalEliminacaoAberto = ref(false);

    // Carregar UCs
    const carregarUCs = async () => {
      carregando.value = true;
      mensagemErro.value = '';

      try {
        const resposta = await ucsAPI.listarMinhas();
        if (resposta.data.sucesso) {
          ucs.value = resposta.data.dados.ucs;
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao carregar UCs';
      } finally {
        carregando.value = false;
      }
    };

    // Modal criar
    const abrirModalNova = () => {
      modoEdicao.value = false;
      formulario.value = {
        codigo: '',
        nome: '',
        descricao: '',
        ano_letivo: ''
      };
      modalAberto.value = true;
    };

    // Modal editar
    const abrirModalEditar = (uc) => {
      modoEdicao.value = true;
      ucSelecionada.value = uc;
      formulario.value = {
        codigo: uc.codigo,
        nome: uc.nome,
        descricao: uc.descricao || '',
        ano_letivo: uc.ano_letivo || ''
      };
      modalAberto.value = true;
    };

    const fecharModal = () => {
      modalAberto.value = false;
      ucSelecionada.value = null;
    };

    // Guardar UC
    const guardarUC = async () => {
      guardando.value = true;
      mensagemErro.value = '';

      try {
        let resposta;
        if (modoEdicao.value) {
          resposta = await ucsAPI.atualizar(ucSelecionada.value.id, formulario.value);
        } else {
          resposta = await ucsAPI.criar(formulario.value);
        }

        if (resposta.data.sucesso) {
          mensagemSucesso.value = modoEdicao.value
            ? 'UC atualizada com sucesso'
            : 'UC criada com sucesso';
          setTimeout(() => mensagemSucesso.value = '', 3000);
          fecharModal();
          carregarUCs();
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao guardar UC';
      } finally {
        guardando.value = false;
      }
    };

    // Modal eliminação
    const confirmarEliminacao = (uc) => {
      ucSelecionada.value = uc;
      modalEliminacaoAberto.value = true;
    };

    const fecharModalEliminacao = () => {
      modalEliminacaoAberto.value = false;
      ucSelecionada.value = null;
    };

    const eliminarUC = async () => {
      try {
        const resposta = await ucsAPI.eliminar(ucSelecionada.value.id);
        if (resposta.data.sucesso) {
          ucs.value = ucs.value.filter(u => u.id !== ucSelecionada.value.id);
          mensagemSucesso.value = 'UC eliminada com sucesso';
          setTimeout(() => mensagemSucesso.value = '', 3000);
          fecharModalEliminacao();
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao eliminar UC';
      }
    };

    onMounted(() => {
      carregarUCs();
    });

    return {
      ucs,
      carregando,
      mensagemSucesso,
      mensagemErro,
      modalAberto,
      modoEdicao,
      guardando,
      formulario,
      ucSelecionada,
      modalEliminacaoAberto,
      abrirModalNova,
      abrirModalEditar,
      fecharModal,
      guardarUC,
      confirmarEliminacao,
      fecharModalEliminacao,
      eliminarUC
    };
  }
};
</script>

<style scoped>
.unidades-curriculares {
  max-width: 1000px;
  margin: 0 auto;
}

.pagina-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

/* Lista de UCs */
.ucs-lista {
  display: grid;
  gap: 1rem;
}

.uc-cartao {
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  padding: 1.5rem;
  transition: border-color 0.2s;
}

.uc-cartao:hover {
  border-color: var(--cor-destaque-primario);
}

.uc-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
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

.uc-nome {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-texto-principal);
  margin: 0;
}

.uc-acoes {
  display: flex;
  gap: 0.5rem;
}

.btn-acao {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--cor-borda);
  background: transparent;
  color: var(--cor-texto-secundario);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-acao:hover {
  color: var(--cor-destaque-primario);
  border-color: var(--cor-destaque-primario);
}

.btn-acao.btn-eliminar:hover {
  color: var(--cor-erro);
  border-color: var(--cor-erro);
}

.uc-descricao {
  color: var(--cor-texto-secundario);
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.uc-rodape {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--cor-borda);
  font-size: 0.85rem;
  color: var(--cor-texto-terciario);
}

.uc-propostas {
  color: var(--cor-destaque-primario);
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

.aviso-eliminacao {
  color: var(--cor-erro) !important;
  font-weight: 500;
}

.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
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

.btn-erro {
  background: var(--cor-erro);
  border-color: var(--cor-erro);
  color: #fff;
}

.btn-erro:hover {
  background: transparent;
  color: var(--cor-erro);
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
