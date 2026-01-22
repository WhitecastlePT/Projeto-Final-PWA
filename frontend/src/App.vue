<template>
  <div id="aplicacao">
    <!-- Layout sem menu (páginas de autenticação) -->
    <div v-if="semLayout" class="layout-autenticacao">
      <!-- Barra Superior Simplificada (apenas tema) -->
      <header class="barra-superior barra-superior-simples">
        <h1 class="barra-superior-titulo">Sistema de Gestão de Propostas de Projeto</h1>
        <div class="barra-superior-acoes">
          <!-- Switch de Tema -->
          <div class="seletor-tema">
            <span class="tema-icone">☀</span>
            <label class="switch-tema">
              <input type="checkbox" :checked="temaEscuro" @change="alternarTema">
              <span class="switch-slider"></span>
            </label>
            <span class="tema-icone">☾</span>
          </div>
        </div>
      </header>
      <!-- Conteúdo centrado -->
      <div class="contentor-autenticacao">
        <router-view />
      </div>
    </div>

    <!-- Layout Principal: Barra Superior + Menu 15% + Conteúdo 85% -->
    <div v-else class="estrutura-principal">
      <!-- Barra Superior 100% -->
      <header class="barra-superior">
        <h1 class="barra-superior-titulo">Sistema de Gestão de Propostas de Projeto</h1>
        <div class="barra-superior-acoes">
          <!-- Indicador de utilizador -->
          <div v-if="estaAutenticado && utilizadorAtual" class="utilizador-info">
            <span class="utilizador-tipo" :class="'tipo-' + tipoUtilizador">{{ nomeTipo }}</span>
            <span class="utilizador-nome">{{ utilizadorAtual.nome }}</span>
          </div>

          <!-- Switch de Tema -->
          <div class="seletor-tema">
            <span class="tema-icone">☀</span>
            <label class="switch-tema">
              <input type="checkbox" :checked="temaEscuro" @change="alternarTema">
              <span class="switch-slider"></span>
            </label>
            <span class="tema-icone">☾</span>
          </div>

          <template v-if="estaAutenticado">
            <button @click="terminarSessao" class="botao-sair" :class="{ 'botao-sair-alerta': emAlerta }">
              <span class="botao-sair-icone">⏏</span>
              <span class="botao-sair-texto">Terminar Sessão</span>
              <span v-if="mostrarCountdown" class="botao-sair-tempo" :class="{ 'tempo-alerta': emAlerta }">{{ formatarTempo(tempoRestante) }}</span>
            </button>
          </template>
          <template v-else>
            <router-link to="/" class="botao-entrar">Entrar</router-link>
          </template>
        </div>
      </header>

      <!-- Corpo: Menu 15% | Conteúdo 85% -->
      <div class="estrutura-corpo">
        <!-- Menu Lateral 15% -->
        <aside class="menu-lateral">
          <nav class="menu-navegacao">
            <!-- Menu para Administrador -->
            <template v-if="tipoUtilizador === 'administrador'">
              <router-link to="/admin/utilizadores" class="menu-item">
                <span class="menu-item-icone">◉</span>
                <span class="menu-item-texto">Utilizadores</span>
                <span class="menu-item-dica">Gerir utilizadores do sistema</span>
              </router-link>

              <div class="menu-divisor"></div>

              <router-link to="/perfil" class="menu-item">
                <span class="menu-item-icone">◇</span>
                <span class="menu-item-texto">Perfil</span>
                <span class="menu-item-dica">Editar o seu perfil</span>
              </router-link>
            </template>

            <!-- Menu para Docente -->
            <template v-else-if="tipoUtilizador === 'docente'">
              <router-link to="/minhas-ucs" class="menu-item">
                <span class="menu-item-icone">◈</span>
                <span class="menu-item-texto">Minhas UC's</span>
                <span class="menu-item-dica">Gerir unidades curriculares</span>
              </router-link>

              <router-link to="/minhas-propostas" class="menu-item">
                <span class="menu-item-icone">◇</span>
                <span class="menu-item-texto">Gestão de propostas</span>
                <span class="menu-item-dica">Gerir as suas propostas</span>
              </router-link>

              <router-link to="/nova-proposta" class="menu-item">
                <span class="menu-item-icone">+</span>
                <span class="menu-item-texto">Nova Proposta</span>
                <span class="menu-item-dica">Criar nova proposta</span>
              </router-link>

              <div class="menu-divisor"></div>

              <router-link to="/docentes" class="menu-item">
                <span class="menu-item-icone">◎</span>
                <span class="menu-item-texto">Docentes</span>
                <span class="menu-item-dica">Lista de docentes registados</span>
              </router-link>

              <div class="menu-divisor"></div>

              <router-link to="/perfil" class="menu-item">
                <span class="menu-item-icone">◉</span>
                <span class="menu-item-texto">Perfil</span>
                <span class="menu-item-dica">Editar o seu perfil</span>
              </router-link>
            </template>

            <!-- Menu para Aluno -->
            <template v-else-if="tipoUtilizador === 'aluno'">
              <router-link to="/ucs-disponiveis" class="menu-item">
                <span class="menu-item-icone">◈</span>
                <span class="menu-item-texto">UC's Disponíveis</span>
                <span class="menu-item-dica">Ver unidades curriculares</span>
              </router-link>

              <router-link to="/minhas-propostas-aluno" class="menu-item">
                <span class="menu-item-icone">◆</span>
                <span class="menu-item-texto">Minhas Propostas</span>
                <span class="menu-item-dica">Propostas atribuídas</span>
              </router-link>

              <router-link to="/minhas-candidaturas" class="menu-item">
                <span class="menu-item-icone">◇</span>
                <span class="menu-item-texto">Candidaturas</span>
                <span class="menu-item-dica">As suas candidaturas</span>
              </router-link>

              <div class="menu-divisor"></div>

              <router-link to="/perfil" class="menu-item">
                <span class="menu-item-icone">◉</span>
                <span class="menu-item-texto">Perfil</span>
                <span class="menu-item-dica">Editar o seu perfil</span>
              </router-link>
            </template>

            <!-- Menu padrão (não autenticado ou tipo desconhecido) -->
            <template v-else>
             <!-- <router-link to="/propostas" class="menu-item">
                <span class="menu-item-icone">◈</span>
                <span class="menu-item-texto">Propostas</span>
                <span class="menu-item-dica">Consultar propostas disponíveis</span>
              </router-link> -->

              <router-link to="/docentes" class="menu-item">
                <span class="menu-item-icone">◎</span>
                <span class="menu-item-texto">Docentes</span>
                <span class="menu-item-dica">Lista de docentes registados</span>
              </router-link>
            </template>
          </nav>
        </aside>

        <!-- Conteúdo 85% -->
        <main class="area-conteudo">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAutenticacaoStore } from './store/autenticacao';
