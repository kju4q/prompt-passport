-- Test inserting an AI prompt manually
INSERT INTO prompts (
    id,
    title,
    text,
    content,
    tags,
    source,
    source_tag,
    usage_count,
    creator,
    created_by,
    type,
    created_at,
    updated_at
) VALUES (
    'test-ai-prompt-' || EXTRACT(EPOCH FROM NOW()),
    'Test AI Prompt Title',
    'This is a test AI-generated prompt content',
    'This is a test AI-generated prompt content',
    ARRAY['test', 'ai'],
    'AI',
    'AI',
    0,
    'AI',
    'AI',
    'submitted',
    NOW(),
    NOW()
) RETURNING *; 