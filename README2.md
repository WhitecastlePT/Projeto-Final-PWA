# SGP - Sistema de Gestao de Propostas de Projeto

Sistema web para gestao de propostas de projetos academicos.
Permite que docentes criem propostas, alunos se candidatem, e administradores gerenciem utilizadores.


## Requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior
- npm (vem com o Node.js)


## Instalacao

### Passo 1 - Instalar o PostgreSQL ( Por defeito está a usar uma BD online )

// No Windows:
// Descarrega o instalador em: https://www.postgresql.org/download/windows/
// Executa o instalador e segue os passos
// Guarda a palavra-passe que definires para o utilizador "postgres"

// No Linux (Ubuntu/Debian):
sudo apt update
sudo apt install postgresql postgresql-contrib

// No Mac:
brew install postgresql


### Passo 2 - Criar a base de dados

// Abre uma linha de comandos e executa:

// No Windows (PowerShell ou CMD):
psql -U postgres

// No Linux/Mac:
sudo -u postgres psql

// Dentro do psql, executa estes comandos:
CREATE DATABASE sgp_db ENCODING 'UTF8';
\q

// Agora aplica o schema e os dados de teste:

// No Windows:
psql -U postgres -d sgp_db -f database/schema.sql
psql -U postgres -d sgp_db -f database/seed.sql

// No Linux/Mac:
sudo -u postgres psql -d sgp_db -f database/schema.sql
sudo -u postgres psql -d sgp_db -f database/seed.sql


### Passo 3 - Configurar o Backend ( POR DEFEITO A BD está online )

// Entra na pasta do backend:
cd backend

// Cria o ficheiro .env com este conteudo:

PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgp_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=chave_secreta_para_tokens_jwt
JWT_EXPIRES_IN=24h
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:5173

// Nota: Altera DB_PASSWORD para a palavra-passe que definiste no PostgreSQL

// Instala as dependencias:
npm install


### Passo 4 - Configurar o Frontend

// Entra na pasta do frontend:
cd frontend

// Cria o ficheiro .env com este conteudo:

VITE_API_URL=http://localhost:3000/api

// Instala as dependencias:
npm install


### Passo 5 - Iniciar a aplicacao

// Precisas de dois terminais abertos.

// Terminal 1 - Backend:
cd backend
npm run dev

// O backend inicia em http://localhost:3000

// Terminal 2 - Frontend:
cd frontend
npm run dev

// O frontend inicia em http://localhost:5173


## Utilizadores de Teste

// Se executaste o seed.sql, tens estes utilizadores disponiveis:

// Administrador:
// Email: admin@sgp.pt
// Senha: senha123

// Docente:
// Email: isaurinomorais@universidade.pt
// Senha: senha123
// Email: anibalpimpao@universidade.pt
// Senha: senha123

// Aluno:
// Email: aluno123@gmail.com
// Senha: senha123


## Como Usar o SGP

### Para Administradores

Passo 1 - Acede a http://localhost:5173
Passo 2 - Clica em "Administrador"
Passo 3 - Faz login com as credenciais de admin
Passo 4 - Na pagina de gestao de utilizadores podes:
         - Ver todos os utilizadores registados
         - Aprovar ou rejeitar novos registos
         - Alterar o tipo de utilizador
         - Eliminar utilizadores


### Para Docentes

Passo 1 - Acede a http://localhost:5173
Passo 2 - Clica em "Docente"
Passo 3 - Faz login ou cria uma nova conta
         // Nota: Novas contas precisam de aprovacao do admin
Passo 4 - Apos aprovacao, podes:
         - Criar e gerir Unidades Curriculares (UCs)
         - Criar propostas de projeto associadas a UCs
         - Adicionar coorientadores as propostas
         - Carregar anexos (PDF, DOC, DOCX, TXT)
         - Ver candidaturas dos alunos
         - Aceitar ou rejeitar candidaturas


### Para Alunos

Passo 1 - Acede a http://localhost:5173
Passo 2 - Clica em "Aluno"
Passo 3 - Faz login ou cria uma nova conta
         // Nota: Novas contas precisam de aprovacao do admin
Passo 4 - Apos aprovacao, podes:
         - Ver UCs disponiveis
         - Ver propostas publicadas em cada UC
         - Candidatar-te a propostas
         - Adicionar anexos a candidatura (CV, portfolio, etc.)
         - Acompanhar o estado das tuas candidaturas


### Para Visitantes (sem conta)

// Podes ver a lista de docentes registados sem fazer login.
// Acede a http://localhost:5173/docentes


## Estrutura do Projeto

Projeto-Final-PWA/
  backend/           // API REST em Node.js/Express
    src/
      controladores/ // Logica de negocio
      modelos/       // Acesso a base de dados
      rotas/         // Definicao de endpoints
      middlewares/   // Autenticacao e validacao
      config/        // Configuracao da BD
    uploads/         // Ficheiros carregados
  frontend/          // Aplicacao Vue.js
    src/
      views/         // Paginas da aplicacao
      components/    // Componentes reutilizaveis
      router/        // Rotas e guards
      store/         // Estado global (Pinia)
      services/      // Comunicacao com API
  database/
    schema.sql       // Estrutura da base de dados
    seed.sql         // Dados de teste


## Estados das Propostas

- rascunho: Proposta em elaboracao, nao visivel para alunos
- publicada: Proposta visivel, alunos podem candidatar-se
- aprovada: Proposta aprovada, alunos ja atribuidos
- arquivada: Proposta arquivada, nao aceita mais candidaturas


## Estados das Candidaturas

- pendente: Candidatura submetida, a aguardar resposta
- aceite: Candidatura aceite pelo docente
- rejeitada: Candidatura rejeitada pelo docente


