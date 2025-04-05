const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Verificar se há um cabeçalho de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
    }
    
    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ mensagem: 'Formato de token inválido' });
    }
    
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ mensagem: 'Formato de token inválido' });
    }
    
    // Verificar o token - AQUI USAMOS A VARIÁVEL DE AMBIENTE
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar as informações do usuário na requisição
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      funcao: decoded.funcao
    };
    
    // Verificar se o usuário é admin para rotas restritas
    if (req.originalUrl.includes('/admin') && req.usuario.funcao !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado. Permissão insuficiente.' });
    }
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensagem: 'Token expirado' });
    }
    
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
};