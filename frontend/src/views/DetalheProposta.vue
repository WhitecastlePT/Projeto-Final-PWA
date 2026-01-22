<template>
  <div class="pagina-detalhe-proposta">
    <div class="cabecalho-pagina">
      <router-link to="/propostas" class="ligacao-voltar">
        &larr; Voltar às Propostas
      </router-link>
      <h1>Detalhe da Proposta</h1>
    </div>

    <div v-if="carregando" class="carregando">
      A carregar proposta...
    </div>

    <div v-else-if="erro" class="alerta alerta-erro">
      {{ erro }}
    </div>

    <div v-else-if="proposta" class="conteudo-proposta">
      <div class="cartao">
        <div class="cartao-cabecalho">
          <div>
            <h2 class="cartao-titulo">{{ proposta.titulo }}</h2>
            <p class="cartao-subtitulo">
              Submetida por {{ proposta.orientador?.nome || 'N/A' }}
            </p>
          </div>
          <span :class="['etiqueta', obterClasseEstado(proposta.estado)]">
            {{ proposta.estado }}
          </span>
        </div>

        <div class="cartao-conteudo">
          <div class="seccao">
            <h3 class="seccao-titulo">Descrição e Objetivos</h3>
            <p class="texto-descricao">{{ proposta.descricao_objetivos }}</p>
          </div>

          <div class="seccao" v-if="proposta.plano_trabalho">
            <h3 class="seccao-titulo">Plano de Trabalho</h3>
            <p class="texto-descricao">{{ proposta.plano_trabalho }}</p>
          </div>

          <div class="grelha grelha-2 margem-topo">
            <div class="info-item">
              <span class="info-label">Orientador</span>
              <span class="info-valor">{{ proposta.orientador?.nome || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email do Orientador</span>
              <span class="info-valor texto-destaque">{{ proposta.orientador?.email || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Data de Criação</span>
              <span class="info-valor">{{ formatarData(proposta.data_criacao) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado</span>
              <span class="info-valor">{{ proposta.estado }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cartao margem-topo" v-if="proposta.coorientadores?.length">
        <h3 class="cartao-titulo">Coorientadores</h3>
        <div class="lista-coorientadores">
          <div v-for="coorientador in proposta.coorientadores" :key="coorientador.id" class="coorientador-item">
            <span class="coorientador-nome">{{ coorientador.nome }}</span>
            <span class="coorientador-email">{{ coorientador.email }}</span>
          </div>
        </div>
      </div>

      <div class="cartao margem-topo" v-if="proposta.palavras_chave?.length">
        <h3 class="cartao-titulo">Palavras-Chave</h3>
        <div class="lista-palavras-chave">
          <span v-for="palavra in proposta.palavras_chave" :key="palavra.id" class="etiqueta etiqueta-secundaria">
            {{ palavra.termo }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { propostasAPI } from '../services/api';

export default {
  name: 'DetalheProposta',
  setup() {
    const route = useRoute();
    const proposta = ref(null);
    const carregando = ref(true);
    const erro = ref(null);

    const carregarProposta = async () => {
      try {
        carregando.value = true;
        erro.value = null;
        const resposta = await propostasAPI.obterPorId(route.params.id);
        if (resposta.data.sucesso) {
          proposta.value = resposta.data.dados.proposta;
        } else {
          erro.value = resposta.data.mensagem;
        }
      } catch (e) {
        erro.value = 'Erro ao carregar proposta';
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
      carregarProposta();
    });

    return {
      proposta,
      carregando,
      erro,
      formatarData,
      obterClasseEstado
    };
  }
};
</script>

<style scoped>
.pagina-detalhe-proposta {
  max-width: 900px;
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

.conteudo-proposta {
  display: flex;
  flex-direction: column;
}

.texto-descricao {
  color: var(--cor-texto-secundario);
  line-height: 1.8;
  white-space: pre-wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  background: var(--cor-fundo-secundario);
  border: 1px solid var(--cor-borda);
}

.info-label {
  color: var(--cor-texto-terciario);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-valor {
  color: var(--cor-texto-principal);
  font-weight: 500;
}

.lista-coorientadores {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.coorientador-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--cor-fundo-secundario);
  border: 1px solid var(--cor-borda);
}

.coorientador-nome {
  color: var(--cor-texto-principal);
  font-weight: 500;
}

.coorientador-email {
  color: var(--cor-destaque-primario);
}

.lista-palavras-chave {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .coorientador-item {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
