CREATE DATABASE IF NOT EXISTS autosys;
USE autosys;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  funcao ENUM('admin', 'tecnico', 'recepcao', 'visualizador') DEFAULT 'visualizador',
  ativo BOOLEAN DEFAULT true,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso DATETIME NULL,
  reset_token VARCHAR(255) NULL,
  reset_expiracao DATETIME NULL,
  imagem VARCHAR(255) NULL
);

-- Tabela de veículos
CREATE TABLE IF NOT EXISTS veiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INT NULL,
  cor VARCHAR(30) NULL,
  matricula VARCHAR(20) NOT NULL UNIQUE,
  vin VARCHAR(50) NULL,
  imagem VARCHAR(255) NULL,
  pneus VARCHAR(50) NULL,
  jante VARCHAR(50) NULL,
  km INT DEFAULT 0,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de intervenções
CREATE TABLE IF NOT EXISTS intervencoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  veiculo_id INT NOT NULL,
  tecnico_id INT NULL,
  descricao TEXT NOT NULL,
  diagnostico TEXT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NULL,
  status VARCHAR(20) DEFAULT 'Pendente',
  km_atual INT DEFAULT 0,
  observacoes TEXT NULL,
  custo_total DECIMAL(10,2) DEFAULT 0.00,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (veiculo_id) REFERENCES veiculos(id),
  FOREIGN KEY (tecnico_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  intervencao_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (intervencao_id) REFERENCES intervencoes(id) ON DELETE CASCADE
);

-- Tabela de peças
CREATE TABLE IF NOT EXISTS pecas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  intervencao_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (intervencao_id) REFERENCES intervencoes(id) ON DELETE CASCADE
);

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, funcao, ativo) 
VALUES ('Administrador', 'admin@autosys.com', '$2b$10$9D9xYE.hITrRKuYgZ6sH9.4baTbPGCJ7S6O8JZN6n44QyDFBzP9a.', 'admin', true)
ON DUPLICATE KEY UPDATE id=id;

-- Inserir alguns veículos e intervenções de exemplo
INSERT INTO veiculos (marca, modelo, ano, cor, matricula, pneus, jante) VALUES
('Toyota', 'Corolla', 2020, 'Branco', 'AA-11-BB', '205/55R16', '16'),
('BMW', 'X5', 2019, 'Preto', 'CC-22-DD', '255/50R19', '19'),
('Audi', 'A4', 2021, 'Cinza', 'EE-33-FF', '225/45R17', '17')
ON DUPLICATE KEY UPDATE id=id;