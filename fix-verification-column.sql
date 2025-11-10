-- ============================================================================
-- Manual Fix: Expand verification_document column
-- Run this in your MySQL client connected to fixitnow_db
-- ============================================================================

-- Step 1: Modify the verification_document column to LONGTEXT
ALTER TABLE users MODIFY COLUMN verification_document LONGTEXT;

-- Step 2: Verify the change
DESCRIBE users;

-- Look for verification_document row - should show "LONGTEXT" type
