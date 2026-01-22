<template>
  <div class="pagina-minhas-propostas">
    <div class="cabecalho-pagina flex-entre">
      <div>
        <h1>Gestão de propostas</h1>
        <p>Gerir as propostas de projeto que submeteu ao sistema</p>
      </div>
      <router-link to="/nova-proposta" class="btn btn-sucesso">
        + Nova Proposta
      </router-link>
    </div>

    <div v-if="carregando" class="carregando">
      A carregar propostas...
    </div>

    <div v-else-if="erro" class="alerta alerta-erro">
      {{ erro }}
    </div>

    <div v-else-if="propostas.length === 0" class="estado-vazio">
      <div class="estado-vazio-icone">◇</div>
      <h3>Sem Propostas</h3>
      <p>Ainda não submeteu nenhuma proposta de projeto.</p>
      <router-link to="/nova-proposta" class="btn btn-primario margem-topo">
        Criar Primeira Proposta
      </router-link>
    </div>

    <div v-else class="lista-propostas">
      <div v-for="proposta in propostas" :key="proposta.id" class="cartao cartao-proposta">
        <div class="cartao-cabecalho">
          <div>
            <h3 class="cartao-titulo">{{ proposta.titulo }}</h3>
            <p class="cartao-subtitulo">
              Criada em {{ formatarData(proposta.data_criacao) }}
            </p>
          </div>
          <span :class="['etiqueta', obterClasseEstado(proposta.estado)]">
            {{ proposta.estado }}
          </span>
        </div>
        <div class="cartao-conteudo">
          <p>{{ truncarTexto(proposta.descricao_objetivos, 200) }}</p>
        </div>
        <div class="cartao-rodape">
          <div class="grupo-botoes">
            <router-link
              :to="`/propostas/${proposta.id}`"
              class="btn btn-secundario btn-pequeno"
            >
              Ver
            </router-link>
            <router-link
              :to="`/editar-proposta/${proposta.id}`"
              class="btn btn-primario btn-pequeno"
            >
              Editar
            </router-link>
            <router-link
              :to="`/propostas/${proposta.id}/candidaturas`"
              class="btn btn-destaque btn-pequeno"
            >
              Candidaturas
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { propostasAPI } from '../services/api';

export default {
  name: 'MinhasPropostas',
  setup() {
    const propostas = ref([]);
    const carregando = ref(true);
    const erro = ref(null);

    const carregarPropostas = async () => {
      try {
        carregando.value = true;
        erro.value = null;
        const resposta = await propostasAPI.listarMinhas();
        if (resposta.data.sucesso) {
          propostas.value = resposta.data.dados.propostas;
        } else {
          erro.value = resposta.data.mensagem;
        }
      } catch (e) {
        erro.value = 'Erro ao carregar as suas propostas';
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

    const truncarTexto = (texto, limite) => {
      if (!texto) return '';
      if (texto.length <= limite) return texto;
      return texto.substring(0, limite) + '...';
    };

    const obterClasseEstado = (estado) => {
      const classes = {
        'rascunho': 'estado-rascunho',
        'publicada': 'estado-publicada',
        'aprovada': 'estado-aprovada',
        'arquivada': 'estado-arquivada'
      };
      return classes[estado] || 'etiqueta-primaria';
    };

    onMounted(() => {
      carregarPropostas();
    });

    return {
      propostas,
      carregando,
      erro,
      formatarData,
      truncarTexto,
      obterClasseEstado
    };
  }
};
</script>

<style scoped>
.pagina-minhas-propostas {
  max-width: 1000px;
  margin: 0 auto;
}

.cabecalho-pagina.flex-entre {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.lista-propostas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cartao-proposta {
  transition: all var(--transicao-rapida);
}

.cartao-proposta:hover {
  border-color: var(--cor-destaque-primario);
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

/* Botão destaque para candidaturas */
.btn-destaque {
  background: var(--cor-destaque-terciario);
  border-color: var(--cor-destaque-terciario);
  color: #000;
}

.btn-destaque:hover {
  background: transparent;
  color: var(--cor-destaque-terciario);
}

/* Responsividade */
@media (max-width: 768px) {
  .cabecalho-pagina.flex-entre {
    flex-direction: column;
    align-items: stretch;
  }

  .cabecalho-pagina.flex-entre .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
