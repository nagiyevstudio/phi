<?php
/**
 * Analytics API
 * Provides aggregated analytics data for a month or yearly income summary
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
$year = $_GET['year'] ?? null;

try {
    $pdo = Database::getPDO();
    $operationModel = new Operation();

    if ($month) {
        if (!validateMonth($month)) {
            sendValidationError(['month' => 'Invalid month format (expected YYYY-MM)']);
        }

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
    }

    if (!$year) {
        sendValidationError([
            'month' => 'Month parameter is required (YYYY-MM) or provide year (YYYY) for income analytics',
            'year' => 'Year parameter is required (YYYY) or provide month (YYYY-MM) for monthly analytics'
        ]);
    }

    if (!validateYear($year)) {
        sendValidationError(['year' => 'Invalid year format (expected YYYY)']);
    }

    $startDate = $year . '-01-01';
    $nextYear = (string)((int)$year + 1);
    $endDate = $nextYear . '-01-01';

    $totalIncomeSql = "
        SELECT COALESCE(SUM(o.amount_minor), 0) as total
        FROM operations o
        WHERE o.user_id = ? 
            AND o.type = 'income'
            AND o.date >= ?
            AND o.date < ?
    ";

    $stmt = $pdo->prepare($totalIncomeSql);
    $stmt->execute([$userId, $startDate, $endDate]);
    $totalIncome = (int)$stmt->fetchColumn();

    $categoryIncomeSql = "
        SELECT 
            c.id,
            c.name,
            c.color,
            COALESCE(SUM(o.amount_minor), 0) as total_minor,
            COUNT(o.id) as transaction_count
        FROM categories c
        LEFT JOIN operations o ON c.id = o.category_id 
            AND o.user_id = ? 
            AND o.type = 'income'
            AND o.date >= ?
            AND o.date < ?
        WHERE c.user_id = ? 
            AND c.type = 'income'
            AND c.is_archived = FALSE
        GROUP BY c.id, c.name, c.color
        HAVING COUNT(o.id) > 0
        ORDER BY total_minor DESC
    ";

    $stmt = $pdo->prepare($categoryIncomeSql);
    $stmt->execute([$userId, $startDate, $endDate, $userId]);
    $categoryIncome = $stmt->fetchAll();

    $categoryIncomeData = array_map(function($row) use ($totalIncome) {
        $total = (int)$row['total_minor'];
        $percentage = $totalIncome > 0 ? round(($total / $totalIncome) * 100, 2) : 0;

        return [
            'categoryId' => $row['id'],
            'categoryName' => $row['name'],
            'color' => $row['color'],
            'totalMinor' => $total,
            'percentage' => $percentage,
            'transactionCount' => (int)$row['transaction_count']
        ];
    }, $categoryIncome);

    $monthlyIncomeSql = "
        SELECT 
            DATE_FORMAT(o.date, '%Y-%m') as month,
            COALESCE(SUM(o.amount_minor), 0) as total_minor,
            COUNT(o.id) as transaction_count
        FROM operations o
        WHERE o.user_id = ? 
            AND o.type = 'income'
            AND o.date >= ?
            AND o.date < ?
        GROUP BY DATE_FORMAT(o.date, '%Y-%m')
        ORDER BY month ASC
    ";

    $stmt = $pdo->prepare($monthlyIncomeSql);
    $stmt->execute([$userId, $startDate, $endDate]);
    $monthlyIncome = $stmt->fetchAll();

    $monthlyIncomeData = array_map(function($row) {
        return [
            'month' => $row['month'],
            'totalMinor' => (int)$row['total_minor'],
            'transactionCount' => (int)$row['transaction_count']
        ];
    }, $monthlyIncome);

    sendSuccess([
        'year' => $year,
        'totalMinor' => $totalIncome,
        'incomeByCategory' => $categoryIncomeData,
        'incomeByMonth' => $monthlyIncomeData
    ]);
    
} catch (Exception $e) {
    sendError('Failed to get analytics: ' . $e->getMessage(), 500);
}

