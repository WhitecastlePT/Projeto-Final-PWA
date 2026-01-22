<template>
  <div class="pagina-perfil">
    <div class="cabecalho-pagina">
      <h1>Meu Perfil</h1>
      <p>Gerir as informações da sua conta</p>
    </div>

    <div v-if="carregando" class="carregando">
      A carregar perfil...
    </div>

    <div v-else>
      <div v-if="mensagemSucesso" class="alerta alerta-sucesso">
        {{ mensagemSucesso }}
      </div>

      <div v-if="mensagemErro" class="alerta alerta-erro">
        {{ mensagemErro }}
      </div>

      <div class="grelha grelha-2">
        <!-- Informações Pessoais -->
        <div class="cartao">
          <div class="cartao-cabecalho">
            <h3 class="cartao-titulo">Informações Pessoais</h3>
            <button v-if="!modoEdicao" @click="iniciarEdicao" class="btn btn-secundario btn-pequeno">
              Editar
            </button>
          </div>
          <div class="cartao-conteudo">
            <!-- Modo Visualização -->
            <template v-if="!modoEdicao">
              <div class="info-grupo">
                <span class="info-label">Nome</span>
                <span class="info-valor">{{ utilizador?.nome || 'N/A' }}</span>
              </div>
              <div class="info-grupo">
                <span class="info-label">Email</span>
                <span class="info-valor texto-destaque">{{ utilizador?.email || 'N/A' }}</span>
              </div>
              <div class="info-grupo">
                <span class="info-label">Tipo de Utilizador</span>
                <span class="info-valor">
                  <span class="badge-tipo" :class="'tipo-' + utilizador?.tipo">
                    {{ formatarTipo(utilizador?.tipo) }}
                  </span>
                </span>
              </div>
              <div class="info-grupo">
                <span class="info-label">Membro desde</span>
                <span class="info-valor">{{ formatarData(utilizador?.data_criacao) }}</span>
              </div>
            </template>

            <!-- Modo Edição -->
            <template v-else>
              <form @submit.prevent="guardarPerfil" class="formulario-edicao">
                <div class="formulario-grupo">
                  <label for="nome" class="formulario-label">Nome</label>
                  <input
                    type="text"
                    id="nome"
                    v-model="edicao.nome"
                    class="formulario-input"
                    placeholder="Introduza o seu nome"
                    required
                  />
                </div>
                <div class="formulario-grupo">
                  <label for="email" class="formulario-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    v-model="edicao.email"
                    class="formulario-input"
                    placeholder="Introduza o seu email"
                    required
                  />
                </div>
                <div class="info-grupo">
                  <span class="info-label">Tipo de Utilizador</span>
                  <span class="info-valor">
                    <span class="badge-tipo" :class="'tipo-' + utilizador?.tipo">
                      {{ formatarTipo(utilizador?.tipo) }}
                    </span>
                  </span>
                </div>
                <div class="formulario-acoes">
                  <button type="button" @click="cancelarEdicao" class="btn btn-secundario">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primario" :disabled="aGuardar">
                    {{ aGuardar ? 'A guardar...' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </template>
          </div>
        </div>

        <!-- Informações específicas do tipo -->
        <div class="cartao">
          <div class="cartao-cabecalho">
            <h3 class="cartao-titulo">
              {{ tipoUtilizador === 'docente' ? 'Informações Docente' : tipoUtilizador === 'aluno' ? 'Informações Aluno' : 'Informações da Conta' }}
            </h3>
            <button v-if="!modoEdicaoEspecifico && tipoUtilizador !== 'administrador'" @click="iniciarEdicaoEspecifico" class="btn btn-secundario btn-pequeno">
              Editar
            </button>
          </div>
          <div class="cartao-conteudo">
            <!-- Docente - Visualização -->
            <template v-if="tipoUtilizador === 'docente' && !modoEdicaoEspecifico">
              <div class="info-grupo">
                <span class="info-label">Gabinete</span>
                <span class="info-valor">{{ utilizador?.gabinete || 'Não definido' }}</span>
              </div>
              <div class="info-grupo">
                <span class="info-label">Departamento</span>
                <span class="info-valor">{{ utilizador?.departamento || 'Não definido' }}</span>
              </div>
            </template>

            <!-- Docente - Edição -->
            <template v-else-if="tipoUtilizador === 'docente' && modoEdicaoEspecifico">
              <form @submit.prevent="guardarEspecifico" class="formulario-edicao">
                <div class="formulario-grupo">
                  <label for="gabinete" class="formulario-label">Gabinete</label>
                  <input
                    type="text"
                    id="gabinete"
                    v-model="edicaoEspecifico.gabinete"
                    class="formulario-input"
                    placeholder="Ex: Gab. 201"
                  />
                </div>
                <div class="formulario-grupo">
                  <label for="departamento" class="formulario-label">Departamento</label>
                  <input
                    type="text"
                    id="departamento"
                    v-model="edicaoEspecifico.departamento"
                    class="formulario-input"
                    placeholder="Ex: Departamento de Informática"
                  />
                </div>
                <div class="formulario-acoes">
                  <button type="button" @click="cancelarEdicaoEspecifico" class="btn btn-secundario">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primario" :disabled="aGuardarEspecifico">
                    {{ aGuardarEspecifico ? 'A guardar...' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </template>

            <!-- Aluno - Visualização -->
            <template v-else-if="tipoUtilizador === 'aluno' && !modoEdicaoEspecifico">
              <div class="info-grupo">
                <span class="info-label">Número de Aluno</span>
                <span class="info-valor">{{ utilizador?.numero_aluno || 'N/A' }}</span>
              </div>
              <div class="info-grupo">
                <span class="info-label">Curso</span>
                <span class="info-valor">{{ utilizador?.curso || 'Não definido' }}</span>
              </div>
            </template>

            <!-- Aluno - Edição -->
            <template v-else-if="tipoUtilizador === 'aluno' && modoEdicaoEspecifico">
              <form @submit.prevent="guardarEspecifico" class="formulario-edicao">
                <div class="formulario-grupo">
                  <label for="numero_aluno" class="formulario-label">Número de Aluno</label>
                  <input
                    type="text"
                    id="numero_aluno"
                    v-model="edicaoEspecifico.numero_aluno"
                    class="formulario-input"
                    placeholder="Ex: 2021001"
                  />
                </div>
                <div class="formulario-grupo">
                  <label for="curso" class="formulario-label">Curso</label>
                  <input
                    type="text"
                    id="curso"
                    v-model="edicaoEspecifico.curso"
                    class="formulario-input"
                    placeholder="Ex: Engenharia Informática"
                  />
                </div>
                <div class="formulario-acoes">
                  <button type="button" @click="cancelarEdicaoEspecifico" class="btn btn-secundario">
                    Cancelar
                  </button>
                  <button type="submit" class="btn btn-primario" :disabled="aGuardarEspecifico">
                    {{ aGuardarEspecifico ? 'A guardar...' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </template>

            <!-- Admin -->
            <template v-else-if="tipoUtilizador === 'administrador'">
              <div class="info-grupo">
                <span class="info-label">Estado</span>
                <span class="info-valor">
                  <span class="badge-estado" :class="utilizador?.aprovado ? 'aprovado' : 'pendente'">
                    {{ utilizador?.aprovado ? 'Aprovado' : 'Pendente' }}
                  </span>
                </span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div class="cartao margem-topo">
        <h3 class="cartao-titulo">Alterar Palavra-passe</h3>
        <form @submit.prevent="alterarPalavraPasse" class="formulario-inline">
          <div class="formulario-grupo">
            <label for="palavra_passe_atual" class="formulario-label">Palavra-passe Atual</label>
            <input
              type="password"
              id="palavra_passe_atual"
              v-model="palavraPasse.atual"
              class="formulario-input"
              placeholder="Introduza a palavra-passe atual"
            />
          </div>
          <div class="formulario-grupo">
            <label for="palavra_passe_nova" class="formulario-label">Nova Palavra-passe</label>
            <input
              type="password"
              id="palavra_passe_nova"
              v-model="palavraPasse.nova"
              class="formulario-input"
              placeholder="Introduza a nova palavra-passe"
              minlength="6"
            />
          </div>
          <div class="formulario-grupo">
            <label for="palavra_passe_confirmar" class="formulario-label">Confirmar Nova Palavra-passe</label>
            <input
              type="password"
              id="palavra_passe_confirmar"
              v-model="palavraPasse.confirmar"
              class="formulario-input"
              placeholder="Confirme a nova palavra-passe"
            />
          </div>
          <button type="submit" class="btn btn-primario" :disabled="aAlterar">
            {{ aAlterar ? 'A alterar...' : 'Alterar Palavra-passe' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAutenticacaoStore } from '../store/autenticacao';

export default {
  name: 'Perfil',
  setup() {
    const autenticacaoStore = useAutenticacaoStore();
    const carregando = ref(false);
    const aAlterar = ref(false);
    const aGuardar = ref(false);
    const aGuardarEspecifico = ref(false);
    const mensagemSucesso = ref('');
    const mensagemErro = ref('');

    // Modos de edição
    const modoEdicao = ref(false);
    const modoEdicaoEspecifico = ref(false);

    const utilizador = computed(() => autenticacaoStore.utilizadorAtual);
    const tipoUtilizador = computed(() => autenticacaoStore.tipoUtilizador);

    // Dados de edição - informações pessoais
    const edicao = ref({
      nome: '',
      email: ''
    });

    // Dados de edição - informações específicas
    const edicaoEspecifico = ref({
      gabinete: '',
      departamento: '',
      numero_aluno: '',
      curso: ''
    });

    const palavraPasse = ref({
      atual: '',
      nova: '',
      confirmar: ''
    });

    const formatarData = (dataString) => {
      if (!dataString) return 'N/A';
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatarTipo = (tipo) => {
      const tipos = {
        administrador: 'Administrador',
        docente: 'Docente',
        aluno: 'Aluno'
      };
      return tipos[tipo] || tipo || 'N/A';
    };

    // Edição de informações pessoais
    const iniciarEdicao = () => {
      edicao.value = {
        nome: utilizador.value?.nome || '',
        email: utilizador.value?.email || ''
      };
      modoEdicao.value = true;
    };

    const cancelarEdicao = () => {
      modoEdicao.value = false;
    };

    const guardarPerfil = async () => {
      mensagemSucesso.value = '';
      mensagemErro.value = '';

      if (!edicao.value.nome.trim()) {
        mensagemErro.value = 'O nome é obrigatório';
        return;
      }

      if (!edicao.value.email.trim()) {
        mensagemErro.value = 'O email é obrigatório';
        return;
      }

      aGuardar.value = true;

      try {
        const resultado = await autenticacaoStore.atualizarPerfil({
          nome: edicao.value.nome,
          email: edicao.value.email
        });

        if (resultado.sucesso) {
          mensagemSucesso.value = 'Perfil atualizado com sucesso';
          modoEdicao.value = false;
          setTimeout(() => mensagemSucesso.value = '', 3000);
        } else {
          mensagemErro.value = resultado.mensagem || 'Erro ao atualizar perfil';
        }
      } catch (erro) {
        mensagemErro.value = 'Erro ao atualizar perfil';
      } finally {
        aGuardar.value = false;
      }
    };

    // Edição de informações específicas
    const iniciarEdicaoEspecifico = () => {
      if (tipoUtilizador.value === 'docente') {
        edicaoEspecifico.value = {
          gabinete: utilizador.value?.gabinete || '',
          departamento: utilizador.value?.departamento || ''
        };
      } else if (tipoUtilizador.value === 'aluno') {
        edicaoEspecifico.value = {
          numero_aluno: utilizador.value?.numero_aluno || '',
          curso: utilizador.value?.curso || ''
        };
      }
      modoEdicaoEspecifico.value = true;
    };

    const cancelarEdicaoEspecifico = () => {
      modoEdicaoEspecifico.value = false;
    };

    const guardarEspecifico = async () => {
      mensagemSucesso.value = '';
      mensagemErro.value = '';
      aGuardarEspecifico.value = true;

      try {
        let dados = {};
        if (tipoUtilizador.value === 'docente') {
          dados = {
            gabinete: edicaoEspecifico.value.gabinete,
            departamento: edicaoEspecifico.value.departamento
          };
        } else if (tipoUtilizador.value === 'aluno') {
          dados = {
            numero_aluno: edicaoEspecifico.value.numero_aluno,
            curso: edicaoEspecifico.value.curso
          };
        }

        const resultado = await autenticacaoStore.atualizarPerfil(dados);

        if (resultado.sucesso) {
          mensagemSucesso.value = 'Informações atualizadas com sucesso';
          modoEdicaoEspecifico.value = false;
          setTimeout(() => mensagemSucesso.value = '', 3000);
        } else {
          mensagemErro.value = resultado.mensagem || 'Erro ao atualizar informações';
        }
      } catch (erro) {
        mensagemErro.value = 'Erro ao atualizar informações';
      } finally {
        aGuardarEspecifico.value = false;
      }
    };

    const alterarPalavraPasse = async () => {
      mensagemSucesso.value = '';
      mensagemErro.value = '';

      if (!palavraPasse.value.atual) {
        mensagemErro.value = 'Introduza a palavra-passe atual';
        return;
      }

      if (palavraPasse.value.nova !== palavraPasse.value.confirmar) {
        mensagemErro.value = 'As palavras-passe não coincidem';
        return;
      }

      if (palavraPasse.value.nova.length < 6) {
        mensagemErro.value = 'A nova palavra-passe deve ter pelo menos 6 caracteres';
        return;
      }

      aAlterar.value = true;

      try {
        const resultado = await autenticacaoStore.atualizarPerfil({
          palavra_passe_atual: palavraPasse.value.atual,
          palavra_passe_nova: palavraPasse.value.nova
        });

        if (resultado.sucesso) {
          mensagemSucesso.value = 'Palavra-passe alterada com sucesso';
          palavraPasse.value = { atual: '', nova: '', confirmar: '' };
          setTimeout(() => mensagemSucesso.value = '', 3000);
        } else {
          mensagemErro.value = resultado.mensagem || 'Erro ao alterar palavra-passe';
        }
      } catch (erro) {
        mensagemErro.value = 'Erro ao alterar palavra-passe';
      } finally {
        aAlterar.value = false;
      }
    };

    onMounted(async () => {
      if (!utilizador.value) {
        carregando.value = true;
        await autenticacaoStore.obterPerfil();
        carregando.value = false;
      }
    });

    return {
      utilizador,
      tipoUtilizador,
      carregando,
      aAlterar,
      aGuardar,
      aGuardarEspecifico,
      mensagemSucesso,
      mensagemErro,
      modoEdicao,
      modoEdicaoEspecifico,
      edicao,
      edicaoEspecifico,
      palavraPasse,
      formatarData,
      formatarTipo,
      iniciarEdicao,
      cancelarEdicao,
      guardarPerfil,
      iniciarEdicaoEspecifico,
      cancelarEdicaoEspecifico,
      guardarEspecifico,
      alterarPalavraPasse
    };
  }
};
</script>

<style scoped>
.pagina-perfil {
  max-width: 900px;
  margin: 0 auto;
}

/* Cabeçalho do cartão com botão */
.cartao-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--cor-borda);
}

.cartao-cabecalho .cartao-titulo {
  margin: 0;
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

.btn-pequeno {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

/* Formulário de edição */
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

.formulario-acoes {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.info-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--cor-borda);
}

.info-grupo:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--cor-texto-terciario);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-valor {
  color: var(--cor-texto-principal);
  font-size: 1.1rem;
  font-weight: 500;
}

/* Badge de tipo */
.badge-tipo {
  display: inline-block;
  padding: 0.25rem 0.75rem;
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

/* Badge de estado */
.badge-estado {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-estado.aprovado {
  background: var(--cor-sucesso);
  color: #000;
}

.badge-estado.pendente {
  background: var(--cor-aviso);
  color: #000;
}

.formulario-inline {
  max-width: 500px;
}

/* Responsividade */
@media (max-width: 768px) {
  .grelha-2 {
    grid-template-columns: 1fr;
  }
}
</style>
