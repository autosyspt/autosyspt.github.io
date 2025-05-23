const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexão ao banco de dados estabelecida com sucesso');
        connection.release();
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error.message);
    }
}

module.exports = { pool, testConnection };