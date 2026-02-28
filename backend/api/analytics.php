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
$years = $_GET['years'] ?? null;
$overall = $_GET['overall'] ?? null;

try {
    $pdo = Database::getPDO();
    $operationModel = new Operation();

    if ($overall === 'income') {
        $totalIncomeSql = "
            SELECT COALESCE(SUM(o.amount_minor), 0) as total
            FROM operations o
            WHERE o.user_id = ? 
                AND o.type = 'income'
        ";

        $stmt = $pdo->prepare($totalIncomeSql);
        $stmt->execute([$userId]);
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
            WHERE c.user_id = ? 
                AND c.type = 'income'
                AND c.is_archived = FALSE
            GROUP BY c.id, c.name, c.color
            HAVING COUNT(o.id) > 0
            ORDER BY total_minor DESC
        ";

        $stmt = $pdo->prepare($categoryIncomeSql);
        $stmt->execute([$userId, $userId]);
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

        $incomeByCategoryYearSql = "
            SELECT 
                YEAR(o.date) as year,
                c.id,
                c.name,
                c.color,
                COALESCE(SUM(o.amount_minor), 0) as total_minor
            FROM operations o
            JOIN categories c ON o.category_id = c.id
            WHERE o.user_id = ? 
                AND o.type = 'income'
                AND c.user_id = ?
                AND c.type = 'income'
                AND c.is_archived = FALSE
            GROUP BY YEAR(o.date), c.id, c.name, c.color
            ORDER BY year ASC, total_minor DESC
        ";

        $stmt = $pdo->prepare($incomeByCategoryYearSql);
        $stmt->execute([$userId, $userId]);
        $incomeByCategoryYear = $stmt->fetchAll();

        $incomeByCategoryYearData = array_map(function($row) {
            return [
                'year' => (string)$row['year'],
                'categoryId' => $row['id'],
                'categoryName' => $row['name'],
                'color' => $row['color'],
                'totalMinor' => (int)$row['total_minor']
            ];
        }, $incomeByCategoryYear);

        $incomeByYearSql = "
            SELECT 
                YEAR(o.date) as year,
                COALESCE(SUM(o.amount_minor), 0) as total_minor
            FROM operations o
            WHERE o.user_id = ? 
                AND o.type = 'income'
            GROUP BY YEAR(o.date)
            ORDER BY year ASC
        ";

        $stmt = $pdo->prepare($incomeByYearSql);
        $stmt->execute([$userId]);
        $incomeByYear = $stmt->fetchAll();

        $incomeByYearData = array_map(function($row) {
            return [
                'year' => (string)$row['year'],
                'totalMinor' => (int)$row['total_minor']
            ];
        }, $incomeByYear);

        $yearStats = null;
        if (!empty($incomeByYearData)) {
            $first = $incomeByYearData[0];
            $min = $first;
            $max = $first;
            $sumMinor = $first['totalMinor'];
            $count = count($incomeByYearData);

            for ($i = 1; $i < $count; $i++) {
                $row = $incomeByYearData[$i];
                $sumMinor += $row['totalMinor'];
                if ($row['totalMinor'] < $min['totalMinor']) {
                    $min = $row;
                }
                if ($row['totalMinor'] > $max['totalMinor']) {
                    $max = $row;
                }
            }

            $yearStats = [
                'max' => $max,
                'min' => $min,
                'averageMinor' => (int)round($sumMinor / $count)
            ];
        }

        sendSuccess([
            'totalMinor' => $totalIncome,
            'incomeByCategory' => $categoryIncomeData,
            'incomeByCategoryYear' => $incomeByCategoryYearData,
            'incomeByYear' => $incomeByYearData,
            'yearStats' => $yearStats
        ]);
    }

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

        // Income by category
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
                AND DATE_FORMAT(o.date, '%Y-%m-01') = DATE_FORMAT(?, '%Y-%m-01')
            WHERE c.user_id = ? 
                AND c.type = 'income'
                AND c.is_archived = FALSE
            GROUP BY c.id, c.name, c.color
            HAVING COUNT(o.id) > 0
            ORDER BY total_minor DESC
        ";

        $stmt = $pdo->prepare($categoryIncomeSql);
        $stmt->execute([$userId, $month . '-01', $userId]);
        $categoryIncome = $stmt->fetchAll();

        $incomeCategoryData = array_map(function($row) use ($incomeSum) {
            $total = (int)$row['total_minor'];
            $percentage = $incomeSum > 0 ? round(($total / $incomeSum) * 100, 2) : 0;

            return [
                'categoryId' => $row['id'],
                'categoryName' => $row['name'],
                'color' => $row['color'],
                'totalMinor' => $total,
                'percentage' => $percentage,
                'transactionCount' => (int)$row['transaction_count']
            ];
        }, $categoryIncome);

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
            'incomesByCategory' => $incomeCategoryData,
            'expensesByDay' => $dailyData
        ]);
    }

    if ($years === 'income') {
        $incomeYearsSql = "
            SELECT DISTINCT YEAR(o.date) as year
            FROM operations o
            WHERE o.user_id = ?
                AND o.type = 'income'
            ORDER BY year DESC
        ";

        $stmt = $pdo->prepare($incomeYearsSql);
        $stmt->execute([$userId]);
        $incomeYears = array_map(
            'strval',
            array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'year')
        );

        sendSuccess([
            'years' => $incomeYears
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

