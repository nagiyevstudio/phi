-- Migration: Create monthly_budgets table
-- Date: 2025-12-21

CREATE TABLE IF NOT EXISTS monthly_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'),
    planned_amount_minor INTEGER NOT NULL CHECK (planned_amount_minor >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, month)
);

CREATE INDEX idx_monthly_budgets_user_id ON monthly_budgets(user_id);
CREATE INDEX idx_monthly_budgets_month ON monthly_budgets(month);
CREATE INDEX idx_monthly_budgets_user_month ON monthly_budgets(user_id, month);

COMMENT ON TABLE monthly_budgets IS 'Monthly budget plans for users';
COMMENT ON COLUMN monthly_budgets.month IS 'Month in format YYYY-MM';
COMMENT ON COLUMN monthly_budgets.planned_amount_minor IS 'Planned budget amount in minor units (kopecks/pennies)';

