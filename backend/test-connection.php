<?php
/**
 * Test script to check database connection and PHP configuration
 * Remove this file after testing
 */

header('Content-Type: application/json');

$result = [
    'php_version' => phpversion(),
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'errors' => [],
    'database' => null
];

    try {
        require_once __DIR__ . '/config/database.php';
        $config = require __DIR__ . '/config/database.php';
        
        $result['database_config'] = [
            'host' => $config['host'],
            'port' => $config['port'],
            'dbname' => $config['dbname'],
            'user' => $config['username'],
            'password_set' => !empty($config['password'])
        ];
        
        // MySQL connection
        $dsn = "mysql:host={$config['host']};port={$config['port']};dbname={$config['dbname']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]);
        
        $result['database'] = [
            'connected' => true,
            'version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
            'connection_method' => 'tcp'
        ];
    } catch (Exception $e) {
        $result['database'] = [
            'connected' => false,
            'error' => $e->getMessage()
        ];
        $result['errors'][] = $e->getMessage();
    }

echo json_encode($result, JSON_PRETTY_PRINT);

