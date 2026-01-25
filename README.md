# SGP - Sistema de Gestao de Propostas de Projeto

Sistema web para gestao de propostas de projetos academicos.
Permite que docentes criem propostas, alunos se candidatem, e administradores gerenciem utilizadores.

## Tecnologias Utilizadas

### Backend
- **Node.js** (v18+) - Runtime JavaScript
- **Express.js** (v4.19) - Framework web
- **PostgreSQL** (v14+) - Base de dados relacional
- **JWT** - Autenticacao baseada em tokens
- **Passport.js** - Autenticacao OAuth2 (Google)
- **Multer** - Upload de ficheiros
- **Bcrypt** - Encriptacao de passwords

### Frontend
- **Vue.js 3** - Framework JavaScript reativo
- **Vue Router 4** - Gestao de rotas SPA
- **Pinia** - Gestao de estado
- **Axios** - Cliente HTTP
- **Vite** - Build tool e dev server

### Base de Dados
- **PostgreSQL** com suporte a tipos enumerados
- Hospedagem cloud via **Neon** (opcional)


## Requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior (ou usar BD cloud Neon)
- npm (vem com o Node.js)


## Instalacao Local

### Passo 1 - Clonar o repositorio

```bash
git clone <url-do-repositorio>
cd Projeto-Final-PWA
```

### Passo 2 - Configurar a Base de Dados

**Opcao A: Base de dados local**

```bash
# Criar a base de dados
psql -U postgres -c "CREATE DATABASE sgp_db ENCODING 'UTF8'"

# Aplicar schema e dados de teste
psql -U postgres -d sgp_db -f database/schema.sql
psql -U postgres -d sgp_db -f database/seed.sql
```

**Opcao B: Base de dados cloud (Neon)**

Criar conta em https://neon.tech e usar as credenciais fornecidas no .env

### Passo 3 - Configurar o Backend

```bash
cd backend
npm install
```

Criar ficheiro `.env`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de Dados (local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgp_db
DB_USER=postgres
DB_PASSWORD=sua_password
DB_SSL=false

# JWT
JWT_SECRET=chave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:5173

# Google OAuth2 (opcional)
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### Passo 4 - Configurar o Frontend

```bash
cd frontend
npm install
```

Criar ficheiro `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Passo 5 - Iniciar a Aplicacao

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Aceder a http://localhost:5173


## Configurar Google OAuth2 (Opcional)

Para permitir login com conta Google:

1. Aceder a https://console.cloud.google.com
2. Criar um novo projeto
3. Ir a "APIs & Services" > "OAuth consent screen"
   - Selecionar "External"
   - Preencher nome da app e email
   - Adicionar scopes: email, profile
4. Ir a "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
   - Tipo: Web application
   - URIs de redirecionamento autorizados:
     - `http://localhost:3000/api/auth/google/callback` (desenvolvimento)
     - `https://seu-backend.onrender.com/api/auth/google/callback` (producao)
5. Copiar Client ID e Client Secret para o `.env`
6. Em "OAuth consent screen" > "Test users", adicionar emails de teste


## Deploy no Render

### Backend

1. Criar novo "Web Service" no Render
2. Conectar ao repositorio GitHub
3. Configurar:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Adicionar variaveis de ambiente (Settings > Environment):
   ```
   NODE_ENV=production
   DB_HOST=...
   DB_PORT=5432
   DB_NAME=sgp_db
   DB_USER=...
   DB_PASSWORD=...
   DB_SSL=true
   JWT_SECRET=...
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://seu-frontend.onrender.com
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=https://seu-backend.onrender.com/api/auth/google/callback
   ```

### Frontend

1. Criar novo "Static Site" no Render
2. Conectar ao repositorio GitHub
3. Configurar:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Adicionar variavel de ambiente:
   ```
   VITE_API_URL=https://seu-backend.onrender.com/api
   ```


## Utilizadores de Teste

Se executou o seed.sql:

| Tipo | Email | Password |
|------|-------|----------|
| Administrador | admin@sgp.pt | senha123 |
| Docente | isaurinomorais@universidade.pt | senha123 |
| Docente | anibalpimpao@universidade.pt | senha123 |
| Aluno | aluno123@gmail.com | senha123 |


## Funcionalidades por Perfil

### Administrador
- Aprovar/rejeitar registos de utilizadores
- Alterar tipo de utilizador
- Eliminar utilizadores
- Ver todos os utilizadores

### Docente
- Criar e gerir Unidades Curriculares (UCs)
- Criar propostas de projeto associadas a UCs
- Adicionar coorientadores
- Carregar anexos (PDF, DOC, DOCX, TXT)
- Ver e gerir candidaturas dos alunos
- Aceitar ou rejeitar candidaturas

### Aluno
- Ver UCs disponiveis
- Ver propostas publicadas
- Candidatar-se a propostas
- Anexar documentos a candidatura (CV, portfolio)
- Acompanhar estado das candidaturas

### Visitante (sem login)
- Ver lista de docentes registados


## Estados do Sistema

### Estados das Propostas
- **rascunho**: Em elaboracao, nao visivel para alunos
- **publicada**: Visivel, alunos podem candidatar-se
- **aprovada**: Com alunos atribuidos
- **arquivada**: Nao aceita mais candidaturas

### Estados das Candidaturas
- **pendente**: A aguardar resposta do docente
- **aceite**: Candidatura aceite
- **rejeitada**: Candidatura rejeitada


## API Endpoints

### Autenticacao
- `POST /api/auth/registar` - Registar novo utilizador
- `POST /api/auth/login` - Login tradicional
- `GET /api/auth/google` - Iniciar login Google OAuth
- `GET /api/auth/google/callback` - Callback Google OAuth
- `GET /api/auth/perfil` - Obter perfil (autenticado)

### Utilizadores
- `GET /api/docentes` - Listar docentes (publico)
- `GET /api/alunos` - Listar alunos (autenticado)

### Administracao
- `GET /api/admin/utilizadores` - Listar utilizadores
- `PUT /api/admin/utilizadores/:id/aprovar` - Aprovar utilizador
- `DELETE /api/admin/utilizadores/:id` - Eliminar utilizador

### Unidades Curriculares
- `GET /api/ucs` - Listar UCs
- `POST /api/ucs` - Criar UC
- `PUT /api/ucs/:id` - Atualizar UC
- `DELETE /api/ucs/:id` - Eliminar UC

### Propostas
- `GET /api/propostas` - Listar propostas publicadas
- `GET /api/propostas/minhas` - Minhas propostas (docente)
- `POST /api/propostas` - Criar proposta
- `PUT /api/propostas/:id` - Atualizar proposta
- `DELETE /api/propostas/:id` - Eliminar proposta

### Candidaturas
- `GET /api/candidaturas/minhas` - Minhas candidaturas (aluno)
- `POST /api/candidaturas` - Criar candidatura
- `PUT /api/candidaturas/:id/estado` - Atualizar estado (docente)

### Anexos
- `POST /api/anexos/:propostaId` - Upload de anexo
- `GET /api/anexos/:id/download` - Download de anexo
- `DELETE /api/anexos/:id` - Eliminar anexo


## Licenca

MIT License
