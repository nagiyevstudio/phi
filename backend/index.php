<?php
/**
 * API Entry Point
 * Simple router for API endpoints
 */

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get request path
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remove script name and query string
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace(dirname($scriptName), '', $path);
$path = trim($path, '/');

// Remove 'api' prefix if present
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

$path = trim($path, '/');
$method = $_SERVER['REQUEST_METHOD'];

// Route to appropriate API file
$routes = [
    'auth/register' => 'api/auth.php',
    'auth/login' => 'api/auth.php',
    'auth/logout' => 'api/auth.php',
    'me' => 'api/me.php',
    'categories' => 'api/categories.php',
    'operations' => 'api/operations.php',
    'months' => 'api/budget.php',
    'analytics' => 'api/analytics.php',
    'export' => 'api/export.php',
];

// Handle dynamic routes (e.g., /months/:month/budget, /operations/:id)
$matchedRoute = null;
$params = [];

// Parse path
$pathParts = explode('/', trim($path, '/'));
$firstPart = $pathParts[0] ?? '';

// Handle special cases with parameters first
if ($firstPart === 'months' && count($pathParts) >= 3) {
    $matchedRoute = 'api/budget.php';
    $params['month'] = $pathParts[1];
    $params['action'] = $pathParts[2];
} elseif ($firstPart === 'operations') {
    $matchedRoute = 'api/operations.php';
    if (count($pathParts) >= 2 && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $pathParts[1])) {
        $params['id'] = $pathParts[1];
    }
} elseif ($firstPart === 'categories') {
    $matchedRoute = 'api/categories.php';
    if (count($pathParts) >= 3 && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $pathParts[1])) {
        $params['id'] = $pathParts[1];
        $params['action'] = $pathParts[2];
    }
} elseif (isset($routes[$path])) {
    // Exact match
    $matchedRoute = $routes[$path];
} elseif (isset($routes[$firstPart])) {
    // First part match (for routes without params like /me, /analytics, /export)
    $matchedRoute = $routes[$firstPart];
} elseif (file_exists(__DIR__ . "/api/$firstPart.php")) {
    // Try direct file mapping for simple paths
    $matchedRoute = "api/$firstPart.php";
}

// Store route params in a global for API files to access
$GLOBALS['route_params'] = $params;
$GLOBALS['request_method'] = $method;

// Include the matched API file
if ($matchedRoute && file_exists(__DIR__ . '/' . $matchedRoute)) {
    require_once __DIR__ . '/' . $matchedRoute;
} else {
    require_once __DIR__ . '/utils/response.php';
    sendNotFound('Endpoint not found');
}

