const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Buscar usuário pelo email
    const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }
    
    const usuario = usuarios[0];
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, funcao: usuario.funcao },
      process.env.JWT_SECRET || 'sua_chave_secreta_temporaria',
      { expiresIn: '24h' }
    );
    
    // Remover senha antes de enviar resposta
    const { senha: _, ...usuarioSemSenha } = usuario;
    
    res.json({
      token,
      usuario: usuarioSemSenha
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ mensagem: 'Erro ao processar o login' });
  }
});

// Verificar usuário autenticado
router.get('/me', auth, async (req, res) => {
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
    console.error('Erro ao buscar usuário autenticado:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar usuário' });
  }
});

module.exports = router;