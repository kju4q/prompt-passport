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

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = wallet_address);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = wallet_address);

-- Policy: Allow insert for new users
CREATE POLICY "Allow insert for new users" ON users
  FOR INSERT WITH CHECK (true);

-- Update existing tables to use user_id instead of nullifier_hash
-- First, add user_id column to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Add user_id column to pinned table
ALTER TABLE pinned ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_pinned_user_id ON pinned(user_id); 