-- Migration: Create users table
-- Date: 2025-12-21

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Users table for authentication';
COMMENT ON COLUMN users.id IS 'Primary key, UUID';
COMMENT ON COLUMN users.email IS 'User email, unique';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt/Argon2 hashed password';

