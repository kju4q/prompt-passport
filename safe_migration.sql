-- Safe migration to add missing columns without deleting existing data

-- Add missing columns that the API expects
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS creator TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);

-- Update existing data to populate the new columns
UPDATE prompts SET content = text WHERE content IS NULL;
UPDATE prompts SET creator = created_by WHERE creator IS NULL AND created_by IS NOT NULL;
UPDATE prompts SET source = source_tag WHERE source IS NULL AND source_tag IS NOT NULL;

-- Generate titles from the first few words of the text
UPDATE prompts SET title = 
  CASE 
    WHEN text IS NOT NULL AND LENGTH(text) > 0 THEN
      CASE 
        WHEN LENGTH(text) <= 50 THEN text
        ELSE LEFT(text, 50) || '...'
      END
    ELSE 'Untitled Prompt'
  END
WHERE title IS NULL;

-- Set default creator for prompts without created_by
UPDATE prompts SET creator = 'Edge Esmeralda' WHERE creator IS NULL;

-- Set default source for prompts without source_tag
UPDATE prompts SET source = 'community' WHERE source IS NULL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_prompts_title ON prompts(title);
CREATE INDEX IF NOT EXISTS idx_prompts_creator ON prompts(creator);
CREATE INDEX IF NOT EXISTS idx_prompts_source ON prompts(source);

-- Ensure RLS policies are in place
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for prompts" ON prompts;

-- Create new policy
CREATE POLICY "Allow all operations for prompts" ON prompts
  FOR ALL USING (true) WITH CHECK (true);

-- Verify the changes
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_prompts,
    COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as prompts_with_titles,
    COUNT(CASE WHEN creator IS NOT NULL THEN 1 END) as prompts_with_creators,
    COUNT(CASE WHEN content IS NOT NULL THEN 1 END) as prompts_with_content
FROM prompts 
WHERE type = 'submitted'; 