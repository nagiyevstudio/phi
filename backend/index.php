<?php
// Align date calculations (e.g., daily limits) with the expected local timezone.
$defaultTimezone = getenv('APP_TIMEZONE') ?: 'Asia/Baku';
date_default_timezone_set($defaultTimezone);

// Устанавливаем заголовки CORS в самом начале, до любых операций
// Разрешаем запросы с production домена и localhost для разработки
$allowedOrigins = [
    'https://finance.nagiyev.com',
    'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
];

// Получаем Origin из заголовков запроса
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['ORIGIN'] ?? '';

// Определяем разрешенный Origin
$allowedOrigin = 'https://finance.nagiyev.com'; // По умолчанию production домен
if (!empty($origin) && in_array($origin, $allowedOrigins)) {
    $allowedOrigin = $origin;
}

// Устанавливаем CORS заголовки ДО любой другой обработки
header("Access-Control-Allow-Origin: $allowedOrigin", true);
header("Access-Control-Allow-Credentials: true", true);
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS", true);
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin", true);
header("Access-Control-Max-Age: 86400", true); // Кеш preflight запросов на 24 часа
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0', true);
header('Pragma: no-cache', true);
header('Expires: 0', true);
header('X-Content-Type-Options: nosniff', true);
header('Referrer-Policy: no-referrer', true);
header('X-Frame-Options: DENY', true);
header('X-Robots-Tag: noindex, nofollow, noarchive', true);

// Обработка preflight запросов (браузер сначала "спрашивает" разрешение)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    header('Content-Length: 0', true);
    header('Content-Type: text/plain', true);
    exit(0);
}

// Настройка обработки ошибок
error_reporting(E_ALL);
ini_set('display_errors', 0); // Не показывать ошибки в выводе (для безопасности)
ini_set('log_errors', 1); // Логировать ошибки
ini_set('error_log', __DIR__ . '/error.log');

// Обработчик фатальных ошибок
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'status' => 500,
            'message' => 'Internal server error'
        ]);
    }
});

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get request path
$path = '';

// Проверяем PATH_INFO сначала (используется при rewrite через .htaccess)
if (isset($_SERVER['PATH_INFO']) && !empty($_SERVER['PATH_INFO'])) {
    $path = trim($_SERVER['PATH_INFO'], '/');
} else {
    // Иначе парсим из REQUEST_URI
    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    
    // Получаем путь из URL (без query string)
    $urlPath = parse_url($requestUri, PHP_URL_PATH) ?? '';
    
    // Простой подход: извлекаем путь после /api/
    if (preg_match('#^/api/(.+)$#', $urlPath, $matches)) {
        $path = $matches[1]; // Получаем все что после /api/
    } elseif ($urlPath === '/api' || $urlPath === '/api/') {
        $path = '';
    } else {
        // Если путь не содержит /api/, пытаемся найти путь относительно скрипта
        if (!empty($scriptName)) {
            $scriptNameOnly = basename($scriptName);
            if (strpos($urlPath, '/' . $scriptNameOnly) !== false) {
                $path = preg_replace('#.*/' . preg_quote($scriptNameOnly, '#') . '/?#', '', $urlPath);
            } else {
                $path = trim($urlPath, '/');
            }
        } else {
            $path = trim($urlPath, '/');
        }
        
        // Удаляем 'api' из начала если есть
        if (strpos($path, 'api/') === 0) {
            $path = substr($path, 4);
        }
    }
    
    $path = trim($path, '/');
}

// Если путь все еще содержит 'api/', удаляем его
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
    $path = trim($path, '/');
}
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
    if (count($pathParts) >= 2 && preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $pathParts[1])) {
        $params['id'] = $pathParts[1];
        if (count($pathParts) >= 3) {
            $params['action'] = $pathParts[2];
        }
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
try {
    if ($matchedRoute && file_exists(__DIR__ . '/' . $matchedRoute)) {
        require_once __DIR__ . '/' . $matchedRoute;
    } else {
        require_once __DIR__ . '/utils/response.php';
        sendNotFound('Endpoint not found');
    }
} catch (Throwable $e) {
    error_log("API Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'status' => 500,
        'message' => 'Internal server error'
    ], JSON_UNESCAPED_UNICODE);
}

