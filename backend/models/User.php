<?php
/**
 * User Model
 * User data access and operations
 */

require_once __DIR__ . '/../utils/database.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/validation.php';

class User {
    private $pdo;
    
    public function __construct() {
        $this->pdo = Database::getPDO();
    }
    
    public function create($email, $password) {
        // Validate input
        if (!validateEmail($email)) {
            throw new InvalidArgumentException('Invalid email format');
        }
        
        if (!validatePassword($password)) {
            throw new InvalidArgumentException('Password must be at least 8 characters');
        }
        
        // Check if user exists
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            throw new Exception('User with this email already exists');
        }
        
        // Hash password and create user
        $passwordHash = hashPassword($password);
        $userId = generateUUID();
        
        $stmt = $this->pdo->prepare("
            INSERT INTO users (id, email, password_hash, created_at, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ");
        
        $stmt->execute([$userId, $email, $passwordHash]);
        
        // Fetch created user
        $stmt = $this->pdo->prepare("SELECT id, email, created_at, updated_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }
    
    public function findByEmail($email) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch();
    }
    
    public function findById($id) {
        $stmt = $this->pdo->prepare("SELECT id, email, created_at, updated_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }
    
    public function verifyCredentials($email, $password) {
        $user = $this->findByEmail($email);
        if (!$user) {
            return false;
        }
        
        if (!verifyPassword($password, $user['password_hash'])) {
            return false;
        }
        
        // Return user data without password hash
        unset($user['password_hash']);
        return $user;
    }
    
    public function updatePassword($userId, $newPassword) {
        if (!validatePassword($newPassword)) {
            throw new InvalidArgumentException('Password must be at least 8 characters');
        }
        
        $passwordHash = hashPassword($newPassword);
        $stmt = $this->pdo->prepare("
            UPDATE users 
            SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        
        return $stmt->execute([$passwordHash, $userId]);
    }
}

