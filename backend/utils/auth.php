<?php
/**
 * Authentication Utility
 * JWT token generation/validation and password hashing
 */

require_once __DIR__ . '/../config/auth.php';

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateJWT($userId, $email) {
    $config = getAuthConfig();
    $secret = $config['jwt_secret'];
    $expiration = time() + $config['jwt_expiration'];
    
    $header = [
        'typ' => 'JWT',
        'alg' => $config['jwt_algorithm']
    ];
    
    $payload = [
        'user_id' => $userId,
        'email' => $email,
        'iat' => time(),
        'exp' => $expiration
    ];
    
    $headerEncoded = base64UrlEncode(json_encode($header));
    $payloadEncoded = base64UrlEncode(json_encode($payload));
    
    $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);
    $signatureEncoded = base64UrlEncode($signature);
    
    return "$headerEncoded.$payloadEncoded.$signatureEncoded";
}

function validateJWT($token) {
    $config = getAuthConfig();
    $secret = $config['jwt_secret'];
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    
    list($headerEncoded, $payloadEncoded, $signatureEncoded) = $parts;
    
    // Verify signature
    $signature = base64UrlDecode($signatureEncoded);
    $expectedSignature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return null;
    }
    
    $payload = json_decode(base64UrlDecode($payloadEncoded), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

function hashPassword($password) {
    $config = getAuthConfig();
    return password_hash($password, $config['password_algorithm'], $config['password_options']);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function getAuthConfig() {
    static $config = null;
    if ($config === null) {
        $config = require __DIR__ . '/../config/auth.php';
    }
    return $config;
}

function getCurrentUserId() {
    // This will be set by middleware
    return $_SESSION['user_id'] ?? null;
}

function getCurrentUserEmail() {
    // This will be set by middleware
    return $_SESSION['user_email'] ?? null;
}

