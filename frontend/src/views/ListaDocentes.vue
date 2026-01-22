<template>
  <div class="pagina-docentes">
    <div class="cabecalho-pagina">
      <div class="cabecalho-topo">
        <router-link v-if="!estaAutenticado" to="/" class="btn-voltar">
          ← Voltar ao Início
        </router-link>
      </div>
      <h1>Docentes</h1>
      <p>Lista de docentes registados no sistema</p>
    </div>

    <div v-if="carregando" class="carregando">
      A carregar docentes...
    </div>

    <div v-else-if="erro" class="alerta alerta-erro">
      {{ erro }}
    </div>

    <div v-else-if="docentes.length === 0" class="estado-vazio">
      <div class="estado-vazio-icone">◎</div>
      <h3>Sem Docentes</h3>
      <p>Não existem docentes registados no sistema.</p>
    </div>

    <div v-else class="contentor-tabela">
      <table class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Data de Registo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="docente in docentes" :key="docente.id">
            <td>
              <span class="docente-nome">{{ docente.nome }}</span>
            </td>
            <td>
              <span class="docente-email">{{ docente.email }}</span>
            </td>
            <td>
              <span class="docente-data">{{ formatarData(docente.data_criacao) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAutenticacaoStore } from '../store/autenticacao';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default {
  name: 'ListaDocentes',
  setup() {
    const autenticacaoStore = useAutenticacaoStore();
    const docentes = ref([]);
    const carregando = ref(true);
    const erro = ref(null);

    const estaAutenticado = computed(() => autenticacaoStore.estaAutenticado);

    const carregarDocentes = async () => {
      try {
        carregando.value = true;
        erro.value = null;
        const resposta = await axios.get(`${API_URL}/docentes`);
        if (resposta.data.sucesso) {
          docentes.value = resposta.data.dados.docentes;
        } else {
          erro.value = resposta.data.mensagem;
        }
      } catch (e) {
        erro.value = 'Erro ao carregar lista de docentes';
        console.error(e);
      } finally {
        carregando.value = false;
      }
    };

    const formatarData = (dataString) => {
      if (!dataString) return '-';
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-PT');
    };

    onMounted(() => {
      carregarDocentes();
    });

    return {
      docentes,
      carregando,
      erro,
      formatarData,
      estaAutenticado
    };
  }
};
</script>

<style scoped>
.pagina-docentes {
  max-width: 1000px;
  margin: 0 auto;
}

.cabecalho-topo {
  margin-bottom: 1rem;
}

.btn-voltar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--cor-destaque-primario);
  background: transparent;
  border: 1px solid var(--cor-destaque-primario);
  text-decoration: none;
  transition: all 0.2s;
}

.btn-voltar:hover {
  background: var(--cor-destaque-primario);
  color: #000;
}

.contentor-tabela {
  overflow-x: auto;
}

.docente-nome {
  color: var(--cor-texto-principal);
  font-weight: 500;
}

.docente-email {
  color: var(--cor-destaque-primario);
}

.docente-data {
  color: var(--cor-texto-terciario);
  font-size: 0.9rem;
}

.estado-vazio {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
}

.estado-vazio-icone {
  font-size: 3rem;
  color: var(--cor-destaque-primario);
  margin-bottom: 1rem;
}

.estado-vazio h3 {
  color: var(--cor-texto-principal);
  margin-bottom: 0.5rem;
}

.estado-vazio p {
  color: var(--cor-texto-secundario);
  margin: 0;
}
</style>
