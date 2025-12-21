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

function requireAuth() {
    $authHeader = getAuthorizationHeader();
    
    // Extract Bearer token
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        $payload = validateJWT($token);
        
        if ($payload && isset($payload['user_id']) && isset($payload['email'])) {
            // Store user info in session for easy access
            $_SESSION['user_id'] = $payload['user_id'];
            $_SESSION['user_email'] = $payload['email'];
            $_SESSION['jwt_payload'] = $payload;
            return $payload['user_id'];
        }
    }
    
    sendUnauthorized('Authentication required');
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

function requireOwnership($userId, $resourceUserId, $resourceName = 'Resource') {
    if ($userId !== $resourceUserId) {
        sendForbidden("You don't have permission to access this $resourceName");
    }
}

