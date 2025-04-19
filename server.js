const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();
console.log('Variáveis de ambiente carregadas', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET ? 'Definido' : 'NÃO DEFINIDO'
});

// Configurações
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_temporaria';

// Pool de conexão MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'autosys',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de autenticação
// Middleware de autenticação
const auth = async (req, res, next) => {
  try {
    console.log('Headers de autenticação:', req.headers);
    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('Cabeçalho de autorização ausente');
      return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
    }
    
    console.log('Cabeçalho de autorização:', authHeader);
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      console.log('Formato de token inválido (deve ser "Bearer TOKEN")');
      return res.status(401).json({ mensagem: 'Formato de token inválido' });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      console.log('Formato de autenticação inválido (não começa com "Bearer ")');
      return res.status(401).json({ mensagem: 'Formato de token inválido' });
    }
    
    if (!token) {
      console.log('Token não fornecido após "Bearer"');
      return res.status(401).json({ mensagem: 'Token não fornecido' });
    }
    
    console.log('Token recebido:', token.substring(0, 20) + '...');
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verificado com sucesso:', decoded);
      req.usuario = decoded;
      return next();
    } catch (jwtError) {
      console.error('Erro ao verificar JWT:', jwtError);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ mensagem: 'Token expirado' });
      }
      return res.status(401).json({ mensagem: 'Token inválido' });
    }
  } catch (error) {
    console.error('Erro geral no middleware de autenticação:', error);
    return res.status(500).json({ mensagem: 'Erro interno no servidor' });
  }
};

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('Tentativa de login:', email);
    
    // Verificação básica de campos
    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });
    }
    
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      console.log(`Usuário não encontrado: ${email}`);
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }
    
    const usuario = usuarios[0];
    
    // Para ambiente de desenvolvimento, aceitar senha fixa para admin
    let senhaValida = false;
    
    if (email === 'admin@autosys.com' && senha === 'admin123') {
      console.log('Login admin com senha padrão');
      senhaValida = true;
    } else {
      try {
        senhaValida = await bcrypt.compare(senha, usuario.senha);
      } catch (bcryptError) {
        console.error('Erro ao verificar senha:', bcryptError);
      }
    }
    
    if (!senhaValida) {
      console.log(`Senha inválida para ${email}`);
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, funcao: usuario.funcao },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    console.log(`Login bem-sucedido: ${email}`);
    
    res.json({
      token,
      usuario: usuarioSemSenha
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ mensagem: 'Erro ao processar o login' });
  }
});

// Rota para obter usuário autenticado
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nome, email, funcao, imagem FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    res.json(usuarios[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar usuário' });
  }
});

// Rota para obter veículos
app.get('/api/veiculos', auth, async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const itensPorPagina = 10;
    const offset = (pagina - 1) * itensPorPagina;
    const termoPesquisa = req.query.pesquisa || '';
    
    console.log(`Buscando veículos: página ${pagina}, termo: ${termoPesquisa}`);
    
    const termo = `%${termoPesquisa}%`;
    
    const [veiculos] = await pool.query(
      `SELECT * FROM veiculos 
       WHERE marca LIKE ? OR modelo LIKE ? OR matricula LIKE ?
       ORDER BY id DESC LIMIT ? OFFSET ?`,
      [termo, termo, termo, itensPorPagina, offset]
    );
    
    const [contagem] = await pool.query(
      `SELECT COUNT(*) as total FROM veiculos 
       WHERE marca LIKE ? OR modelo LIKE ? OR matricula LIKE ?`,
      [termo, termo, termo]
    );
    
    const totalPaginas = Math.ceil(contagem[0].total / itensPorPagina);
    
    console.log(`Encontrados ${veiculos.length} veículos, total: ${contagem[0].total}`);
    
    res.json({
      veiculos,
      paginaAtual: pagina,
      totalPaginas
    });
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar veículos', erro: error.message });
  }
});

// Cadastrar veículos
app.post('/api/veiculos', auth, async (req, res) => {
  try {
    const { marca, modelo, ano, cor, matricula, vin, pneus, jante } = req.body;
    
    if (!marca || !modelo || !matricula) {
      return res.status(400).json({ mensagem: 'Marca, modelo e matrícula são obrigatórios' });
    }
    
    // Verificar se a matrícula já está em uso
    const [checkMatricula] = await pool.query('SELECT id FROM veiculos WHERE matricula = ?', [matricula]);
    
    if (checkMatricula.length > 0) {
      return res.status(400).json({ mensagem: 'Matrícula já cadastrada' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO veiculos (marca, modelo, ano, cor, matricula, vin, pneus, jante) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [marca, modelo, ano || null, cor || null, matricula, vin || null, pneus || null, jante || null]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      mensagem: 'Veículo cadastrado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao cadastrar veículo:', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar veículo', erro: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Testar conexão com o banco
pool.query('SELECT 1')
  .then(() => console.log('Conexão com MySQL estabelecida'))
  .catch(err => console.error('Erro ao conectar com MySQL:', err));