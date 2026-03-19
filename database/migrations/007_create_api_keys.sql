-- Migration: Create API keys table for external server access
-- Date: 2026-03-19

CREATE TABLE IF NOT EXISTS api_keys (
    id CHAR(36) PRIMARY KEY COMMENT 'Primary key, UUID',
    user_id CHAR(36) NOT NULL COMMENT 'Owner user id',
    name VARCHAR(100) NOT NULL COMMENT 'Human-friendly key name',
    key_prefix VARCHAR(12) NOT NULL COMMENT 'Public lookup prefix',
    key_hash CHAR(64) NOT NULL COMMENT 'HMAC-SHA256 hash of API key secret',
    scopes TEXT NOT NULL COMMENT 'JSON array of granted scopes',
    last_used_at DATETIME NULL COMMENT 'Last successful usage timestamp',
    last_used_ip VARCHAR(45) NULL COMMENT 'Last successful client IP',
    expires_at DATETIME NULL COMMENT 'Optional expiration timestamp',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Can be used for authentication',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_api_keys_key_prefix (key_prefix),
    KEY idx_api_keys_user_id (user_id),
    KEY idx_api_keys_is_active (is_active),
    CONSTRAINT fk_api_keys_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT='API keys for external server access';
