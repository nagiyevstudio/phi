-- Migration: Create operations table
-- Date: 2025-12-21

CREATE TABLE IF NOT EXISTS operations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT 'Primary key, UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Foreign key to users table',
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0) COMMENT 'Amount in minor units (kopecks/pennies), stored as integer',
    note TEXT NULL COMMENT 'Optional note/description',
    category_id CHAR(36) NOT NULL COMMENT 'Foreign key to categories table',
    date DATE NOT NULL COMMENT 'Date of the operation',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) COMMENT='Financial operations (expenses and income)';

CREATE INDEX idx_operations_user_id ON operations(user_id);
CREATE INDEX idx_operations_date ON operations(date);
CREATE INDEX idx_operations_user_date ON operations(user_id, date);
CREATE INDEX idx_operations_category_id ON operations(category_id);
CREATE INDEX idx_operations_type ON operations(type);
CREATE INDEX idx_operations_user_month ON operations(user_id, date);
