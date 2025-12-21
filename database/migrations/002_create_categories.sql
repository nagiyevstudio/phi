-- Migration: Create categories table
-- Date: 2025-12-21

CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT 'Primary key, UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Foreign key to users table',
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')) COMMENT 'Category type: expense or income',
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NULL COMMENT 'Color code in HEX format (e.g., #FF5733)',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether category is archived (soft delete)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id, type, name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='User categories for expenses and income';

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_user_type ON categories(user_id, type);
CREATE INDEX idx_categories_archived ON categories(is_archived);
