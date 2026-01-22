<template>
  <div class="escolha-perfil">
    <div class="escolha-perfil-container">
      <!-- Cabeçalho -->
      <div class="escolha-perfil-header">
        <h1 class="escolha-perfil-titulo">Sistema de Gestão de Propostas de Projeto</h1>
        <p class="escolha-perfil-subtitulo">Selecione o seu tipo de utilizador para continuar</p>
      </div>

      <!-- Opções de Perfil -->
      <div class="escolha-perfil-opcoes">
        <button
          class="escolha-perfil-botao escolha-perfil-aluno"
          @click="selecionarPerfil('aluno')"
        >
          <span class="escolha-perfil-icone">◈</span>
          <span class="escolha-perfil-nome">Aluno</span>
          <span class="escolha-perfil-descricao">Consultar propostas e submeter candidaturas</span>
        </button>

        <button
          class="escolha-perfil-botao escolha-perfil-docente"
          @click="selecionarPerfil('docente')"
        >
          <span class="escolha-perfil-icone">◎</span>
          <span class="escolha-perfil-nome">Docente</span>
          <span class="escolha-perfil-descricao">Gerir unidades curriculares e propostas</span>
        </button>

        <button
          class="escolha-perfil-botao escolha-perfil-admin"
          @click="selecionarPerfil('administrador')"
        >
          <span class="escolha-perfil-icone">◉</span>
          <span class="escolha-perfil-nome">Administrador</span>
          <span class="escolha-perfil-descricao">Gerir utilizadores do sistema</span>
        </button>
      </div>

      <!-- Separador -->
      <div class="escolha-perfil-separador">
        <span>ou</span>
      </div>

      <!-- Acesso Anónimo -->
      <div class="escolha-perfil-anonimo">
        <button
          class="escolha-perfil-botao escolha-perfil-botao-anonimo"
          @click="entrarComoAnonimo"
        >
          <span class="escolha-perfil-icone">◇</span>
          <span class="escolha-perfil-nome">Entrar como Anónimo</span>
          <span class="escolha-perfil-descricao">Ver lista de docentes registados</span>
        </button>
      </div>

      <!-- Rodapé -->
      <div class="escolha-perfil-footer">
        <p class="escolha-perfil-info">
          Selecione o seu perfil e faça o registo/login, ou entre como anónimo.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'EscolhaPerfil',
  setup() {
    const router = useRouter();

    const selecionarPerfil = (tipo) => {
      router.push({ name: 'Login', params: { tipo } });
    };

    const entrarComoAnonimo = () => {
      router.push({ name: 'ListaDocentes' });
    };

    return {
      selecionarPerfil,
      entrarComoAnonimo
    };
  }
};
</script>

<style scoped>
.escolha-perfil {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-fundo-principal);
  padding: 2rem;
}

.escolha-perfil-container {
  width: 100%;
  max-width: 900px;
  text-align: center;
}

.escolha-perfil-header {
  margin-bottom: 3rem;
}

.escolha-perfil-titulo {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--cor-destaque-primario);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1rem;
}

.escolha-perfil-subtitulo {
  font-size: 1.1rem;
  color: var(--cor-texto-secundario);
  margin: 0;
}

.escolha-perfil-opcoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.escolha-perfil-botao {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2.5rem 2rem;
  background: var(--cor-fundo-cartao);
  border: 2px solid var(--cor-borda);
  color: var(--cor-texto-principal);
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.escolha-perfil-botao:hover {
  border-color: var(--cor-destaque-primario);
  /* box-shadow: var(--sombra-destaque); */
  transform: translateY(-4px);
}

.escolha-perfil-botao:active {
  transform: translateY(-2px);
}

.escolha-perfil-icone {
  font-size: 3rem;
  color: var(--cor-destaque-primario);
}

.escolha-perfil-nome {
  font-size: 1.4rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.escolha-perfil-descricao {
  font-size: 0.9rem;
  color: var(--cor-texto-secundario);
  line-height: 1.4;
}

/* Cores específicas por tipo */
.escolha-perfil-aluno:hover {
  border-color: var(--cor-destaque-terciario);
}

.escolha-perfil-aluno:hover .escolha-perfil-icone {
  color: var(--cor-destaque-terciario);
}

.escolha-perfil-docente:hover {
  border-color: var(--cor-destaque-primario);
}

.escolha-perfil-docente:hover .escolha-perfil-icone {
  color: var(--cor-destaque-primario);
}

.escolha-perfil-admin:hover {
  border-color: var(--cor-destaque-secundario);
}

.escolha-perfil-admin:hover .escolha-perfil-icone {
  color: var(--cor-destaque-secundario);
}

/* Separador */
.escolha-perfil-separador {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.escolha-perfil-separador::before,
.escolha-perfil-separador::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--cor-borda);
}

.escolha-perfil-separador span {
  padding: 0 1.5rem;
  color: var(--cor-texto-terciario);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Acesso Anónimo */
.escolha-perfil-anonimo {
  max-width: 350px;
  margin: 0 auto 2rem;
}

.escolha-perfil-botao-anonimo {
  width: 100%;
  background: transparent;
  border-style: dashed;
}

.escolha-perfil-botao-anonimo:hover {
  border-color: var(--cor-texto-secundario);
  border-style: solid;
}

.escolha-perfil-botao-anonimo:hover .escolha-perfil-icone {
  color: var(--cor-texto-secundario);
}

.escolha-perfil-footer {
  padding-top: 1rem;
}

.escolha-perfil-info {
  font-size: 0.9rem;
  color: var(--cor-texto-terciario);
  margin: 0;
}

/* Responsividade */
@media (max-width: 768px) {
  .escolha-perfil {
    padding: 1rem;
  }

  .escolha-perfil-titulo {
    font-size: 1.3rem;
    letter-spacing: 1px;
  }

  .escolha-perfil-subtitulo {
    font-size: 1rem;
  }

  .escolha-perfil-opcoes {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .escolha-perfil-botao {
    padding: 1.5rem;
  }

  .escolha-perfil-icone {
    font-size: 2.5rem;
  }

  .escolha-perfil-nome {
    font-size: 1.2rem;
  }
}
</style>
