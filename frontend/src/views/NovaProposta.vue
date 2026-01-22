<template>
  <div class="pagina-nova-proposta">
    <div class="cabecalho-pagina">
      <router-link to="/minhas-propostas" class="ligacao-voltar">
        &larr; Voltar à gestão de propostas
      </router-link>
      <h1>Criar nova proposta</h1>
      <p>Preencha o formulário abaixo para submeter uma nova proposta de projeto</p>
    </div>

    <div v-if="mensagemSucesso" class="alerta alerta-sucesso">
      {{ mensagemSucesso }}
    </div>

    <div v-if="mensagemErro" class="alerta alerta-erro">
      {{ mensagemErro }}
    </div>

    <form @submit.prevent="submeterProposta" class="formulario">
      <div class="formulario-grupo">
        <label for="titulo" class="formulario-label">Título da Proposta</label>
        <input
          type="text"
          id="titulo"
          v-model="proposta.titulo"
          class="formulario-input"
          placeholder="Introduza o título da proposta"
          required
        />
      </div>

      <div class="formulario-grupo">
        <label for="descricao" class="formulario-label">Descrição e Objetivos</label>
        <textarea
          id="descricao"
          v-model="proposta.descricao_objetivos"
          class="formulario-textarea"
          placeholder="Descreva os objetivos e o âmbito do projeto"
          required
        ></textarea>
      </div>

      <div class="formulario-grupo">
        <label for="plano" class="formulario-label">Plano de Trabalho (Opcional)</label>
        <textarea
          id="plano"
          v-model="proposta.plano_trabalho"
          class="formulario-textarea"
          placeholder="Descreva o plano de trabalho proposto"
        ></textarea>
      </div>

      <div class="formulario-grupo">
        <label for="uc" class="formulario-label">Unidade Curricular</label>
        <select id="uc" v-model="proposta.uc_id" class="formulario-select">
          <option value="">-- Sem UC associada --</option>
          <option
            v-for="uc in minhasUCs"
            :key="uc.id"
            :value="uc.id"
          >
            {{ uc.codigo }} - {{ uc.nome }}
          </option>
        </select>
        <p class="formulario-ajuda">Associe a proposta a uma UC para que os alunos possam encontrá-la</p>
      </div>

      <div class="formulario-grupo">
        <label for="estado" class="formulario-label">Estado</label>
        <select id="estado" v-model="proposta.estado" class="formulario-select">
          <option value="rascunho">Rascunho</option>
          <option value="publicada">Publicada</option>
        </select>
        <p class="formulario-ajuda">Apenas propostas publicadas ficam visíveis para os alunos</p>
      </div>

      <!-- Secção de Coorientadores -->
      <div class="formulario-seccao">
        <h3 class="seccao-titulo">Coorientadores</h3>
        <p class="seccao-descricao">Adicione docentes como coorientadores desta proposta (opcional)</p>

        <div class="seletor-multi">
          <select v-model="coorientadorSelecionado" class="formulario-select">
            <option value="">-- Selecione um docente --</option>
            <option
              v-for="docente in docentesDisponiveis"
              :key="docente.id"
              :value="docente.id"
            >
              {{ docente.nome }} ({{ docente.email }})
            </option>
          </select>
          <button
            type="button"
            class="btn btn-adicionar"
            @click="adicionarCoorientador"
            :disabled="!coorientadorSelecionado"
          >
            + Adicionar
          </button>
        </div>

        <div v-if="coorientadoresSelecionados.length > 0" class="itens-selecionados">
          <div
            v-for="coorientador in coorientadoresSelecionados"
            :key="coorientador.id"
            class="item-selecionado"
          >
            <span class="item-nome">{{ coorientador.nome }}</span>
            <button
              type="button"
              class="btn-remover"
              @click="removerCoorientador(coorientador.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Secção de Palavras-chave -->
      <div class="formulario-seccao">
        <h3 class="seccao-titulo">Palavras-chave</h3>
        <p class="seccao-descricao">Adicione palavras-chave para facilitar a pesquisa (opcional)</p>

        <div class="seletor-multi">
          <select v-model="palavraChaveSelecionada" class="formulario-select">
            <option value="">-- Selecione uma palavra-chave --</option>
            <option
              v-for="pc in palavrasChaveDisponiveis"
              :key="pc.id"
              :value="pc.id"
            >
              {{ pc.termo }}
            </option>
          </select>
          <button
            type="button"
            class="btn btn-adicionar"
            @click="adicionarPalavraChave"
            :disabled="!palavraChaveSelecionada"
          >
            + Adicionar
          </button>
        </div>

        <div class="criar-palavra-chave">
          <input
            type="text"
            v-model="novaPalavraChave"
            class="formulario-input"
            placeholder="Ou crie uma nova palavra-chave..."
          />
          <button
            type="button"
            class="btn btn-adicionar"
            @click="criarNovaPalavraChave"
            :disabled="!novaPalavraChave.trim()"
          >
            + Criar
          </button>
        </div>

        <div v-if="palavrasChaveSelecionadas.length > 0" class="itens-selecionados">
          <div
            v-for="pc in palavrasChaveSelecionadas"
            :key="pc.id"
            class="item-selecionado item-tag"
          >
            <span class="item-nome">{{ pc.termo }}</span>
            <button
              type="button"
              class="btn-remover"
              @click="removerPalavraChave(pc.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Secção de Alunos -->
      <div class="formulario-seccao">
        <h3 class="seccao-titulo">Alunos Atribuídos</h3>
        <p class="seccao-descricao">Atribua alunos a esta proposta (opcional)</p>

        <div class="seletor-multi">
          <select v-model="alunoSelecionado" class="formulario-select">
            <option value="">-- Selecione um aluno --</option>
            <option
              v-for="aluno in alunosDisponiveis"
              :key="aluno.id"
              :value="aluno.id"
            >
              {{ aluno.nome }} ({{ aluno.numero_aluno || aluno.email }})
            </option>
          </select>
          <button
            type="button"
            class="btn btn-adicionar"
            @click="adicionarAluno"
            :disabled="!alunoSelecionado"
          >
            + Adicionar
          </button>
        </div>

        <div v-if="alunosSelecionados.length > 0" class="itens-selecionados">
          <div
            v-for="aluno in alunosSelecionados"
            :key="aluno.id"
            class="item-selecionado"
          >
            <span class="item-nome">{{ aluno.nome }}</span>
            <span class="item-detalhe">{{ aluno.numero_aluno }}</span>
            <button
              type="button"
              class="btn-remover"
              @click="removerAluno(aluno.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <div class="grupo-botoes margem-topo">
        <button type="submit" class="btn btn-primario" :disabled="carregando">
          <span v-if="carregando" class="indicador-carregamento"></span>
          {{ carregando ? 'A submeter...' : 'Criar Proposta' }}
        </button>
        <router-link to="/minhas-propostas" class="btn btn-secundario">
          Cancelar
        </router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { propostasAPI, docentesAPI, alunosAPI, palavrasChaveAPI, ucsAPI } from '../services/api';
