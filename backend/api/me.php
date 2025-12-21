<?php
/**
 * User Profile API
 * Get current user information
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/middleware.php';
require_once __DIR__ . '/../models/User.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

// Require authentication
$userId = requireAuth();

try {
    $userModel = new User();
    $user = $userModel->findById($userId);
    
    if (!$user) {
        sendNotFound('User not found');
    }
    
    sendSuccess([
        'id' => $user['id'],
        'email' => $user['email'],
        'createdAt' => $user['created_at'],
        'updatedAt' => $user['updated_at']
    ]);
    
} catch (Exception $e) {
    sendError('Failed to get user profile: ' . $e->getMessage(), 500);
}

