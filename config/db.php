<?php

class Database {

    private static string $hostname = 'localhost';
    private static string $database = 'autosyspt';
    private static string $username = 'root';
    private static string $password = '';

    private static ?PDO $connection = null;

    public static function connect(): void {
        if (self::$connection === null) {
            $dsn = 'mysql:host=' . self::$hostname . ';dbname=' . self::$database . ';charset=utf8mb4';

            self::$connection = new PDO($dsn, self::$username, self::$password);
            self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        }
    }

    public static function getConnection(): PDO {

        self::connect();
        return self::$connection;
    }
}