import { useAutenticacaoStore } from '../store/autenticacao';

export default {
  name: 'NovaProposta',
  setup() {
    const router = useRouter();
    const autenticacaoStore = useAutenticacaoStore();
    const carregando = ref(false);
    const mensagemErro = ref('');
    const mensagemSucesso = ref('');

    const proposta = ref({
      titulo: '',
      descricao_objetivos: '',
      plano_trabalho: '',
      estado: 'rascunho',
      uc_id: ''
    });

    // Dados para seleção
    const docentes = ref([]);
    const alunos = ref([]);
    const palavrasChave = ref([]);
    const minhasUCs = ref([]);

    // Seleções atuais
    const coorientadorSelecionado = ref('');
    const alunoSelecionado = ref('');
    const palavraChaveSelecionada = ref('');
    const novaPalavraChave = ref('');

    // Itens selecionados
    const coorientadoresSelecionados = ref([]);
    const alunosSelecionados = ref([]);
    const palavrasChaveSelecionadas = ref([]);

    // Docentes disponíveis (excluindo o utilizador atual e os já selecionados)
    const docentesDisponiveis = computed(() => {
      const idsSelecionados = coorientadoresSelecionados.value.map(c => c.id);
      return docentes.value.filter(d =>
        d.id !== autenticacaoStore.utilizadorAtual?.id &&
        !idsSelecionados.includes(d.id)
      );
    });

    // Alunos disponíveis (excluindo os já selecionados)
    const alunosDisponiveis = computed(() => {
      const idsSelecionados = alunosSelecionados.value.map(a => a.id);
      return alunos.value.filter(a => !idsSelecionados.includes(a.id));
    });

    // Palavras-chave disponíveis (excluindo as já selecionadas)
    const palavrasChaveDisponiveis = computed(() => {
      const idsSelecionados = palavrasChaveSelecionadas.value.map(pc => pc.id);
      return palavrasChave.value.filter(pc => !idsSelecionados.includes(pc.id));
    });

    // Carregar dados
    const carregarDados = async () => {
      try {
        const [resDocentes, resAlunos, resPalavrasChave, resUCs] = await Promise.all([
          docentesAPI.listar(),
          alunosAPI.listar(),
          palavrasChaveAPI.listar(),
          ucsAPI.listarMinhas()
        ]);

        if (resDocentes.data.sucesso) {
          docentes.value = resDocentes.data.dados.docentes;
        }
        if (resAlunos.data.sucesso) {
          alunos.value = resAlunos.data.dados.alunos;
        }
        if (resPalavrasChave.data.sucesso) {
          palavrasChave.value = resPalavrasChave.data.dados.palavras_chave;
        }
        if (resUCs.data.sucesso) {
          minhasUCs.value = resUCs.data.dados.ucs;
        }
      } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
      }
    };

    // Funções para adicionar/remover coorientadores
    const adicionarCoorientador = () => {
      if (!coorientadorSelecionado.value) return;
      const docente = docentes.value.find(d => d.id === coorientadorSelecionado.value);
      if (docente) {
        coorientadoresSelecionados.value.push(docente);
        coorientadorSelecionado.value = '';
      }
    };

    const removerCoorientador = (id) => {
      coorientadoresSelecionados.value = coorientadoresSelecionados.value.filter(c => c.id !== id);
    };

    // Funções para adicionar/remover alunos
    const adicionarAluno = () => {
      if (!alunoSelecionado.value) return;
      const aluno = alunos.value.find(a => a.id === alunoSelecionado.value);
      if (aluno) {
        alunosSelecionados.value.push(aluno);
        alunoSelecionado.value = '';
      }
    };

    const removerAluno = (id) => {
      alunosSelecionados.value = alunosSelecionados.value.filter(a => a.id !== id);
    };

    // Funções para adicionar/remover palavras-chave
    const adicionarPalavraChave = () => {
      if (!palavraChaveSelecionada.value) return;
      const pc = palavrasChave.value.find(p => p.id === palavraChaveSelecionada.value);
      if (pc) {
        palavrasChaveSelecionadas.value.push(pc);
        palavraChaveSelecionada.value = '';
      }
    };

    const removerPalavraChave = (id) => {
      palavrasChaveSelecionadas.value = palavrasChaveSelecionadas.value.filter(pc => pc.id !== id);
    };

    const criarNovaPalavraChave = async () => {
      if (!novaPalavraChave.value.trim()) return;

      try {
        const resposta = await palavrasChaveAPI.criar(novaPalavraChave.value.trim());
        if (resposta.data.sucesso) {
          const novaPC = resposta.data.dados.palavra_chave;
          palavrasChave.value.push(novaPC);
          palavrasChaveSelecionadas.value.push(novaPC);
          novaPalavraChave.value = '';
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao criar palavra-chave';
      }
    };

    const submeterProposta = async () => {
      mensagemErro.value = '';
      mensagemSucesso.value = '';
      carregando.value = true;

      try {
        const dadosProposta = {
          titulo: proposta.value.titulo,
          descricao_objetivos: proposta.value.descricao_objetivos,
          estado: proposta.value.estado,
          uc_id: proposta.value.uc_id || null,
          coorientadores: coorientadoresSelecionados.value.map(c => c.id),
          alunos: alunosSelecionados.value.map(a => a.id),
          palavras_chave: palavrasChaveSelecionadas.value.map(pc => pc.id)
        };

        const resposta = await propostasAPI.criar(dadosProposta);
        if (resposta.data.sucesso) {
          mensagemSucesso.value = 'Proposta criada com sucesso!';
          setTimeout(() => {
            router.push('/minhas-propostas');
          }, 1500);
        } else {
          mensagemErro.value = resposta.data.mensagem;
        }
      } catch (erro) {
        console.error('Erro ao criar proposta:', erro);
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao criar proposta';
      } finally {
        carregando.value = false;
      }
    };

    onMounted(() => {
      carregarDados();
    });

    return {
      proposta,
      carregando,
      mensagemErro,
      mensagemSucesso,
      submeterProposta,
      // Dados para seleção
      docentesDisponiveis,
      alunosDisponiveis,
      palavrasChaveDisponiveis,
      minhasUCs,
      // Seleções
      coorientadorSelecionado,
      alunoSelecionado,
      palavraChaveSelecionada,
      novaPalavraChave,
      // Itens selecionados
      coorientadoresSelecionados,
      alunosSelecionados,
      palavrasChaveSelecionadas,
      // Funções
      adicionarCoorientador,
      removerCoorientador,
      adicionarAluno,
      removerAluno,
      adicionarPalavraChave,
      removerPalavraChave,
      criarNovaPalavraChave
    };
  }
};
</script>

