<?php
/**
 * Authentication Configuration
 * JWT token settings
 */

// Load environment variables if .env file exists
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

return [
    'jwt_secret' => $_ENV['JWT_SECRET'] ?? 'change-this-secret-key-in-production',
    'jwt_algorithm' => 'HS256',
    'jwt_expiration' => 86400 * 7, // 7 days in seconds
    'password_algorithm' => PASSWORD_BCRYPT,
    'password_options' => ['cost' => 12],
];

