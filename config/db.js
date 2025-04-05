// config/db.js - Arquivo de configuração do banco de dados

const mysql = require('mysql2/promise');

// Configurações de conexão com o banco de dados
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Criar um pool de conexões para melhor performance
const pool = mysql.createPool(dbConfig);

// Testar a conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return false;
  }
}

// Exportar o pool de conexões e a função de teste
module.exports = {
  pool,
  testConnection
};