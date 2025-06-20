-- Check if the increment_usage_count function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'increment_usage_count';

-- If the function doesn't exist, create it
CREATE OR REPLACE FUNCTION increment_usage_count(prompt_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE prompts 
  SET usage_count = usage_count + 1 
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql; 