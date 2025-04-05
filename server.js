// server.js - Arquivo principal do servidor

require('dotenv').config(); // Para carregar variáveis de ambiente de um arquivo .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/db');
const veiculosRoutes = require('./routes/veiculos');
const intervencoesRoutes = require('./routes/intervencoes'); // Você precisará criar este arquivo
const usuariosRoutes = require('./routes/usuarios'); // Você precisará criar este arquivo
const authRoutes = require('./routes/auth'); // Você precisará criar este arquivo para login

const app = express();
const PORT = process.env.PORT || 3000;

// Testar conexão com o banco de dados
testConnection();

// Middlewares
app.use(cors()); // Permitir requisições de diferentes origens
app.use(express.json()); // Para fazer parse de JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Para fazer parse de dados de formulários

app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/api/veiculos', veiculosRoutes);
app.use('/api/intervencoes', intervencoesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes); // Para login e registro

// Rota de teste
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// Middleware para tratar rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

// Middleware para tratar erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensagem: 'Erro interno do servidor' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
