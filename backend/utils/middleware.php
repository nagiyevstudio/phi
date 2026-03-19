<?php
/**
 * Middleware Utility
 * Authentication and authorization middleware
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/response.php';

/**
 * Получает заголовок Authorization разными способами
 */
function getAuthorizationHeader() {
    // Способ 1: через $_SERVER['HTTP_AUTHORIZATION'] (для CGI/FastCGI и .htaccess правила)
    if (isset($_SERVER['HTTP_AUTHORIZATION']) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
        return $_SERVER['HTTP_AUTHORIZATION'];
    }
    
    // Способ 2: через getallheaders() (для Apache)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if ($headers) {
            foreach (['Authorization', 'authorization', 'AUTHORIZATION'] as $key) {
                if (isset($headers[$key])) {
                    return $headers[$key];
                }
            }
        }
    }
    
    // Способ 3: через REDIRECT_HTTP_AUTHORIZATION (для некоторых конфигураций Apache)
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    
    // Способ 4: через apache_request_headers() если доступна
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if ($headers) {
            foreach (['Authorization', 'authorization', 'AUTHORIZATION'] as $key) {
                if (isset($headers[$key])) {
                    return $headers[$key];
                }
            }
        }
    }
    
    return '';
}

function getBearerToken() {
    $authHeader = getAuthorizationHeader();

    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }

    return '';
}

function getClientIpAddress() {
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (empty($_SERVER[$key])) {
            continue;
        }

        $value = trim((string)$_SERVER[$key]);
        if ($key === 'HTTP_X_FORWARDED_FOR') {
            $parts = explode(',', $value);
            return trim($parts[0]);
        }

        return $value;
    }

    return null;
}

function getApiKeyRequiredScopes($path = null, $method = null) {
    $path = trim((string)($path ?? ($GLOBALS['request_path'] ?? '')), '/');
    $method = strtoupper((string)($method ?? ($_SERVER['REQUEST_METHOD'] ?? 'GET')));
    $firstPart = explode('/', $path)[0] ?? '';

    switch ($firstPart) {
        case 'operations':
            return $method === 'GET' ? ['operations:read'] : ['operations:write'];
        case 'categories':
            return $method === 'GET' ? ['categories:read'] : ['categories:write'];
        case 'months':
            return $method === 'GET' ? ['budgets:read'] : ['budgets:write'];
        case 'analytics':
            return ['analytics:read'];
        case 'export':
            return ['export:read'];
        case 'me':
            return ['profile:read'];
        case 'api-keys':
            return null;
        default:
            return null;
    }
}

function apiKeyHasScopes($grantedScopes, $requiredScopes) {
    if (in_array('*', $grantedScopes, true)) {
        return true;
    }

    foreach ($requiredScopes as $scope) {
        if (!in_array($scope, $grantedScopes, true)) {
            return false;
        }
    }

    return true;
}

function setAuthenticatedSession(array $context) {
    $_SESSION['user_id'] = $context['user_id'];
    $_SESSION['user_email'] = $context['email'] ?? null;
    $_SESSION['user_role'] = $context['role'] ?? null;
    $_SESSION['auth_type'] = $context['auth_type'];
    $_SESSION['auth_scopes'] = $context['scopes'] ?? [];
    $_SESSION['jwt_payload'] = $context['jwt_payload'] ?? null;
    $_SESSION['api_key_id'] = $context['api_key_id'] ?? null;
    $_SESSION['api_key_name'] = $context['api_key_name'] ?? null;
}

