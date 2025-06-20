-- Check the actual schema of the prompts table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'prompts'
ORDER BY ordinal_position;

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
    created_at
FROM prompts 
WHERE id LIKE '175040%'
ORDER BY created_at DESC 
LIMIT 3; 