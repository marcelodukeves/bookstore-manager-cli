-- =====================================================================
-- BookStore Manager CLI
-- Banco de dados da livraria (PostgreSQL)
--
-- Organização do arquivo:
--   1. Criação da estrutura (DDL)
--   2. Manipulação de dados (DML)
--   3. Consultas dos relatórios
--
-- Antes de executar, crie o banco "bookstore_manager" e conecte-se a ele.
-- O script pode ser executado várias vezes: ele recria as tabelas do zero.
-- =====================================================================


-- =====================================================================
-- 1. CRIAÇÃO DA ESTRUTURA (DDL)
-- =====================================================================

-- Remove as tabelas existentes, dos filhos para os pais,
-- para permitir executar o script novamente.
DROP TABLE IF EXISTS emprestimos CASCADE;
DROP TABLE IF EXISTS livros CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS autores CASCADE;

-- ---------------------------------------------------------------------
-- Tabela autores
-- ---------------------------------------------------------------------
CREATE TABLE autores (
    id             SERIAL       PRIMARY KEY,
    nome           VARCHAR(100) NOT NULL UNIQUE,
    nacionalidade  VARCHAR(50)  NOT NULL
);

-- ---------------------------------------------------------------------
-- Tabela clientes
-- ---------------------------------------------------------------------
CREATE TABLE clientes (
    id        SERIAL       PRIMARY KEY,
    nome      VARCHAR(100) NOT NULL,
    email     VARCHAR(120) NOT NULL UNIQUE,
    telefone  VARCHAR(20)  NOT NULL
);

-- ---------------------------------------------------------------------
-- Tabela livros
-- Cada livro pertence a um autor (relacionamento 1:N com autores).
-- ---------------------------------------------------------------------
CREATE TABLE livros (
    id                     SERIAL       PRIMARY KEY,
    titulo                 VARCHAR(150) NOT NULL,
    isbn                   VARCHAR(20)  NOT NULL UNIQUE,
    ano_publicacao         INTEGER      NOT NULL,
    autor_id               INTEGER      NOT NULL,
    quantidade_total       INTEGER      NOT NULL,
    quantidade_disponivel  INTEGER      NOT NULL,

    CONSTRAINT fk_livros_autor
        FOREIGN KEY (autor_id) REFERENCES autores (id),

    CONSTRAINT ck_livros_ano_publicacao
        CHECK (ano_publicacao >= 1000),
    CONSTRAINT ck_livros_quantidade_total
        CHECK (quantidade_total > 0),
    CONSTRAINT ck_livros_quantidade_disponivel
        CHECK (quantidade_disponivel >= 0 AND quantidade_disponivel <= quantidade_total)
);

-- ---------------------------------------------------------------------
-- Tabela emprestimos
-- Liga um livro a um cliente em uma data (relacionamentos 1:N com
-- livros e com clientes). data_devolucao nula = empréstimo ativo.
-- ---------------------------------------------------------------------
CREATE TABLE emprestimos (
    id               SERIAL   PRIMARY KEY,
    livro_id         INTEGER  NOT NULL,
    cliente_id       INTEGER  NOT NULL,
    data_emprestimo  DATE     NOT NULL DEFAULT CURRENT_DATE,
    data_devolucao   DATE,

    CONSTRAINT fk_emprestimos_livro
        FOREIGN KEY (livro_id) REFERENCES livros (id),
    CONSTRAINT fk_emprestimos_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes (id),

    CONSTRAINT ck_emprestimos_datas
        CHECK (data_devolucao IS NULL OR data_devolucao >= data_emprestimo)
);


-- =====================================================================
-- 2. MANIPULAÇÃO DE DADOS (DML)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 2.1 INSERT
-- Dados iniciais idênticos ao seed da aplicação (src/data/seed.ts).
-- A ordem respeita as chaves estrangeiras: primeiro as tabelas pai
-- (autores e clientes), depois livros e por fim emprestimos.
-- Os ids são gerados em sequência (1, 2, 3...) pelo SERIAL.
-- ---------------------------------------------------------------------

