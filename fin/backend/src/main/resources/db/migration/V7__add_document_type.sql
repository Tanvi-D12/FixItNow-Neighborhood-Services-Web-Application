-- Add document_type column to users table for provider verification
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS document_type VARCHAR(50);

-- Set existing verification_document values to have document_type
UPDATE users SET document_type = 'ShopAct' WHERE role = 'PROVIDER' AND verification_document IS NOT NULL AND document_type IS NULL;
