-- Migration: Update operations date to datetime
-- Date: 2025-12-23

ALTER TABLE operations
    MODIFY date DATETIME NOT NULL COMMENT 'Date and time of the operation';
