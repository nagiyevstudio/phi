-- Full database schema for PHI application
-- MySQL database schema
-- Date: 2025-12-21

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT 'Primary key, UUID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email, unique',
    name VARCHAR(100) NULL COMMENT 'Optional display name',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt/Argon2 hashed password',
    role ENUM('owner', 'editor', 'viewer') NOT NULL DEFAULT 'owner' COMMENT 'User role for access control',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='Users table for authentication';

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- Table: categories
-- ============================================
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

-- ============================================
-- Table: operations
-- ============================================
CREATE TABLE IF NOT EXISTS operations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT 'Primary key, UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Foreign key to users table',
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0) COMMENT 'Amount in minor units (kopecks/pennies), stored as integer',
    note TEXT NULL COMMENT 'Optional note/description',
    category_id CHAR(36) NOT NULL COMMENT 'Foreign key to categories table',
    date DATETIME NOT NULL COMMENT 'Date and time of the operation',
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

-- ============================================
-- Table: monthly_budgets
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_budgets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT 'Primary key, UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Foreign key to users table',
    month VARCHAR(7) NOT NULL CHECK (month REGEXP '^[0-9]{4}-[0-9]{2}$') COMMENT 'Month in format YYYY-MM',
    planned_amount_minor INTEGER NOT NULL CHECK (planned_amount_minor >= 0) COMMENT 'Planned budget amount in minor units (kopecks/pennies)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(user_id, month),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='Monthly budget plans for users';

CREATE INDEX idx_monthly_budgets_user_id ON monthly_budgets(user_id);
CREATE INDEX idx_monthly_budgets_month ON monthly_budgets(month);
CREATE INDEX idx_monthly_budgets_user_month ON monthly_budgets(user_id, month);

-- ============================================
-- Table: api_keys
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id CHAR(36) PRIMARY KEY COMMENT 'Primary key, UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Owner user id',
    name VARCHAR(100) NOT NULL COMMENT 'Human-friendly key name',
    key_prefix VARCHAR(12) NOT NULL UNIQUE COMMENT 'Public lookup prefix',
    key_hash CHAR(64) NOT NULL COMMENT 'HMAC-SHA256 hash of API key secret',
    scopes TEXT NOT NULL COMMENT 'JSON array of granted scopes',
    last_used_at DATETIME NULL COMMENT 'Last successful usage timestamp',
    last_used_ip VARCHAR(45) NULL COMMENT 'Last successful client IP',
    expires_at DATETIME NULL COMMENT 'Optional expiration timestamp',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Can be used for authentication',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='API keys for external server access';

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
