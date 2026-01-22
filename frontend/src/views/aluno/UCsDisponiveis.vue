<template>
  <div class="ucs-disponiveis">
    <div class="pagina-cabecalho">
      <h1 class="pagina-titulo">Unidades Curriculares</h1>
      <p class="pagina-subtitulo">Consulte as UC's com propostas disponíveis</p>
    </div>

    <!-- Mensagem de erro -->
    <div v-if="mensagemErro" class="alerta alerta-erro">
      {{ mensagemErro }}
    </div>

    <!-- Carregando -->
    <div v-if="carregando" class="carregando-container">
      <div class="indicador-carregamento"></div>
      <span>A carregar unidades curriculares...</span>
    </div>

    <!-- Lista de UCs -->
    <div v-else-if="ucs.length > 0" class="ucs-grid">
      <router-link
        v-for="uc in ucs"
        :key="uc.id"
        :to="'/ucs/' + uc.id + '/propostas'"
        class="uc-cartao"
      >
        <div class="uc-cabecalho">
          <span class="uc-codigo">{{ uc.codigo }}</span>
          <span class="uc-propostas">{{ uc.total_propostas }} proposta(s)</span>
        </div>
        <h3 class="uc-nome">{{ uc.nome }}</h3>
        <p v-if="uc.descricao" class="uc-descricao">{{ truncarTexto(uc.descricao, 100) }}</p>
        <div class="uc-rodape">
          <span class="uc-docente">{{ uc.docente_nome }}</span>
          <span v-if="uc.ano_letivo" class="uc-ano">{{ uc.ano_letivo }}</span>
        </div>
      </router-link>
    </div>

    <!-- Vazio -->
    <div v-else class="estado-vazio">
      <span class="estado-vazio-icone">◈</span>
      <h3>Sem UC's Disponíveis</h3>
      <p>De momento não existem unidades curriculares com propostas publicadas.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { ucsAPI } from '../../services/api';

export default {
  name: 'UCsDisponiveis',
  setup() {
    const ucs = ref([]);
    const carregando = ref(true);
    const mensagemErro = ref('');

    const carregarUCs = async () => {
      carregando.value = true;
      mensagemErro.value = '';

      try {
        const resposta = await ucsAPI.listar();
        if (resposta.data.sucesso) {
          // Filtrar apenas UCs com propostas
          ucs.value = resposta.data.dados.ucs.filter(uc => uc.total_propostas > 0 || true);
        }
      } catch (erro) {
        mensagemErro.value = erro.response?.data?.mensagem || 'Erro ao carregar UCs';
      } finally {
        carregando.value = false;
      }
    };

    const truncarTexto = (texto, max) => {
      if (!texto) return '';
      if (texto.length <= max) return texto;
      return texto.substring(0, max) + '...';
    };

    onMounted(() => {
      carregarUCs();
    });

    return {
      ucs,
      carregando,
      mensagemErro,
      truncarTexto
    };
  }
};
</script>

<style scoped>
.ucs-disponiveis {
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

/* Grid de UCs */
.ucs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.uc-cartao {
  display: flex;
  flex-direction: column;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  padding: 1.5rem;
  text-decoration: none;
  transition: all 0.2s;
}

.uc-cartao:hover {
  border-color: var(--cor-destaque-primario);
  transform: translateY(-2px);
  /* box-shadow: var(--sombra-destaque); */
}

.uc-cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.uc-codigo {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.2rem 0.5rem;
  background: var(--cor-destaque-primario);
  color: #000;
}

.uc-propostas {
  font-size: 0.8rem;
  color: var(--cor-destaque-terciario);
  font-weight: 500;
}

.uc-nome {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-texto-principal);
  margin: 0 0 0.75rem 0;
}

.uc-descricao {
  color: var(--cor-texto-secundario);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  flex: 1;
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

.uc-docente {
  color: var(--cor-texto-secundario);
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

/* Alerta */
.alerta-erro {
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid var(--cor-erro);
  color: var(--cor-erro);
}

/* Responsividade */
@media (max-width: 768px) {
  .ucs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
