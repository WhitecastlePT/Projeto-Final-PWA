<template>
  <div class="pagina-propostas">
    <div class="cabecalho-pagina">
      <h1>Propostas de Projeto</h1>
      <p>Lista de propostas publicadas disponíveis para consulta</p>
    </div>

    <div v-if="carregando" class="carregando">
      A carregar propostas...
    </div>

    <div v-else-if="mensagemErro" class="alerta alerta-erro">
      {{ mensagemErro }}
    </div>

    <div v-else>
      <div v-if="propostas.length === 0" class="estado-vazio">
        <div class="estado-vazio-icone">◇</div>
        <h3>Sem Propostas</h3>
        <p>Ainda não existem propostas publicadas no sistema.</p>
      </div>

      <div v-else class="grelha grelha-2">
        <div v-for="proposta in propostas" :key="proposta.id" class="cartao cartao-proposta">
          <div class="cartao-cabecalho">
            <h3 class="cartao-titulo">{{ proposta.titulo }}</h3>
            <span class="etiqueta etiqueta-primaria">{{ proposta.estado || 'Publicada' }}</span>
          </div>
          <div class="cartao-conteudo">
            <div class="proposta-orientador">
              <span class="etiqueta-label">Orientador</span>
              <span class="etiqueta-valor">{{ proposta.orientador?.nome || 'N/A' }}</span>
            </div>
            <p class="proposta-descricao">
              {{ truncarTexto(proposta.descricao_objetivos, 150) }}
            </p>
          </div>
          <div class="cartao-rodape">
            <router-link
              :to="`/propostas/${proposta.id}`"
              class="btn btn-primario btn-pequeno"
            >
              Ver Detalhes
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
  name: 'ListaPropostas',
  setup() {
    const propostas = ref([]);
    const carregando = ref(true);
    const mensagemErro = ref('');

    const carregarPropostas = async () => {
      try {
        const resposta = await propostasAPI.listar({ estado: 'publicada' });
        propostas.value = resposta.data.dados.propostas;
      } catch (erro) {
        console.error('Erro ao carregar propostas:', erro);
        mensagemErro.value = 'Erro ao carregar propostas';
      } finally {
        carregando.value = false;
      }
    };

    const truncarTexto = (texto, limite) => {
      if (!texto) return '';
      if (texto.length <= limite) return texto;
      return texto.substring(0, limite) + '...';
    };

    onMounted(() => {
      carregarPropostas();
    });

    return {
      propostas,
      carregando,
      mensagemErro,
      truncarTexto
    };
  }
};
</script>

<style scoped>
.pagina-propostas {
  max-width: 1200px;
  margin: 0 auto;
}

.cartao-proposta {
  display: flex;
  flex-direction: column;
}

.cartao-proposta .cartao-conteudo {
  flex: 1;
}

.proposta-orientador {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--cor-borda);
}

.etiqueta-label {
  color: var(--cor-texto-terciario);
  font-size: 0.8rem;
  text-transform: uppercase;
}

.etiqueta-valor {
  color: var(--cor-destaque-primario);
  font-weight: 500;
}

.proposta-descricao {
  color: var(--cor-texto-secundario);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
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
