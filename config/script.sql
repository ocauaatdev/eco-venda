-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: localhost    Database: ecovenda
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `idAdmin` int NOT NULL,
  `emailAdmin` varchar(45) NOT NULL,
  `senhaAdmin` char(80) NOT NULL,
  `nomeAdmin` varchar(45) NOT NULL,
  PRIMARY KEY (`idAdmin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assinatura`
--

DROP TABLE IF EXISTS `assinatura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assinatura` (
  `idAssinatura` int NOT NULL,
  `ini_vigencia` date DEFAULT NULL,
  `fim_vigencia` date DEFAULT NULL,
  `Clientes_idClientes` int NOT NULL,
  `Plano_idPlano` int NOT NULL,
  PRIMARY KEY (`idAssinatura`),
  KEY `fk_Assinatura_Clientes1_idx` (`Clientes_idClientes`),
  KEY `fk_Assinatura_Plano1_idx` (`Plano_idPlano`),
  CONSTRAINT `fk_Assinatura_Clientes1` FOREIGN KEY (`Clientes_idClientes`) REFERENCES `clientes` (`idClientes`),
  CONSTRAINT `fk_Assinatura_Plano1` FOREIGN KEY (`Plano_idPlano`) REFERENCES `plano` (`idPlano`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assinatura`
--

LOCK TABLES `assinatura` WRITE;
/*!40000 ALTER TABLE `assinatura` DISABLE KEYS */;
/*!40000 ALTER TABLE `assinatura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `idCategorias` int NOT NULL,
  `nomeCategoria` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idCategorias`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `idClientes` int NOT NULL AUTO_INCREMENT,
  `celularCliente` varchar(14) NOT NULL,
  `nomeCliente` varchar(45) NOT NULL,
  `cpfCliente` char(14) NOT NULL,
  `emailCliente` varchar(45) NOT NULL,
  `senhaCliente` char(60) NOT NULL,
  `data_nascCliente` date NOT NULL,
  `logradouroCliente` varchar(45) DEFAULT NULL,
  `bairroCliente` varchar(30) DEFAULT NULL,
  `cidadeCliente` varchar(30) DEFAULT NULL,
  `ufCliente` char(2) DEFAULT NULL,
  `cepCliente` char(9) NOT NULL,
  PRIMARY KEY (`idClientes`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'(11)11111-1111','teste','111.111.111-11','teste@teste.com','$2a$12$pn4/3yAtDpxvCb/qxMGD9.iEF9MKFictgbd8ER4XN2tC7HoCUa9hm','2011-11-20',NULL,NULL,NULL,NULL,'11111-111');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cupons`
--

DROP TABLE IF EXISTS `cupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cupons` (
  `idCupons` int NOT NULL,
  `descontoCupons` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idCupons`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cupons`
--

LOCK TABLES `cupons` WRITE;
/*!40000 ALTER TABLE `cupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `cupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresas`
--

DROP TABLE IF EXISTS `empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresas` (
  `idEmpresas` int NOT NULL AUTO_INCREMENT,
  `razaoSocial` varchar(45) NOT NULL,
  `celularEmpresa` varchar(14) NOT NULL,
  `emailEmpresa` varchar(45) NOT NULL,
  `senhaEmpresa` char(60) NOT NULL,
  `cpnjempresa` varchar(20) NOT NULL,
  `logradouroEmpresa` varchar(45) DEFAULT NULL,
  `bairroEmpresa` varchar(30) DEFAULT NULL,
  `cidadeEmpresa` varchar(30) DEFAULT NULL,
  `ufEmpresa` char(2) DEFAULT NULL,
  `cepEmpresa` char(9) NOT NULL,
  PRIMARY KEY (`idEmpresas`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresas`
--

LOCK TABLES `empresas` WRITE;
/*!40000 ALTER TABLE `empresas` DISABLE KEYS */;
/*!40000 ALTER TABLE `empresas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item pedido`
--

DROP TABLE IF EXISTS `item pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item pedido` (
  `idItem pedido` int NOT NULL,
  `produtos_das_empresas_idProd` int NOT NULL,
  `Pedidos_idPedidos` int NOT NULL,
  `qtde` varchar(45) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`idItem pedido`),
  KEY `fk_Item pedido_produtos_das_empresas1_idx` (`produtos_das_empresas_idProd`),
  KEY `fk_Item pedido_Pedidos1_idx` (`Pedidos_idPedidos`),
  CONSTRAINT `fk_Item pedido_Pedidos1` FOREIGN KEY (`Pedidos_idPedidos`) REFERENCES `pedidos` (`idPedidos`),
  CONSTRAINT `fk_Item pedido_produtos_das_empresas1` FOREIGN KEY (`produtos_das_empresas_idProd`) REFERENCES `produtos_das_empresas` (`idProd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item pedido`
--

LOCK TABLES `item pedido` WRITE;
/*!40000 ALTER TABLE `item pedido` DISABLE KEYS */;
/*!40000 ALTER TABLE `item pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `idPedidos` int NOT NULL,
  `prazoPedido` date DEFAULT NULL,
  `Clientes_idClientes` int NOT NULL,
  `data_pedido` date DEFAULT NULL,
  `total_pedido` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idPedidos`),
  KEY `fk_Pedidos_Clientes1_idx` (`Clientes_idClientes`),
  CONSTRAINT `fk_Pedidos_Clientes1` FOREIGN KEY (`Clientes_idClientes`) REFERENCES `clientes` (`idClientes`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plano`
--

DROP TABLE IF EXISTS `plano`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plano` (
  `idPlano` int NOT NULL,
  `nome` varchar(45) DEFAULT NULL,
  `descricao` varchar(45) DEFAULT NULL,
  `valor` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`idPlano`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plano`
--

LOCK TABLES `plano` WRITE;
/*!40000 ALTER TABLE `plano` DISABLE KEYS */;
/*!40000 ALTER TABLE `plano` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plano_cupons`
--

DROP TABLE IF EXISTS `plano_cupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plano_cupons` (
  `Plano_idPlano` int NOT NULL,
  `Cupons_idCupons` int NOT NULL,
  `tdeCupons` int DEFAULT NULL,
  KEY `fk_Plano_has_Cupons_Cupons1_idx` (`Cupons_idCupons`),
  KEY `fk_Plano_has_Cupons_Plano1_idx` (`Plano_idPlano`),
  CONSTRAINT `fk_Plano_has_Cupons_Cupons1` FOREIGN KEY (`Cupons_idCupons`) REFERENCES `cupons` (`idCupons`),
  CONSTRAINT `fk_Plano_has_Cupons_Plano1` FOREIGN KEY (`Plano_idPlano`) REFERENCES `plano` (`idPlano`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plano_cupons`
--

LOCK TABLES `plano_cupons` WRITE;
/*!40000 ALTER TABLE `plano_cupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `plano_cupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtos_das_empresas`
--

DROP TABLE IF EXISTS `produtos_das_empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtos_das_empresas` (
  `idProd` int NOT NULL AUTO_INCREMENT,
  `descricaoProd` text,
  `valorProd` decimal(5,2) NOT NULL,
  `qtdeEstoque` varchar(35) NOT NULL,
  `marcaProd` varchar(40) DEFAULT NULL,
  `tituloProd` varchar(50) NOT NULL,
  `modeloProd` varchar(45) DEFAULT NULL,
  `corProd` varchar(45) DEFAULT NULL,
  `tamanhoProd` varchar(45) DEFAULT NULL,
  `Empresas_idEmpresas` int NOT NULL,
  `Categorias_idCategorias` int NOT NULL,
  `imagemProd` longblob,
  PRIMARY KEY (`idProd`),
  KEY `fk_produtos_das_empresas_Empresas1_idx` (`Empresas_idEmpresas`),
  KEY `fk_produtos_das_empresas_Categorias1_idx` (`Categorias_idCategorias`),
  CONSTRAINT `fk_produtos_das_empresas_Categorias1` FOREIGN KEY (`Categorias_idCategorias`) REFERENCES `categorias` (`idCategorias`),
  CONSTRAINT `fk_produtos_das_empresas_Empresas1` FOREIGN KEY (`Empresas_idEmpresas`) REFERENCES `empresas` (`idEmpresas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos_das_empresas`
--

LOCK TABLES `produtos_das_empresas` WRITE;
/*!40000 ALTER TABLE `produtos_das_empresas` DISABLE KEYS */;
/*!40000 ALTER TABLE `produtos_das_empresas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-04 11:47:04
