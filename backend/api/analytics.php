<?php
/**
 * Analytics API
 * Provides aggregated analytics data for a month
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/middleware.php';
require_once __DIR__ . '/../utils/database.php';
require_once __DIR__ . '/../models/Operation.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

// Require authentication
$userId = requireAuth();

$month = $_GET['month'] ?? null;

if (!$month) {
    sendValidationError(['month' => 'Month parameter is required (YYYY-MM)']);
}

if (!validateMonth($month)) {
    sendValidationError(['month' => 'Invalid month format (expected YYYY-MM)']);
}

try {
    $pdo = Database::getPDO();
    $operationModel = new Operation();
    
    // Get totals
    $incomeSum = $operationModel->getSumByType($userId, 'income', $month);
    $expenseSum = $operationModel->getSumByType($userId, 'expense', $month);
    $net = $incomeSum - $expenseSum;
    
    // Expenses by category
    $categoryExpensesSql = "
        SELECT 
            c.id,
            c.name,
            c.color,
            COALESCE(SUM(o.amount_minor), 0) as total_minor,
            COUNT(o.id) as transaction_count
        FROM categories c
        LEFT JOIN operations o ON c.id = o.category_id 
            AND o.user_id = ? 
            AND o.type = 'expense'
            AND DATE_FORMAT(o.date, '%Y-%m-01') = DATE_FORMAT(?, '%Y-%m-01')
        WHERE c.user_id = ? 
            AND c.type = 'expense'
            AND c.is_archived = FALSE
        GROUP BY c.id, c.name, c.color
        HAVING COUNT(o.id) > 0
        ORDER BY total_minor DESC
    ";
    
    $stmt = $pdo->prepare($categoryExpensesSql);
    $stmt->execute([$userId, $month . '-01', $userId]);
    $categoryExpenses = $stmt->fetchAll();
    
    // Format category expenses
    $categoryData = array_map(function($row) use ($expenseSum) {
        $total = (int)$row['total_minor'];
        $percentage = $expenseSum > 0 ? round(($total / $expenseSum) * 100, 2) : 0;
        
        return [
            'categoryId' => $row['id'],
            'categoryName' => $row['name'],
            'color' => $row['color'],
            'totalMinor' => $total,
            'percentage' => $percentage,
            'transactionCount' => (int)$row['transaction_count']
        ];
    }, $categoryExpenses);
    
    // Expenses by day
    $dailyExpensesSql = "
        SELECT 
            DATE(o.date) as date,
            COALESCE(SUM(o.amount_minor), 0) as total_minor,
            COUNT(o.id) as transaction_count
        FROM operations o
        WHERE o.user_id = ? 
            AND o.type = 'expense'
            AND DATE_FORMAT(o.date, '%Y-%m-01') = DATE_FORMAT(?, '%Y-%m-01')
        GROUP BY DATE(o.date)
        ORDER BY DATE(o.date) ASC
    ";
    
    $stmt = $pdo->prepare($dailyExpensesSql);
    $stmt->execute([$userId, $month . '-01']);
    $dailyExpenses = $stmt->fetchAll();
    
    // Format daily expenses
    $dailyData = array_map(function($row) {
        return [
            'date' => $row['date'],
            'totalMinor' => (int)$row['total_minor'],
            'transactionCount' => (int)$row['transaction_count']
        ];
    }, $dailyExpenses);
    
    sendSuccess([
        'month' => $month,
        'totals' => [
            'incomeMinor' => $incomeSum,
            'expenseMinor' => $expenseSum,
            'netMinor' => $net
        ],
        'expensesByCategory' => $categoryData,
        'expensesByDay' => $dailyData
    ]);
    
} catch (Exception $e) {
    sendError('Failed to get analytics: ' . $e->getMessage(), 500);
}

