<?php
/**
 * Middleware Utility
 * Authentication and authorization middleware
 */

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/response.php';

function requireAuth() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
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
    
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
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

