const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Obter todas as intervenções com paginação e filtros
router.get('/', auth, async (req, res) => {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const itensPorPagina = 10;
    const offset = (pagina - 1) * itensPorPagina;
    const termoPesquisa = req.query.pesquisa || '';
    const veiculoId = req.query.veiculoId || null;
    const status = req.query.status || null;
    const dataInicio = req.query.dataInicio || null;
    const dataFim = req.query.dataFim || null;

    // Construir a query base
    let sqlQuery = `
      SELECT i.*, v.marca, v.modelo, v.matricula, u.nome AS tecnico_nome
      FROM intervencoes i
      LEFT JOIN veiculos v ON i.veiculo_id = v.id
      LEFT JOIN usuarios u ON i.tecnico_id = u.id
      WHERE 1=1
    `;

    let countQuery = `
      SELECT COUNT(*) as total
      FROM intervencoes i
      LEFT JOIN veiculos v ON i.veiculo_id = v.id
      LEFT JOIN usuarios u ON i.tecnico_id = u.id
      WHERE 1=1
    `;

    // Array para guardar os parâmetros
    const queryParams = [];
    const countParams = [];

    // Adicionar filtros conforme necessário
    if (termoPesquisa) {
      const termo = `%${termoPesquisa}%`;
      sqlQuery += ` AND (i.descricao LIKE ? OR v.matricula LIKE ? OR v.marca LIKE ? OR v.modelo LIKE ? OR u.nome LIKE ?)`;
      countQuery += ` AND (i.descricao LIKE ? OR v.matricula LIKE ? OR v.marca LIKE ? OR v.modelo LIKE ? OR u.nome LIKE ?)`;
      queryParams.push(termo, termo, termo, termo, termo);
      countParams.push(termo, termo, termo, termo, termo);
    }

    if (veiculoId) {
      sqlQuery += ` AND i.veiculo_id = ?`;
      countQuery += ` AND i.veiculo_id = ?`;
      queryParams.push(veiculoId);
      countParams.push(veiculoId);
    }

    if (status) {
      sqlQuery += ` AND i.status = ?`;
      countQuery += ` AND i.status = ?`;
      queryParams.push(status);
      countParams.push(status);
    }

    if (dataInicio) {
      sqlQuery += ` AND i.data_inicio >= ?`;
      countQuery += ` AND i.data_inicio >= ?`;
      queryParams.push(dataInicio);
      countParams.push(dataInicio);
    }

    if (dataFim) {
      sqlQuery += ` AND i.data_fim <= ?`;
      countQuery += ` AND i.data_fim <= ?`;
      queryParams.push(dataFim);
      countParams.push(dataFim);
    }

    // Adicionar ordenação e limites
    sqlQuery += ` ORDER BY i.data_inicio DESC LIMIT ? OFFSET ?`;
    queryParams.push(itensPorPagina, offset);

    // Executar consultas
    const [rows] = await pool.execute(sqlQuery, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    const totalItems = countResult[0].total;
    const totalPaginas = Math.ceil(totalItems / itensPorPagina);

    res.json({
      intervencoes: rows,
      totalPaginas: totalPaginas,
      paginaAtual: pagina,
      totalItems: totalItems
    });
  } catch (error) {
    console.error('Erro ao buscar intervenções:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar intervenções' });
  }
});

// Obter uma intervenção específica pelo ID
router.get('/:id', auth, async (req, res) => {
  try {
    const intervencaoId = req.params.id;
    const query = `
      SELECT i.*, v.marca, v.modelo, v.matricula, v.imagem AS veiculo_imagem, 
             u.nome AS tecnico_nome, u.email AS tecnico_email
      FROM intervencoes i
      LEFT JOIN veiculos v ON i.veiculo_id = v.id
      LEFT JOIN usuarios u ON i.tecnico_id = u.id
      WHERE i.id = ?
    `;
    
    const [rows] = await pool.execute(query, [intervencaoId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Intervenção não encontrada' });
    }

    // Buscar serviços relacionados a esta intervenção
    const [servicos] = await pool.execute(
      'SELECT * FROM servicos WHERE intervencao_id = ?',
      [intervencaoId]
    );

    // Buscar peças relacionadas a esta intervenção
    const [pecas] = await pool.execute(
      'SELECT * FROM pecas WHERE intervencao_id = ?',
      [intervencaoId]
    );

    // Montar objeto de resposta
    const intervencao = {
      ...rows[0],
      servicos: servicos,
      pecas: pecas
    };
    
    res.json(intervencao);
  } catch (error) {
    console.error('Erro ao buscar intervenção:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar intervenção' });
  }
});

