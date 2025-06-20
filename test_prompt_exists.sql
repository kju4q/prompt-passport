-- Check if AI-generated prompts exist in the database
SELECT 
    id,
    title,
    usage_count,
    created_at,
    source
FROM prompts 
WHERE source = 'AI' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check total count of AI prompts
SELECT COUNT(*) as ai_prompt_count 
FROM prompts 
WHERE source = 'AI';

-- Check recent prompts (last 24 hours)
SELECT 
    id,
    title,
    usage_count,
    created_at,
    source
FROM prompts 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC; 