import { useSessao } from './composables/useSessao';

export default {
  name: 'App',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const autenticacaoStore = useAutenticacaoStore();

    // Gestão de sessão com timeout por inatividade
    const {
      iniciarMonitorizacao,
      pararMonitorizacao,
      tempoRestante,
      mostrarCountdown,
      emAlerta,
      formatarTempo
    } = useSessao(autenticacaoStore);

    const estaAutenticado = computed(() => autenticacaoStore.estaAutenticado);
    const utilizadorAtual = computed(() => autenticacaoStore.utilizadorAtual);
    const tipoUtilizador = computed(() => autenticacaoStore.tipoUtilizador);

    // Nome legível do tipo de utilizador
    const nomeTipo = computed(() => {
      const tipos = {
        administrador: 'Admin',
        docente: 'Docente',
        aluno: 'Aluno'
      };
      return tipos[tipoUtilizador.value] || '';
    });

    // Páginas sem layout (usam layout centrado)
    const semLayout = computed(() => {
      return route.meta?.semLayout || false;
    });

    const terminarSessao = () => {
      pararMonitorizacao();
      autenticacaoStore.terminarSessao();
      router.push('/');
    };

    // Gestão do tema (escuro/claro)
    const temaEscuro = ref(true);

    const aplicarTema = (escuro) => {
      if (escuro) {
        document.documentElement.removeAttribute('data-tema');
      } else {
        document.documentElement.setAttribute('data-tema', 'claro');
      }
    };

    const alternarTema = () => {
      temaEscuro.value = !temaEscuro.value;
      aplicarTema(temaEscuro.value);
      localStorage.setItem('tema', temaEscuro.value ? 'escuro' : 'claro');
    };

    // Carregar preferência de tema ao iniciar
    onMounted(async () => {
      const temaGuardado = localStorage.getItem('tema');
      if (temaGuardado) {
        temaEscuro.value = temaGuardado === 'escuro';
      } else {
        // Verificar preferência do sistema
        const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
        temaEscuro.value = prefereEscuro;
      }
      aplicarTema(temaEscuro.value);

      // Verificar token e carregar perfil se autenticado
      if (estaAutenticado.value && !utilizadorAtual.value) {
        const tokenValido = await autenticacaoStore.verificarToken();
        if (tokenValido) {
          iniciarMonitorizacao();
        }
      } else if (estaAutenticado.value) {
        iniciarMonitorizacao();
      }
    });

    // Observar mudanças no estado de autenticação
    watch(estaAutenticado, (novoValor) => {
      if (novoValor) {
        iniciarMonitorizacao();
      } else {
        pararMonitorizacao();
      }
    });

    // Limpar ao desmontar
    onUnmounted(() => {
      pararMonitorizacao();
    });

    return {
      estaAutenticado,
      utilizadorAtual,
      tipoUtilizador,
      nomeTipo,
      semLayout,
      terminarSessao,
      temaEscuro,
      alternarTema,
      tempoRestante,
      mostrarCountdown,
      emAlerta,
      formatarTempo
    };
  }
};
</script>