function resolveAuthContext() {
    $token = getBearerToken();
    if ($token === '') {
        return null;
    }

    if (strpos($token, 'phi_') === 0) {
        $parsedKey = parseApiKeyToken($token);
        if (!$parsedKey) {
            return null;
        }

        require_once __DIR__ . '/../models/ApiKey.php';
        $apiKeyModel = new ApiKey();
        $apiKey = $apiKeyModel->findActiveByPrefix($parsedKey['prefix']);

        if (!$apiKey) {
            return null;
        }

        if (!verifyApiKeyToken($parsedKey['prefix'], $parsedKey['secret'], $apiKey['key_hash'])) {
            return null;
        }

        $scopes = $apiKeyModel->parseScopes($apiKey['scopes']);

        return [
            'auth_type' => 'api_key',
            'user_id' => $apiKey['user_id'],
            'email' => $apiKey['user_email'] ?? null,
            'role' => $apiKey['user_role'] ?? null,
            'api_key_id' => $apiKey['id'],
            'api_key_name' => $apiKey['name'],
            'scopes' => $scopes
        ];
    }

    $payload = validateJWT($token);
    if (!$payload || !isset($payload['user_id']) || !isset($payload['email'])) {
        return null;
    }

    return [
        'auth_type' => 'jwt',
        'user_id' => $payload['user_id'],
        'email' => $payload['email'],
        'role' => $payload['role'] ?? null,
        'jwt_payload' => $payload,
        'scopes' => ['*']
    ];
}

function requireAuth($requiredScopes = null) {
    $context = resolveAuthContext();
    if (!$context) {
        sendUnauthorized('Authentication required');
    }

    if ($context['auth_type'] === 'api_key') {
        $requiredScopes = $requiredScopes ?? getApiKeyRequiredScopes();
        if (empty($requiredScopes)) {
            sendForbidden('API key access is not available for this endpoint');
        }

        if (!apiKeyHasScopes($context['scopes'], $requiredScopes)) {
            sendForbidden('API key does not have permission for this endpoint');
        }

        require_once __DIR__ . '/../models/ApiKey.php';
        $apiKeyModel = new ApiKey();
        $apiKeyModel->touchUsage($context['api_key_id'], getClientIpAddress());
    }

    setAuthenticatedSession($context);
    return $context['user_id'];
}

function requireJwtAuth() {
    $context = resolveAuthContext();
    if (!$context || $context['auth_type'] !== 'jwt') {
        sendUnauthorized('JWT authentication required');
    }

    setAuthenticatedSession($context);
    return $context['user_id'];
}

function getAuthenticatedUserId() {
    if (isset($_SESSION['user_id'])) {
        return $_SESSION['user_id'];
    }
    
    $authHeader = getAuthorizationHeader();
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        $payload = validateJWT($token);
        
        if ($payload && isset($payload['user_id'])) {
            $_SESSION['user_id'] = $payload['user_id'];
            $_SESSION['user_email'] = $payload['email'] ?? null;
            return $payload['user_id'];
        }
    }
    
    return null;
}

function getAuthenticatedUserRole($userId) {
    if (isset($_SESSION['user_role']) && $_SESSION['user_role'] !== null) {
        return $_SESSION['user_role'];
    }

    if (isset($_SESSION['jwt_payload']) && isset($_SESSION['jwt_payload']['role'])) {
        $_SESSION['user_role'] = $_SESSION['jwt_payload']['role'];
        return $_SESSION['user_role'];
    }

    require_once __DIR__ . '/../models/User.php';
    $userModel = new User();
    $user = $userModel->findById($userId);
    $role = $user['role'] ?? null;
    $_SESSION['user_role'] = $role;
    return $role;
}

function requireOwnerAccess($userId) {
    $role = getAuthenticatedUserRole($userId);
    if ($role !== 'owner') {
        sendForbidden('Owner access required');
    }
}

function requireWriteAccess($userId) {
    $role = getAuthenticatedUserRole($userId);
    if (!in_array($role, ['owner', 'editor'], true)) {
        sendForbidden('Read-only access');
    }
}

function requireOwnership($userId, $resourceUserId, $resourceName = 'Resource') {
    if ($userId !== $resourceUserId) {
        sendForbidden("You don't have permission to access this $resourceName");
    }
}

