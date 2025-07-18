
CREATE SCHEMA IF NOT EXISTS `autosyspt` DEFAULT CHARACTER SET utf8mb4 ;
USE `autosyspt` ;

SELECT * FROM Usr;


CREATE TABLE IF NOT EXISTS `autosyspt`.`carro` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `modelo` VARCHAR(50) NULL DEFAULT NULL,
  `marca` VARCHAR(50) NULL DEFAULT NULL,
  `ano` YEAR(4) NULL DEFAULT NULL,
  `cor` VARCHAR(50) NULL DEFAULT NULL,
  `pneus` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

CREATE TABLE IF NOT EXISTS `autosyspt`.`usr` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(200) NOT NULL,
  `nome` VARCHAR(200) NULL DEFAULT NULL,
  `palavra` VARCHAR(100) NULL DEFAULT NULL,
  `permissao` ENUM('user', 'mec', 'manager') NOT NULL DEFAULT 'user',
  `imagem` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `autosyspt`.`mec`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `autosyspt`.`mec` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `usr_id` INT(11) NOT NULL,
  `especialidade` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `usr_id` (`usr_id` ASC) VISIBLE,
  CONSTRAINT `mec_ibfk_1`
    FOREIGN KEY (`usr_id`)
    REFERENCES `autosyspt`.`usr` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `autosyspt`.`intervencao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `autosyspt`.`intervencao` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `carro_id` INT(11) NOT NULL,
  `mec_id` INT(11) NULL DEFAULT NULL,
  `nome` VARCHAR(200) NULL DEFAULT NULL,
  `descricao` TEXT NULL DEFAULT NULL,
  `data_inter` DATE NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `carro_id` (`carro_id` ASC) VISIBLE,
  INDEX `mec_id` (`mec_id` ASC) VISIBLE,
  CONSTRAINT `intervencao_ibfk_1`
    FOREIGN KEY (`carro_id`)
    REFERENCES `autosyspt`.`carro` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `intervencao_ibfk_2`
    FOREIGN KEY (`mec_id`)
    REFERENCES `autosyspt`.`mec` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `autosyspt`.`manager`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `autosyspt`.`manager` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `usr_id` INT(11) NOT NULL,
  `nivel` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `usr_id` (`usr_id` ASC) VISIBLE,
  CONSTRAINT `manager_ibfk_1`
    FOREIGN KEY (`usr_id`)
    REFERENCES `autosyspt`.`usr` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


UPDATE Usr
SET palavra = '$2y$10$zvK4qKZK0Jtqf9vQDezLmeUWDo9TZxXYpG5NQqTPtv5nHXAO30h8O'
WHERE email = 'utilizador@email.com';

