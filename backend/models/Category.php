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
        
        $stmt = $this->pdo->prepare("
            INSERT INTO categories (user_id, type, name, color, is_archived, created_at, updated_at)
            VALUES (?, ?, ?, ?, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, user_id, type, name, color, is_archived, created_at, updated_at
        ");
        
        try {
            $stmt->execute([$userId, $type, $name, $color]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            if (strpos($e->getCode(), '23505') !== false) { // Unique violation
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
        
        $sql = "UPDATE categories SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ? RETURNING *";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }
    
    public function archive($id, $userId) {
        // Check if category is used in operations
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM operations WHERE category_id = ?");
        $stmt->execute([$id]);
        $count = $stmt->fetchColumn();
        
        if ($count > 0) {
            // Archive instead of delete
            $stmt = $this->pdo->prepare("
                UPDATE categories 
                SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ? AND user_id = ?
                RETURNING *
            ");
            $stmt->execute([$id, $userId]);
            return $stmt->fetch();
        }
        
        // If not used, we can delete (but for consistency, archive anyway)
        $stmt = $this->pdo->prepare("
            UPDATE categories 
            SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ? AND user_id = ?
            RETURNING *
        ");
        $stmt->execute([$id, $userId]);
        return $stmt->fetch();
    }
    
    public function isUsed($id) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM operations WHERE category_id = ?");
        $stmt->execute([$id]);
        return $stmt->fetchColumn() > 0;
    }
}

