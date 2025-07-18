const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ mensagem: 'Token de autenticação não fornecido' });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      funcao: decoded.funcao
    };
    
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensagem: 'Token expirado' });
    }
    
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
};