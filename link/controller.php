<?php

require '../config/db.php';


class Controller
{
    protected QueryBuilder $queryBuilder;

    public function __construct()
    {

        date_default_timezone_set("Europe/Lisbon");

        $this->queryBuilder = new QueryBuilder();
    }
public function login(string $email, string $senha)
{
    $result = $this->queryBuilder->table('Usr')
        ->select(['id', 'email', 'nome', 'palavra', 'permissao'])
        ->where('email', '=', $email)
        ->get();

    if (empty($result)) {
        return ['ok' => false, 'error' => 'Email não encontrado'];
    }

    $user = $result[0];

    if (!password_verify($senha, $user['palavra'])) {
        return ['ok' => false, 'error' => 'Senha incorreta'];
    }

    // INICIA A SESSÃO AQUI
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $_SESSION['user'] = [
        "id" => $user['id'],
        "nome" => $user['nome'],
        "email" => $user['email'],
        "permissao" => $user['permissao']
    ];

    return [
        'ok' => true,
        'id' => $user['id'],
        'email' => $user['email'],
        'nome' => $user['nome'],
        'permissao' => $user['permissao']
    ];
}




public function signin(string $nome, string $email, string $senha): array
{
    $result = $this->queryBuilder->table('Usr')
        ->select(['id'])
        ->where('email', '=', $email)
        ->get();

    if (!empty($result)) {
        return ['ok' => false, 'error' => 'Email já registado.'];
    }

    $hash = password_hash($senha, PASSWORD_DEFAULT);
    $permissao = 'user';

    $inserido = $this->queryBuilder->table('Usr')->insert([
        'nome' => $nome,
        'email' => $email,
        'palavra' => $hash,
        'permissao' => $permissao
    ]);

    if (!$inserido) {
        return ['ok' => false, 'error' => 'Erro ao criar conta.'];
    }

    return ['ok' => true];
}

// Vehicle Management Methods
public function getVeiculos(int $pagina = 1, string $pesquisa = '', int $limite = 10): array
{
    $offset = ($pagina - 1) * $limite;
    
    // Get vehicles with pagination - using only original table fields
    $queryBuilder = new QueryBuilder();
    $query = $queryBuilder->table('carro')->select(['id', 'marca', 'modelo', 'ano', 'cor', 'pneus']);
    
    if (!empty($pesquisa)) {
        $query->where('marca', 'LIKE', "%{$pesquisa}%")
              ->orWhere('modelo', 'LIKE', "%{$pesquisa}%")
              ->orWhere('cor', 'LIKE', "%{$pesquisa}%");
    }
    
    $veiculos = $query->limit($limite)->offset($offset)->get();
    
    // Get total count for pagination
    $totalQueryBuilder = new QueryBuilder();
    $totalQuery = $totalQueryBuilder->table('carro')->select(['COUNT(*) as total']);
    if (!empty($pesquisa)) {
        $totalQuery->where('marca', 'LIKE', "%{$pesquisa}%")
                   ->orWhere('modelo', 'LIKE', "%{$pesquisa}%")
                   ->orWhere('cor', 'LIKE', "%{$pesquisa}%");
    }
    $totalResult = $totalQuery->get();
    $total = $totalResult[0]['total'] ?? 0;
    
    return [
        'ok' => true,
        'veiculos' => $veiculos,
        'pagina' => $pagina,
        'total' => $total,
        'totalPaginas' => ceil($total / $limite)
    ];
}

public function getVeiculo(int $id): array
{
    $queryBuilder = new QueryBuilder();
    $veiculo = $queryBuilder->table('carro')
        ->select(['id', 'marca', 'modelo', 'ano', 'cor', 'pneus'])
        ->where('id', '=', $id)
        ->get();
    
    if (empty($veiculo)) {
        return ['ok' => false, 'error' => 'Veículo não encontrado'];
    }
    
    return ['ok' => true, 'veiculo' => $veiculo[0]];
}

public function criarVeiculo(array $dados): array
    {
        try {
            error_log("criarVeiculo called with data: " . json_encode($dados));
            
            // Validate required fields
            $requiredFields = ['marca', 'modelo', 'ano', 'cor'];
            foreach ($requiredFields as $field) {
                if (empty($dados[$field])) {
                    return ['ok' => false, 'error' => "Campo '{$field}' é obrigatório"];
                }
            }
            
            $dadosInsercao = [
                'marca' => $dados['marca'],
                'modelo' => $dados['modelo'],
                'ano' => $dados['ano'],
                'cor' => $dados['cor']
            ];
            
            if (!empty($dados['pneus'])) {
                $dadosInsercao['pneus'] = $dados['pneus'];
            }
            
            error_log("Inserting basic data: " . json_encode($dadosInsercao));
            
            $queryBuilder = new QueryBuilder();
            $inserido = $queryBuilder->table('carro')->insert($dadosInsercao);
            
            if (!$inserido) {
                return ['ok' => false, 'error' => 'Erro ao criar veículo'];
            }
            
            return ['ok' => true, 'mensagem' => 'Veículo criado com sucesso'];
            
        } catch (Exception $e) {
            error_log("criarVeiculo exception: " . $e->getMessage());
            return ['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()];
        }
    }
public function atualizarVeiculo(int $id, array $dados): array
{
    // Check if vehicle exists
    $queryBuilder = new QueryBuilder();
    $veiculo = $queryBuilder->table('carro')
        ->select(['id'])
        ->where('id', '=', $id)
        ->get();
    
    if (empty($veiculo)) {
        return ['ok' => false, 'error' => 'Veículo não encontrado'];
    }
    
    // Prepare data for update - only original table fields
    $dadosAtualizacao = [];
    if (isset($dados['marca'])) $dadosAtualizacao['marca'] = $dados['marca'];
    if (isset($dados['modelo'])) $dadosAtualizacao['modelo'] = $dados['modelo'];
    if (isset($dados['ano'])) $dadosAtualizacao['ano'] = $dados['ano'];
    if (isset($dados['cor'])) $dadosAtualizacao['cor'] = $dados['cor'];
    if (isset($dados['pneus'])) $dadosAtualizacao['pneus'] = $dados['pneus'];
    
    if (empty($dadosAtualizacao)) {
        return ['ok' => false, 'error' => 'Nenhum dado para atualizar'];
    }
    
    $updateQueryBuilder = new QueryBuilder();
    $atualizado = $updateQueryBuilder->table('carro')
        ->update($dadosAtualizacao)
        ->where('id', '=', $id)
        ->execute();
    
    if (!$atualizado) {
        return ['ok' => false, 'error' => 'Erro ao atualizar veículo'];
    }
    
    return ['ok' => true, 'mensagem' => 'Veículo atualizado com sucesso'];
}

public function excluirVeiculo(int $id): array
{
    // Check if vehicle exists
    $queryBuilder = new QueryBuilder();
    $veiculo = $queryBuilder->table('carro')
        ->select(['id'])
        ->where('id', '=', $id)
        ->get();
    
    if (empty($veiculo)) {
        return ['ok' => false, 'error' => 'Veículo não encontrado'];
    }
    
    $deleteQueryBuilder = new QueryBuilder();
    $excluido = $deleteQueryBuilder->table('carro')
        ->delete()
        ->where('id', '=', $id)
        ->execute();
    
    if (!$excluido) {
        return ['ok' => false, 'error' => 'Erro ao excluir veículo'];
    }
    
    return ['ok' => true, 'mensagem' => 'Veículo excluído com sucesso'];
}

// ============= INTERVENTION METHODS =============

public function getIntervencoes(int $pagina = 1, string $pesquisa = '', int $limite = 10): array
{
    $offset = ($pagina - 1) * $limite;
    
    $query = new QueryBuilder();
    $query->table('intervencao i')
          ->select(['i.*', 'CONCAT(c.marca, " ", c.modelo, " - ", COALESCE(c.matricula, c.id)) as veiculo_info'])
          ->leftJoin('carro c', 'i.carro_id', '=', 'c.id');
    
    if (!empty($pesquisa)) {
        $query->where('i.nome', 'LIKE', "%{$pesquisa}%")
              ->orWhere('i.descricao', 'LIKE', "%{$pesquisa}%")
              ->orWhere('c.marca', 'LIKE', "%{$pesquisa}%")
              ->orWhere('c.modelo', 'LIKE', "%{$pesquisa}%");
    }
    
    $intervencoes = $query->limit($limite)->offset($offset)->get();
    
    // Get total count for pagination
    $totalQueryBuilder = new QueryBuilder();
    $totalQuery = $totalQueryBuilder->table('intervencao i')->select(['COUNT(*) as total'])
                                   ->leftJoin('carro c', 'i.carro_id', '=', 'c.id');
    if (!empty($pesquisa)) {
        $totalQuery->where('i.nome', 'LIKE', "%{$pesquisa}%")
                   ->orWhere('i.descricao', 'LIKE', "%{$pesquisa}%")
                   ->orWhere('c.marca', 'LIKE', "%{$pesquisa}%")
                   ->orWhere('c.modelo', 'LIKE', "%{$pesquisa}%");
    }
    $totalResult = $totalQuery->get();
    $total = $totalResult[0]['total'] ?? 0;
    
    return [
        'ok' => true,
        'intervencoes' => $intervencoes,
        'pagina' => $pagina,
        'total' => $total,
        'totalPaginas' => ceil($total / $limite)
    ];
}

public function getIntervencao(int $id): array
{
    $queryBuilder = new QueryBuilder();
    $intervencao = $queryBuilder->table('intervencao')
        ->select(['*'])
        ->where('id', '=', $id)
        ->get();
    
    if (empty($intervencao)) {
        return ['ok' => false, 'error' => 'Intervenção não encontrada'];
    }
    
    return ['ok' => true, 'intervencao' => $intervencao[0]];
}

public function criarIntervencao(array $dados): array
{
    try {
        error_log("criarIntervencao called with data: " . json_encode($dados));
        
        // Validate required fields - match the actual database structure
        $requiredFields = ['carro_id', 'nome', 'data_inter'];
        foreach ($requiredFields as $field) {
            if (empty($dados[$field])) {
                return ['ok' => false, 'error' => "Campo '{$field}' é obrigatório"];
            }
        }
        
        $dadosInsercao = [
            'carro_id' => $dados['carro_id'],
            'nome' => $dados['nome'],
            'descricao' => $dados['descricao'] ?? '',
            'data_inter' => $dados['data_inter']
        ];
        
        // Add mec_id if provided
        if (!empty($dados['mec_id'])) {
            $dadosInsercao['mec_id'] = $dados['mec_id'];
        }
        
        error_log("Inserting intervention data: " . json_encode($dadosInsercao));
        
        $queryBuilder = new QueryBuilder();
        $inserido = $queryBuilder->table('intervencao')->insert($dadosInsercao);
        
        if (!$inserido) {
            return ['ok' => false, 'error' => 'Erro ao criar intervenção'];
        }
        
        return ['ok' => true, 'mensagem' => 'Intervenção criada com sucesso'];
        
    } catch (Exception $e) {
        error_log("criarIntervencao exception: " . $e->getMessage());
        return ['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()];
    }
}

public function atualizarIntervencao(int $id, array $dados): array
{
    try {
        // Check if intervention exists
        $queryBuilder = new QueryBuilder();
        $intervencao = $queryBuilder->table('intervencao')
            ->select(['id'])
            ->where('id', '=', $id)
            ->get();
        
        if (empty($intervencao)) {
            return ['ok' => false, 'error' => 'Intervenção não encontrada'];
        }
        
        // Prepare data for update - match database structure
        $dadosAtualizacao = [];
        if (isset($dados['carro_id'])) $dadosAtualizacao['carro_id'] = $dados['carro_id'];
        if (isset($dados['nome'])) $dadosAtualizacao['nome'] = $dados['nome'];
        if (isset($dados['descricao'])) $dadosAtualizacao['descricao'] = $dados['descricao'];
        if (isset($dados['data_inter'])) $dadosAtualizacao['data_inter'] = $dados['data_inter'];
        if (isset($dados['mec_id'])) $dadosAtualizacao['mec_id'] = $dados['mec_id'];
        
        if (empty($dadosAtualizacao)) {
            return ['ok' => false, 'error' => 'Nenhum dado para atualizar'];
        }
        
        $updateQueryBuilder = new QueryBuilder();
        $atualizado = $updateQueryBuilder->table('intervencao')
            ->update($dadosAtualizacao)
            ->where('id', '=', $id)
            ->execute();
        
        if (!$atualizado) {
            return ['ok' => false, 'error' => 'Erro ao atualizar intervenção'];
        }
        
        return ['ok' => true, 'mensagem' => 'Intervenção atualizada com sucesso'];
        
    } catch (Exception $e) {
        error_log("atualizarIntervencao exception: " . $e->getMessage());
        return ['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()];
    }
}

public function excluirIntervencao(int $id): array
{
    // Check if intervention exists
    $queryBuilder = new QueryBuilder();
    $intervencao = $queryBuilder->table('intervencao')
        ->select(['id'])
        ->where('id', '=', $id)
        ->get();
    
    if (empty($intervencao)) {
        return ['ok' => false, 'error' => 'Intervenção não encontrada'];
    }
    
    $deleteQueryBuilder = new QueryBuilder();
    $excluido = $deleteQueryBuilder->table('intervencao')
        ->delete()
        ->where('id', '=', $id)
        ->execute();
    
    if (!$excluido) {
        return ['ok' => false, 'error' => 'Erro ao excluir intervenção'];
    }
    
    return ['ok' => true, 'mensagem' => 'Intervenção excluída com sucesso'];
}

// ============= USER METHODS =============

public function getUsuarios(int $pagina = 1, string $pesquisa = '', int $limite = 10): array
{
    $offset = ($pagina - 1) * $limite;
    
    $query = new QueryBuilder();
    $query->table('usr')->select(['id', 'nome', 'email', 'permissao', 'imagem']);
    
    if (!empty($pesquisa)) {
        $query->where('nome', 'LIKE', "%{$pesquisa}%")
              ->orWhere('email', 'LIKE', "%{$pesquisa}%")
              ->orWhere('permissao', 'LIKE', "%{$pesquisa}%");
    }
    
    $usuarios = $query->limit($limite)->offset($offset)->get();
    
    // Get total count for pagination
    $totalQueryBuilder = new QueryBuilder();
    $totalQuery = $totalQueryBuilder->table('usr')->select(['COUNT(*) as total']);
    if (!empty($pesquisa)) {
        $totalQuery->where('nome', 'LIKE', "%{$pesquisa}%")
                   ->orWhere('email', 'LIKE', "%{$pesquisa}%")
                   ->orWhere('permissao', 'LIKE', "%{$pesquisa}%");
    }
    $totalResult = $totalQuery->get();
    $total = $totalResult[0]['total'] ?? 0;
    
    return [
        'ok' => true,
        'usuarios' => $usuarios,
        'pagina' => $pagina,
        'total' => $total,
        'totalPaginas' => ceil($total / $limite)
    ];
}

public function getUsuario(int $id): array
{
    $queryBuilder = new QueryBuilder();
    $usuario = $queryBuilder->table('usr')
        ->select(['id', 'nome', 'email', 'permissao', 'imagem'])
        ->where('id', '=', $id)
        ->get();
    
    if (empty($usuario)) {
        return ['ok' => false, 'error' => 'Usuário não encontrado'];
    }
    
    return ['ok' => true, 'usuario' => $usuario[0]];
}

public function criarUsuario(array $dados): array
{
    try {
        error_log("criarUsuario called with data: " . json_encode($dados));
        
        // Validate required fields - using actual database structure
        $requiredFields = ['nome', 'email', 'palavra', 'permissao'];
        foreach ($requiredFields as $field) {
            if (empty($dados[$field])) {
                return ['ok' => false, 'error' => "Campo '{$field}' é obrigatório"];
            }
        }
        
        // Check if email already exists
        $queryBuilder = new QueryBuilder();
        $existingUser = $queryBuilder->table('usr')
            ->select(['id'])
            ->where('email', '=', $dados['email'])
            ->get();
        
        if (!empty($existingUser)) {
            return ['ok' => false, 'error' => 'Email já está em uso'];
        }
        
        $dadosInsercao = [
            'nome' => $dados['nome'],
            'email' => $dados['email'],
            'palavra' => password_hash($dados['palavra'], PASSWORD_DEFAULT),
            'permissao' => $dados['permissao']
        ];
        
        if (!empty($dados['imagem'])) {
            $dadosInsercao['imagem'] = $dados['imagem'];
        }
        
        error_log("Inserting user data: " . json_encode($dadosInsercao));
        
        $insertQueryBuilder = new QueryBuilder();
        $inserido = $insertQueryBuilder->table('usr')->insert($dadosInsercao);
        
        if (!$inserido) {
            return ['ok' => false, 'error' => 'Erro ao criar usuário'];
        }
        
        return ['ok' => true, 'mensagem' => 'Usuário criado com sucesso'];
        
    } catch (Exception $e) {
        error_log("criarUsuario exception: " . $e->getMessage());
        return ['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()];
    }
}

public function atualizarUsuario(int $id, array $dados): array
{
    try {
        // Check if user exists
        $queryBuilder = new QueryBuilder();
        $usuario = $queryBuilder->table('usr')
            ->select(['id', 'email'])
            ->where('id', '=', $id)
            ->get();
        
        if (empty($usuario)) {
            return ['ok' => false, 'error' => 'Usuário não encontrado'];
        }
        
        // Check if email is being changed and if it's already in use by another user
        if (isset($dados['email']) && $dados['email'] !== $usuario[0]['email']) {
            $emailCheckBuilder = new QueryBuilder();
            $existingUser = $emailCheckBuilder->table('usr')
                ->select(['id'])
                ->where('email', '=', $dados['email'])
                ->where('id', '!=', $id)
                ->get();
            
            if (!empty($existingUser)) {
                return ['ok' => false, 'error' => 'Email já está em uso por outro usuário'];
            }
        }
        
        // Prepare data for update - using actual database structure
        $dadosAtualizacao = [];
        if (isset($dados['nome'])) $dadosAtualizacao['nome'] = $dados['nome'];
        if (isset($dados['email'])) $dadosAtualizacao['email'] = $dados['email'];
        if (isset($dados['permissao'])) $dadosAtualizacao['permissao'] = $dados['permissao'];
        if (isset($dados['imagem'])) $dadosAtualizacao['imagem'] = $dados['imagem'];
        
        // Only update password if provided - using 'palavra' field
        if (isset($dados['palavra']) && !empty($dados['palavra'])) {
            $dadosAtualizacao['palavra'] = password_hash($dados['palavra'], PASSWORD_DEFAULT);
        }
        
        if (empty($dadosAtualizacao)) {
            return ['ok' => false, 'error' => 'Nenhum dado para atualizar'];
        }
        
        $updateQueryBuilder = new QueryBuilder();
        $atualizado = $updateQueryBuilder->table('usr')
            ->update($dadosAtualizacao)
            ->where('id', '=', $id)
            ->execute();
        
        if (!$atualizado) {
            return ['ok' => false, 'error' => 'Erro ao atualizar usuário'];
        }
        
        return ['ok' => true, 'mensagem' => 'Usuário atualizado com sucesso'];
        
    } catch (Exception $e) {
        error_log("atualizarUsuario exception: " . $e->getMessage());
        return ['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()];
    }
}

public function excluirUsuario(int $id): array
{
    // Check if user exists
    $queryBuilder = new QueryBuilder();
    $usuario = $queryBuilder->table('usr')
        ->select(['id'])
        ->where('id', '=', $id)
        ->get();
    
    if (empty($usuario)) {
        return ['ok' => false, 'error' => 'Usuário não encontrado'];
    }
    
    $deleteQueryBuilder = new QueryBuilder();
    $excluido = $deleteQueryBuilder->table('usr')
        ->delete()
        ->where('id', '=', $id)
        ->execute();
    
    if (!$excluido) {
        return ['ok' => false, 'error' => 'Erro ao excluir usuário'];
    }
    
    return ['ok' => true, 'mensagem' => 'Usuário excluído com sucesso'];
}

}
