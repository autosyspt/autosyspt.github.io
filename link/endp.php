<?php
session_start();
require_once 'Router.php';
require_once 'controller.php';
require_once 'QueryBuilder.php';

$controller = new Controller();
$router = new Router();


$router->add('GET', '/session', function () {
    header('Content-Type: application/json');
    if (session_status() === PHP_SESSION_NONE) session_start();

    if (isset($_SESSION['user'])) {
        echo json_encode(['ok' => true, 'user' => $_SESSION['user']]);
    } else {
        echo json_encode(['ok' => false]);
    }
});

$router->add('POST', '/login', function () use ($controller) {
    header('Content-Type: application/json');
    if (session_status() === PHP_SESSION_NONE) session_start();

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email'], $data['senha'])) {
        echo json_encode(['ok' => false, 'error' => 'Dados em falta']);
        return;
    }

    $result = $controller->login($data['email'], $data['senha']);
    echo json_encode($result);
});

$router->add('POST', '/logout', function () {
    header('Content-Type: application/json');
    if (session_status() === PHP_SESSION_NONE) session_start();
    session_destroy();
    echo json_encode(['ok' => true]);
});

$router->add('POST', '/signin', function () use ($controller) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email'], $data['senha'], $data['nome'])) {
        echo json_encode(['ok' => false, 'error' => 'Dados incompletos.']);
        return;
    }

    $result = $controller->signin($data['nome'], $data['email'], $data['senha']);
    echo json_encode($result);
});

// TEMPORARY DEBUGGING ROUTES
$router->add('GET', '/debug', function () {
    header('Content-Type: application/json');
    echo json_encode([
        'ok' => true,
        'method' => $_SERVER['REQUEST_METHOD'],
        'uri' => $_SERVER['REQUEST_URI'],
        'script' => $_SERVER['SCRIPT_NAME'],
        'get' => $_GET,
        'post' => $_POST
    ]);
});

$router->add('GET', '/test', function () {
    header('Content-Type: application/json');
    echo json_encode(['ok' => true, 'message' => 'Test endpoint works']);
});

$router->add('POST', '/testCreate', function () {
    header('Content-Type: application/json');
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode(['ok' => true, 'received' => $data, 'message' => 'Data received successfully']);
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
    }
});

$router->add('GET', '/getCars', function () use ($controller) {
    header('Content-Type: application/json');
    
    $pagina = (int)($_GET['pagina'] ?? 1);
    $pesquisa = $_GET['pesquisa'] ?? '';
    $limite = (int)($_GET['limite'] ?? 10);
    
    $result = $controller->getVeiculos($pagina, $pesquisa, $limite);
    echo json_encode($result);
});

$router->add('GET', '/getCar/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    $result = $controller->getVeiculo((int)$id);
    if ($result['ok']) {
        echo json_encode($result['veiculo']);
    } else {
        http_response_code(404);
        echo json_encode($result);
    }
});

$router->add('POST', '/createCar', function () use ($controller) {
    header('Content-Type: application/json');
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            echo json_encode(['ok' => false, 'error' => 'Dados inválidos ou JSON malformado']);
            return;
        }
        
        error_log("CreateCar data received: " . json_encode($data));
        
        $result = $controller->criarVeiculo($data);
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("CreateCar error: " . $e->getMessage());
        echo json_encode(['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
    }
});

$router->add('PUT', '/updateCar/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            echo json_encode(['ok' => false, 'error' => 'Dados inválidos ou JSON malformado']);
            return;
        }
        
        error_log("UpdateCar data received for ID $id: " . json_encode($data));
        
        $result = $controller->atualizarVeiculo((int)$id, $data);
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("UpdateCar error: " . $e->getMessage());
        echo json_encode(['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
    }
});

$router->add('DELETE', '/deleteCar/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    $result = $controller->excluirVeiculo((int)$id);
    echo json_encode($result);
});

// ============= INTERVENTION ENDPOINTS =============

$router->add('GET', '/getInterventions', function () use ($controller) {
    header('Content-Type: application/json');
    
    $pagina = (int)($_GET['pagina'] ?? 1);
    $pesquisa = $_GET['pesquisa'] ?? '';
    $limite = (int)($_GET['limite'] ?? 10);
    
    $result = $controller->getIntervencoes($pagina, $pesquisa, $limite);
    echo json_encode($result);
});

$router->add('GET', '/getIntervention/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    $result = $controller->getIntervencao((int)$id);
    if ($result['ok']) {
        echo json_encode($result['intervencao']);
    } else {
        http_response_code(404);
        echo json_encode($result);
    }
});

$router->add('POST', '/createIntervention', function () use ($controller) {
    header('Content-Type: application/json');
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            echo json_encode(['ok' => false, 'error' => 'Dados inválidos ou JSON malformado']);
            return;
        }
        
        error_log("CreateIntervention data received: " . json_encode($data));
        
        $result = $controller->criarIntervencao($data);
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("CreateIntervention error: " . $e->getMessage());
        echo json_encode(['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
    }
});

$router->add('PUT', '/updateIntervention/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            echo json_encode(['ok' => false, 'error' => 'Dados inválidos ou JSON malformado']);
            return;
        }
        
        error_log("UpdateIntervention data received for ID $id: " . json_encode($data));
        
        $result = $controller->atualizarIntervencao((int)$id, $data);
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("UpdateIntervention error: " . $e->getMessage());
        echo json_encode(['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
    }
});

$router->add('DELETE', '/deleteIntervention/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    $result = $controller->excluirIntervencao((int)$id);
    echo json_encode($result);
});

// ============= USER ENDPOINTS =============

$router->add('GET', '/getUsers', function () use ($controller) {
    header('Content-Type: application/json');
    
    $pagina = (int)($_GET['pagina'] ?? 1);
    $pesquisa = $_GET['pesquisa'] ?? '';
    $limite = (int)($_GET['limite'] ?? 10);
    
    $result = $controller->getUsuarios($pagina, $pesquisa, $limite);
    echo json_encode($result);
});

$router->add('GET', '/getUser/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    $result = $controller->getUsuario((int)$id);
    if ($result['ok']) {
        echo json_encode($result['usuario']);
    } else {
        http_response_code(404);
        echo json_encode($result);
    }
});

$router->add('POST', '/createUser', function () use ($controller) {
    header('Content-Type: application/json');
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            echo json_encode(['ok' => false, 'error' => 'Dados inválidos ou JSON malformado']);
            return;
        }
        
        error_log("CreateUser data received: " . json_encode($data));
        
        $result = $controller->criarUsuario($data);
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("CreateUser error: " . $e->getMessage());
        echo json_encode(['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
    }
});

$router->add('PUT', '/updateUser/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            echo json_encode(['ok' => false, 'error' => 'Dados inválidos ou JSON malformado']);
            return;
        }
        
        error_log("UpdateUser data received for ID $id: " . json_encode($data));
        
        $result = $controller->atualizarUsuario((int)$id, $data);
        echo json_encode($result);
        
    } catch (Exception $e) {
        error_log("UpdateUser error: " . $e->getMessage());
        echo json_encode(['ok' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
    }
});

$router->add('DELETE', '/deleteUser/$id', function ($id) use ($controller) {
    header('Content-Type: application/json');
    
    $result = $controller->excluirUsuario((int)$id);
    echo json_encode($result);
});


header('Content-Type: application/json');
$response = $router->dispatch();

