-- Check the actual schema of the prompts table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'prompts'
ORDER BY ordinal_position;

-- Check if updated_at column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'prompts' AND column_name = 'updated_at';

-- Add updated_at column if it doesn't exist
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Check what fields are actually being saved
SELECT 
    id,
    title,
    text,
    content,
    source,
    source_tag,
    usage_count,
    creator,
    created_by,
    type,
    created_at,
    updated_at
FROM prompts 
WHERE id LIKE '175040%'
ORDER BY created_at DESC 
LIMIT 3; 