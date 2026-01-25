# Estrutura do Projeto SGP

Este documento descreve a estrutura completa do projeto Sistema de Gestao de Propostas.

## Arvore de Diretorios

```
Projeto-Final-PWA/
│
├── backend/                          # API REST Node.js/Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── baseDados.js          # Configuracao e pool PostgreSQL
│   │   │   └── passport.js           # Configuracao Google OAuth2
│   │   │
│   │   ├── controladores/
│   │   │   ├── alunoControlador.js   # Logica de alunos
│   │   │   ├── anexoControlador.js   # Upload/download de ficheiros
│   │   │   ├── candidaturaControlador.js  # Gestao de candidaturas
│   │   │   ├── docenteControlador.js # Logica de docentes
│   │   │   ├── palavraChaveControlador.js # Gestao de tags
│   │   │   ├── propostaControlador.js     # CRUD de propostas
│   │   │   ├── ucControlador.js      # Gestao de UCs
│   │   │   └── utilizadorControlador.js   # Auth e perfil
│   │   │
│   │   ├── middlewares/
│   │   │   ├── autenticacao.js       # Verificacao JWT e geracao de tokens
│   │   │   ├── erros.js              # Handler global de erros
│   │   │   └── upload.js             # Configuracao Multer
│   │   │
│   │   ├── modelos/
│   │   │   ├── alunoModelo.js        # Queries de alunos
│   │   │   ├── anexoModelo.js        # Queries de anexos
│   │   │   ├── candidaturaModelo.js  # Queries de candidaturas
│   │   │   ├── docenteModelo.js      # Queries de docentes
│   │   │   ├── palavraChaveModelo.js # Queries de palavras-chave
│   │   │   ├── propostaModelo.js     # Queries de propostas
│   │   │   ├── ucModelo.js           # Queries de UCs
│   │   │   └── utilizadorModelo.js   # Queries de utilizadores
│   │   │
│   │   ├── rotas/
│   │   │   ├── adminRotas.js         # Rotas de administracao
│   │   │   ├── alunoRotas.js         # Rotas de alunos
│   │   │   ├── anexoRotas.js         # Rotas de anexos
│   │   │   ├── authRotas.js          # Rotas de autenticacao (inclui Google OAuth)
│   │   │   ├── candidaturaRotas.js   # Rotas de candidaturas
│   │   │   ├── docenteRotas.js       # Rotas de docentes
│   │   │   ├── palavraChaveRotas.js  # Rotas de palavras-chave
│   │   │   ├── propostaRotas.js      # Rotas de propostas
│   │   │   └── ucRotas.js            # Rotas de UCs
│   │   │
│   │   └── index.js                  # Entry point, configuracao Express
│   │
│   ├── uploads/                      # Ficheiros carregados (gitignored)
│   ├── .env                          # Variaveis de ambiente (gitignored)
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                         # Aplicacao Vue.js 3
│   ├── src/
│   │   ├── composables/
│   │   │   └── useSessao.js          # Composable para gestao de sessao
│   │   │
│   │   ├── config/
│   │   │   └── sessao.js             # Configuracoes de sessao
│   │   │
│   │   ├── router/
│   │   │   └── index.js              # Definicao de rotas e guards
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # Cliente Axios e servicos API
│   │   │
│   │   ├── store/
│   │   │   └── autenticacao.js       # Pinia store para auth
│   │   │
│   │   ├── views/
│   │   │   ├── admin/
│   │   │   │   └── GestaoUtilizadores.vue  # Painel de administracao
│   │   │   │
│   │   │   ├── aluno/
│   │   │   │   ├── MinhasCandidaturas.vue  # Lista de candidaturas do aluno
│   │   │   │   ├── MinhasPropostasAluno.vue # Propostas aceites
│   │   │   │   ├── PropostasUC.vue         # Propostas de uma UC
│   │   │   │   └── UCsDisponiveis.vue      # Lista de UCs disponiveis
│   │   │   │
│   │   │   ├── docente/
│   │   │   │   ├── CandidaturasProposta.vue # Gerir candidaturas
│   │   │   │   └── UnidadesCurriculares.vue # Gerir UCs
│   │   │   │
│   │   │   ├── App.vue               # Componente raiz
│   │   │   ├── AuthCallback.vue      # Callback do Google OAuth
│   │   │   ├── DetalheProposta.vue   # Visualizar proposta
│   │   │   ├── EditarProposta.vue    # Editar proposta existente
│   │   │   ├── EscolhaPerfil.vue     # Selecao de tipo de login
│   │   │   ├── Inicio.vue            # Pagina inicial
│   │   │   ├── ListaDocentes.vue     # Lista publica de docentes
│   │   │   ├── ListaPropostas.vue    # Lista de propostas publicadas
│   │   │   ├── Login.vue             # Formulario de login
│   │   │   ├── MinhasPropostas.vue   # Propostas do docente
│   │   │   ├── NaoEncontrado.vue     # Pagina 404
│   │   │   ├── NovaProposta.vue      # Criar nova proposta
│   │   │   ├── Perfil.vue            # Perfil do utilizador
│   │   │   └── Registo.vue           # Formulario de registo
│   │   │
│   │   ├── App.vue                   # Componente raiz com layout
│   │   └── main.js                   # Bootstrap Vue + Router + Pinia
│   │
│   ├── public/                       # Assets estaticos
│   ├── .env                          # Variaveis de ambiente (gitignored)
│   ├── index.html                    # HTML template
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js                # Configuracao Vite
│
├── database/
│   ├── schema.sql                    # Estrutura da base de dados
│   ├── seed.sql                      # Dados de teste
│   └── migration_google_auth.sql     # Migracao para suporte OAuth
│
├── wireframes_mockup_prototipo/      # Mockups e prototipos
│
├── .gitignore
├── CLAUDE.md                         # Instrucoes para Claude Code AI
├── ESTRUTURA.md                      # Este ficheiro
└── README.md                         # Documentacao principal
```


