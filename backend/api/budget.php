<?php
/**
 * Budget API
 * Handles monthly budget operations and calculations
 */

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/validation.php';
require_once __DIR__ . '/../utils/middleware.php';
require_once __DIR__ . '/../models/MonthlyBudget.php';
require_once __DIR__ . '/../models/Operation.php';

$method = $_SERVER['REQUEST_METHOD'];
$routeParams = $GLOBALS['route_params'] ?? [];
$month = $routeParams['month'] ?? null;
$action = $routeParams['action'] ?? null;

// Require authentication
$userId = requireAuth();

switch ($method) {
    case 'GET':
        if ($month && $action === 'budget') {
            handleGetBudget($userId, $month);
        } else {
            sendNotFound('Endpoint not found');
        }
        break;
        
    case 'PUT':
        if ($month && $action === 'budget') {
            handleSetBudget($userId, $month);
        } else {
            sendNotFound('Endpoint not found');
        }
        break;
        
    default:
        sendError('Method not allowed', 405);
        break;
}

function handleGetBudget($userId, $month) {
    if (!validateMonth($month)) {
        sendValidationError(['month' => 'Invalid month format (expected YYYY-MM)']);
    }
    
    try {
        $budgetModel = new MonthlyBudget();
        $budget = $budgetModel->findByMonth($userId, $month);
        
        $planned = $budget ? (int)$budget['planned_amount_minor'] : 0;
        
        // Calculate expense sum
        $operationModel = new Operation();
        $expenseSum = $operationModel->getSumByType($userId, 'expense', $month);
        $incomeSum = $operationModel->getSumByType($userId, 'income', $month);
        
        // Calculate remaining
        $remaining = $planned - $expenseSum;
        
        // Calculate days left
        $daysLeft = calculateDaysLeft($month);
        
        // Calculate daily limit
        $dailyLimit = 0;
        if ($daysLeft > 0) {
            $dailyLimit = max(0, $remaining) / max(1, $daysLeft);
        }
        
        sendSuccess([
            'month' => $month,
            'planned' => $planned,
            'expenseSum' => $expenseSum,
            'incomeSum' => $incomeSum,
            'remaining' => $remaining,
            'daysLeft' => $daysLeft,
            'dailyLimit' => round($dailyLimit, 2),
            'isOverBudget' => $remaining < 0
        ]);
        
    } catch (Exception $e) {
        sendError('Failed to get budget: ' . $e->getMessage(), 500);
    }
}

function handleSetBudget($userId, $month) {
    if (!validateMonth($month)) {
        sendValidationError(['month' => 'Invalid month format (expected YYYY-MM)']);
    }
    
    $data = getJSONInput();
    
    if (!$data || !isset($data['plannedAmountMinor'])) {
        sendError('plannedAmountMinor is required');
    }
    
    $plannedAmountMinor = (int)$data['plannedAmountMinor'];
    
    if ($plannedAmountMinor < 0) {
        sendValidationError(['plannedAmountMinor' => 'Planned amount must be non-negative']);
    }
    
    try {
        $budgetModel = new MonthlyBudget();
        $budget = $budgetModel->createOrUpdate($userId, $month, $plannedAmountMinor);
        
        sendSuccess([
            'month' => $budget['month'],
            'plannedAmountMinor' => (int)$budget['planned_amount_minor']
        ], 'Budget saved successfully');
        
    } catch (Exception $e) {
        sendError('Failed to set budget: ' . $e->getMessage(), 500);
    }
}

function calculateDaysLeft($month) {
    $currentDate = new DateTime();
    $monthDate = DateTime::createFromFormat('Y-m-d', $month . '-01');
    
    if (!$monthDate) {
        return 0;
    }
    
    $currentMonth = $currentDate->format('Y-m');
    $targetMonth = $monthDate->format('Y-m');
    
    // If target month is in the past
    if ($targetMonth < $currentMonth) {
        return 0;
    }
    
    // If target month is in the future
    if ($targetMonth > $currentMonth) {
        return $monthDate->format('t'); // Number of days in the month
    }
    
    // Current month: calculate days including today
    $lastDayOfMonth = (int)$monthDate->format('t');
    $today = (int)$currentDate->format('d');
    $daysLeft = $lastDayOfMonth - $today + 1;
    
    return max(0, $daysLeft);
}

