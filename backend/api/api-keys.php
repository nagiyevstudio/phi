<?php
/**
 * API Keys management API
 * JWT-only endpoint for issuing and revoking external server keys.
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/middleware.php';
require_once __DIR__ . '/../models/ApiKey.php';

$method = $_SERVER['REQUEST_METHOD'];
$routeParams = $GLOBALS['route_params'] ?? [];
$id = $routeParams['id'] ?? null;

$userId = requireJwtAuth();
requireOwnerAccess($userId);

$apiKeyModel = new ApiKey();

switch ($method) {
    case 'GET':
        handleListApiKeys($apiKeyModel, $userId);
        break;

    case 'POST':
        handleCreateApiKey($apiKeyModel, $userId);
        break;

    case 'DELETE':
        if (!$id) {
            sendNotFound('API key ID required');
        }
        handleRevokeApiKey($apiKeyModel, $userId, $id);
        break;

    default:
        sendError('Method not allowed', 405);
        break;
}

function handleListApiKeys($apiKeyModel, $userId) {
    try {
        sendSuccess([
            'apiKeys' => $apiKeyModel->findAllByUserId($userId),
            'allowedScopes' => ApiKey::getAllowedScopes()
        ]);
    } catch (Exception $e) {
        sendError('Failed to list API keys: ' . $e->getMessage(), 500);
    }
}

function handleCreateApiKey($apiKeyModel, $userId) {
    $data = getJSONInput();
    if (!$data) {
        sendError('Invalid JSON input');
    }

    $name = $data['name'] ?? '';
    $scopes = $data['scopes'] ?? [];
    $expiresAt = $data['expiresAt'] ?? null;

    try {
        $created = $apiKeyModel->create($userId, $name, $scopes, $expiresAt);
        sendSuccess([
            'apiKey' => $created['apiKey'],
            'apiKeyInfo' => $created['record']
        ], 'API key created successfully', 201);
    } catch (InvalidArgumentException $e) {
        sendValidationError([
            'message' => $e->getMessage()
        ]);
    } catch (Exception $e) {
        sendError('Failed to create API key: ' . $e->getMessage(), 500);
    }
}

function handleRevokeApiKey($apiKeyModel, $userId, $id) {
    if (!validateUUID($id)) {
        sendValidationError(['id' => 'Invalid API key ID format']);
    }

    try {
        $apiKey = $apiKeyModel->revoke($id, $userId);
        if (!$apiKey) {
            sendNotFound('API key not found');
        }

        sendSuccess($apiKey, 'API key revoked successfully');
    } catch (Exception $e) {
        sendError('Failed to revoke API key: ' . $e->getMessage(), 500);
    }
}
