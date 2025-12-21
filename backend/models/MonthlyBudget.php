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
        
        $stmt = $this->pdo->prepare("
            INSERT INTO monthly_budgets (user_id, month, planned_amount_minor, created_at, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, month)
            DO UPDATE SET 
                planned_amount_minor = EXCLUDED.planned_amount_minor,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        ");
        
        $stmt->execute([$userId, $month, $plannedAmountMinor]);
        return $stmt->fetch();
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
        
        $stmt = $this->pdo->prepare("DELETE FROM monthly_budgets WHERE user_id = ? AND month = ? RETURNING id");
        $stmt->execute([$userId, $month]);
        return $stmt->fetch();
    }
}

