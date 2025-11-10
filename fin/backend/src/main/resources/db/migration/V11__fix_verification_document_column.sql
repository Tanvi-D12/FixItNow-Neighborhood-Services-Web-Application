-- ============================================================================
-- Migration V11: Fix verification_document column size
-- ============================================================================
-- Issue: verification_document was VARCHAR(255) but stores base64-encoded files
-- Solution: Alter to LONGTEXT to accommodate large files
-- ============================================================================

ALTER TABLE users MODIFY COLUMN verification_document LONGTEXT;
