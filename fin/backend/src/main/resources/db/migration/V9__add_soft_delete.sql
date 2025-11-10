-- Add soft delete columns to users and services tables
-- This allows us to keep historical data while hiding deleted records

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

ALTER TABLE services
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add indexes for deleted records filtering
CREATE INDEX idx_users_is_deleted ON users(is_deleted);
CREATE INDEX idx_services_is_deleted ON services(is_deleted);
