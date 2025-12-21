<?php
/**
 * Categories API
 * Handles CRUD operations for categories
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/middleware.php';
require_once __DIR__ . '/../models/Category.php';

$method = $_SERVER['REQUEST_METHOD'];
$routeParams = $GLOBALS['route_params'] ?? [];
$id = $routeParams['id'] ?? null;
$action = $routeParams['action'] ?? null;

// Require authentication
$userId = requireAuth();

$categoryModel = new Category();

switch ($method) {
    case 'GET':
        handleListCategories($categoryModel, $userId);
        break;
        
    case 'POST':
        handleCreateCategory($categoryModel, $userId);
        break;
        
    case 'PUT':
        if ($id) {
            handleUpdateCategory($categoryModel, $userId, $id);
        } else {
            sendNotFound('Category ID required');
        }
        break;
        
    case 'PATCH':
        if ($id && $action === 'archive') {
            handleArchiveCategory($categoryModel, $userId, $id);
        } else {
            sendNotFound('Endpoint not found');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function handleListCategories($categoryModel, $userId) {
    $type = $_GET['type'] ?? null;
    $includeArchived = isset($_GET['includeArchived']) && $_GET['includeArchived'] === 'true';
    
    if ($type && !validateCategoryType($type)) {
        sendValidationError(['type' => 'Invalid category type']);
    }
    
    try {
        $categories = $categoryModel->findAll($userId, $type, $includeArchived);
        
        $formattedCategories = array_map(function($cat) {
            return [
                'id' => $cat['id'],
                'type' => $cat['type'],
                'name' => $cat['name'],
                'color' => $cat['color'],
                'isArchived' => (bool)$cat['is_archived'],
                'createdAt' => $cat['created_at'],
                'updatedAt' => $cat['updated_at']
            ];
        }, $categories);
        
        sendSuccess(['categories' => $formattedCategories]);
        
    } catch (Exception $e) {
        sendError('Failed to list categories: ' . $e->getMessage(), 500);
    }
}

function handleCreateCategory($categoryModel, $userId) {
    $data = getJSONInput();
    
    if (!$data) {
        sendError('Invalid JSON input');
    }
    
    $errors = [];
    
    $type = $data['type'] ?? null;
    if (empty($type)) {
        $errors['type'] = 'Type is required';
    } elseif (!validateCategoryType($type)) {
        $errors['type'] = 'Invalid category type';
    }
    
    $name = isset($data['name']) ? trim($data['name']) : '';
    if (empty($name)) {
        $errors['name'] = 'Name is required';
    }
    
    $color = isset($data['color']) && !empty($data['color']) ? $data['color'] : null;
    if ($color && !validateColor($color)) {
        $errors['color'] = 'Invalid color format (expected #RRGGBB)';
    }
    
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    try {
        $category = $categoryModel->create($userId, $type, $name, $color);
        
        sendSuccess([
            'id' => $category['id'],
            'type' => $category['type'],
            'name' => $category['name'],
            'color' => $category['color'],
            'isArchived' => (bool)$category['is_archived'],
            'createdAt' => $category['created_at'],
            'updatedAt' => $category['updated_at']
        ], 'Category created successfully', 201);
        
    } catch (Exception $e) {
        $message = $e->getMessage();
        if (strpos($message, 'already exists') !== false) {
            sendError('Category with this name already exists', 409);
        } else {
            sendError('Failed to create category: ' . $message, 500);
        }
    }
}

function handleUpdateCategory($categoryModel, $userId, $id) {
    if (!validateUUID($id)) {
        sendValidationError(['id' => 'Invalid category ID format']);
    }
    
    $data = getJSONInput();
    
    if (!$data) {
        sendError('Invalid JSON input');
    }
    
    $name = isset($data['name']) ? trim($data['name']) : null;
    $color = isset($data['color']) ? ($data['color'] === '' ? null : $data['color']) : null;
    
    if ($name === '' || (empty($name) && $name !== null)) {
        sendValidationError(['name' => 'Name cannot be empty']);
    }
    
    if ($color !== null && !validateColor($color)) {
        sendValidationError(['color' => 'Invalid color format (expected #RRGGBB)']);
    }
    
    try {
        $category = $categoryModel->update($id, $userId, $name, $color);
        
        if (!$category) {
            sendNotFound('Category not found');
        }
        
        sendSuccess([
            'id' => $category['id'],
            'type' => $category['type'],
            'name' => $category['name'],
            'color' => $category['color'],
            'isArchived' => (bool)$category['is_archived'],
            'updatedAt' => $category['updated_at']
        ], 'Category updated successfully');
        
    } catch (Exception $e) {
        sendError('Failed to update category: ' . $e->getMessage(), 500);
    }
}

function handleArchiveCategory($categoryModel, $userId, $id) {
    if (!validateUUID($id)) {
        sendValidationError(['id' => 'Invalid category ID format']);
    }
    
    try {
        $category = $categoryModel->archive($id, $userId);
        
        if (!$category) {
            sendNotFound('Category not found');
        }
        
        sendSuccess([
            'id' => $category['id'],
            'isArchived' => (bool)$category['is_archived']
        ], 'Category archived successfully');
        
    } catch (Exception $e) {
        sendError('Failed to archive category: ' . $e->getMessage(), 500);
    }
}

