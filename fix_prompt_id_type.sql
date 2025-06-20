-- Fix prompt_id data type mismatch in pinned table
-- The prompts table uses string IDs but pinned table expects integers

-- First, let's check what data type the prompts.id column actually is
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'prompts' AND column_name = 'id';

-- Check what data type the pinned.prompt_id column is
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pinned' AND column_name = 'prompt_id';

-- If prompts.id is TEXT and pinned.prompt_id is INTEGER, we need to change pinned.prompt_id to TEXT
-- Drop the foreign key constraint first
ALTER TABLE pinned DROP CONSTRAINT IF EXISTS pinned_prompt_id_fkey;

-- Change the data type of prompt_id in pinned table to TEXT
ALTER TABLE pinned ALTER COLUMN prompt_id TYPE TEXT;

-- Re-add the foreign key constraint with the correct data type
ALTER TABLE pinned ADD CONSTRAINT pinned_prompt_id_fkey 
  FOREIGN KEY (prompt_id) REFERENCES prompts(id);

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pinned' AND column_name = 'prompt_id'; 