INSERT INTO autores (nome, nacionalidade) VALUES
    ('Machado de Assis',       'Brasileira'),
    ('Clarice Lispector',      'Brasileira'),
    ('Jorge Amado',            'Brasileira'),
    ('George Orwell',          'Britânica'),
    ('Gabriel García Márquez', 'Colombiana'),
    ('Cecília Meireles',       'Brasileira');

INSERT INTO clientes (nome, email, telefone) VALUES
    ('Maria Silva',    'maria@email.com',    '49 99999-0001'),
    ('João Souza',     'joao@email.com',     '49 99999-0002'),
    ('Ana Pereira',    'ana@email.com',      '49 99999-0003'),
    ('Carlos Lima',    'carlos@email.com',   '49 99999-0004'),
    ('Fernanda Costa', 'fernanda@email.com', '49 99999-0005');

-- A quantidade disponível já considera os empréstimos ativos abaixo.
INSERT INTO livros (titulo, isbn, ano_publicacao, autor_id, quantidade_total, quantidade_disponivel) VALUES
    ('Dom Casmurro',                    '978-85-359-0277-5', 1899, 1, 3, 2),
    ('Memórias Póstumas de Brás Cubas', '978-85-359-0278-2', 1881, 1, 2, 2),
    ('A Hora da Estrela',               '978-85-325-1000-1', 1977, 2, 2, 1),
    ('Capitães da Areia',               '978-85-359-0300-0', 1937, 3, 2, 2),
    ('1984',                            '978-85-359-0301-7', 1949, 4, 3, 2),
    ('A Revolução dos Bichos',          '978-85-359-0302-4', 1945, 4, 1, 0),
    ('Cem Anos de Solidão',             '978-85-359-0303-1', 1967, 5, 2, 2);

-- data_devolucao nula = empréstimo ativo (2 devolvidos e 4 ativos).
INSERT INTO emprestimos (livro_id, cliente_id, data_emprestimo, data_devolucao) VALUES
    (1, 1, '2026-10-01', '2026-10-08'),
    (1, 2, '2026-10-05', NULL),
    (3, 3, '2026-10-10', NULL),
    (5, 1, '2026-10-12', '2026-10-19'),
    (5, 4, '2026-10-15', NULL),
    (6, 2, '2026-10-20', NULL);

-- ---------------------------------------------------------------------
-- 2.2 UPDATE
-- ---------------------------------------------------------------------

-- Atualiza o telefone de um cliente.
UPDATE clientes
SET telefone = '49 98888-0005'
WHERE id = 5;

-- Aumenta o estoque do livro 2 em uma unidade: o total e o disponível
-- sobem juntos, como faz a aplicação ao atualizar a quantidade.
UPDATE livros
SET quantidade_total      = quantidade_total + 1,
    quantidade_disponivel = quantidade_disponivel + 1
WHERE id = 2;

-- ---------------------------------------------------------------------
-- 2.3 DELETE
-- Só é possível remover registros que não são referenciados por outras
-- tabelas. Por isso a remoção segue a ordem dos filhos para os pais.
-- ---------------------------------------------------------------------

-- Remove o livro 7, que não possui nenhum empréstimo.
DELETE FROM livros
WHERE id = 7;

-- Remove a cliente 5, que não possui nenhum empréstimo.
DELETE FROM clientes
WHERE id = 5;

-- Exemplos de remoções BLOQUEADAS pelas chaves estrangeiras.
-- Para demonstrar, retire o "--" do início da linha e execute apenas ela:
--
-- DELETE FROM autores  WHERE id = 1;  -- erro: o autor possui livros
-- DELETE FROM livros   WHERE id = 1;  -- erro: o livro possui empréstimos
-- DELETE FROM clientes WHERE id = 1;  -- erro: o cliente possui empréstimos

-- ---------------------------------------------------------------------
-- 2.4 SELECT
-- Consultas simples para conferir o estado das tabelas após o DML.
-- ---------------------------------------------------------------------

SELECT * FROM autores     ORDER BY id;
SELECT * FROM livros      ORDER BY id;
SELECT * FROM clientes    ORDER BY id;
SELECT * FROM emprestimos ORDER BY id;


