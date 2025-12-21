<?php
/**
 * Response Utility
 * Standardized JSON responses for API
 */

function sendResponse($data = null, $statusCode = 200, $message = null) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    
    $response = [
        'success' => $statusCode >= 200 && $statusCode < 300,
        'status' => $statusCode,
    ];
    
    if ($message !== null) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendSuccess($data = null, $message = null, $statusCode = 200) {
    sendResponse($data, $statusCode, $message);
}

function sendError($message, $statusCode = 400, $errors = null) {
    $data = null;
    if ($errors !== null) {
        $data = ['errors' => $errors];
    }
    sendResponse($data, $statusCode, $message);
}

function sendUnauthorized($message = 'Unauthorized') {
    sendError($message, 401);
}

function sendForbidden($message = 'Forbidden') {
    sendError($message, 403);
}

function sendNotFound($message = 'Resource not found') {
    sendError($message, 404);
}

function sendValidationError($errors, $message = 'Validation failed') {
    sendError($message, 422, $errors);
}