// Criar uma nova intervenção
router.post('/', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      veiculo_id,
      tecnico_id,
      descricao,
      diagnostico,
      data_inicio,
      data_fim,
      status,
      km_atual,
      observacoes,
      servicos,
      pecas,
      custo_total
    } = req.body;
    
    // Validação básica
    if (!veiculo_id || !descricao) {
      return res.status(400).json({ mensagem: 'Veículo e descrição são obrigatórios' });
    }
    
    // Inserir a intervenção
    const queryIntervencao = `
      INSERT INTO intervencoes 
      (veiculo_id, tecnico_id, descricao, diagnostico, data_inicio, data_fim, status, km_atual, observacoes, custo_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultIntervencao] = await connection.execute(queryIntervencao, [
      veiculo_id,
      tecnico_id || null,
      descricao,
      diagnostico || null,
      data_inicio || new Date(),
      data_fim || null,
      status || 'Pendente',
      km_atual || 0,
      observacoes || null,
      custo_total || 0
    ]);
    
    const intervencaoId = resultIntervencao.insertId;
    
    // Inserir serviços relacionados, se houver
    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        await connection.execute(
          'INSERT INTO servicos (intervencao_id, nome, descricao, valor) VALUES (?, ?, ?, ?)',
          [intervencaoId, servico.nome, servico.descricao, servico.valor]
        );
      }
    }
    
    // Inserir peças relacionadas, se houver
    if (pecas && pecas.length > 0) {
      for (const peca of pecas) {
        await connection.execute(
          'INSERT INTO pecas (intervencao_id, nome, quantidade, valor_unitario) VALUES (?, ?, ?, ?)',
          [intervencaoId, peca.nome, peca.quantidade, peca.valor_unitario]
        );
      }
    }
    
    // Atualizar o odômetro do veículo, se km_atual for fornecido
    if (km_atual) {
      await connection.execute(
        'UPDATE veiculos SET km = ? WHERE id = ?',
        [km_atual, veiculo_id]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      id: intervencaoId,
      mensagem: 'Intervenção cadastrada com sucesso'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao cadastrar intervenção:', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar intervenção' });
  } finally {
    connection.release();
  }
});

// Atualizar uma intervenção existente
router.put('/:id', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const intervencaoId = req.params.id;
    const {
      tecnico_id,
      descricao,
      diagnostico,
      data_inicio,
      data_fim,
      status,
      km_atual,
      observacoes,
      servicos,
      pecas,
      custo_total
    } = req.body;
    
    // Validação básica
    if (!descricao) {
      return res.status(400).json({ mensagem: 'Descrição é obrigatória' });
    }
    
    // Verificar se a intervenção existe
    const [checkIntervencao] = await connection.execute(
      'SELECT id, veiculo_id FROM intervencoes WHERE id = ?',
      [intervencaoId]
    );
    
    if (checkIntervencao.length === 0) {
      return res.status(404).json({ mensagem: 'Intervenção não encontrada' });
    }
    
    const veiculoId = checkIntervencao[0].veiculo_id;
    
    // Atualizar a intervenção
    const queryIntervencao = `
      UPDATE intervencoes
      SET tecnico_id = ?, descricao = ?, diagnostico = ?,
          data_inicio = ?, data_fim = ?, status = ?, 
          km_atual = ?, observacoes = ?, custo_total = ?
      WHERE id = ?
    `;
    
    await connection.execute(queryIntervencao, [
      tecnico_id || null,
      descricao,
      diagnostico || null,
      data_inicio || new Date(),
      data_fim || null,
      status || 'Pendente',
      km_atual || 0,
      observacoes || null,
      custo_total || 0,
      intervencaoId
    ]);
    
    // Atualizar serviços relacionados
    if (servicos) {
      // Remover serviços existentes
      await connection.execute('DELETE FROM servicos WHERE intervencao_id = ?', [intervencaoId]);
      
      // Adicionar novos serviços
      for (const servico of servicos) {
        await connection.execute(
          'INSERT INTO servicos (intervencao_id, nome, descricao, valor) VALUES (?, ?, ?, ?)',
          [intervencaoId, servico.nome, servico.descricao || '', servico.valor || 0]
        );
      }
    }
    
    // Atualizar peças relacionadas
    if (pecas) {
      // Remover peças existentes
      await connection.execute('DELETE FROM pecas WHERE intervencao_id = ?', [intervencaoId]);
      
      // Adicionar novas peças
      for (const peca of pecas) {
        await connection.execute(
          'INSERT INTO pecas (intervencao_id, nome, quantidade, valor_unitario) VALUES (?, ?, ?, ?)',
          [intervencaoId, peca.nome, peca.quantidade || 1, peca.valor_unitario || 0]
        );
      }
    }
    
    // Atualizar o odômetro do veículo, se km_atual for fornecido
    if (km_atual) {
      await connection.execute(
        'UPDATE veiculos SET km = ? WHERE id = ?',
        [km_atual, veiculoId]
      );
    }
    
    await connection.commit();
    
    res.json({ 
      mensagem: 'Intervenção atualizada com sucesso',
      status: status // Retorna o status para atualizações na UI
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar intervenção:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar intervenção' });
  } finally {
    connection.release();
  }
});

// Excluir uma intervenção
router.delete('/:id', auth, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const intervencaoId = req.params.id;
    
    // Verificar se a intervenção existe
    const [checkIntervencao] = await connection.execute(
      'SELECT id FROM intervencoes WHERE id = ?', 
      [intervencaoId]
    );
    
    if (checkIntervencao.length === 0) {
      return res.status(404).json({ mensagem: 'Intervenção não encontrada' });
    }
    
    // Excluir serviços relacionados
    await connection.execute('DELETE FROM servicos WHERE intervencao_id = ?', [intervencaoId]);
    
    // Excluir peças relacionadas
    await connection.execute('DELETE FROM pecas WHERE intervencao_id = ?', [intervencaoId]);
    
    // Excluir a intervenção
    await connection.execute('DELETE FROM intervencoes WHERE id = ?', [intervencaoId]);
    
    await connection.commit();
    
    res.json({ mensagem: 'Intervenção excluída com sucesso' });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao excluir intervenção:', error);
    res.status(500).json({ mensagem: 'Erro ao excluir intervenção' });
  } finally {
    connection.release();
  }
});

// Atualizar o status de uma intervenção
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const intervencaoId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ mensagem: 'Status é obrigatório' });
    }
    
    // Verificar valores válidos para status
    const statusValidos = ['Pendente', 'Em andamento', 'Concluída', 'Cancelada'];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ 
        mensagem: 'Status inválido. Use: Pendente, Em andamento, Concluída ou Cancelada' 
      });
    }
    
    // Verificar se a intervenção existe
    const [checkIntervencao] = await pool.execute(
      'SELECT id FROM intervencoes WHERE id = ?', 
      [intervencaoId]
    );
    
    if (checkIntervencao.length === 0) {
      return res.status(404).json({ mensagem: 'Intervenção não encontrada' });
    }
    
    // Se o status for Concluída e não houver data_fim, definir como a data atual
    let query = 'UPDATE intervencoes SET status = ? WHERE id = ?';
    let params = [status, intervencaoId];
    
    if (status === 'Concluída') {
      query = 'UPDATE intervencoes SET status = ?, data_fim = IFNULL(data_fim, NOW()) WHERE id = ?';
    }
    
    await pool.execute(query, params);
    
    res.json({ mensagem: 'Status da intervenção atualizado com sucesso', status });
  } catch (error) {
    console.error('Erro ao atualizar status da intervenção:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar status da intervenção' });
  }
});

// Obter estatísticas de intervenções
router.get('/estatisticas/dashboard', auth, async (req, res) => {
  try {
    // Contar intervenções por status
    const [porStatus] = await pool.execute(`
      SELECT status, COUNT(*) as total 
      FROM intervencoes 
      GROUP BY status
    `);
    
    // Contar intervenções dos últimos 30 dias
    const [ultimos30Dias] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM intervencoes 
      WHERE data_inicio >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    // Calcular média de custo das intervenções
    const [mediaCusto] = await pool.execute(`
      SELECT AVG(custo_total) as media 
      FROM intervencoes 
      WHERE status = 'Concluída'
    `);
    
    // Intervenções por mês nos últimos 12 meses
    const [porMes] = await pool.execute(`
      SELECT 
        DATE_FORMAT(data_inicio, '%Y-%m') as mes,
        COUNT(*) as total
      FROM intervencoes
      WHERE data_inicio >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(data_inicio, '%Y-%m')
      ORDER BY mes
    `);
    
    res.json({
      por_status: porStatus,
      ultimos_30_dias: ultimos30Dias[0].total,
      media_custo: mediaCusto[0].media || 0,
      por_mes: porMes
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar estatísticas de intervenções' });
  }
});

module.exports = router;