-- =====================================================================
-- 3. CONSULTAS DOS RELATÓRIOS
-- Para ver cada relatório separadamente, selecione a consulta
-- desejada e execute somente a seleção.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 3.1 Livros disponíveis
-- Livros com pelo menos um exemplar livre para empréstimo, com o autor.
-- Recursos: INNER JOIN, WHERE, ORDER BY.
-- ---------------------------------------------------------------------
SELECT
    l.id,
    l.titulo                AS livro,
    a.nome                  AS autor,
    l.quantidade_disponivel AS disponiveis,
    l.quantidade_total      AS total
FROM livros l
INNER JOIN autores a ON a.id = l.autor_id
WHERE l.quantidade_disponivel > 0
ORDER BY l.titulo;

-- ---------------------------------------------------------------------
-- 3.2 Livros emprestados
-- Empréstimos ainda ativos (sem data de devolução), com o livro,
-- o cliente e a data do empréstimo.
-- Recursos: INNER JOIN em três tabelas, WHERE, ORDER BY.
-- ---------------------------------------------------------------------
SELECT
    e.id                                       AS emprestimo,
    l.titulo                                   AS livro,
    c.nome                                     AS cliente,
    TO_CHAR(e.data_emprestimo, 'DD/MM/YYYY')   AS data_emprestimo
FROM emprestimos e
INNER JOIN livros   l ON l.id = e.livro_id
INNER JOIN clientes c ON c.id = e.cliente_id
WHERE e.data_devolucao IS NULL
ORDER BY e.data_emprestimo, e.id;

-- ---------------------------------------------------------------------
-- 3.3 Livros cadastrados por autor
-- Quantidade de livros e de exemplares de cada autor. O LEFT JOIN
-- mantém na lista os autores que ainda não possuem livros (total 0).
-- Recursos: LEFT JOIN, GROUP BY, COUNT, SUM, COALESCE, ORDER BY.
-- ---------------------------------------------------------------------
SELECT
    a.id,
    a.nome                                AS autor,
    COUNT(l.id)                           AS total_livros,
    COALESCE(SUM(l.quantidade_total), 0)  AS total_exemplares
FROM autores a
LEFT JOIN livros l ON l.autor_id = a.id
GROUP BY a.id, a.nome
ORDER BY total_livros DESC, a.nome;

-- ---------------------------------------------------------------------
-- 3.4 Quantidade de empréstimos por livro
-- Total de empréstimos já realizados de cada livro (ativos e
-- devolvidos). O LEFT JOIN mantém os livros nunca emprestados (total 0).
-- Recursos: LEFT JOIN, GROUP BY, COUNT, ORDER BY.
-- ---------------------------------------------------------------------
SELECT
    l.id,
    l.titulo         AS livro,
    COUNT(e.id)      AS total_emprestimos
FROM livros l
LEFT JOIN emprestimos e ON e.livro_id = l.id
GROUP BY l.id, l.titulo
ORDER BY total_emprestimos DESC, l.titulo;

-- ---------------------------------------------------------------------
-- 3.5 Clientes com empréstimos ativos
-- Clientes que estão com pelo menos um livro, e quantos livros cada um
-- tem em mãos.
-- Recursos: INNER JOIN, WHERE, GROUP BY, COUNT, ORDER BY.
-- ---------------------------------------------------------------------
SELECT
    c.id,
    c.nome          AS cliente,
    c.email,
    COUNT(e.id)     AS emprestimos_ativos
FROM clientes c
INNER JOIN emprestimos e ON e.cliente_id = c.id
WHERE e.data_devolucao IS NULL
GROUP BY c.id, c.nome, c.email
ORDER BY emprestimos_ativos DESC, c.nome;

-- ---------------------------------------------------------------------
-- 3.6 Extra: os 3 livros mais emprestados
-- Ranking dos livros com mais empréstimos, limitado a três linhas.
-- Recursos: INNER JOIN, GROUP BY, COUNT, ORDER BY, LIMIT.
-- ---------------------------------------------------------------------
SELECT
    l.titulo         AS livro,
    COUNT(e.id)      AS total_emprestimos
FROM livros l
INNER JOIN emprestimos e ON e.livro_id = l.id
GROUP BY l.id, l.titulo
ORDER BY total_emprestimos DESC, l.titulo
LIMIT 3;