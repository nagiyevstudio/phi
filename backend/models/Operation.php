<?php
/**
 * Operation Model
 * Financial operation data access and operations
 */

require_once __DIR__ . '/../utils/database.php';
require_once __DIR__ . '/../utils/validation.php';

class Operation {
    private $pdo;
    
    public function __construct() {
        $this->pdo = Database::getPDO();
    }
    
    public function create($userId, $type, $amountMinor, $categoryId, $date, $note = null) {
        // Validate input
        if (!validateOperationType($type)) {
            throw new InvalidArgumentException('Invalid operation type');
        }
        
        if (!validateAmount($amountMinor)) {
            throw new InvalidArgumentException('Amount must be positive');
        }
        
        if (!validateUUID($categoryId)) {
            throw new InvalidArgumentException('Invalid category ID');
        }
        
        if (!validateDate($date)) {
            throw new InvalidArgumentException('Invalid date format');
        }
        
        // Verify category belongs to user and is correct type
        $categoryStmt = $this->pdo->prepare("SELECT id, type FROM categories WHERE id = ? AND user_id = ? AND is_archived = FALSE");
        $categoryStmt->execute([$categoryId, $userId]);
        $category = $categoryStmt->fetch();
        
        if (!$category) {
            throw new Exception('Category not found');
        }
        
        if ($category['type'] !== $type) {
            throw new Exception('Category type does not match operation type');
        }
        
        $stmt = $this->pdo->prepare("
            INSERT INTO operations (user_id, type, amount_minor, category_id, date, note, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        ");
        
        $stmt->execute([$userId, $type, $amountMinor, $categoryId, $date, $note]);
        return $stmt->fetch();
    }
    
    public function findById($id, $userId = null) {
        $sql = "SELECT o.*, c.name as category_name, c.type as category_type, c.color as category_color
                FROM operations o
                JOIN categories c ON o.category_id = c.id
                WHERE o.id = ?";
        $params = [$id];
        
        if ($userId) {
            $sql .= " AND o.user_id = ?";
            $params[] = $userId;
        }
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }
    
    public function findAll($userId, $filters = [], $page = 1, $pageSize = 50) {
        $sql = "SELECT o.*, c.name as category_name, c.type as category_type, c.color as category_color
                FROM operations o
                JOIN categories c ON o.category_id = c.id
                WHERE o.user_id = ?";
        $params = [$userId];
        
        // Apply filters
        if (!empty($filters['month'])) {
            $sql .= " AND DATE_TRUNC('month', o.date) = DATE_TRUNC('month', ?::date)";
            $params[] = $filters['month'] . '-01';
        }
        
        if (!empty($filters['type'])) {
            $sql .= " AND o.type = ?";
            $params[] = $filters['type'];
        }
        
        if (!empty($filters['categoryId'])) {
            $sql .= " AND o.category_id = ?";
            $params[] = $filters['categoryId'];
        }
        
        if (!empty($filters['q'])) {
            $sql .= " AND (o.note ILIKE ? OR c.name ILIKE ?)";
            $searchTerm = '%' . $filters['q'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        // Order by date (newest first)
        $sql .= " ORDER BY o.date DESC, o.created_at DESC";
        
        // Get total count
        $countSql = "SELECT COUNT(*) FROM (" . str_replace('SELECT o.*, c.name as category_name, c.type as category_type, c.color as category_color', 'SELECT o.id', $sql) . ") as count_query";
        $countStmt = $this->pdo->prepare($countSql);
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();
        
        // Apply pagination
        $offset = ($page - 1) * $pageSize;
        $sql .= " LIMIT ? OFFSET ?";
        $params[] = $pageSize;
        $params[] = $offset;
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $data = $stmt->fetchAll();
        
        return [
            'data' => $data,
            'total' => (int)$total,
            'page' => $page,
            'pageSize' => $pageSize,
            'totalPages' => (int)ceil($total / $pageSize)
        ];
    }
    
    public function update($id, $userId, $data) {
        $updates = [];
        $params = [];
        
        if (isset($data['amount_minor'])) {
            if (!validateAmount($data['amount_minor'])) {
                throw new InvalidArgumentException('Amount must be positive');
            }
            $updates[] = "amount_minor = ?";
            $params[] = $data['amount_minor'];
        }
        
        if (isset($data['category_id'])) {
            if (!validateUUID($data['category_id'])) {
                throw new InvalidArgumentException('Invalid category ID');
            }
            // Verify category
            $categoryStmt = $this->pdo->prepare("SELECT id, type FROM categories WHERE id = ? AND user_id = ? AND is_archived = FALSE");
            $categoryStmt->execute([$data['category_id'], $userId]);
            $category = $categoryStmt->fetch();
            
            if (!$category) {
                throw new Exception('Category not found');
            }
            
            // Get current operation type if not changing
            if (!isset($data['type'])) {
                $currentOp = $this->findById($id, $userId);
                if ($currentOp && $currentOp['type'] !== $category['type']) {
                    throw new Exception('Category type does not match operation type');
                }
            } elseif ($data['type'] !== $category['type']) {
                throw new Exception('Category type does not match operation type');
            }
            
            $updates[] = "category_id = ?";
            $params[] = $data['category_id'];
        }
        
        if (isset($data['type'])) {
            if (!validateOperationType($data['type'])) {
                throw new InvalidArgumentException('Invalid operation type');
            }
            $updates[] = "type = ?";
            $params[] = $data['type'];
        }
        
        if (isset($data['date'])) {
            if (!validateDate($data['date'])) {
                throw new InvalidArgumentException('Invalid date format');
            }
            $updates[] = "date = ?";
            $params[] = $data['date'];
        }
        
        if (isset($data['note'])) {
            $updates[] = "note = ?";
            $params[] = $data['note'];
        }
        
        if (empty($updates)) {
            return $this->findById($id, $userId);
        }
        
        $updates[] = "updated_at = CURRENT_TIMESTAMP";
        $params[] = $id;
        $params[] = $userId;
        
        $sql = "UPDATE operations SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ? RETURNING *";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }
    
    public function delete($id, $userId) {
        $stmt = $this->pdo->prepare("DELETE FROM operations WHERE id = ? AND user_id = ? RETURNING id");
        $stmt->execute([$id, $userId]);
        return $stmt->fetch();
    }
    
    public function getSumByType($userId, $type, $month = null) {
        $sql = "SELECT COALESCE(SUM(amount_minor), 0) as total
                FROM operations
                WHERE user_id = ? AND type = ?";
        $params = [$userId, $type];
        
        if ($month) {
            $sql .= " AND DATE_TRUNC('month', date) = DATE_TRUNC('month', ?::date)";
            $params[] = $month . '-01';
        }
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }
}

