-- Check if prompts table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'prompts'
ORDER BY ordinal_position;

-- Check current data in prompts table
SELECT 
    id,
    content,
    text,
    title,
    source,
    creator,
    usage_count,
    tags,
    type,
    created_at,
    user_id,
    parent_id,
    generation,
    remix_type,
    likes,
    rating
FROM prompts 
ORDER BY created_at DESC 
LIMIT 10;

-- Count total prompts
SELECT COUNT(*) as total_prompts FROM prompts;

-- Check prompts by type
SELECT type, COUNT(*) as count 
FROM prompts 
GROUP BY type; 