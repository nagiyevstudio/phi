<?php
/**
 * Category Model
 * Category data access and operations
 */

require_once __DIR__ . '/../utils/database.php';
require_once __DIR__ . '/../utils/validation.php';

class Category {
    private $pdo;
    
    public function __construct() {
        $this->pdo = Database::getPDO();
    }
    
    public function create($userId, $type, $name, $color = null) {
        // Validate input
        if (!validateCategoryType($type)) {
            throw new InvalidArgumentException('Invalid category type');
        }
        
        if (empty($name)) {
            throw new InvalidArgumentException('Category name is required');
        }
        
        if ($color && !validateColor($color)) {
            throw new InvalidArgumentException('Invalid color format');
        }
        
        $categoryId = generateUUID();
        
        $stmt = $this->pdo->prepare("
            INSERT INTO categories (id, user_id, type, name, color, is_archived, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ");
        
        try {
            $stmt->execute([$categoryId, $userId, $type, $name, $color]);
            
            // Fetch created category
            $stmt = $this->pdo->prepare("SELECT id, user_id, type, name, color, is_archived, created_at, updated_at FROM categories WHERE id = ?");
            $stmt->execute([$categoryId]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            if ($e->getCode() == 1062) { // Unique violation
                throw new Exception('Category with this name already exists');
            }
            throw $e;
        }
    }
    
    public function findAll($userId, $type = null, $includeArchived = false) {
        $sql = "SELECT * FROM categories WHERE user_id = ?";
        $params = [$userId];
        
        if ($type) {
            $sql .= " AND type = ?";
            $params[] = $type;
        }
        
        if (!$includeArchived) {
            $sql .= " AND is_archived = FALSE";
        }
        
        $sql .= " ORDER BY name ASC";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    public function findById($id, $userId = null) {
        $sql = "SELECT * FROM categories WHERE id = ?";
        $params = [$id];
        
        if ($userId) {
            $sql .= " AND user_id = ?";
            $params[] = $userId;
        }
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }
    
    public function update($id, $userId, $name = null, $color = null) {
        $updates = [];
        $params = [];
        
        if ($name !== null) {
            $updates[] = "name = ?";
            $params[] = $name;
        }
        
        if ($color !== null) {
            if ($color === '') {
                $updates[] = "color = NULL";
            } else {
                if (!validateColor($color)) {
                    throw new InvalidArgumentException('Invalid color format');
                }
                $updates[] = "color = ?";
                $params[] = $color;
            }
        }
        
        if (empty($updates)) {
            return $this->findById($id, $userId);
        }
        
        $updates[] = "updated_at = CURRENT_TIMESTAMP";
        $params[] = $id;
        $params[] = $userId;
        
        $sql = "UPDATE categories SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ?";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        // Fetch updated category
        return $this->findById($id, $userId);
    }
    
    public function archive($id, $userId) {
        // Check if category is used in operations
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM operations WHERE category_id = ?");
        $stmt->execute([$id]);
        $count = $stmt->fetchColumn();
        
        // Archive category
        $stmt = $this->pdo->prepare("
            UPDATE categories 
            SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([$id, $userId]);
        
        // Fetch updated category
        return $this->findById($id, $userId);
    }
    
    public function isUsed($id) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM operations WHERE category_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetchColumn() > 0;
    }
}

