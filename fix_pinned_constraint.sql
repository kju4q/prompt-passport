-- Fix pinned table constraint for upsert operations
-- Add unique constraint on (prompt_id, user_id) combination

-- First, drop any existing constraint if it exists (to avoid errors)
ALTER TABLE pinned DROP CONSTRAINT IF EXISTS pinned_prompt_id_user_id_key;

-- Add the unique constraint
ALTER TABLE pinned ADD CONSTRAINT pinned_prompt_id_user_id_key UNIQUE (prompt_id, user_id);

-- Verify the constraint was added
-- You can check this in Supabase dashboard under Table Editor > pinned > Constraints 