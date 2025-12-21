<?php
/**
 * Database Migration Utility
 * Run migrations to set up the database schema
 * 
 * Usage: php migrate.php [migration_file]
 * If no migration file is provided, runs all migrations in order
 */

require_once __DIR__ . '/../config/database.php';

function getDatabaseConnection() {
    try {
        $config = require __DIR__ . '/../config/database.php';
        $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['dbname']}";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        return $pdo;
    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage() . "\n");
    }
}

function createMigrationsTable($pdo) {
    $sql = "CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql);
}

function getExecutedMigrations($pdo) {
    $stmt = $pdo->query("SELECT version FROM schema_migrations ORDER BY version");
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function recordMigration($pdo, $version) {
    $stmt = $pdo->prepare("INSERT INTO schema_migrations (version) VALUES (?) ON CONFLICT DO NOTHING");
    $stmt->execute([$version]);
}

function runMigration($pdo, $file) {
    $version = basename($file, '.sql');
    $sql = file_get_contents($file);
    
    if ($sql === false) {
        echo "Error: Could not read migration file: $file\n";
        return false;
    }
    
    try {
        $pdo->beginTransaction();
        $pdo->exec($sql);
        recordMigration($pdo, $version);
        $pdo->commit();
        echo "✓ Migration $version executed successfully\n";
        return true;
    } catch (PDOException $e) {
        $pdo->rollBack();
        echo "✗ Migration $version failed: " . $e->getMessage() . "\n";
        return false;
    }
}

function runAllMigrations($pdo) {
    $migrationsDir = __DIR__ . '/../../database/migrations';
    $files = glob($migrationsDir . '/*.sql');
    
    if (empty($files)) {
        echo "No migration files found in $migrationsDir\n";
        return;
    }
    
    // Sort files by name to ensure order
    natsort($files);
    
    $executed = getExecutedMigrations($pdo);
    $executedSet = array_flip($executed);
    
    foreach ($files as $file) {
        $version = basename($file, '.sql');
        
        if (isset($executedSet[$version])) {
            echo "- Migration $version already executed, skipping\n";
            continue;
        }
        
        runMigration($pdo, $file);
    }
}

// Main execution
try {
    $pdo = getDatabaseConnection();
    createMigrationsTable($pdo);
    
    if ($argc > 1) {
        // Run specific migration
        $migrationFile = $argv[1];
        if (!file_exists($migrationFile)) {
            die("Migration file not found: $migrationFile\n");
        }
        runMigration($pdo, $migrationFile);
    } else {
        // Run all pending migrations
        echo "Running all pending migrations...\n";
        runAllMigrations($pdo);
        echo "\nMigration process completed.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

