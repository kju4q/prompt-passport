-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on wallet_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (this is more permissive for NextAuth)
CREATE POLICY "Allow all operations for authenticated users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Alternative: More specific policies if you want more control
-- CREATE POLICY "Allow insert for new users" ON users
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow select for all users" ON users
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow update for own data" ON users
--   FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
--   WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Update existing tables to use user_id instead of nullifier_hash
-- First, add user_id column to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Add user_id column to pinned table
ALTER TABLE pinned ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_pinned_user_id ON pinned(user_id); 