## Arquitetura do Backend

### Padrao MVC Adaptado

```
Request → Rotas → Controladores → Modelos → Base de Dados
                       ↓
                  Middlewares (Auth, Upload, Erros)
```

### Fluxo de uma Request

1. **Rotas** (`/src/rotas/`) - Definem endpoints e mapeiam para controladores
2. **Middlewares** - Interceptam requests para validacao, auth, upload
3. **Controladores** (`/src/controladores/`) - Logica de negocio e validacao
4. **Modelos** (`/src/modelos/`) - Queries SQL parametrizadas

### Ficheiros Principais

#### `src/index.js`
Entry point da aplicacao. Configura:
- Express e middlewares (CORS, JSON, static files)
- Passport para OAuth
- Montagem de todas as rotas
- Handler global de erros

#### `src/config/baseDados.js`
- Pool de conexoes PostgreSQL
- Funcao `executarQuery(sql, params)` para queries seguras
- Suporte a SSL para conexoes cloud

#### `src/config/passport.js`
- Estrategia Google OAuth2
- Logica de criacao/vinculacao de utilizadores
- Suporte a login por tipo (aluno/docente)

#### `src/middlewares/autenticacao.js`
- `verificarAutenticacao` - Valida token JWT
- `verificarAdmin` - Verifica se e administrador
- `gerarToken` - Cria JWT com dados do utilizador


## Arquitetura do Frontend

### Estrutura Vue 3 + Composition API

```
main.js → App.vue → Router → Views → Components
              ↓
           Pinia Store (autenticacao)
              ↓
           API Service (axios)
```

### Ficheiros Principais

#### `src/main.js`
Bootstrap da aplicacao Vue com:
- Router
- Pinia (state management)
- Configuracao inicial

#### `src/router/index.js`
- Definicao de todas as rotas
- Guards de navegacao (auth, admin, aluno, docente)
- Redirecionamentos por tipo de utilizador

#### `src/store/autenticacao.js`
Pinia store que gere:
- Estado de autenticacao
- Token JWT
- Dados do utilizador
- Acoes de login/logout/registo

#### `src/services/api.js`
- Instancia Axios configurada
- Interceptor para adicionar token JWT
- Objetos de servico por entidade (auth, propostas, ucs, etc.)


## Modelo de Dados

### Diagrama ER Simplificado

