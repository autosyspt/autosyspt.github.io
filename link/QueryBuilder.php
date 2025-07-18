<?php

class QueryBuilder
{
    private string $table;
    private string $query = '';
    private array $bindings = [];

    public function table(string $table): self
    {

        $this->table = $table;

        return $this;
    }

    public function select(array $columns = ['*']): self
    {

        $columnsList = implode(', ', $columns);

        $this->query = "SELECT $columnsList FROM {$this->table}";

        return $this;
    }

    public function where(string $column, string $operator, mixed $value): self
    {

        if (strtoupper($operator) === 'IN' && is_array($value)) {

            $placeholders = [];

            foreach ($value as $i => $val) {

                $ph = ':' . preg_replace('/[^a-zA-Z0-9_]/', '_', $column) . "_$i";

                $placeholders[] = $ph;

                $this->bindings[$ph] = $val;
            }

            $this->query .= (str_contains($this->query, 'WHERE') ? " AND" : " WHERE") . " $column IN (" . implode(', ', $placeholders) . ")";
        } else {

            $placeholder = ':' . preg_replace('/[^a-zA-Z0-9_]/', '_', $column) . uniqid('_');

            $this->query .= (str_contains($this->query, 'WHERE') ? " AND" : " WHERE") . " $column $operator $placeholder";

            $this->bindings[$placeholder] = $value;
        }

        return $this;
    }

    public function orWhere(string $column, string $operator, mixed $value): self
    {
        $placeholder = ':' . preg_replace('/[^a-zA-Z0-9_]/', '_', $column) . uniqid('_');

        $this->query .= (str_contains($this->query, 'WHERE') ? " OR" : " WHERE") . " $column $operator $placeholder";
        $this->bindings[$placeholder] = $value;

        return $this;
    }


    public function join(string $table, string $column1, string $operator, string $column2): static
    {

        $this->query .= " JOIN $table ON $column1 $operator $column2";

        return $this;
    }

    public function leftJoin(string $table, string $column1, string $operator, string $column2): static
    {
        $this->query .= " LEFT JOIN $table ON $column1 $operator $column2";
        return $this;
    }

    public function limit(int $count): static
    {

        $this->query .= " LIMIT $count";

        return $this;
    }

    public function offset(int $offset): static
    {

        $this->query .= " OFFSET $offset";

        return $this;
    }

    public function order(string $column_name, string $direction = 'ASC'): static
    {

        if (str_contains($this->query, 'ORDER BY')) {

            $this->query .= ", $column_name $direction";
        } else {

            $this->query .= " ORDER BY $column_name $direction";
        }

        return $this;
    }


    public function groupBy(string|array $columns): static
    {

        if (is_array($columns)) {

            $columns = implode(', ', $columns);
        }

        $this->query .= " GROUP BY $columns";

        return $this;
    }

    public function getServerTimeStamp(): string
    {

        $pdo = Database::getConnection();

        $stmt = $pdo->query("SELECT CURRENT_TIMESTAMP() as server_time");

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row['server_time'];
    }


    public function insert(array $data): bool
    {

        $columns = implode(', ', array_keys($data));

        $placeholders = implode(', ', array_map(fn($col) => ":$col", array_keys($data)));

        $this->query = "INSERT INTO {$this->table} ($columns) VALUES ($placeholders)";

        $this->bindings = array_combine(array_map(fn($col) => ":$col", array_keys($data)), array_values($data));

        return $this->execute();
    }

    public function getLastInsertId(): string
    {

        $pdo = Database::getConnection();
        return $pdo->lastInsertId();
    }

    public function update(array $data): self
    {

        $set = implode(', ', array_map(fn($col) => "$col = :$col", array_keys($data)));

        $this->query = "UPDATE {$this->table} SET $set";
        foreach ($data as $key => $value) {
            $this->bindings[":$key"] = $value;
        }

        return $this;
    }

    public function delete(): self
    {

        $this->query = "DELETE FROM {$this->table}";

        return $this;
    }

    public function execute(): bool
    {

        $pdo = Database::getConnection();

        $stmt = $pdo->prepare($this->query);

        return $stmt->execute($this->bindings);
    }

    public function get(): array
    {

        $pdo = Database::getConnection();

        $stmt = $pdo->prepare($this->query);

        error_log("QUERY: " . $this->query);
        error_log("BINDINGS: " . json_encode($this->bindings));

        $stmt->execute($this->bindings);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function raw($sql)
    {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare($sql);
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("QueryBuilder raw SQL error: " . $e->getMessage());
            throw $e;
        }
    }
}
