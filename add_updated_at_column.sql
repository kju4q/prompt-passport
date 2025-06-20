-- Add updated_at column to prompts table
-- This fixes the "Could not find the 'updated_at' column" error

-- Check if updated_at column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prompts' AND column_name = 'updated_at';

-- Add the updated_at column if it doesn't exist
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing rows to have updated_at set to created_at
UPDATE prompts 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'prompts' AND column_name = 'updated_at';

-- Show a sample of prompts with updated_at
SELECT id, title, created_at, updated_at 
FROM prompts 
ORDER BY created_at DESC 
LIMIT 5; 