<style scoped>
/* ==========================================
   BASE
   ========================================== */
#aplicacao {
  width: 100%;
  min-height: 100vh;
  background: var(--cor-fundo-principal);
}

/* Layout de autenticação com barra superior */
.layout-autenticacao {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--cor-fundo-principal);
}

.barra-superior-simples {
  flex-shrink: 0;
}

/* Conteúdo centrado para Login/Registo */
.contentor-autenticacao {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cor-fundo-principal);
  margin-top: 60px;
}

/* Layout Principal */
.estrutura-principal {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ==========================================
   BARRA SUPERIOR - 100%
   ========================================== */
.barra-superior {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: var(--cor-fundo-cabecalho);
  border-bottom: 1px solid var(--cor-borda);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  flex-shrink: 0;
  z-index: 1000;
}

.barra-superior-titulo {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-destaque-primario);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.barra-superior-acoes {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Informação do utilizador */
.utilizador-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--cor-fundo-input);
  border: 1px solid var(--cor-borda);
}

.utilizador-tipo {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.15rem 0.4rem;
}

.utilizador-tipo.tipo-administrador {
  background: var(--cor-destaque-secundario);
  color: #000;
}

.utilizador-tipo.tipo-docente {
  background: var(--cor-destaque-primario);
  color: #000;
}

.utilizador-tipo.tipo-aluno {
  background: var(--cor-destaque-terciario);
  color: #000;
}

.utilizador-nome {
  font-size: 0.85rem;
  color: var(--cor-texto-principal);
}

.botao-sair {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--cor-erro);
  color: var(--cor-erro);
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.botao-sair:hover {
  background: var(--cor-erro);
  color: #fff;
}

.botao-sair-tempo {
  font-family: monospace;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.15rem 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  min-width: 45px;
  text-align: center;
}

.botao-sair-tempo.tempo-alerta {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.botao-sair-alerta {
  background: var(--cor-erro);
  color: #fff;
  animation: pulsar 1s ease-in-out infinite;
}

@keyframes pulsar {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.botao-sair-icone {
  font-size: 1rem;
}

.botao-entrar {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background: var(--cor-destaque-primario);
  border: 1px solid var(--cor-destaque-primario);
  color: var(--cor-fundo-principal);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.botao-entrar:hover {
  background: transparent;
  color: var(--cor-destaque-primario);
}

/* ==========================================
   SELETOR DE TEMA
   ========================================== */
.seletor-tema {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--cor-fundo-input);
  border: 1px solid var(--cor-borda);
}

.tema-icone {
  font-size: 1rem;
  color: var(--cor-texto-secundario);
  transition: color 0.2s;
}

.seletor-tema:hover .tema-icone {
  color: var(--cor-destaque-primario);
}

.switch-tema {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
  cursor: pointer;
}

.switch-tema input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--cor-fundo-hover);
  border: 1px solid var(--cor-borda);
  transition: all 0.3s;
}

.switch-slider::before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: var(--cor-destaque-primario);
  transition: all 0.3s;
}

.switch-tema input:checked + .switch-slider {
  background: var(--cor-destaque-primario);
  border-color: var(--cor-destaque-primario);
}

.switch-tema input:checked + .switch-slider::before {
  transform: translateX(22px);
  background: var(--cor-fundo-principal);
}

.switch-tema:hover .switch-slider {
  border-color: var(--cor-destaque-primario);
}

/* ==========================================
   CORPO - 15% | 85%
   ========================================== */
