// routes/veiculos.js - Implementação das rotas/endpoints da API para veículos

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth'); // Middleware para verificar autenticação

// Obter todos os veículos com paginação e pesquisa
router.get('/', auth, async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const itensPorPagina = 10; // Define quantos itens por página
    const offset = (pagina - 1) * itensPorPagina;
    const termoPesquisa = req.query.pesquisa || '';
    
    let sqlQuery = `
      SELECT * FROM veiculos 
      WHERE marca LIKE ? OR modelo LIKE ? OR matricula LIKE ?
      LIMIT ? OFFSET ?
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total FROM veiculos 
      WHERE marca LIKE ? OR modelo LIKE ? OR matricula LIKE ?
    `;
    
    const termo = `%${termoPesquisa}%`;
    
    // Executar consulta para obter veículos
    const [rows] = await pool.execute(sqlQuery, [termo, termo, termo, itensPorPagina, offset]);
    
    // Executar consulta para obter contagem total para paginação
    const [countResult] = await pool.execute(countQuery, [termo, termo, termo]);
    const totalItems = countResult[0].total;
    const totalPaginas = Math.ceil(totalItems / itensPorPagina);
    
    res.json({
      veiculos: rows,
      totalPaginas: totalPaginas,
      paginaAtual: pagina
    });
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar veículos' });
  }
});

// Obter um veículo específico pelo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const veiculoId = req.params.id;
    const [rows] = await pool.execute('SELECT * FROM veiculos WHERE id = ?', [veiculoId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar veículo' });
  }
});

// Criar um novo veículo
router.post('/', auth, async (req, res) => {
  try {
    const { marca, modelo, ano, cor, matricula, vin, imagem, pneus, jante } = req.body;
    
    // Validação básica
    if (!marca || !modelo || !matricula) {
      return res.status(400).json({ mensagem: 'Marca, modelo e matrícula são obrigatórios' });
    }
    
    const query = `
      INSERT INTO veiculos (marca, modelo, ano, cor, matricula, vin, imagem, pneus, jante)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      marca, modelo, ano, cor, matricula, vin, imagem, pneus, jante
    ]);
    
    res.status(201).json({
      id: result.insertId,
      mensagem: 'Veículo cadastrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cadastrar veículo:', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar veículo' });
  }
});

// Atualizar um veículo existente
router.put('/:id', auth, async (req, res) => {
  try {
    const veiculoId = req.params.id;
    const { marca, modelo, ano, cor, matricula, vin, imagem, pneus, jante } = req.body;
    
    // Validação básica
    if (!marca || !modelo || !matricula) {
      return res.status(400).json({ mensagem: 'Marca, modelo e matrícula são obrigatórios' });
    }
    
    // Verificar se o veículo existe
    const [checkVeiculo] = await pool.execute('SELECT id FROM veiculos WHERE id = ?', [veiculoId]);
    if (checkVeiculo.length === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado' });
    }
    
    const query = `
      UPDATE veiculos
      SET marca = ?, modelo = ?, ano = ?, cor = ?, matricula = ?, 
          vin = ?, imagem = ?, pneus = ?, jante = ?
      WHERE id = ?
    `;
    
    await pool.execute(query, [
      marca, modelo, ano, cor, matricula, vin, imagem, pneus, jante, veiculoId
    ]);
    
    res.json({ mensagem: 'Veículo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar veículo' });
  }
});

// Excluir um veículo
router.delete('/:id', auth, async (req, res) => {
  try {
    const veiculoId = req.params.id;
    
    // Verificar se o veículo existe
    const [checkVeiculo] = await pool.execute('SELECT id FROM veiculos WHERE id = ?', [veiculoId]);
    if (checkVeiculo.length === 0) {
      return res.status(404).json({ mensagem: 'Veículo não encontrado' });
    }
    
    // Verificar se existem intervenções associadas a este veículo
    const [checkIntervencoes] = await pool.execute(
      'SELECT id FROM intervencoes WHERE veiculo_id = ?', 
      [veiculoId]
    );
    
    if (checkIntervencoes.length > 0) {
      return res.status(400).json({ 
        mensagem: 'Este veículo possui intervenções associadas e não pode ser excluído' 
      });
    }
    
    await pool.execute('DELETE FROM veiculos WHERE id = ?', [veiculoId]);
    
    res.json({ mensagem: 'Veículo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir veículo:', error);
    res.status(500).json({ mensagem: 'Erro ao excluir veículo' });
  }
});

module.exports = router;
