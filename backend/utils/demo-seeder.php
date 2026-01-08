<?php
/**
 * Demo Account Seeder Utility
 * Core logic for creating demo account with financial data
 */

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/validation.php';
require_once __DIR__ . '/auth.php';

/**
 * Creates a demo user account with realistic financial data
 * 
 * @param array $options Options array with keys: email, password, name, force
 * @param callable|null $outputCallback Optional callback for output (for CLI mode)
 * @return array Statistics array with created data info
 * @throws Exception
 */
function createDemoAccount($options, $outputCallback = null) {
    $output = function($message) use ($outputCallback) {
        if ($outputCallback) {
            call_user_func($outputCallback, $message);
        }
    };
    
    // Validate email
    if (!validateEmail($options['email'])) {
        throw new InvalidArgumentException('Invalid email format');
    }
    
    // Validate password
    if (!validatePassword($options['password'])) {
        throw new InvalidArgumentException('Password must be at least 8 characters');
    }
    
    $pdo = Database::getPDO();
    
    // Check if demo user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$options['email']]);
    $existingUser = $stmt->fetch();
    
    if ($existingUser && !$options['force']) {
        throw new Exception("User with email '{$options['email']}' already exists. Use force option to recreate.");
    }
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        $userId = null;
        
        // Delete existing user and all related data if exists
        if ($existingUser) {
            $userId = $existingUser['id'];
            $output("Deleting existing demo account...\n");
            
            // Delete operations
            $stmt = $pdo->prepare("DELETE FROM operations WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            // Delete categories
            $stmt = $pdo->prepare("DELETE FROM categories WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            // Delete monthly budgets
            $stmt = $pdo->prepare("DELETE FROM monthly_budgets WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            // Delete user
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            
            $output("Existing account deleted.\n\n");
        }
        
        // Create demo user
        $output("Creating demo user...\n");
        $userId = generateUUID();
        $passwordHash = hashPassword($options['password']);
        
        $stmt = $pdo->prepare("
            INSERT INTO users (id, email, name, password_hash, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'owner', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ");
        $stmt->execute([$userId, $options['email'], $options['name'], $passwordHash]);
        $output("User created: {$userId}\n\n");
        
        // Define expense categories
        $expenseCategories = [
            ['name' => 'Продукты / Еда', 'color' => '#FF6B6B'],
            ['name' => 'Транспорт', 'color' => '#4ECDC4'],
            ['name' => 'Жилье / Коммунальные', 'color' => '#45B7D1'],
            ['name' => 'Здоровье / Медицина', 'color' => '#FFA07A'],
            ['name' => 'Развлечения', 'color' => '#98D8C8'],
            ['name' => 'Одежда', 'color' => '#F7DC6F'],
            ['name' => 'Образование', 'color' => '#BB8FCE'],
            ['name' => 'Прочее', 'color' => '#95A5A6']
        ];
        
        // Define income categories
        $incomeCategories = [
            ['name' => 'Зарплата', 'color' => '#2ECC71'],
            ['name' => 'Фриланс', 'color' => '#3498DB'],
            ['name' => 'Инвестиции', 'color' => '#9B59B6'],
            ['name' => 'Подарки', 'color' => '#E67E22']
        ];
        
        // Create expense categories
        $output("Creating expense categories...\n");
        $expenseCategoryIds = [];
        foreach ($expenseCategories as $cat) {
            $categoryId = generateUUID();
            $stmt = $pdo->prepare("
                INSERT INTO categories (id, user_id, type, name, color, is_archived, created_at, updated_at)
                VALUES (?, ?, 'expense', ?, ?, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");
            $stmt->execute([$categoryId, $userId, $cat['name'], $cat['color']]);
            $expenseCategoryIds[] = $categoryId;
            $output("  - {$cat['name']}\n");
        }
        $output("Created " . count($expenseCategoryIds) . " expense categories.\n\n");
        
        // Create income categories
        $output("Creating income categories...\n");
        $incomeCategoryIds = [];
        foreach ($incomeCategories as $cat) {
            $categoryId = generateUUID();
            $stmt = $pdo->prepare("
                INSERT INTO categories (id, user_id, type, name, color, is_archived, created_at, updated_at)
                VALUES (?, ?, 'income', ?, ?, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");
            $stmt->execute([$categoryId, $userId, $cat['name'], $cat['color']]);
            $incomeCategoryIds[] = $categoryId;
            $output("  - {$cat['name']}\n");
        }
        $output("Created " . count($incomeCategoryIds) . " income categories.\n\n");
        
        // Generate income operations (3 years)
        $output("Generating income operations (3 years)...\n");
        $now = new DateTime();
        $startDate = clone $now;
        $startDate->modify('-3 years');
        $startDate->modify('first day of this month');
        
        $incomeOperations = 0;
        $currentDate = clone $startDate;
        
        while ($currentDate <= $now) {
            $year = (int)$currentDate->format('Y');
            $month = (int)$currentDate->format('m');
            
            // Salary (1-2 times per month, usually at the beginning)
            $salaryCount = mt_rand(1, 2);
            for ($i = 0; $i < $salaryCount; $i++) {
                $day = mt_rand(1, 10); // Beginning of month
                $date = new DateTime("$year-$month-$day");
                $date->setTime(mt_rand(9, 18), mt_rand(0, 59));
                
                $amount = mt_rand(5000000, 10000000); // 50000-100000 in kopecks
                $categoryId = $incomeCategoryIds[0]; // Зарплата
                
                $operationId = generateUUID();
                $stmt = $pdo->prepare("
                    INSERT INTO operations (id, user_id, type, amount_minor, category_id, date, note, created_at, updated_at)
                    VALUES (?, ?, 'income', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ");
                $note = mt_rand(0, 3) === 0 ? 'Зарплата за ' . $date->format('F Y') : null;
                $stmt->execute([$operationId, $userId, $amount, $categoryId, $date->format('Y-m-d H:i:s'), $note]);
                $incomeOperations++;
            }
            
            // Freelance (0-2 times per month)
            $freelanceCount = mt_rand(0, 2);
            for ($i = 0; $i < $freelanceCount; $i++) {
                $day = mt_rand(1, 28);
                $date = new DateTime("$year-$month-$day");
                $date->setTime(mt_rand(9, 20), mt_rand(0, 59));
                
                $amount = mt_rand(1000000, 5000000); // 10000-50000 in kopecks
                $categoryId = $incomeCategoryIds[1]; // Фриланс
                
                $operationId = generateUUID();
                $stmt = $pdo->prepare("
                    INSERT INTO operations (id, user_id, type, amount_minor, category_id, date, note, created_at, updated_at)
                    VALUES (?, ?, 'income', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ");
                $notes = ['Проект #' . mt_rand(100, 999), 'Фриланс работа', null];
                $note = $notes[mt_rand(0, count($notes) - 1)];
                $stmt->execute([$operationId, $userId, $amount, $categoryId, $date->format('Y-m-d H:i:s'), $note]);
                $incomeOperations++;
            }
            
            // Investments (0-1 times per month)
            if (mt_rand(0, 2) === 0) {
                $day = mt_rand(1, 28);
                $date = new DateTime("$year-$month-$day");
                $date->setTime(mt_rand(10, 17), mt_rand(0, 59));
                
                $amount = mt_rand(500000, 2000000); // 5000-20000 in kopecks
                $categoryId = $incomeCategoryIds[2]; // Инвестиции
                
                $operationId = generateUUID();
                $stmt = $pdo->prepare("
                    INSERT INTO operations (id, user_id, type, amount_minor, category_id, date, note, created_at, updated_at)
                    VALUES (?, ?, 'income', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ");
                $note = mt_rand(0, 2) === 0 ? 'Дивиденды' : null;
                $stmt->execute([$operationId, $userId, $amount, $categoryId, $date->format('Y-m-d H:i:s'), $note]);
                $incomeOperations++;
            }
            
            // Gifts (rare, 0-1 times per 3 months)
            if (mt_rand(0, 8) === 0) {
                $day = mt_rand(1, 28);
                $date = new DateTime("$year-$month-$day");
                $date->setTime(mt_rand(10, 20), mt_rand(0, 59));
                
                $amount = mt_rand(200000, 1000000); // 2000-10000 in kopecks
                $categoryId = $incomeCategoryIds[3]; // Подарки
                
                $operationId = generateUUID();
                $stmt = $pdo->prepare("
                    INSERT INTO operations (id, user_id, type, amount_minor, category_id, date, note, created_at, updated_at)
                    VALUES (?, ?, 'income', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ");
                $note = 'Подарок';
                $stmt->execute([$operationId, $userId, $amount, $categoryId, $date->format('Y-m-d H:i:s'), $note]);
                $incomeOperations++;
            }
            
            $currentDate->modify('+1 month');
        }
        
        $output("Created $incomeOperations income operations.\n\n");
        
        // Generate expense operations (last 12 months)
        $output("Generating expense operations (last 12 months)...\n");
        $expenseStartDate = clone $now;
        $expenseStartDate->modify('-12 months');
        $expenseStartDate->modify('first day of this month');
        
        $expenseOperations = 0;
        $currentDate = clone $expenseStartDate;
        
        // Expense amount ranges per category (in kopecks)
        $expenseRanges = [
            0 => [200000, 800000],  // Продукты / Еда: 2000-8000
            1 => [50000, 300000],   // Транспорт: 500-3000
            2 => [300000, 1500000],  // Жилье / Коммунальные: 3000-15000
            3 => [100000, 500000],  // Здоровье / Медицина: 1000-5000
            4 => [50000, 400000],   // Развлечения: 500-4000
            5 => [100000, 600000],  // Одежда: 1000-6000
            6 => [200000, 800000],  // Образование: 2000-8000
            7 => [10000, 200000]    // Прочее: 100-2000
        ];
        
        // Expense notes per category
        $expenseNotes = [
            0 => ['Продукты', 'Супермаркет', 'Еда на неделю', 'Завтрак', 'Обед', null],
            1 => ['Такси', 'Метро', 'Автобус', 'Бензин', 'Парковка', null],
            2 => ['Аренда', 'Коммунальные', 'Электричество', 'Вода', 'Интернет', null],
            3 => ['Врач', 'Лекарства', 'Аптека', 'Стоматолог', null],
            4 => ['Кино', 'Ресторан', 'Кафе', 'Концерт', 'Развлечения', null],
            5 => ['Одежда', 'Обувь', 'Магазин', null],
            6 => ['Курсы', 'Книги', 'Обучение', null],
            7 => ['Прочее', 'Разное', null]
        ];
        
        while ($currentDate <= $now) {
            $year = (int)$currentDate->format('Y');
            $month = (int)$currentDate->format('m');
            $daysInMonth = (int)$currentDate->format('t');
            
            // Generate 5-15 expense operations per month
            $operationsCount = mt_rand(5, 15);
            
            for ($i = 0; $i < $operationsCount; $i++) {
                $day = mt_rand(1, $daysInMonth);
                $date = new DateTime("$year-$month-$day");
                $date->setTime(mt_rand(8, 22), mt_rand(0, 59));
                
                // Random category
                $categoryIndex = mt_rand(0, count($expenseCategoryIds) - 1);
                $categoryId = $expenseCategoryIds[$categoryIndex];
                
                // Random amount based on category
                $range = $expenseRanges[$categoryIndex];
                $amount = mt_rand($range[0], $range[1]);
                
                // Random note
                $notes = $expenseNotes[$categoryIndex];
                $note = $notes[mt_rand(0, count($notes) - 1)];
                
                $operationId = generateUUID();
                $stmt = $pdo->prepare("
                    INSERT INTO operations (id, user_id, type, amount_minor, category_id, date, note, created_at, updated_at)
                    VALUES (?, ?, 'expense', ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ");
                $stmt->execute([$operationId, $userId, $amount, $categoryId, $date->format('Y-m-d H:i:s'), $note]);
                $expenseOperations++;
            }
            
            $currentDate->modify('+1 month');
        }
        
        $output("Created $expenseOperations expense operations.\n\n");
        
        // Calculate monthly budgets based on average expenses
        $output("Creating monthly budgets...\n");
        $budgetDate = clone $expenseStartDate;
        $budgetsCreated = 0;
        
        while ($budgetDate <= $now) {
            $month = $budgetDate->format('Y-m');
            
            // Calculate average expense for this month
            $stmt = $pdo->prepare("
                SELECT COALESCE(SUM(amount_minor), 0) as total
                FROM operations
                WHERE user_id = ? AND type = 'expense'
                AND DATE_FORMAT(date, '%Y-%m') = ?
            ");
            $stmt->execute([$userId, $month]);
            $totalExpenses = (int)$stmt->fetchColumn();
            
            // Budget = expenses + 15% buffer
            $budgetAmount = (int)($totalExpenses * 1.15);
            
            // Minimum budget
            if ($budgetAmount < 500000) {
                $budgetAmount = 500000; // 5000 minimum
            }
            
            $budgetId = generateUUID();
            $stmt = $pdo->prepare("
                INSERT INTO monthly_budgets (id, user_id, month, planned_amount_minor, created_at, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ");
            $stmt->execute([$budgetId, $userId, $month, $budgetAmount]);
            $budgetsCreated++;
            
            $budgetDate->modify('+1 month');
        }
        
        $output("Created $budgetsCreated monthly budgets.\n\n");
        
        // Commit transaction
        $pdo->commit();
        
        // Return statistics
        return [
            'userId' => $userId,
            'email' => $options['email'],
            'password' => $options['password'],
            'expenseCategories' => count($expenseCategoryIds),
            'incomeCategories' => count($incomeCategoryIds),
            'incomeOperations' => $incomeOperations,
            'expenseOperations' => $expenseOperations,
            'monthlyBudgets' => $budgetsCreated
        ];
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

