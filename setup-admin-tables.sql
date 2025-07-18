-- Use the existing autosyspt schema
USE `autosyspt`;

-- Update carro table to ensure it has all needed columns
ALTER TABLE `carro` 
ADD COLUMN IF NOT EXISTS `jantes` VARCHAR(50) NULL DEFAULT NULL;

-- Sample interventions data (using existing table structure)
INSERT IGNORE INTO `intervencao` (`carro_id`, `nome`, `descricao`, `data_inter`) VALUES
(1, 'Manutenção Preventiva', 'Troca de óleo e filtros', '2025-01-10'),
(1, 'Serviços Elétricos e Eletrônicos', 'Verificação do sistema elétrico', '2025-01-15'),
(2, 'Manutenção Corretiva', 'Reparo no sistema de freios', '2025-01-12');

-- Ensure we have some sample cars
INSERT IGNORE INTO `carro` (`id`, `matricula`, `modelo`, `marca`, `ano`, `cor`, `pneus`) VALUES
(1, '12-AB-34', 'Civic', 'Honda', 2020, 'Azul', 'Michelin 205/55R16'),
(2, '56-CD-78', 'Golf', 'Volkswagen', 2019, 'Preto', 'Continental 225/45R17'),
(3, '90-EF-12', 'Corolla', 'Toyota', 2021, 'Branco', 'Bridgestone 215/60R16');
