<?php
/**
 * Monthly Budget Model
 * Monthly budget data access and operations
 */

require_once __DIR__ . '/../utils/database.php';
require_once __DIR__ . '/../utils/validation.php';

class MonthlyBudget {
    private $pdo;
    
    public function __construct() {
        $this->pdo = Database::getPDO();
    }
    
    public function createOrUpdate($userId, $month, $plannedAmountMinor) {
        // Validate input
        if (!validateMonth($month)) {
            throw new InvalidArgumentException('Invalid month format (expected YYYY-MM)');
        }
        
        if (!is_numeric($plannedAmountMinor) || $plannedAmountMinor < 0) {
            throw new InvalidArgumentException('Planned amount must be non-negative');
        }
        
        // Check if budget already exists
        $existing = $this->findByMonth($userId, $month);
        
        if ($existing) {
            // Update existing budget
            $stmt = $this->pdo->prepare("
                UPDATE monthly_budgets 
                SET planned_amount_minor = ?, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND month = ?
            ");
            $stmt->execute([$plannedAmountMinor, $userId, $month]);
            return $this->findByMonth($userId, $month);
        } else {
            // Create new budget
            $budgetId = generateUUID();
            $stmt = $this->pdo->prepare("
                INSERT INTO monthly_budgets (id, user_id, month, planned_amount_minor, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");
            $stmt->execute([$budgetId, $userId, $month, $plannedAmountMinor]);
            
            // Fetch created budget
            return $this->findByMonth($userId, $month);
        }
    }
    
    public function findByMonth($userId, $month) {
        if (!validateMonth($month)) {
            throw new InvalidArgumentException('Invalid month format (expected YYYY-MM)');
        }
        
        $stmt = $this->pdo->prepare("SELECT * FROM monthly_budgets WHERE user_id = ? AND month = ?");
        $stmt->execute([$userId, $month]);
        return $stmt->fetch();
    }
    
    public function findAll($userId, $limit = null) {
        $sql = "SELECT * FROM monthly_budgets WHERE user_id = ? ORDER BY month DESC";
        if ($limit) {
            $sql .= " LIMIT ?";
        }
        
        $stmt = $this->pdo->prepare($sql);
        if ($limit) {
            $stmt->execute([$userId, $limit]);
        } else {
            $stmt->execute([$userId]);
        }
        return $stmt->fetchAll();
    }
    
    public function delete($userId, $month) {
        if (!validateMonth($month)) {
            throw new InvalidArgumentException('Invalid month format (expected YYYY-MM)');
        }
        
        // Fetch budget before deletion
        $budget = $this->findByMonth($userId, $month);
        if (!$budget) {
            return null;
        }
        
        $stmt = $this->pdo->prepare("DELETE FROM monthly_budgets WHERE user_id = ? AND month = ?");
        $stmt->execute([$userId, $month]);
        
        return ['id' => $budget['id']];
    }
}

