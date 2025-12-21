-- Migration: Create categories table
-- Date: 2025-12-21

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

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_user_type ON categories(user_id, type);
CREATE INDEX idx_categories_archived ON categories(is_archived);

COMMENT ON TABLE categories IS 'User categories for expenses and income';
COMMENT ON COLUMN categories.type IS 'Category type: expense or income';
COMMENT ON COLUMN categories.is_archived IS 'Whether category is archived (soft delete)';
COMMENT ON COLUMN categories.color IS 'Color code in HEX format (e.g., #FF5733)';

