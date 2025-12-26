<?php
/**
 * Operations API
 * Handles CRUD operations for financial operations
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/middleware.php';
require_once __DIR__ . '/../models/Operation.php';

$method = $_SERVER['REQUEST_METHOD'];
$routeParams = $GLOBALS['route_params'] ?? [];
$id = $routeParams['id'] ?? null;

// Require authentication
$userId = requireAuth();

$operationModel = new Operation();

switch ($method) {
    case 'GET':
        if ($id) {
            handleGetOperation($operationModel, $userId, $id);
        } else {
            handleListOperations($operationModel, $userId);
        }
        break;
        
    case 'POST':
        requireWriteAccess($userId);
        handleCreateOperation($operationModel, $userId);
        break;
        
    case 'PUT':
        if ($id) {
            requireWriteAccess($userId);
            handleUpdateOperation($operationModel, $userId, $id);
        } else {
            sendNotFound('Operation ID required');
        }
        break;
        
    case 'DELETE':
        if ($id) {
            requireWriteAccess($userId);
            handleDeleteOperation($operationModel, $userId, $id);
        } else {
            sendNotFound('Operation ID required');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function handleListOperations($operationModel, $userId) {
    $filters = [];
    
    // Parse query parameters
    $month = $_GET['month'] ?? null;
    if ($month && validateMonth($month)) {
        $filters['month'] = $month;
    }
    
    $type = $_GET['type'] ?? null;
    if ($type && validateOperationType($type)) {
        $filters['type'] = $type;
    }
    
    $categoryId = $_GET['categoryId'] ?? null;
    if ($categoryId && validateUUID($categoryId)) {
        $filters['categoryId'] = $categoryId;
    }
    
    $q = $_GET['q'] ?? null;
    if ($q) {
        $filters['q'] = sanitizeString($q);
    }
    
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    // Allow larger pageSize to load all operations for a month (max 10000 for safety)
    $pageSize = isset($_GET['pageSize']) ? min((int)$_GET['pageSize'], 10000) : 50;
    
    try {
        $result = $operationModel->findAll($userId, $filters, $page, $pageSize);
        
        // Format response
        $formattedData = array_map(function($op) {
            return [
                'id' => $op['id'],
                'type' => $op['type'],
                'amountMinor' => (int)$op['amount_minor'],
                'note' => $op['note'],
                'categoryId' => $op['category_id'],
                'categoryName' => $op['category_name'],
                'categoryType' => $op['category_type'],
                'categoryColor' => $op['category_color'],
                'date' => formatOperationDate($op['date']),
                'createdAt' => $op['created_at'],
                'updatedAt' => $op['updated_at']
            ];
        }, $result['data']);
        
        sendSuccess([
            'operations' => $formattedData,
            'pagination' => [
                'total' => $result['total'],
                'page' => $result['page'],
                'pageSize' => $result['pageSize'],
                'totalPages' => $result['totalPages']
            ]
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to list operations: ' . $e->getMessage(), 500);
    }
}

function handleGetOperation($operationModel, $userId, $id) {
    if (!validateUUID($id)) {
        sendValidationError(['id' => 'Invalid operation ID format']);
    }
    
    try {
        $operation = $operationModel->findById($id, $userId);
        
        if (!$operation) {
            sendNotFound('Operation not found');
        }
        
        sendSuccess([
            'id' => $operation['id'],
            'type' => $operation['type'],
            'amountMinor' => (int)$operation['amount_minor'],
            'note' => $operation['note'],
            'categoryId' => $operation['category_id'],
            'categoryName' => $operation['category_name'],
            'categoryType' => $operation['category_type'],
            'categoryColor' => $operation['category_color'],
            'date' => formatOperationDate($operation['date']),
            'createdAt' => $operation['created_at'],
            'updatedAt' => $operation['updated_at']
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to get operation: ' . $e->getMessage(), 500);
    }
}

function handleCreateOperation($operationModel, $userId) {
    $data = getJSONInput();
    
    if (!$data) {
        sendError('Invalid JSON input');
    }
    
    $errors = [];
    
    $type = $data['type'] ?? null;
    if (empty($type)) {
        $errors['type'] = 'Type is required';
    } elseif (!validateOperationType($type)) {
        $errors['type'] = 'Invalid operation type';
    }
    
    $amountMinor = isset($data['amountMinor']) ? (int)$data['amountMinor'] : null;
    if ($amountMinor === null || $amountMinor <= 0) {
        $errors['amountMinor'] = 'Amount must be a positive number';
    }
    
    $categoryId = $data['categoryId'] ?? null;
    if (empty($categoryId)) {
        $errors['categoryId'] = 'Category ID is required';
    } elseif (!validateUUID($categoryId)) {
        $errors['categoryId'] = 'Invalid category ID format';
    }
    
    $date = $data['date'] ?? date('Y-m-d H:i:s');
    if (!validateDate($date)) {
        $errors['date'] = 'Invalid date format (expected YYYY-MM-DD or YYYY-MM-DDTHH:MM)';
    }
    
    $note = isset($data['note']) ? sanitizeString($data['note']) : null;
    
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    try {
        $operation = $operationModel->create($userId, $type, $amountMinor, $categoryId, $date, $note);
        
        sendSuccess([
            'id' => $operation['id'],
            'type' => $operation['type'],
            'amountMinor' => (int)$operation['amount_minor'],
            'note' => $operation['note'],
            'categoryId' => $operation['category_id'],
            'date' => formatOperationDate($operation['date']),
            'createdAt' => $operation['created_at'],
            'updatedAt' => $operation['updated_at']
        ], 'Operation created successfully', 201);
        
    } catch (Exception $e) {
        sendError('Failed to create operation: ' . $e->getMessage(), 500);
    }
}

function handleUpdateOperation($operationModel, $userId, $id) {
    if (!validateUUID($id)) {
        sendValidationError(['id' => 'Invalid operation ID format']);
    }
    
    $data = getJSONInput();
    
    if (!$data) {
        sendError('Invalid JSON input');
    }
    
    // Build update data
    $updateData = [];
    
    if (isset($data['type'])) {
        if (!validateOperationType($data['type'])) {
            sendValidationError(['type' => 'Invalid operation type']);
        }
        $updateData['type'] = $data['type'];
    }
    
    if (isset($data['amountMinor'])) {
        $amountMinor = (int)$data['amountMinor'];
        if ($amountMinor <= 0) {
            sendValidationError(['amountMinor' => 'Amount must be positive']);
        }
        $updateData['amount_minor'] = $amountMinor;
    }
    
    if (isset($data['categoryId'])) {
        if (!validateUUID($data['categoryId'])) {
            sendValidationError(['categoryId' => 'Invalid category ID format']);
        }
        $updateData['category_id'] = $data['categoryId'];
    }
    
    if (isset($data['date'])) {
        if (!validateDate($data['date'])) {
            sendValidationError(['date' => 'Invalid date format (expected YYYY-MM-DD or YYYY-MM-DDTHH:MM)']);
        }
        $updateData['date'] = $data['date'];
    }
    
    if (isset($data['note'])) {
        $updateData['note'] = sanitizeString($data['note']);
    }
    
    if (empty($updateData)) {
        sendError('No fields to update');
    }
    
    try {
        $operation = $operationModel->update($id, $userId, $updateData);
        
        if (!$operation) {
            sendNotFound('Operation not found');
        }
        
        sendSuccess([
            'id' => $operation['id'],
            'type' => $operation['type'],
            'amountMinor' => (int)$operation['amount_minor'],
            'note' => $operation['note'],
            'categoryId' => $operation['category_id'],
            'date' => formatOperationDate($operation['date']),
            'updatedAt' => $operation['updated_at']
        ], 'Operation updated successfully');
        
    } catch (Exception $e) {
        sendError('Failed to update operation: ' . $e->getMessage(), 500);
    }
}

function formatOperationDate($value) {
    if (!$value) {
        return $value;
    }

    $value = trim($value);
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return $value;
    }

    try {
        $dt = new DateTime($value);
        return $dt->format('Y-m-d\TH:i:s');
    } catch (Exception $e) {
        return $value;
    }
}

function handleDeleteOperation($operationModel, $userId, $id) {
    if (!validateUUID($id)) {
        sendValidationError(['id' => 'Invalid operation ID format']);
    }
    
    try {
        $operation = $operationModel->delete($id, $userId);
        
        if (!$operation) {
            sendNotFound('Operation not found');
        }
        
        sendSuccess(null, 'Operation deleted successfully');
        
    } catch (Exception $e) {
        sendError('Failed to delete operation: ' . $e->getMessage(), 500);
    }
}

