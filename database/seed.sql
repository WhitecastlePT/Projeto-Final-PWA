-- =====================================================
-- Script de Dados de Teste (Seed)
-- Sistema de Gestão de Propostas de Projeto
-- =====================================================

-- ATENÇÃO: Este script insere dados de exemplo para desenvolvimento e testes
-- As palavras-passe estão em formato bcrypt com hash de "senha123"
-- ADMIN INICIAL: admin@sgp.pt / senha123

-- =====================================================
-- Limpar dados existentes (cuidado em produção!)
-- =====================================================

TRUNCATE TABLE
    anexo_candidatura,
    candidatura,
    proposta_palavra_chave,
    proposta_aluno,
    proposta_coorientador,
    anexo,
    proposta,
    unidade_curricular,
    palavra_chave,
    utilizador
RESTART IDENTITY CASCADE;

-- =====================================================
-- Inserir Utilizadores
-- =====================================================

-- Palavra-passe para todos: "senha123"
-- Hash bcrypt: $2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2

-- ADMINISTRADOR INICIAL (já aprovado)
-- Verifica se já existe antes de inserir (criado pelo schema.sql)
INSERT INTO utilizador (nome, email, palavra_passe, tipo, aprovado)
VALUES ('Administrador', 'admin@sgp.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'administrador', TRUE)
ON CONFLICT (email) DO NOTHING;

-- DOCENTES (já aprovados para testes)
INSERT INTO utilizador (nome, email, palavra_passe, tipo, aprovado, gabinete, departamento) VALUES
    ('Prof. João Silva', 'joao.silva@universidade.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'docente', TRUE, 'Gab. 201', 'Departamento de Informática'),
    ('Prof. Maria Santos', 'maria.santos@universidade.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'docente', TRUE, 'Gab. 202', 'Departamento de Informática'),
    ('Prof. Carlos Mendes', 'carlos.mendes@universidade.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'docente', TRUE, 'Gab. 105', 'Departamento de Sistemas'),
    ('Prof. Ana Rodrigues', 'ana.rodrigues@universidade.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'docente', TRUE, 'Gab. 301', 'Departamento de Redes'),
    ('Prof. Pedro Costa', 'pedro.costa@universidade.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'docente', TRUE, 'Gab. 108', 'Departamento de Engenharia de Software');

-- ALUNOS (alguns aprovados, alguns pendentes para testar aprovação)
INSERT INTO utilizador (nome, email, palavra_passe, tipo, aprovado, numero_aluno, curso) VALUES
    ('António Ferreira', 'antonio.ferreira@aluno.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'aluno', TRUE, '2021001', 'Engenharia Informática'),
    ('Beatriz Oliveira', 'beatriz.oliveira@aluno.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'aluno', TRUE, '2021002', 'Engenharia Informática'),
    ('Carlos Pereira', 'carlos.pereira@aluno.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'aluno', TRUE, '2021003', 'Ciência de Dados'),
    ('Diana Sousa', 'diana.sousa@aluno.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'aluno', TRUE, '2021004', 'Engenharia Informática'),
    ('Eduardo Martins', 'eduardo.martins@aluno.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'aluno', TRUE, '2021005', 'Engenharia de Software'),
    ('Francisca Alves', 'francisca.alves@aluno.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'aluno', FALSE, '2021006', 'Engenharia Informática'),
    ('Gabriel Ribeiro', 'gabriel.ribeiro@aluno.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'aluno', FALSE, '2021007', 'Ciência de Dados'),
    ('Helena Carvalho', 'helena.carvalho@aluno.pt', '$2b$10$dv5.45y8C1XvfbXeAm8T6uWDWT9qPOg.h6Gl5oaJucBi0n65kO2r2', 'aluno', FALSE, '2021008', 'Engenharia de Software');

-- IDs resultantes:
-- 1: Admin
-- 2-6: Docentes (João=2, Maria=3, Carlos=4, Ana=5, Pedro=6)
-- 7-14: Alunos (António=7, Beatriz=8, Carlos=9, Diana=10, Eduardo=11, Francisca=12, Gabriel=13, Helena=14)

-- =====================================================
-- Inserir Unidades Curriculares
-- =====================================================

INSERT INTO unidade_curricular (nome, codigo, descricao, docente_id, ano_letivo, semestre, ativa) VALUES
    ('Programação Web Avançada', 'PWA', 'Desenvolvimento de aplicações web modernas com frameworks JavaScript', 2, '2024/2025', '1º Semestre', TRUE),
    ('Inteligência Artificial', 'IA', 'Fundamentos e aplicações de IA e Machine Learning', 2, '2024/2025', '1º Semestre', TRUE),
    ('Bases de Dados Avançadas', 'BDA', 'Sistemas de bases de dados NoSQL e distribuídas', 3, '2024/2025', '1º Semestre', TRUE),
    ('Segurança Informática', 'SI', 'Princípios de cibersegurança e criptografia', 5, '2024/2025', '2º Semestre', TRUE),
    ('Computação em Nuvem', 'CN', 'Arquiteturas e serviços cloud computing', 4, '2024/2025', '2º Semestre', TRUE),
    ('Desenvolvimento Mobile', 'DM', 'Criação de aplicações para iOS e Android', 6, '2024/2025', '1º Semestre', TRUE);

-- =====================================================
-- Inserir Palavras-chave
-- =====================================================

INSERT INTO palavra_chave (termo) VALUES
    ('Inteligência Artificial'),
    ('Machine Learning'),
    ('Desenvolvimento Web'),
    ('Base de Dados'),
    ('Segurança Informática'),
    ('Computação em Nuvem'),
    ('Internet das Coisas'),
    ('Blockchain'),
    ('Realidade Virtual'),
    ('Análise de Dados'),
    ('APIs REST'),
    ('Microserviços'),
    ('DevOps'),
    ('Mobile'),
    ('Frontend'),
    ('Backend');

-- =====================================================
-- Inserir Propostas (associadas a UCs)
-- =====================================================

INSERT INTO proposta (titulo, descricao_objetivos, orientador_id, uc_id, estado) VALUES
    (
        'Sistema de Recomendação Inteligente para E-commerce',
        'Desenvolver um sistema de recomendação baseado em machine learning que analisa o comportamento de compra dos utilizadores e sugere produtos relevantes. O projeto inclui análise de dados históricos, implementação de algoritmos de filtragem colaborativa e criação de uma API REST para integração.',
        2,  -- Prof. João Silva
        2,  -- UC: Inteligência Artificial
        'publicada'
    ),
    (
        'Plataforma de Gestão de Projetos com Blockchain',
        'Criar uma plataforma descentralizada para gestão de projetos académicos utilizando tecnologia blockchain. O sistema garantirá a integridade e rastreabilidade de todas as atividades do projeto, incluindo submissões, avaliações e feedback.',
        3,  -- Prof. Maria Santos
        3,  -- UC: Bases de Dados Avançadas
        'publicada'
    ),
    (
        'Aplicação Mobile para Monitorização de Saúde com IoT',
        'Desenvolver uma aplicação mobile que integra com dispositivos IoT para monitorização de sinais vitais em tempo real. Inclui dashboard de visualização de dados, alertas automáticos e armazenamento seguro de informação médica.',
        4,  -- Prof. Carlos Mendes
        6,  -- UC: Desenvolvimento Mobile
        'publicada'
    ),
    (
        'Sistema de Segurança com Autenticação Biométrica',
        'Implementar um sistema de controlo de acessos utilizando autenticação biométrica (impressão digital e reconhecimento facial). O projeto abrange desenvolvimento de API, integração com hardware e implementação de protocolos de segurança.',
        5,  -- Prof. Ana Rodrigues
        4,  -- UC: Segurança Informática
        'rascunho'
    ),
    (
        'Plataforma de Análise de Sentimentos em Redes Sociais',
        'Criar uma ferramenta de análise de sentimentos que processa posts de redes sociais em tempo real utilizando processamento de linguagem natural. Inclui dashboard de visualização, exportação de relatórios e API para integração.',
        2,  -- Prof. João Silva
        2,  -- UC: Inteligência Artificial
        'publicada'
    ),
    (
        'Arquitetura de Microserviços para Sistema Bancário',
        'Projetar e implementar uma arquitetura de microserviços escalável para um sistema bancário, incluindo serviços de autenticação, transações, gestão de contas e notificações. Utilização de Docker, Kubernetes e implementação de padrões de comunicação entre serviços.',
        6,  -- Prof. Pedro Costa
        5,  -- UC: Computação em Nuvem
        'aprovada'
    ),
    (
        'Aplicação de Realidade Virtual para Formação Médica',
        'Desenvolver uma aplicação de realidade virtual para simulação de procedimentos médicos. O sistema permite treino imersivo de técnicas cirúrgicas com feedback em tempo real e registo de desempenho.',
        3,  -- Prof. Maria Santos
        NULL,  -- Sem UC associada
        'rascunho'
    ),
    (
        'Trabalho 1 - Desenvolvimento de API REST',
        'Criar uma API REST completa para gestão de uma loja online, incluindo autenticação JWT, CRUD de produtos, gestão de encomendas e documentação Swagger.',
        2,  -- Prof. João Silva
        1,  -- UC: Programação Web Avançada
        'publicada'
    ),
    (
        'Trabalho 2 - Frontend com Vue.js',
        'Desenvolver uma aplicação frontend em Vue.js 3 que consome a API do Trabalho 1, implementando componentes reutilizáveis, gestão de estado com Pinia e routing.',
        2,  -- Prof. João Silva
        1,  -- UC: Programação Web Avançada
        'publicada'
    );

-- =====================================================
-- Associar Coorientadores a Propostas
-- =====================================================

-- Proposta 1: coorientador Prof. Maria Santos
INSERT INTO proposta_coorientador (proposta_id, coorientador_id) VALUES (1, 3);

-- Proposta 2: coorientadores Prof. João Silva e Prof. Carlos Mendes
INSERT INTO proposta_coorientador (proposta_id, coorientador_id) VALUES
    (2, 2),
    (2, 4);

-- Proposta 6: coorientador Prof. Ana Rodrigues
INSERT INTO proposta_coorientador (proposta_id, coorientador_id) VALUES (6, 5);

-- =====================================================
-- Associar Alunos a Propostas (associação direta)
-- =====================================================

-- Proposta 6 (aprovada): já tem alunos associados
INSERT INTO proposta_aluno (proposta_id, aluno_id) VALUES
    (6, 7),  -- António
    (6, 8);  -- Beatriz

-- Proposta 1: um aluno interessado
INSERT INTO proposta_aluno (proposta_id, aluno_id) VALUES (1, 9);  -- Carlos

-- Proposta 3: dois alunos
INSERT INTO proposta_aluno (proposta_id, aluno_id) VALUES
    (3, 10),  -- Diana
    (3, 11);  -- Eduardo

-- =====================================================
-- Associar Palavras-chave a Propostas
-- =====================================================

-- Proposta 1: Sistema de Recomendação
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (1, 2),  -- Machine Learning
    (1, 10), -- Análise de Dados
    (1, 11), -- APIs REST
    (1, 16); -- Backend

-- Proposta 2: Blockchain
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (2, 8),  -- Blockchain
    (2, 3),  -- Desenvolvimento Web
    (2, 4);  -- Base de Dados

-- Proposta 3: IoT e Mobile
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (3, 7),  -- Internet das Coisas
    (3, 14), -- Mobile
    (3, 6);  -- Computação em Nuvem

-- Proposta 4: Segurança
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (4, 5),  -- Segurança Informática
    (4, 1);  -- Inteligência Artificial

-- Proposta 5: Análise de Sentimentos
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (5, 1),  -- Inteligência Artificial
    (5, 2),  -- Machine Learning
    (5, 10); -- Análise de Dados

-- Proposta 6: Microserviços
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (6, 12), -- Microserviços
    (6, 13), -- DevOps
    (6, 11), -- APIs REST
    (6, 6);  -- Computação em Nuvem

-- Proposta 7: Realidade Virtual
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (7, 9),  -- Realidade Virtual
    (7, 1);  -- Inteligência Artificial

-- Proposta 8: API REST
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (8, 3),  -- Desenvolvimento Web
    (8, 11), -- APIs REST
    (8, 16); -- Backend

-- Proposta 9: Vue.js
INSERT INTO proposta_palavra_chave (proposta_id, palavra_chave_id) VALUES
    (9, 3),  -- Desenvolvimento Web
    (9, 15); -- Frontend

-- =====================================================
-- Inserir Candidaturas de Exemplo
-- =====================================================

INSERT INTO candidatura (aluno_id, proposta_id, estado, observacoes) VALUES
    (7, 8, 'pendente', 'Tenho experiência com Node.js e MongoDB. Gostaria de desenvolver este trabalho.'),
    (8, 8, 'aceite', 'Já trabalhei com APIs REST em projetos pessoais.'),
    (9, 9, 'pendente', 'Tenho conhecimentos de Vue.js e pretendo aprofundar.'),
    (10, 1, 'pendente', 'Interessada em machine learning e sistemas de recomendação.'),
    (11, 3, 'rejeitada', 'Candidatura rejeitada por falta de pré-requisitos.');

-- =====================================================
-- Inserir Anexos de Exemplo (propostas)
-- =====================================================

INSERT INTO anexo (nome_ficheiro, caminho, tipo, tamanho_bytes, proposta_id) VALUES
    ('requisitos_sistema.pdf', 'uploads/propostas/1/requisitos_sistema.pdf', 'pdf', 245760, 1),
    ('arquitetura_proposta.pdf', 'uploads/propostas/1/arquitetura_proposta.pdf', 'pdf', 389120, 1),
    ('especificacao_tecnica.docx', 'uploads/propostas/2/especificacao_tecnica.docx', 'docx', 156440, 2),
    ('diagrama_arquitetura.pdf', 'uploads/propostas/6/diagrama_arquitetura.pdf', 'pdf', 512000, 6),
    ('plano_trabalho.pdf', 'uploads/propostas/6/plano_trabalho.pdf', 'pdf', 198620, 6),
    ('enunciado_trabalho1.pdf', 'uploads/propostas/8/enunciado_trabalho1.pdf', 'pdf', 125000, 8),
    ('enunciado_trabalho2.pdf', 'uploads/propostas/9/enunciado_trabalho2.pdf', 'pdf', 130000, 9);

-- =====================================================
-- Inserir Anexos de Candidaturas (alunos)
-- =====================================================

INSERT INTO anexo_candidatura (candidatura_id, nome_ficheiro, caminho, tipo, tamanho_bytes) VALUES
    (1, 'portfolio_antonio.pdf', 'uploads/candidaturas/1/portfolio_antonio.pdf', 'pdf', 1024000),
    (2, 'cv_beatriz.pdf', 'uploads/candidaturas/2/cv_beatriz.pdf', 'pdf', 512000),
    (2, 'projeto_exemplo.zip', 'uploads/candidaturas/2/projeto_exemplo.zip', 'zip', 2048000),
    (3, 'trabalhos_anteriores.pdf', 'uploads/candidaturas/3/trabalhos_anteriores.pdf', 'pdf', 768000);

-- =====================================================
-- Verificar Dados Inseridos
-- =====================================================

SELECT 'Utilizadores' as tabela, COUNT(*) as total FROM utilizador
UNION ALL
SELECT 'Administradores', COUNT(*) FROM utilizador WHERE tipo = 'administrador'
UNION ALL
SELECT 'Docentes', COUNT(*) FROM utilizador WHERE tipo = 'docente'
UNION ALL
SELECT 'Alunos', COUNT(*) FROM utilizador WHERE tipo = 'aluno'
UNION ALL
SELECT 'Alunos Pendentes', COUNT(*) FROM utilizador WHERE tipo = 'aluno' AND aprovado = FALSE
UNION ALL
SELECT 'Unidades Curriculares', COUNT(*) FROM unidade_curricular
UNION ALL
SELECT 'Palavras-chave', COUNT(*) FROM palavra_chave
UNION ALL
SELECT 'Propostas', COUNT(*) FROM proposta
UNION ALL
SELECT 'Candidaturas', COUNT(*) FROM candidatura
UNION ALL
SELECT 'Anexos Propostas', COUNT(*) FROM anexo
UNION ALL
SELECT 'Anexos Candidaturas', COUNT(*) FROM anexo_candidatura;

-- =====================================================
-- Fim do Script
-- =====================================================
