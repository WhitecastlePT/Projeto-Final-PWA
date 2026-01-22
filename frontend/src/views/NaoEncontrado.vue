<template>
  <div class="pagina-erro">
    <div class="erro-conteudo">
      <span class="erro-codigo">404</span>
      <h1 class="erro-titulo">Página Não Encontrada</h1>
      <p class="erro-mensagem">
        A página que procura não existe ou foi movida.
      </p>
      <p class="erro-url">
        <span class="erro-url-label">URL:</span>
        <code>{{ rotaAtual }}</code>
      </p>
      <router-link to="/" class="btn btn-primario">
        Voltar ao Início
      </router-link>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'NaoEncontrado',
  setup() {
    const route = useRoute();
    const rotaAtual = computed(() => route.fullPath);

    return {
      rotaAtual
    };
  }
};
</script>

<style scoped>
.pagina-erro {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.erro-conteudo {
  text-align: center;
  max-width: 500px;
}

.erro-codigo {
  display: block;
  font-size: 8rem;
  font-weight: 700;
  color: var(--cor-destaque-primario);
  line-height: 1;
  margin-bottom: 1rem;
  text-shadow: 0 0 40px rgba(0, 212, 255, 0.3);
}

.erro-titulo {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--cor-texto-principal);
  margin: 0 0 1rem 0;
}

.erro-mensagem {
  font-size: 1rem;
  color: var(--cor-texto-secundario);
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.erro-url {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--cor-fundo-input);
  border: 1px solid var(--cor-borda);
}

.erro-url-label {
  font-size: 0.85rem;
  color: var(--cor-texto-terciario);
}

.erro-url code {
  font-size: 0.9rem;
  color: var(--cor-erro);
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
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

.btn-primario:hover {
  background: transparent;
  color: var(--cor-destaque-primario);
}

/* Responsividade */
@media (max-width: 768px) {
  .erro-codigo {
    font-size: 5rem;
  }

  .erro-titulo {
    font-size: 1.25rem;
  }

  .erro-url {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
