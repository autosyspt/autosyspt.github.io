const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Verificar se o usuário é administrador
const isAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.funcao === 'admin') {
    return next();
  }
  return res.status(403).json({ mensagem: 'Acesso negado. Permissão insuficiente.' });
};

// Obter todos os usuários (apenas admin)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const itensPorPagina = 10;
    const offset = (pagina - 1) * itensPorPagina;
    const termoPesquisa = req.query.pesquisa || '';
    
    let sqlQuery = `
      SELECT id, nome, email, funcao, ativo, data_criacao, ultimo_acesso
      FROM usuarios
      WHERE (nome LIKE ? OR email LIKE ?)
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total
      FROM usuarios
      WHERE (nome LIKE ? OR email LIKE ?)
    `;
    
    const termo = `%${termoPesquisa}%`;
    
    // Executar consultas
    const [rows] = await pool.execute(sqlQuery + ` ORDER BY nome LIMIT ? OFFSET ?`, [termo, termo, itensPorPagina, offset]);
    const [countResult] = await pool.execute(countQuery, [termo, termo]);
    
    const totalItems = countResult[0].total;
    const totalPaginas = Math.ceil(totalItems / itensPorPagina);
    
    res.json({
      usuarios: rows,
      totalPaginas: totalPaginas,
      paginaAtual: pagina
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar usuários' });
  }
});

// Obter um usuário específico pelo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const usuarioId = req.params.id;
    
    // Apenas administradores podem ver outros usuários
    if (req.usuario.funcao !== 'admin' && req.usuario.id !== parseInt(usuarioId)) {
      return res.status(403).json({ mensagem: 'Acesso negado. Permissão insuficiente.' });
    }
    
    const [rows] = await pool.execute(
      `SELECT id, nome, email, funcao, ativo, data_criacao, ultimo_acesso 
       FROM usuarios WHERE id = ?`, 
      [usuarioId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    // Buscar intervenções relacionadas se for um técnico
    let intervencoes = [];
    if (rows[0].funcao === 'tecnico') {
      [intervencoes] = await pool.execute(
        `SELECT i.id, i.descricao, i.data_inicio, i.status, v.marca, v.modelo, v.matricula
         FROM intervencoes i
         JOIN veiculos v ON i.veiculo_id = v.id
         WHERE i.tecnico_id = ?
         ORDER BY i.data_inicio DESC
         LIMIT 10`, 
        [usuarioId]
      );
    }
    
    const usuario = {
      ...rows[0],
      intervencoes: intervencoes
    };
    
    res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar usuário' });
  }
});

