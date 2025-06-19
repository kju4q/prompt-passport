# User Authentication Setup

This guide explains how to set up user authentication with World ID wallet and NextAuth.js in your Prompt Passport application.

## Overview

The application now uses:

- **World ID Wallet Auth** for primary authentication (as recommended by World ID docs)
- **NextAuth.js** for session management and user state
- **Supabase** for user data storage

## Database Setup

### 1. Run the SQL Migration

Execute the following SQL in your Supabase dashboard SQL editor:

```sql
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
```

### 2. Environment Variables

Make sure you have these environment variables set in your `.env.local`:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## How It Works

### 1. User Authentication Flow

1. User clicks "Sign in with World App" button
2. World ID wallet authentication is initiated
3. After successful wallet verification, NextAuth creates a session
4. User data is automatically created/updated in the `users` table
5. User can now access personalized features (pinned prompts, etc.)

### 2. Session Management

- NextAuth handles all session management securely
- Sessions include user ID and wallet address
- Protected routes can check `session?.user?.id`
- API routes use `await auth()` to get the current session

### 3. Database Integration

- Users are automatically created in the `users` table on first sign-in
- All user-specific data (prompts, pins) now reference `user_id`
- The system maintains backward compatibility with `nullifier_hash` for existing data

## Key Changes Made

### API Routes Updated

- `/api/prompts/pin` - Now uses user ID from session
- `/api/prompts/pinned` - Now uses user ID from session
- `/api/auth/[...nextauth]/route.ts` - Creates/updates users in database

### Components Updated

- `WorldIDButton` - Handles NextAuth sign-in
- `PromptCard` - Uses session for pinning
- `PromptForm` - Uses session for user identification
- All pages now use `useSession()` instead of verification context

### Database Schema

- New `users` table with wallet address and timestamps
- `user_id` columns added to existing tables
- Proper foreign key relationships and indexes

## Benefits

1. **Proper User Profiles**: Users now have persistent profiles in the database
2. **Session Management**: Secure, persistent sessions across browser sessions
3. **Scalability**: Easy to add more authentication methods in the future
4. **Security**: Follows World ID best practices for mini apps
5. **User Experience**: Users stay signed in and can access their data

## Testing

1. Run the SQL migration in Supabase
2. Start your development server
3. Try signing in with World ID wallet
4. Check that a user record is created in the `users` table
5. Test pinning prompts and verify they appear in the pinned page
6. Test that sessions persist across page refreshes

## Migration Notes

- Existing data using `nullifier_hash` will continue to work
- New data will use `user_id` for better relationships
- The system gracefully handles both old and new data formats
