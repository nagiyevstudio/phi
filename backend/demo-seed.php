<?php
/**
 * Demo Account Seeder (CLI)
 * Creates a demo user account with realistic financial data for product presentation
 * 
 * Usage:
 *   php demo-seed.php
 *   php demo-seed.php --email=demo@example.com --password=demo123
 *   php demo-seed.php --force
 */

// Only run from CLI
if (php_sapi_name() !== 'cli') {
    die("This script can only be run from command line.\n");
}

require_once __DIR__ . '/utils/demo-seeder.php';

// Parse command line arguments
$options = [
    'email' => 'demo@phi.local',
    'password' => 'demo123456',
    'name' => 'Demo User',
    'force' => false
];

foreach ($argv as $arg) {
    if (strpos($arg, '--email=') === 0) {
        $options['email'] = substr($arg, 8);
    } elseif (strpos($arg, '--password=') === 0) {
        $options['password'] = substr($arg, 11);
    } elseif (strpos($arg, '--name=') === 0) {
        $options['name'] = substr($arg, 7);
    } elseif ($arg === '--force') {
        $options['force'] = true;
    }
}

echo "=== PHI Demo Account Seeder ===\n\n";
echo "Email: {$options['email']}\n";
echo "Name: {$options['name']}\n\n";

try {
    $stats = createDemoAccount($options, function($message) {
        echo $message;
    });
    
    // Print statistics
    echo "=== Statistics ===\n";
    echo "User ID: {$stats['userId']}\n";
    echo "Email: {$stats['email']}\n";
    echo "Password: {$stats['password']}\n";
    echo "Expense Categories: {$stats['expenseCategories']}\n";
    echo "Income Categories: {$stats['incomeCategories']}\n";
    echo "Income Operations: {$stats['incomeOperations']}\n";
    echo "Expense Operations: {$stats['expenseOperations']}\n";
    echo "Monthly Budgets: {$stats['monthlyBudgets']}\n";
    echo "\n=== Demo account created successfully! ===\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

