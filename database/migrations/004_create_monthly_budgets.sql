-- Migration: Create monthly_budgets table
-- Date: 2025-12-21

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
