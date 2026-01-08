<?php
/**
 * Demo Account Seeder API
 * Web endpoint for creating demo account with financial data
 * 
 * Usage:
 *   POST /api/demo-seed
 *   Body: {
 *     "secret": "your-secret-key",
 *     "email": "demo@phi.local",
 *     "password": "demo123456",
 *     "name": "Demo User",
 *     "force": false
 *   }
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/demo-seeder.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Only allow POST
if ($method !== 'POST') {
    sendError('Method not allowed. Use POST.', 405);
}

// Get secret key from environment or use default for development
$requiredSecret = $_ENV['DEMO_SEED_SECRET'] ?? 'demo-seed-secret-key-change-me';

// Get request data
$data = getJSONInput();

if (!$data) {
    sendError('Invalid JSON input');
}

// Verify secret key
$providedSecret = $data['secret'] ?? '';

if (empty($providedSecret) || $providedSecret !== $requiredSecret) {
    sendUnauthorized('Invalid or missing secret key');
}

// Prepare options
$options = [
    'email' => $data['email'] ?? 'demo@phi.local',
    'password' => $data['password'] ?? 'demo123456',
    'name' => $data['name'] ?? 'Demo User',
    'force' => isset($data['force']) ? (bool)$data['force'] : false
];

// Collect output for response
$outputMessages = [];
$outputCallback = function($message) use (&$outputMessages) {
    $outputMessages[] = $message;
};

try {
    $stats = createDemoAccount($options, $outputCallback);
    
    sendSuccess([
        'statistics' => $stats,
        'output' => implode('', $outputMessages)
    ], 'Demo account created successfully');
    
} catch (InvalidArgumentException $e) {
    sendValidationError(['message' => $e->getMessage()], 'Validation failed');
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}

