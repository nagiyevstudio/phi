-- Migration: Create operations table
-- Date: 2025-12-21

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

CREATE INDEX idx_operations_user_id ON operations(user_id);
CREATE INDEX idx_operations_date ON operations(date);
CREATE INDEX idx_operations_user_date ON operations(user_id, date);
CREATE INDEX idx_operations_category_id ON operations(category_id);
CREATE INDEX idx_operations_type ON operations(type);
CREATE INDEX idx_operations_user_month ON operations(user_id, date);

COMMENT ON TABLE operations IS 'Financial operations (expenses and income)';
COMMENT ON COLUMN operations.amount_minor IS 'Amount in minor units (kopecks/pennies), stored as integer';
COMMENT ON COLUMN operations.date IS 'Date of the operation';
COMMENT ON COLUMN operations.note IS 'Optional note/description';

