<?php
/**
 * Authentication API
 * Handles user registration, login, logout
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../models/User.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'] ?? '';
$routeParams = $GLOBALS['route_params'] ?? [];

// Extract endpoint from path (e.g., /api/auth/login -> login)
$pathParts = explode('/', trim(parse_url($path, PHP_URL_PATH), '/'));
$endpoint = '';
if (count($pathParts) >= 2 && $pathParts[count($pathParts) - 2] === 'auth') {
    $endpoint = end($pathParts);
}

switch ($method) {
    case 'POST':
        if ($endpoint === 'register' || strpos($path, '/auth/register') !== false) {
            handleRegister();
        } elseif ($endpoint === 'login' || strpos($path, '/auth/login') !== false) {
            handleLogin();
        } elseif ($endpoint === 'logout' || strpos($path, '/auth/logout') !== false) {
            handleLogout();
        } else {
            sendNotFound('Endpoint not found');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function handleRegister() {
    $data = getJSONInput();
    
    if (!$data) {
        sendError('Invalid JSON input');
    }
    
    $email = sanitizeString($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $confirmPassword = $data['confirmPassword'] ?? $password;
    
    // Validation
    $errors = [];
    
    if (empty($email)) {
        $errors['email'] = 'Email is required';
    } elseif (!validateEmail($email)) {
        $errors['email'] = 'Invalid email format';
    }
    
    if (empty($password)) {
        $errors['password'] = 'Password is required';
    } elseif (!validatePassword($password)) {
        $errors['password'] = 'Password must be at least 8 characters';
    }
    
    if ($password !== $confirmPassword) {
        $errors['confirmPassword'] = 'Passwords do not match';
    }
    
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    // Create user
    try {
        $userModel = new User();
        $user = $userModel->create($email, $password);
        
        // Generate JWT token
        $token = generateJWT($user['id'], $user['email']);
        
        sendSuccess([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'createdAt' => $user['created_at']
            ],
            'token' => $token
        ], 'User registered successfully', 201);
        
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'already exists') !== false) {
            sendError('User with this email already exists', 409);
        } else {
            sendError('Registration failed: ' . $e->getMessage(), 500);
        }
    }
}

function handleLogin() {
    $data = getJSONInput();
    
    if (!$data) {
        sendError('Invalid JSON input');
    }
    
    $email = sanitizeString($data['email'] ?? '');
    $password = $data['password'] ?? '';
    
    // Validation
    if (empty($email)) {
        sendValidationError(['email' => 'Email is required']);
    }
    
    if (empty($password)) {
        sendValidationError(['password' => 'Password is required']);
    }
    
    // Verify credentials
    try {
        $userModel = new User();
        $user = $userModel->verifyCredentials($email, $password);
        
        if (!$user) {
            sendError('Invalid email or password', 401);
        }
        
        // Generate JWT token
        $token = generateJWT($user['id'], $user['email']);
        
        sendSuccess([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'createdAt' => $user['created_at']
            ],
            'token' => $token
        ], 'Login successful');
        
    } catch (Exception $e) {
        sendError('Login failed: ' . $e->getMessage(), 500);
    }
}

function handleLogout() {
    // For JWT, logout is handled client-side by removing the token
    // But we can clear server-side session if using sessions
    session_destroy();
    
    sendSuccess(null, 'Logout successful');
}

