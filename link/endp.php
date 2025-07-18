<?php
require_once 'Router.php';
require_once 'controller.php';
require_once 'QueryBuilder.php';

$controller = new Controller();

$router = new Router();

$router->add('POST', '/login', function() use ($controller) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email'], $data['senha'])) {
        return ['ok' => false, 'error' => 'Dados em falta'];
    }

    return $controller->login($data['email'], $data['senha']);
});

$router->add('POST', '/signin', function () use ($controller) {
    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['email'], $data['senha'], $data['nome'])) {
        return ['ok' => false, 'error' => 'Dados incompletos.'];
    }

    return $controller->signin($data['nome'], $data['email'], $data['senha']);
});


$router->dispatch();





