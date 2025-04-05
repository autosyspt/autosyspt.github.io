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
    
    // Validação básica
    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios' });
    }
    
    // Buscar usuário pelo email
    const [usuarios] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }
    
    const usuario = usuarios[0];
    
    // Verificar se a conta está ativa
    if (!usuario.ativo) {
      return res.status(401).json({ mensagem: 'Conta desativada. Contacte o administrador.' });
    }
    
    // Comparar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email,
        nome: usuario.nome,
        funcao: usuario.funcao
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );
    
    // Atualizar último acesso
    await pool.execute('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = ?', [usuario.id]);
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        funcao: usuario.funcao
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ mensagem: 'Erro ao processar login' });
  }
});

// Verificar token e obter dados do usuário atual
router.get('/me', auth, async (req, res) => {
  try {
    const [usuario] = await pool.execute(
      `SELECT id, nome, email, funcao, ativo, data_criacao, ultimo_acesso 
       FROM usuarios WHERE id = ?`, 
      [req.usuario.id]
    );
    
    if (usuario.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    res.json(usuario[0]);
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({ mensagem: 'Erro ao obter dados do usuário' });
  }
});

// Requisitar redefinição de senha
router.post('/esqueci-senha', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ mensagem: 'E-mail é obrigatório' });
    }
    
    // Verificar se o e-mail existe
    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    
    if (usuarios.length === 0) {
      // Não informar ao usuário se o e-mail existe ou não por motivos de segurança
      return res.json({ mensagem: 'Se o e-mail estiver registrado, você receberá instruções para redefinir sua senha.' });
    }
    
    const usuarioId = usuarios[0].id;
    
    // Gerar token de redefinição (expira em 1 hora)
    const resetToken = jwt.sign(
      { id: usuarioId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Salvar token no banco
    await pool.execute(
      'UPDATE usuarios SET reset_token = ?, reset_expiracao = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, usuarioId]
    );
    
  
    
    res.json({ 
      mensagem: 'Se o e-mail estiver registrado, você receberá instruções para redefinir sua senha.',
      // Remova a linha abaixo em ambiente de produção:
      resetToken: resetToken // Isso é apenas para facilitar o teste em desenvolvimento
    });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({ mensagem: 'Erro ao processar solicitação' });
  }
});

// Redefinir senha com token
router.post('/redefinir-senha', async (req, res) => {
  try {
    const { token, nova_senha } = req.body;
    
    if (!token || !nova_senha) {
      return res.status(400).json({ mensagem: 'Token e nova senha são obrigatórios' });
    }
    
    let decoded;
    try {
      // Verificar se o token é válido
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ mensagem: 'Token inválido ou expirado' });
    }
    
    // Verificar se o token existe no banco e não expirou
    const [usuarios] = await pool.execute(
      'SELECT id FROM usuarios WHERE id = ? AND reset_token = ? AND reset_expiracao > NOW()',
      [decoded.id, token]
    );
    
    if (usuarios.length === 0) {
      return res.status(400).json({ mensagem: 'Token inválido ou expirado' });
    }
    
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(nova_senha, salt);
    
    // Atualizar a senha e limpar o token
    await pool.execute(
      'UPDATE usuarios SET senha = ?, reset_token = NULL, reset_expiracao = NULL WHERE id = ?',
      [hashSenha, decoded.id]
    );
    
    res.json({ mensagem: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ mensagem: 'Erro ao redefinir senha' });
  }
});

module.exports = router;