-- ============================================================================
-- Migration V10: Expand verification_document column to LONGTEXT
-- ============================================================================
-- Issue: verification_document column (VARCHAR 255) was too small for base64-encoded files
-- Solution: Change to LONGTEXT (up to 4GB) to accommodate large document uploads
-- ============================================================================

ALTER TABLE users 
MODIFY COLUMN verification_document LONGTEXT;

-- Alternatively, if you want to limit to a reasonable size (e.g., 16MB):
-- ALTER TABLE users 
-- MODIFY COLUMN verification_document LONGBLOB;
