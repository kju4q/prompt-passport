-- Comprehensive fix for pinned table foreign key constraint issues

-- First, let's check the current state
SELECT 
    tc.table_name,
    kcu.column_name,
    kcu.data_type,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'pinned';

-- Check data types of both tables
SELECT 
    'prompts' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'prompts' AND column_name = 'id'
UNION ALL
SELECT 
    'pinned' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'pinned' AND column_name = 'prompt_id';

-- Drop the existing foreign key constraint
ALTER TABLE pinned DROP CONSTRAINT IF EXISTS pinned_prompt_id_fkey;

-- Ensure prompt_id is TEXT type
ALTER TABLE pinned ALTER COLUMN prompt_id TYPE TEXT;

-- Re-add the foreign key constraint
ALTER TABLE pinned ADD CONSTRAINT pinned_prompt_id_fkey 
    FOREIGN KEY (prompt_id) REFERENCES prompts(id);

-- Verify the fix
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    kcu.data_type,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'pinned';

-- Fix pinned table constraint for upsert operations
-- Add unique constraint on (prompt_id, user_id) combination

-- First, drop any existing constraint if it exists (to avoid errors)
ALTER TABLE pinned DROP CONSTRAINT IF EXISTS pinned_prompt_id_user_id_key;

-- Add the unique constraint
ALTER TABLE pinned ADD CONSTRAINT pinned_prompt_id_user_id_key UNIQUE (prompt_id, user_id);

-- Verify the constraint was added
-- You can check this in Supabase dashboard under Table Editor > pinned > Constraints 