<template>
  <div class="pagina-inicio">
    <div class="boas-vindas">
      <h1 class="boas-vindas-titulo">Bem-vindo ao SGP</h1>
      <p class="boas-vindas-subtitulo">
        Sistema de Gestão de Propostas de Projeto
      </p>
    </div>

    <div class="painel-resumo" v-if="estaAutenticado">
      <div class="resumo-item">
        <span class="resumo-valor">{{ estatisticas.totalPropostas }}</span>
        <span class="resumo-label">Total de Propostas</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-valor">{{ estatisticas.publicadas }}</span>
        <span class="resumo-label">Publicadas</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-valor">{{ estatisticas.rascunhos }}</span>
        <span class="resumo-label">Rascunhos</span>
      </div>
      <div class="resumo-item">
        <span class="resumo-valor">{{ estatisticas.docentes }}</span>
        <span class="resumo-label">Docentes</span>
      </div>
    </div>

    <div class="informacao-sistema">
      <h2 class="seccao-titulo">Sobre o Sistema</h2>
      <p class="informacao-texto">
        O Sistema de Gestão de Propostas de Projeto (SGP) é uma plataforma para gestão de propostas académicas.
        Utilize o menu lateral para navegar entre as diferentes secções do sistema.
      </p>

      <div class="funcionalidades-lista">
        <div class="funcionalidade-item">
          <span class="funcionalidade-icone">◈</span>
          <div class="funcionalidade-conteudo">
            <strong>Propostas</strong>
            <span>Consulte todas as propostas de projeto disponíveis</span>
          </div>
        </div>
        <div class="funcionalidade-item">
          <span class="funcionalidade-icone">◎</span>
          <div class="funcionalidade-conteudo">
            <strong>Docentes</strong>
            <span>Veja a lista de docentes registados no sistema</span>
          </div>
        </div>
        <div class="funcionalidade-item" v-if="estaAutenticado">
          <span class="funcionalidade-icone">◇</span>
          <div class="funcionalidade-conteudo">
            <strong>Gestão de propostas</strong>
            <span>Gira as propostas que submeteu ao sistema</span>
          </div>
        </div>
        <div class="funcionalidade-item" v-if="estaAutenticado">
          <span class="funcionalidade-icone">+</span>
          <div class="funcionalidade-conteudo">
            <strong>Nova Proposta</strong>
            <span>Crie e submeta novas propostas de projeto</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAutenticacaoStore } from '../store/autenticacao';

export default {
  name: 'Inicio',
  setup() {
    const autenticacaoStore = useAutenticacaoStore();
    const estaAutenticado = computed(() => autenticacaoStore.estaAutenticado);

    const estatisticas = ref({
      totalPropostas: 0,
      publicadas: 0,
      rascunhos: 0,
      docentes: 0
    });

    onMounted(() => {
      // Carregar estatísticas se necessário
    });

    return {
      estaAutenticado,
      estatisticas
    };
  }
};
</script>

<style scoped>
.pagina-inicio {
  max-width: 900px;
  margin: 0 auto;
}

/* Boas-vindas */
.boas-vindas {
  text-align: center;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--cor-borda);
}

.boas-vindas-titulo {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--cor-destaque-primario);
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.boas-vindas-subtitulo {
  color: var(--cor-texto-secundario);
  font-size: 1.1rem;
  margin: 0;
}

/* Painel de Resumo */
.painel-resumo {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.resumo-item {
  flex: 1;
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  padding: 1.5rem;
  text-align: center;
  transition: all 0.2s ease;
}

.resumo-item:hover {
  border-color: var(--cor-destaque-primario);
}

.resumo-valor {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--cor-destaque-primario);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.resumo-label {
  color: var(--cor-texto-secundario);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Informação do Sistema */
.informacao-sistema {
  background: var(--cor-fundo-cartao);
  border: 1px solid var(--cor-borda);
  padding: 2rem;
}

.seccao-titulo {
  color: var(--cor-destaque-primario);
  font-size: 1.1rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.informacao-texto {
  color: var(--cor-texto-secundario);
  line-height: 1.7;
  margin-bottom: 2rem;
}

/* Lista de Funcionalidades */
.funcionalidades-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.funcionalidade-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--cor-fundo-secundario);
  border: 1px solid var(--cor-borda);
  transition: all 0.2s ease;
}

.funcionalidade-item:hover {
  border-color: var(--cor-destaque-primario);
}

.funcionalidade-icone {
  color: var(--cor-destaque-primario);
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.funcionalidade-conteudo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.funcionalidade-conteudo strong {
  color: var(--cor-texto-principal);
}

.funcionalidade-conteudo span {
  color: var(--cor-texto-secundario);
  font-size: 0.9rem;
}

/* Responsividade */
@media (max-width: 768px) {
  .boas-vindas {
    padding: 2rem 1rem;
  }

  .boas-vindas-titulo {
    font-size: 1.75rem;
  }

  .boas-vindas-subtitulo {
    font-size: 1rem;
  }

  .painel-resumo {
    flex-wrap: wrap;
  }

  .resumo-item {
    flex: 1 1 45%;
    min-width: 120px;
  }

  .resumo-valor {
    font-size: 2rem;
  }

  .informacao-sistema {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .resumo-item {
    flex: 1 1 100%;
  }
}
</style>
