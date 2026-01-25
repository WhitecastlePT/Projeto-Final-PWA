import { createRouter, createWebHistory } from 'vue-router';
import { useAutenticacaoStore } from '../store/autenticacao';

// Importar views
import EscolhaPerfil from '../views/EscolhaPerfil.vue';
import Login from '../views/Login.vue';
import Registo from '../views/Registo.vue';
import AuthCallback from '../views/AuthCallback.vue';
import ListaPropostas from '../views/ListaPropostas.vue';
import ListaDocentes from '../views/ListaDocentes.vue';
import MinhasPropostas from '../views/MinhasPropostas.vue';
import DetalheProposta from '../views/DetalheProposta.vue';
import NovaProposta from '../views/NovaProposta.vue';
import EditarProposta from '../views/EditarProposta.vue';
import Perfil from '../views/Perfil.vue';

// Views Admin (lazy loading)
const GestaoUtilizadores = () => import('../views/admin/GestaoUtilizadores.vue');

// Views Aluno (lazy loading)
const UCsDisponiveis = () => import('../views/aluno/UCsDisponiveis.vue');
const PropostasUC = () => import('../views/aluno/PropostasUC.vue');
const MinhasCandidaturas = () => import('../views/aluno/MinhasCandidaturas.vue');
const MinhasPropostasAluno = () => import('../views/aluno/MinhasPropostasAluno.vue');

// Views Docente (lazy loading)
const UnidadesCurriculares = () => import('../views/docente/UnidadesCurriculares.vue');
const CandidaturasProposta = () => import('../views/docente/CandidaturasProposta.vue');

// Página de erro 404
const NaoEncontrado = () => import('../views/NaoEncontrado.vue');

const rotas = [
  // Página inicial - Escolha de perfil
  {
    path: '/',
    name: 'EscolhaPerfil',
    component: EscolhaPerfil,
    meta: { semLayout: true, apenasConvidados: true }
  },

  // Autenticação (sem layout)
  {
    path: '/login/:tipo',
    name: 'Login',
    component: Login,
    meta: { semLayout: true, apenasConvidados: true }
  },
  {
    path: '/registo/:tipo',
    name: 'Registo',
    component: Registo,
    meta: { semLayout: true, apenasConvidados: true }
  },

  // Callback OAuth (Google)
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { semLayout: true }
  },

  // Rotas de Admin
  {
    path: '/admin/utilizadores',
    name: 'GestaoUtilizadores',
    component: GestaoUtilizadores,
    meta: { requerAutenticacao: true, tipos: ['administrador'] }
  },

  // Rotas de Docente
  {
    path: '/minhas-ucs',
    name: 'UnidadesCurriculares',
    component: UnidadesCurriculares,
    meta: { requerAutenticacao: true, tipos: ['docente'] }
  },
  {
    path: '/minhas-propostas',
    name: 'MinhasPropostas',
    component: MinhasPropostas,
    meta: { requerAutenticacao: true, tipos: ['docente'] }
  },
  {
    path: '/nova-proposta',
    name: 'NovaProposta',
    component: NovaProposta,
    meta: { requerAutenticacao: true, tipos: ['docente'] }
  },
  {
    path: '/editar-proposta/:id',
    name: 'EditarProposta',
    component: EditarProposta,
    meta: { requerAutenticacao: true, tipos: ['docente'] }
  },
  {
    path: '/propostas/:id/candidaturas',
    name: 'CandidaturasProposta',
    component: CandidaturasProposta,
    meta: { requerAutenticacao: true, tipos: ['docente'] }
  },

  // Rotas de Aluno
  {
    path: '/ucs-disponiveis',
    name: 'UCsDisponiveis',
    component: UCsDisponiveis,
    meta: { requerAutenticacao: true, tipos: ['aluno'] }
  },
  {
    path: '/ucs/:id/propostas',
    name: 'PropostasUC',
    component: PropostasUC,
    meta: { requerAutenticacao: true, tipos: ['aluno'] }
  },
  {
    path: '/minhas-candidaturas',
    name: 'MinhasCandidaturas',
    component: MinhasCandidaturas,
    meta: { requerAutenticacao: true, tipos: ['aluno'] }
  },
  {
    path: '/minhas-propostas-aluno',
    name: 'MinhasPropostasAluno',
    component: MinhasPropostasAluno,
    meta: { requerAutenticacao: true, tipos: ['aluno'] }
  },

  // Rotas públicas / comuns
  {
    path: '/propostas',
    name: 'ListaPropostas',
    component: ListaPropostas,
    meta: { requerAutenticacao: false }
  },
  {
    path: '/propostas/:id',
    name: 'DetalheProposta',
    component: DetalheProposta,
    meta: { requerAutenticacao: false }
  },
  {
    path: '/docentes',
    name: 'ListaDocentes',
    component: ListaDocentes,
    meta: { requerAutenticacao: false, acessoAnonimo: true }
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: Perfil,
    meta: { requerAutenticacao: true }
  },

  // Redirecionar rotas antigas
  {
    path: '/login',
    redirect: '/'
  },
  {
    path: '/registo',
    redirect: '/'
  },

  // Rota 404 - Página não encontrada (deve ser a última)
  {
    path: '/:pathMatch(.*)*',
    name: 'NaoEncontrado',
    component: NaoEncontrado,
    meta: { semLayout: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes: rotas
});

// Tipos de utilizador válidos
const tiposValidos = ['administrador', 'docente', 'aluno'];

// Guard de navegação para verificar autenticação e tipo
router.beforeEach(async (para, de, next) => {
  const autenticacaoStore = useAutenticacaoStore();
  const estaAutenticado = autenticacaoStore.estaAutenticado;
  const tipoUtilizador = autenticacaoStore.tipoUtilizador;

  // Validar parâmetro :tipo nas rotas de login e registo
  if ((para.name === 'Login' || para.name === 'Registo') && para.params.tipo) {
    if (!tiposValidos.includes(para.params.tipo)) {
      next({ name: 'NaoEncontrado' });
      return;
    }
  }

  // Se está autenticado mas não tem dados do utilizador, carregar perfil
  if (estaAutenticado && !autenticacaoStore.utilizadorAtual) {
    await autenticacaoStore.verificarToken();
  }

  // Se a rota requer autenticação e o utilizador não está autenticado
  if (para.meta.requerAutenticacao && !estaAutenticado) {
    next('/');
    return;
  }

  // Se a rota é apenas para convidados e o utilizador está autenticado
  if (para.meta.apenasConvidados && estaAutenticado) {
    // Redirecionar para a página inicial do tipo de utilizador
    const tipo = autenticacaoStore.tipoUtilizador;
    if (tipo === 'administrador') {
      next('/admin/utilizadores');
    } else if (tipo === 'docente') {
      next('/minhas-propostas');
    } else if (tipo === 'aluno') {
      next('/ucs-disponiveis');
    } else {
      next('/perfil');
    }
    return;
  }

  // Se a rota requer um tipo específico de utilizador
  if (para.meta.tipos && para.meta.tipos.length > 0) {
    if (!para.meta.tipos.includes(tipoUtilizador)) {
      // Redirecionar para a página inicial do tipo de utilizador
      if (tipoUtilizador === 'administrador') {
        next('/admin/utilizadores');
      } else if (tipoUtilizador === 'docente') {
        next('/minhas-propostas');
      } else if (tipoUtilizador === 'aluno') {
        next('/ucs-disponiveis');
      } else {
        next('/');
      }
      return;
    }
  }

  next();
});

export default router;
