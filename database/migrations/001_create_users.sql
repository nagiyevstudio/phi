-- Migration: Create users table
-- Date: 2025-12-21

CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT 'Primary key, UUID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email, unique',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt/Argon2 hashed password',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='Users table for authentication';

CREATE INDEX idx_users_email ON users(email);
