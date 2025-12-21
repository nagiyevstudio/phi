-- Full database schema for PerFinance application
-- PostgreSQL database schema
-- Date: 2025-12-21

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Users table for authentication';
COMMENT ON COLUMN users.id IS 'Primary key, UUID';
COMMENT ON COLUMN users.email IS 'User email, unique';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt/Argon2 hashed password';

-- ============================================
-- Table: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NULL,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, type, name)
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_archived ON categories(is_archived);

COMMENT ON TABLE categories IS 'User categories for expenses and income';
COMMENT ON COLUMN categories.type IS 'Category type: expense or income';
COMMENT ON COLUMN categories.is_archived IS 'Whether category is archived (soft delete)';
COMMENT ON COLUMN categories.color IS 'Color code in HEX format (e.g., #FF5733)';

-- ============================================
-- Table: operations
-- ============================================
CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income')),
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    note TEXT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operations_user_id ON operations(user_id);
CREATE INDEX IF NOT EXISTS idx_operations_date ON operations(date);
CREATE INDEX IF NOT EXISTS idx_operations_user_date ON operations(user_id, date);
CREATE INDEX IF NOT EXISTS idx_operations_category_id ON operations(category_id);
CREATE INDEX IF NOT EXISTS idx_operations_type ON operations(type);
CREATE INDEX IF NOT EXISTS idx_operations_user_month ON operations(user_id, date);

COMMENT ON TABLE operations IS 'Financial operations (expenses and income)';
COMMENT ON COLUMN operations.amount_minor IS 'Amount in minor units (kopecks/pennies), stored as integer';
COMMENT ON COLUMN operations.date IS 'Date of the operation';
COMMENT ON COLUMN operations.note IS 'Optional note/description';

-- ============================================
-- Table: monthly_budgets
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
    planned_amount_minor INTEGER NOT NULL CHECK (planned_amount_minor >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user_id ON monthly_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_month ON monthly_budgets(month);
CREATE INDEX IF NOT EXISTS idx_monthly_budgets_user_month ON monthly_budgets(user_id, month);

COMMENT ON TABLE monthly_budgets IS 'Monthly budget plans for users';
COMMENT ON COLUMN monthly_budgets.month IS 'Month in format YYYY-MM';
COMMENT ON COLUMN monthly_budgets.planned_amount_minor IS 'Planned budget amount in minor units (kopecks/pennies)';

