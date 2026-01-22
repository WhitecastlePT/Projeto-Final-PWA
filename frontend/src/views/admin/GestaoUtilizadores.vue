<template>
  <div class="gestao-utilizadores">
    <div class="pagina-cabecalho">
      <h1 class="pagina-titulo">Gestão de Utilizadores</h1>
      <p class="pagina-subtitulo">Aprovar, rejeitar e gerir utilizadores do sistema</p>
    </div>

    <!-- Filtros -->
    <div class="filtros-container">
      <div class="filtro-grupo">
        <label class="filtro-label">Estado:</label>
        <select v-model="filtroEstado" class="filtro-select">
          <option value="todos">Todos</option>
          <option value="pendentes">Pendentes</option>
          <option value="aprovados">Aprovados</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label class="filtro-label">Tipo:</label>
        <select v-model="filtroTipo" class="filtro-select">
          <option value="todos">Todos</option>
          <option value="docente">Docentes</option>
          <option value="aluno">Alunos</option>
          <option value="administrador">Administradores</option>
        </select>
      </div>
      <div class="filtro-grupo">
        <label class="filtro-label">Pesquisar:</label>
        <input
          type="text"
          v-model="pesquisa"
          class="filtro-input"
          placeholder="Nome ou email..."
        />
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
      <span>A carregar utilizadores...</span>
    </div>

    <!-- Tabela de utilizadores -->
    <div v-else class="tabela-container">
      <table class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Data Registo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="utilizador in utilizadoresFiltrados" :key="utilizador.id">
            <td>
              <div class="utilizador-nome">{{ utilizador.nome }}</div>
              <div v-if="utilizador.numero_aluno" class="utilizador-detalhe">
                Nº Aluno: {{ utilizador.numero_aluno }}
              </div>
              <div v-if="utilizador.gabinete" class="utilizador-detalhe">
                Gabinete: {{ utilizador.gabinete }}
              </div>
            </td>
            <td>{{ utilizador.email }}</td>
            <td>
              <span class="badge-tipo" :class="'tipo-' + utilizador.tipo">
                {{ formatarTipo(utilizador.tipo) }}
              </span>
            </td>
            <td>
              <span class="badge-estado" :class="utilizador.aprovado ? 'aprovado' : 'pendente'">
                {{ utilizador.aprovado ? 'Aprovado' : 'Pendente' }}
              </span>
            </td>
            <td>{{ formatarData(utilizador.data_criacao) }}</td>
            <td>
              <div class="acoes-container">
                <!-- Editar -->
                <button
                  @click="abrirModalEdicao(utilizador)"
                  class="btn-acao btn-editar"
                  title="Editar"
                >
                  ✎
                </button>
                <!-- Aprovar -->
                <button
                  v-if="!utilizador.aprovado"
                  @click="aprovarUtilizador(utilizador)"
                  class="btn-acao btn-aprovar"
                  title="Aprovar"
                >
                  ✓
                </button>
                <!-- Rejeitar -->
                <button
                  v-if="!utilizador.aprovado"
                  @click="rejeitarUtilizador(utilizador)"
                  class="btn-acao btn-rejeitar"
                  title="Rejeitar"
                >
                  ✕
                </button>
                <!-- Alterar Tipo -->
                <button
                  v-if="utilizador.aprovado"
                  @click="abrirModalTipo(utilizador)"
                  class="btn-acao btn-tipo"
                  title="Alterar Tipo"
                >
                  ⇄
                </button>
                <!-- Eliminar -->
                <button
                  v-if="!eUtilizadorAtual(utilizador)"
                  @click="confirmarEliminacao(utilizador)"
                  class="btn-acao btn-eliminar"
                  title="Eliminar"
                >
                  ⌫
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="utilizadoresFiltrados.length === 0">
            <td colspan="6" class="tabela-vazia">
              Nenhum utilizador encontrado.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Alterar Tipo -->
    <div v-if="modalTipoAberto" class="modal-overlay" @click.self="fecharModalTipo">
      <div class="modal">
        <div class="modal-cabecalho">
          <h3 class="modal-titulo">Alterar Tipo de Utilizador</h3>
          <button @click="fecharModalTipo" class="modal-fechar">✕</button>
        </div>
        <div class="modal-corpo">
          <p>Utilizador: <strong>{{ utilizadorSelecionado?.nome }}</strong></p>
          <p class="tipo-atual">Tipo atual: <span class="badge-tipo" :class="'tipo-' + utilizadorSelecionado?.tipo">{{ formatarTipo(utilizadorSelecionado?.tipo) }}</span></p>
          <div class="formulario-grupo">
            <label class="formulario-label">Novo Tipo:</label>
            <select v-model="novoTipo" class="formulario-input">
              <option value="administrador">Administrador</option>
              <option value="docente">Docente</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>
          <p v-if="eUtilizadorAtual(utilizadorSelecionado) && novoTipo !== 'administrador'" class="aviso-eliminacao">
            Atenção: Ao mudar o seu próprio tipo para não-administrador, perderá acesso a esta página.
          </p>
        </div>
        <div class="modal-rodape">
          <button @click="fecharModalTipo" class="btn btn-secundario">Cancelar</button>
          <button @click="alterarTipo" class="btn btn-primario">Confirmar</button>
        </div>
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
          <p>Tem certeza que deseja eliminar o utilizador:</p>
          <p><strong>{{ utilizadorSelecionado?.nome }}</strong> ({{ utilizadorSelecionado?.email }})?</p>
          <p class="aviso-eliminacao">Esta ação não pode ser revertida.</p>
        </div>
        <div class="modal-rodape">
          <button @click="fecharModalEliminacao" class="btn btn-secundario">Cancelar</button>
          <button @click="eliminarUtilizador" class="btn btn-erro">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Modal Editar Utilizador -->
    <div v-if="modalEdicaoAberto" class="modal-overlay" @click.self="fecharModalEdicao">
      <div class="modal modal-largo">
        <div class="modal-cabecalho">
          <h3 class="modal-titulo">Editar Utilizador</h3>
          <button @click="fecharModalEdicao" class="modal-fechar">✕</button>
        </div>
        <div class="modal-corpo">
          <form @submit.prevent="guardarEdicao" class="formulario-edicao">
            <!-- Campos comuns -->
            <div class="formulario-grupo">
              <label class="formulario-label">Nome *</label>
              <input
                type="text"
                v-model="edicao.nome"
                class="formulario-input"
                required
              />
            </div>
            <div class="formulario-grupo">
              <label class="formulario-label">Email *</label>
              <input
                type="email"
                v-model="edicao.email"
                class="formulario-input"
                required
              />
            </div>
            <div class="formulario-grupo">
              <label class="formulario-label">Nova Palavra-passe (deixe vazio para manter)</label>
              <input
                type="password"
                v-model="edicao.palavra_passe"
                class="formulario-input"
                placeholder="••••••"
                minlength="6"
              />
            </div>

            <!-- Campos específicos de Docente -->
            <template v-if="utilizadorSelecionado?.tipo === 'docente'">
              <div class="formulario-divisor">
                <span>Informações de Docente</span>
              </div>
              <div class="formulario-linha">
                <div class="formulario-grupo">
                  <label class="formulario-label">Gabinete</label>
                  <input
                    type="text"
                    v-model="edicao.gabinete"
                    class="formulario-input"
                    placeholder="Ex: Gab. 201"
                  />
                </div>
                <div class="formulario-grupo">
                  <label class="formulario-label">Departamento</label>
                  <input
                    type="text"
                    v-model="edicao.departamento"
                    class="formulario-input"
                    placeholder="Ex: Departamento de Informática"
                  />
                </div>
              </div>
            </template>

            <!-- Campos específicos de Aluno -->
            <template v-if="utilizadorSelecionado?.tipo === 'aluno'">
              <div class="formulario-divisor">
                <span>Informações de Aluno</span>
              </div>
              <div class="formulario-linha">
                <div class="formulario-grupo">
                  <label class="formulario-label">Número de Aluno</label>
                  <input
                    type="text"
                    v-model="edicao.numero_aluno"
                    class="formulario-input"
                    placeholder="Ex: 2021001"
                  />
                </div>
                <div class="formulario-grupo">
                  <label class="formulario-label">Curso</label>
                  <input
                    type="text"
                    v-model="edicao.curso"
                    class="formulario-input"
                    placeholder="Ex: Engenharia Informática"
                  />
                </div>
              </div>
            </template>

            <!-- Administrador não tem campos específicos -->
            <template v-if="utilizadorSelecionado?.tipo === 'administrador'">
              <div class="formulario-divisor">
                <span>Administrador</span>
              </div>
              <p class="info-admin">Os administradores não possuem campos específicos adicionais.</p>
            </template>
          </form>
        </div>
        <div class="modal-rodape">
          <button @click="fecharModalEdicao" class="btn btn-secundario">Cancelar</button>
          <button @click="guardarEdicao" class="btn btn-primario" :disabled="aGuardar">
            {{ aGuardar ? 'A guardar...' : 'Guardar Alterações' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { adminAPI } from '../../services/api';
import { useAutenticacaoStore } from '../../store/autenticacao';

export default {
  name: 'GestaoUtilizadores',
  setup() {
    const autenticacaoStore = useAutenticacaoStore();
    const utilizadores = ref([]);
    const carregando = ref(true);
    const mensagemSucesso = ref('');
    const mensagemErro = ref('');

    // Filtros
    const filtroEstado = ref('todos');
    const filtroTipo = ref('todos');
    const pesquisa = ref('');

    // Modais
    const modalTipoAberto = ref(false);
    const modalEliminacaoAberto = ref(false);
    const modalEdicaoAberto = ref(false);
    const utilizadorSelecionado = ref(null);
    const novoTipo = ref('docente');
    const aGuardar = ref(false);

    // Dados de edição
    const edicao = ref({
      nome: '',
      email: '',
      palavra_passe: '',
      gabinete: '',
      departamento: '',
      numero_aluno: '',
      curso: ''
    });

    // Utilizadores filtrados
    const utilizadoresFiltrados = computed(() => {
      return utilizadores.value.filter(u => {
        // Filtro estado
        if (filtroEstado.value === 'pendentes' && u.aprovado) return false;
        if (filtroEstado.value === 'aprovados' && !u.aprovado) return false;

        // Filtro tipo
        if (filtroTipo.value !== 'todos' && u.tipo !== filtroTipo.value) return false;

        // Pesquisa
        if (pesquisa.value) {
          const termo = pesquisa.value.toLowerCase();
          if (!u.nome.toLowerCase().includes(termo) && !u.email.toLowerCase().includes(termo)) {
            return false;
          }
        }

        return true;
      });
    });

    // Carregar utilizadores
    const carregarUtilizadores = async () => {
      carregando.value = true;
      mensagemErro.value = '';

      try {
        const resposta = await adminAPI.listarUtilizadores();
        if (resposta.data.sucesso) {
          utilizadores.value = resposta.data.dados.utilizadores;
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao carregar utilizadores';
      } finally {
        carregando.value = false;
      }
    };

    // Aprovar utilizador
    const aprovarUtilizador = async (utilizador) => {
      try {
        const resposta = await adminAPI.aprovarUtilizador(utilizador.id);
        if (resposta.data.sucesso) {
          utilizador.aprovado = true;
          mensagemSucesso.value = `Utilizador "${utilizador.nome}" aprovado com sucesso.`;
          setTimeout(() => mensagemSucesso.value = '', 3000);
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao aprovar utilizador';
      }
    };

    // Rejeitar utilizador
    const rejeitarUtilizador = async (utilizador) => {
      try {
        const resposta = await adminAPI.rejeitarUtilizador(utilizador.id);
        if (resposta.data.sucesso) {
          utilizadores.value = utilizadores.value.filter(u => u.id !== utilizador.id);
          mensagemSucesso.value = `Utilizador "${utilizador.nome}" rejeitado e removido.`;
          setTimeout(() => mensagemSucesso.value = '', 3000);
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao rejeitar utilizador';
      }
    };

    // Modal alterar tipo
    const abrirModalTipo = (utilizador) => {
      utilizadorSelecionado.value = utilizador;
      novoTipo.value = utilizador.tipo;
      modalTipoAberto.value = true;
    };

    const fecharModalTipo = () => {
      modalTipoAberto.value = false;
      utilizadorSelecionado.value = null;
    };

    const alterarTipo = async () => {
      try {
        const resposta = await adminAPI.alterarTipoUtilizador(utilizadorSelecionado.value.id, novoTipo.value);
        if (resposta.data.sucesso) {
          utilizadorSelecionado.value.tipo = novoTipo.value;
          mensagemSucesso.value = `Tipo de "${utilizadorSelecionado.value.nome}" alterado para ${formatarTipo(novoTipo.value)}.`;
          setTimeout(() => mensagemSucesso.value = '', 3000);
          fecharModalTipo();
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao alterar tipo';
      }
    };

    // Modal confirmar eliminação
    const confirmarEliminacao = (utilizador) => {
      utilizadorSelecionado.value = utilizador;
      modalEliminacaoAberto.value = true;
    };

    const fecharModalEliminacao = () => {
      modalEliminacaoAberto.value = false;
      utilizadorSelecionado.value = null;
    };

    const eliminarUtilizador = async () => {
      try {
        const resposta = await adminAPI.eliminarUtilizador(utilizadorSelecionado.value.id);
        if (resposta.data.sucesso) {
          utilizadores.value = utilizadores.value.filter(u => u.id !== utilizadorSelecionado.value.id);
          mensagemSucesso.value = `Utilizador "${utilizadorSelecionado.value.nome}" eliminado com sucesso.`;
          setTimeout(() => mensagemSucesso.value = '', 3000);
          fecharModalEliminacao();
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao eliminar utilizador';
      }
    };

    // Modal editar utilizador
    const abrirModalEdicao = (utilizador) => {
      utilizadorSelecionado.value = utilizador;
      edicao.value = {
        nome: utilizador.nome || '',
        email: utilizador.email || '',
        palavra_passe: '',
        gabinete: utilizador.gabinete || '',
        departamento: utilizador.departamento || '',
        numero_aluno: utilizador.numero_aluno || '',
        curso: utilizador.curso || ''
      };
      modalEdicaoAberto.value = true;
    };

    const fecharModalEdicao = () => {
      modalEdicaoAberto.value = false;
      utilizadorSelecionado.value = null;
      edicao.value = {
        nome: '',
        email: '',
        palavra_passe: '',
        gabinete: '',
        departamento: '',
        numero_aluno: '',
        curso: ''
      };
    };

    const guardarEdicao = async () => {
      if (!edicao.value.nome.trim()) {
        mensagemErro.value = 'O nome é obrigatório';
        return;
      }

      if (!edicao.value.email.trim()) {
        mensagemErro.value = 'O email é obrigatório';
        return;
      }

      aGuardar.value = true;
      mensagemErro.value = '';

      try {
        // Preparar dados para enviar
        const dados = {
          nome: edicao.value.nome,
          email: edicao.value.email
        };

        // Adicionar palavra-passe apenas se preenchida
        if (edicao.value.palavra_passe) {
          dados.palavra_passe = edicao.value.palavra_passe;
        }

        // Campos específicos de docente
        if (utilizadorSelecionado.value.tipo === 'docente') {
          dados.gabinete = edicao.value.gabinete;
          dados.departamento = edicao.value.departamento;
        }

        // Campos específicos de aluno
        if (utilizadorSelecionado.value.tipo === 'aluno') {
          dados.numero_aluno = edicao.value.numero_aluno;
          dados.curso = edicao.value.curso;
        }

        const resposta = await adminAPI.atualizarUtilizador(utilizadorSelecionado.value.id, dados);

        if (resposta.data.sucesso) {
          // Atualizar utilizador na lista local
          const indice = utilizadores.value.findIndex(u => u.id === utilizadorSelecionado.value.id);
          if (indice !== -1) {
            utilizadores.value[indice] = { ...utilizadores.value[indice], ...resposta.data.dados.utilizador };
          }

          mensagemSucesso.value = `Utilizador "${edicao.value.nome}" atualizado com sucesso.`;
          setTimeout(() => mensagemSucesso.value = '', 3000);
          fecharModalEdicao();
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao atualizar utilizador';
      } finally {
        aGuardar.value = false;
      }
    };

    // Formatadores
    const formatarTipo = (tipo) => {
      const tipos = {
        administrador: 'Admin',
        docente: 'Docente',
        aluno: 'Aluno'
      };
      return tipos[tipo] || tipo;
    };

    const formatarData = (data) => {
      if (!data) return '-';
      return new Date(data).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Verificar se é o utilizador atual
    const eUtilizadorAtual = (utilizador) => {
      if (!utilizador || !autenticacaoStore.utilizadorAtual) return false;
      return utilizador.id === autenticacaoStore.utilizadorAtual.id;
    };

    onMounted(() => {
      carregarUtilizadores();
    });

    return {
      utilizadores,
      utilizadoresFiltrados,
      carregando,
      mensagemSucesso,
      mensagemErro,
      filtroEstado,
      filtroTipo,
      pesquisa,
      modalTipoAberto,
      modalEliminacaoAberto,
      modalEdicaoAberto,
      utilizadorSelecionado,
      novoTipo,
      edicao,
      aGuardar,
      aprovarUtilizador,
      rejeitarUtilizador,
      abrirModalTipo,
      fecharModalTipo,
      alterarTipo,
      confirmarEliminacao,
      fecharModalEliminacao,
      eliminarUtilizador,
      abrirModalEdicao,
      fecharModalEdicao,
      guardarEdicao,
      formatarTipo,
      formatarData,
      eUtilizadorAtual
    };
  }
};
</script>

<style scoped>
.gestao-utilizadores {
  max-width: 1200px;
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
}

/* Filtros */
.filtros-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
}

.filtro-grupo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filtro-label {
  font-size: 0.85rem;
  color: var(--cor-texto-secundario);
}

.filtro-select,
.filtro-input {
  padding: 0.5rem 0.75rem;
  background: var(--cor-fundo-input);
  border: 1px solid var(--cor-borda);
  color: var(--cor-texto-principal);
  font-size: 0.9rem;
  font-family: inherit;
}

.filtro-input {
  min-width: 200px;
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

/* Tabela */
.tabela-container {
  overflow-x: auto;
  border: 1px solid var(--cor-borda);
}

.tabela {
  width: 100%;
  border-collapse: collapse;
}

.tabela th,
.tabela td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--cor-borda);
}

.tabela th {
  background: var(--cor-fundo-cabecalho);
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--cor-texto-secundario);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tabela td {
  background: var(--cor-fundo-cartao);
  font-size: 0.9rem;
}

.tabela tr:hover td {
  background: var(--cor-fundo-hover);
}

.tabela-vazia {
  text-align: center;
  color: var(--cor-texto-terciario);
  padding: 2rem !important;
}

.utilizador-nome {
  font-weight: 500;
  color: var(--cor-texto-principal);
}

.utilizador-detalhe {
  font-size: 0.8rem;
  color: var(--cor-texto-terciario);
  margin-top: 0.25rem;
}

/* Badges */
.badge-tipo,
.badge-estado {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-tipo.tipo-administrador {
  background: var(--cor-destaque-secundario);
  color: #000;
}

.badge-tipo.tipo-docente {
  background: var(--cor-destaque-primario);
  color: #000;
}

.badge-tipo.tipo-aluno {
  background: var(--cor-destaque-terciario);
  color: #000;
}

.badge-estado.aprovado {
  background: var(--cor-sucesso);
  color: #000;
}

.badge-estado.pendente {
  background: var(--cor-aviso);
  color: #000;
}

/* Ações */
.acoes-container {
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
  border-color: currentColor;
}

.btn-aprovar:hover {
  color: var(--cor-sucesso);
  background: rgba(0, 255, 136, 0.1);
}

.btn-rejeitar:hover,
.btn-eliminar:hover {
  color: var(--cor-erro);
  background: rgba(255, 71, 87, 0.1);
}

.btn-tipo:hover,
.btn-editar:hover {
  color: var(--cor-destaque-primario);
  background: rgba(0, 212, 255, 0.1);
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
  max-width: 450px;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
}

.modal-largo {
  max-width: 600px;
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

.tipo-atual {
  margin-bottom: 1rem;
}

.info-admin {
  color: var(--cor-texto-terciario);
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
}

/* Formulário de edição no modal */
.formulario-edicao {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formulario-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.formulario-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--cor-texto-secundario);
}

.formulario-input {
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

.formulario-linha {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.formulario-divisor {
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  border-top: 1px solid var(--cor-borda);
}

.formulario-divisor span {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--cor-destaque-primario);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-rodape {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--cor-borda);
}

/* Botões */
.btn {
  padding: 0.5rem 1rem;
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

.btn-erro {
  background: var(--cor-erro);
  border-color: var(--cor-erro);
  color: #fff;
}

.btn-erro:hover {
  background: transparent;
  color: var(--cor-erro);
}

/* Responsividade */
@media (max-width: 768px) {
  .filtros-container {
    flex-direction: column;
  }

  .filtro-grupo {
    width: 100%;
  }

  .filtro-select,
  .filtro-input {
    flex: 1;
  }

  .tabela th:nth-child(5),
  .tabela td:nth-child(5) {
    display: none;
  }

  .formulario-linha {
    grid-template-columns: 1fr;
  }
}
</style>