<style scoped>
.pagina-nova-proposta {
  max-width: 1000px;
  margin: 0 auto;
}

.ligacao-voltar {
  display: inline-flex;
  align-items: center;
  color: var(--cor-texto-secundario);
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: color var(--transicao-rapida);
}

.ligacao-voltar:hover {
  color: var(--cor-destaque-primario);
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

/* Secções do formulário */
.formulario-seccao {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--cor-borda);
}

.seccao-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-destaque-primario);
  margin: 0 0 0.5rem 0;
}

.seccao-descricao {
  font-size: 0.9rem;
  color: var(--cor-texto-terciario);
  margin: 0 0 1rem 0;
}

.formulario-ajuda {
  font-size: 0.8rem;
  color: var(--cor-texto-terciario);
  margin: 0.5rem 0 0 0;
}

/* Seletor multi */
.seletor-multi {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.seletor-multi .formulario-select {
  flex: 1;
}

.btn-adicionar {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--cor-destaque-primario);
  color: var(--cor-destaque-primario);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-adicionar:hover:not(:disabled) {
  background: var(--cor-destaque-primario);
  color: #000;
}

.btn-adicionar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Criar palavra-chave */
.criar-palavra-chave {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.criar-palavra-chave .formulario-input {
  flex: 1;
}

/* Itens selecionados */
.itens-selecionados {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-selecionado {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  font-size: 0.9rem;
}

.item-tag {
  background: var(--cor-destaque-primario);
  border-color: var(--cor-destaque-primario);
  color: #000;
}

.item-tag .btn-remover {
  color: #000;
}

.item-tag .btn-remover:hover {
  color: var(--cor-erro);
}

.item-nome {
  color: var(--cor-texto-principal);
}

.item-detalhe {
  font-size: 0.8rem;
  color: var(--cor-texto-terciario);
}

.btn-remover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--cor-texto-terciario);
  font-size: 0.8rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-remover:hover {
  color: var(--cor-erro);
}

/* Responsividade */
@media (max-width: 768px) {
  .grupo-botoes {
    flex-direction: column;
  }

  .grupo-botoes .btn {
    width: 100%;
    text-align: center;
  }

  .seletor-multi,
  .criar-palavra-chave {
    flex-direction: column;
  }

  .btn-adicionar {
    width: 100%;
  }
}
</style>