// Criar um novo usuário (apenas admin)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { nome, email, senha, funcao } = req.body;
    
    // Validação
    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios' });
    }
    
    // Verificar se o e-mail já está em uso
    const [checkEmail] = await pool.execute('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (checkEmail.length > 0) {
      return res.status(400).json({ mensagem: 'Este e-mail já está registrado' });
    }
    
    // Verificar se a função é válida
    const funcoesValidas = ['admin', 'tecnico', 'recepcao', 'visualizador'];
    if (funcao && !funcoesValidas.includes(funcao)) {
      return res.status(400).json({ 
        mensagem: 'Função inválida. Use: admin, tecnico, recepcao ou visualizador' 
      });
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(senha, salt);
    
    // Inserir usuário
    const query = `
      INSERT INTO usuarios (nome, email, senha, funcao, ativo, data_criacao)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await pool.execute(query, [
      nome, 
      email, 
      hashSenha, 
      funcao || 'tecnico',
      true
    ]);
    
    res.status(201).json({
      id: result.insertId,
      mensagem: 'Usuário cadastrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
  }
});

// Atualizar um usuário existente
router.put('/:id', auth, async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const { nome, email, senha, funcao, ativo } = req.body;
    
    // Apenas administradores podem alterar outros usuários ou mudar funções
    const isOwnAccount = req.usuario.id === parseInt(usuarioId);
    if (!isOwnAccount && req.usuario.funcao !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado. Permissão insuficiente.' });
    }
    
    // Apenas admins podem mudar funções ou status de ativo
    if ((funcao || ativo !== undefined) && req.usuario.funcao !== 'admin') {
      return res.status(403).json({ mensagem: 'Apenas administradores podem alterar funções ou status' });
    }
    
    // Verificar se o usuário existe
    const [checkUsuario] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
    if (checkUsuario.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    // Verificar se o e-mail já está em uso por outro usuário
    if (email) {
      const [checkEmail] = await pool.execute(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?', 
        [email, usuarioId]
      );
      if (checkEmail.length > 0) {
        return res.status(400).json({ mensagem: 'Este e-mail já está em uso por outro usuário' });
      }
    }
    
    // Construir a query base
    let query = 'UPDATE usuarios SET ';
    const params = [];
    const updates = [];
    
    // Adicionar campos à atualização
    if (nome) {
      updates.push('nome = ?');
      params.push(nome);
    }
    
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      const hashSenha = await bcrypt.hash(senha, salt);
      updates.push('senha = ?');
      params.push(hashSenha);
    }
    
    if (funcao && req.usuario.funcao === 'admin') {
      // Verificar se a função é válida
      const funcoesValidas = ['admin', 'tecnico', 'recepcao', 'visualizador'];
      if (!funcoesValidas.includes(funcao)) {
        return res.status(400).json({ 
          mensagem: 'Função inválida. Use: admin, tecnico, recepcao ou visualizador' 
        });
      }
      updates.push('funcao = ?');
      params.push(funcao);
    }
    
    if (ativo !== undefined && req.usuario.funcao === 'admin') {
      updates.push('ativo = ?');
      params.push(ativo);
    }
    
    // Se não há campos para atualizar
    if (updates.length === 0) {
      return res.status(400).json({ mensagem: 'Nenhum campo para atualizar' });
    }
    
    // Finalizar a query
    query += updates.join(', ') + ' WHERE id = ?';
    params.push(usuarioId);
    
    await pool.execute(query, params);
    
    res.json({ mensagem: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar usuário' });
  }
});

// Excluir um usuário (apenas admin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const usuarioId = req.params.id;
    
    // Verificar se o usuário existe
    const [checkUsuario] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [usuarioId]);
    if (checkUsuario.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    // Verificar se não está tentando excluir a si mesmo
    if (req.usuario.id === parseInt(usuarioId)) {
      return res.status(400).json({ mensagem: 'Você não pode excluir sua própria conta' });
    }
    
    // Verificar se há intervenções associadas a este técnico
    const [checkIntervencoes] = await pool.execute(
      'SELECT COUNT(*) AS total FROM intervencoes WHERE tecnico_id = ?',
      [usuarioId]
    );
    
    // Se houver intervenções, impedir exclusão e oferecer alternativa
    if (checkIntervencoes[0].total > 0) {
      return res.status(400).json({ 
        mensagem: 'Este usuário possui intervenções associadas. Desative a conta em vez de excluí-la.'
      });
    }
    
    // Excluir o usuário
    await pool.execute('DELETE FROM usuarios WHERE id = ?', [usuarioId]);
    
    res.json({ mensagem: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ mensagem: 'Erro ao excluir usuário' });
  }
});

// Atualizar a senha do próprio usuário
router.post('/alterar-senha', auth, async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    const usuarioId = req.usuario.id;
    
    // Validação
    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ mensagem: 'Senha atual e nova senha são obrigatórias' });
    }
    
    // Verificar senha atual
    const [usuario] = await pool.execute('SELECT senha FROM usuarios WHERE id = ?', [usuarioId]);
    
    if (usuario.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }
    
    const senhaValida = await bcrypt.compare(senha_atual, usuario[0].senha);
    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Senha atual incorreta' });
    }
    
    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const hashSenha = await bcrypt.hash(nova_senha, salt);
    
    // Atualizar senha
    await pool.execute('UPDATE usuarios SET senha = ? WHERE id = ?', [hashSenha, usuarioId]);
    
    res.json({ mensagem: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ mensagem: 'Erro ao alterar senha' });
  }
});

// Obter lista de técnicos para seleção em formulários
router.get('/lista/tecnicos', auth, async (req, res) => {
  try {
    const [tecnicos] = await pool.execute(
      `SELECT id, nome, email FROM usuarios WHERE funcao = 'tecnico' AND ativo = true ORDER BY nome`
    );
    
    res.json(tecnicos);
  } catch (error) {
    console.error('Erro ao buscar lista de técnicos:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar lista de técnicos' });
  }
});

module.exports = router;