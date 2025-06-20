-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  text TEXT,
  title TEXT,
  source TEXT,
  creator TEXT,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[],
  type TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  parent_id INTEGER REFERENCES prompts(id),
  generation INTEGER DEFAULT 0,
  remix_type TEXT,
  likes INTEGER DEFAULT 0,
  rating DECIMAL(3,2)
);

-- Create pinned table
CREATE TABLE IF NOT EXISTS pinned (
  id SERIAL PRIMARY KEY,
  prompt_id INTEGER REFERENCES prompts(id),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prompt_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at);
CREATE INDEX IF NOT EXISTS idx_pinned_user_id ON pinned(user_id);
CREATE INDEX IF NOT EXISTS idx_pinned_prompt_id ON pinned(prompt_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Allow all operations for authenticated users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Prompts table policies
CREATE POLICY "Allow all operations for prompts" ON prompts
  FOR ALL USING (true) WITH CHECK (true);

-- Pinned table policies
CREATE POLICY "Allow all operations for pinned" ON pinned
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for testing
INSERT INTO prompts (content, text, title, source, creator, usage_count, tags, type) VALUES
(
  'Write a creative story about a magical forest',
  'Write a creative story about a magical forest where trees whisper ancient secrets and creatures of light dance in moonlit clearings. Make it enchanting and mysterious.',
  'Magical Forest Story',
  'community',
  'Edge Esmeralda',
  15,
  ARRAY['writing', 'creative', 'fantasy'],
  'submitted'
),
(
  'Create a Python script for data analysis',
  'Create a Python script that analyzes a CSV dataset, generates visualizations, and provides insights. Include error handling and clear documentation.',
  'Data Analysis Script',
  'community',
  'Edge Esmeralda',
  8,
  ARRAY['coding', 'python', 'data'],
  'submitted'
),
(
  'Design a modern UI component',
  'Design a modern, responsive UI component with smooth animations and accessibility features. Use clean design principles.',
  'Modern UI Component',
  'community',
  'Edge Esmeralda',
  12,
  ARRAY['design', 'ui', 'modern'],
  'submitted'
); 