.estrutura-corpo {
  display: flex;
  flex: 1;
  width: 100%;
  min-height: calc(100vh - 60px);
  margin-top: 60px;
}

/* ==========================================
   MENU LATERAL - 15%
   ========================================== */
.menu-lateral {
  width: 15%;
  background: var(--cor-fundo-secundario);
  border-right: 1px solid var(--cor-borda);
  display: flex;
  flex-direction: column;
}

.menu-navegacao {
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.menu-divisor {
  height: 1px;
  background: var(--cor-borda);
  margin: 0.5rem 1rem;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  margin: 0.25rem 0.5rem;
  color: var(--cor-texto-secundario);
  text-decoration: none;
  border: 1px solid transparent;
  background: var(--cor-fundo-cartao);
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(0, 212, 255, 0.08);
  color: var(--cor-texto-principal);
  border-color: var(--cor-destaque-primario);
}

.menu-item.router-link-active {
  background: rgba(0, 212, 255, 0.12);
  color: var(--cor-destaque-primario);
  border-color: var(--cor-destaque-primario);
}

.menu-item-icone {
  width: 20px;
  text-align: center;
  color: var(--cor-destaque-primario);
  font-size: 1rem;
}

.menu-item-texto {
  flex: 1;
  font-size: 0.9rem;
}

/* Tooltip */
.menu-item-dica {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--cor-fundo-cabecalho);
  border: 1px solid var(--cor-destaque-primario);
  color: var(--cor-texto-principal);
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  z-index: 100;
}

.menu-item-dica::before {
  content: "";
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: var(--cor-destaque-primario);
}

.menu-item:hover .menu-item-dica {
  opacity: 1;
  visibility: visible;
}

/* ==========================================
   ÁREA DE CONTEÚDO - 85%
   ========================================== */
.area-conteudo {
  width: 85%;
  padding: 2rem;
  background: var(--cor-fundo-principal);
  overflow-y: auto;
}

/* ==========================================
   RESPONSIVIDADE - TABLET
   ========================================== */
@media (max-width: 1024px) {
  .barra-superior-titulo {
    font-size: 0.95rem;
  }

  .utilizador-info {
    display: none;
  }

  .menu-lateral {
    width: 70px;
  }

  .menu-item {
    justify-content: center;
    padding: 0.75rem;
    margin: 0.25rem;
  }

  .menu-item-texto {
    display: none;
  }

  .menu-item-icone {
    width: auto;
    font-size: 1.2rem;
  }

  .menu-divisor {
    margin: 0.5rem 0.25rem;
  }

  .area-conteudo {
    width: calc(100% - 70px);
  }
}

/* ==========================================
   RESPONSIVIDADE - MOBILE
   ========================================== */
@media (max-width: 768px) {
  .barra-superior {
    height: 50px;
    padding: 0 1rem;
  }

  .barra-superior-titulo {
    font-size: 0.7rem;
  }

  .botao-sair-texto {
    display: none;
  }

  .botao-sair {
    padding: 0.4rem 0.6rem;
  }

  .botao-entrar {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .seletor-tema {
    padding: 0.2rem 0.5rem;
    gap: 0.3rem;
  }

  .tema-icone {
    font-size: 0.85rem;
  }

  .switch-tema {
    width: 36px;
    height: 18px;
  }

  .switch-slider::before {
    height: 12px;
    width: 12px;
  }

  .switch-tema input:checked + .switch-slider::before {
    transform: translateX(18px);
  }

  .estrutura-corpo {
    flex-direction: column;
    min-height: calc(100vh - 50px);
    margin-top: 50px;
  }

  .contentor-autenticacao {
    margin-top: 50px;
  }

  .menu-lateral {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--cor-borda);
  }

  .menu-navegacao {
    flex-direction: row;
    overflow-x: auto;
    padding: 0;
  }

  .menu-divisor {
    display: none;
  }

  .menu-item {
    flex-direction: column;
    padding: 0.5rem 0.75rem;
    margin: 0 0.25rem;
    border: 1px solid transparent;
    gap: 0.25rem;
  }

  .menu-item:hover,
  .menu-item.router-link-active {
    border-color: var(--cor-destaque-primario);
  }

  .menu-item-texto {
    display: block;
    font-size: 0.65rem;
  }

  .menu-item-icone {
    font-size: 1rem;
  }

  .menu-item-dica {
    display: none;
  }

  .area-conteudo {
    width: 100%;
    padding: 1rem;
  }
}
</style>
