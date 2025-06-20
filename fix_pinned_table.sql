-- Fix pinned table to work with user_id instead of nullifier_hash
-- Make nullifier_hash nullable since we're using user_id now

-- Check current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pinned'
ORDER BY ordinal_position;

-- Make nullifier_hash nullable
ALTER TABLE pinned ALTER COLUMN nullifier_hash DROP NOT NULL;

-- Set a default value for existing rows (if any)
UPDATE pinned SET nullifier_hash = 'migrated' WHERE nullifier_hash IS NULL;

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pinned'
ORDER BY ordinal_position; 