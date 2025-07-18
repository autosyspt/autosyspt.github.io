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
    error_log("Login tentativa: $email");


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



}
