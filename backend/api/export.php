<?php
/**
 * Export API
 * Exports user data in JSON or CSV format
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/middleware.php';
require_once __DIR__ . '/../models/Operation.php';
require_once __DIR__ . '/../models/Category.php';
require_once __DIR__ . '/../models/MonthlyBudget.php';

// Require authentication
$userId = requireAuth();

$format = $_GET['format'] ?? 'json';
$month = $_GET['month'] ?? null;

if (!in_array($format, ['json', 'csv'])) {
    sendValidationError(['format' => 'Invalid format (expected json or csv)']);
}

if ($month && !validateMonth($month)) {
    sendValidationError(['month' => 'Invalid month format (expected YYYY-MM)']);
}

try {
    $operationModel = new Operation();
    $categoryModel = new Category();
    $budgetModel = new MonthlyBudget();
    
    // Build filters
    $filters = [];
    if ($month) {
        $filters['month'] = $month;
    }
    
    // Get operations
    $operationsResult = $operationModel->findAll($userId, $filters, 1, 10000);
    $operations = $operationsResult['data'];
    
    // Get categories
    $categories = $categoryModel->findAll($userId, null, true);
    
    // Get budgets (if month specified, only that month; otherwise all)
    if ($month) {
        $budget = $budgetModel->findByMonth($userId, $month);
        $budgets = $budget ? [$budget] : [];
    } else {
        $budgets = $budgetModel->findAll($userId);
    }
    
    // Format data
    $exportData = [
        'exportDate' => date('Y-m-d H:i:s'),
        'month' => $month,
        'categories' => array_map(function($cat) {
            return [
                'id' => $cat['id'],
                'type' => $cat['type'],
                'name' => $cat['name'],
                'color' => $cat['color'],
                'isArchived' => (bool)$cat['is_archived']
            ];
        }, $categories),
        'operations' => array_map(function($op) {
            return [
                'id' => $op['id'],
                'type' => $op['type'],
                'amountMinor' => (int)$op['amount_minor'],
                'note' => $op['note'],
                'categoryId' => $op['category_id'],
                'categoryName' => $op['category_name'],
                'date' => $op['date']
            ];
        }, $operations),
        'budgets' => array_map(function($budget) {
            return [
                'month' => $budget['month'],
                'plannedAmountMinor' => (int)$budget['planned_amount_minor']
            ];
        }, $budgets)
    ];
    
    if ($format === 'json') {
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="perfinance_export_' . ($month ?? 'all') . '_' . date('Y-m-d') . '.json"');
        echo json_encode($exportData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    } else {
        // CSV format
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="perfinance_export_' . ($month ?? 'all') . '_' . date('Y-m-d') . '.csv"');
        
        $output = fopen('php://output', 'w');
        
        // BOM for UTF-8
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        // Operations CSV
        fputcsv($output, ['Type', 'Date', 'Category', 'Amount (minor units)', 'Note'], ';');
        foreach ($exportData['operations'] as $op) {
            fputcsv($output, [
                $op['type'],
                $op['date'],
                $op['categoryName'],
                $op['amountMinor'],
                $op['note'] ?? ''
            ], ';');
        }
        
        fclose($output);
    }
    
    exit;
    
} catch (Exception $e) {
    sendError('Failed to export data: ' . $e->getMessage(), 500);
}