```
                    ┌─────────────────┐
                    │   utilizador    │
                    │─────────────────│
                    │ id              │
                    │ nome            │
                    │ email           │
                    │ palavra_passe   │
                    │ tipo            │◄──── enum: admin/docente/aluno
                    │ google_id       │
                    │ aprovado        │
                    │ gabinete        │  (docente)
                    │ departamento    │  (docente)
                    │ numero_aluno    │  (aluno)
                    │ curso           │  (aluno)
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────┐   ┌─────────────────┐
│ unidade_curricular│  │  proposta  │   │   candidatura   │
│─────────────────│  │─────────────│   │─────────────────│
│ id              │  │ id          │   │ id              │
│ nome            │  │ titulo      │   │ aluno_id        │
│ codigo          │  │ descricao   │   │ proposta_id     │
│ docente_id  ────┼──│ orientador_id│   │ estado          │
│ ano_letivo      │  │ uc_id   ────┼───│ observacoes     │
│ semestre        │  │ estado      │   │ feedback_docente│
└─────────────────┘  └──────┬──────┘   └─────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
     ┌───────────┐   ┌───────────┐   ┌─────────────┐
     │   anexo   │   │proposta_  │   │proposta_    │
     │───────────│   │coorientador   │palavra_chave│
     │ id        │   │───────────│   │─────────────│
     │ nome      │   │proposta_id│   │ proposta_id │
     │ caminho   │   │coorient_id│   │ palavra_id  │
     │ proposta_id   └───────────┘   └─────────────┘
     └───────────┘
```

### Tipos Enumerados (PostgreSQL)

```sql
tipo_utilizador: 'administrador', 'docente', 'aluno'
estado_proposta: 'rascunho', 'publicada', 'aprovada', 'arquivada'
estado_candidatura: 'pendente', 'aceite', 'rejeitada'
tipo_ficheiro: 'pdf', 'doc', 'docx', 'txt', 'zip'
```


## Fluxos de Autenticacao

### Login Tradicional

```
1. Frontend: POST /api/auth/login (email, password)
2. Backend: Valida credenciais com bcrypt
3. Backend: Gera JWT com dados do utilizador
4. Frontend: Armazena token em localStorage
5. Frontend: Configura Axios com header Authorization
```

### Login Google OAuth2

```
1. Frontend: Redireciona para /api/auth/google?tipo=aluno|docente
2. Backend: Redireciona para Google com state=tipo
3. Google: Utilizador autoriza
4. Google: Redireciona para /api/auth/google/callback?code=...&state=tipo
5. Backend: Troca code por access_token
6. Backend: Obtem perfil do utilizador
7. Backend: Cria/vincula utilizador com tipo correto
8. Backend: Gera JWT
9. Backend: Redireciona para /auth/callback?token=...
10. Frontend: Extrai token e armazena
```


## Variaveis de Ambiente

### Backend (.env)

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| PORT | Porta do servidor | 3000 |
| NODE_ENV | Ambiente | development/production |
| DB_HOST | Host PostgreSQL | localhost |
| DB_PORT | Porta PostgreSQL | 5432 |
| DB_NAME | Nome da base de dados | sgp_db |
| DB_USER | Utilizador PostgreSQL | postgres |
| DB_PASSWORD | Password PostgreSQL | senha |
| DB_SSL | Usar SSL | true/false |
| JWT_SECRET | Chave secreta JWT | string_aleatoria |
| JWT_EXPIRES_IN | Validade do token | 24h |
| UPLOAD_DIR | Pasta de uploads | uploads |
| MAX_FILE_SIZE | Tamanho maximo (bytes) | 5242880 |
| CORS_ORIGIN | URL do frontend | http://localhost:5173 |
| GOOGLE_CLIENT_ID | ID OAuth Google | xxx.apps.googleusercontent.com |
| GOOGLE_CLIENT_SECRET | Secret OAuth Google | GOCSPX-xxx |
| GOOGLE_CALLBACK_URL | URL callback OAuth | http://localhost:3000/api/auth/google/callback |

### Frontend (.env)

| Variavel | Descricao | Exemplo |
|----------|-----------|---------|
| VITE_API_URL | URL base da API | http://localhost:3000/api |


## Scripts Disponiveis

### Backend

```bash
npm run dev      # Inicia com nodemon (hot reload)
npm start        # Inicia em producao
npm run db:schema # Aplica schema.sql
npm run db:seed   # Aplica seed.sql
```

### Frontend

```bash
npm run dev      # Servidor de desenvolvimento Vite
npm run build    # Build de producao
npm run preview  # Preview do build
```


## Seguranca

### Medidas Implementadas

1. **Passwords**: Encriptadas com bcrypt (10 rounds)
2. **SQL Injection**: Queries parametrizadas via `executarQuery`
3. **JWT**: Tokens assinados com secret, expiracao configuravel
4. **CORS**: Origem restrita ao frontend
5. **Upload**: Validacao de tipo MIME e tamanho
6. **OAuth**: State parameter para prevenir CSRF
7. **Aprovacao**: Novos utilizadores requerem aprovacao admin
