-- =====================================================
-- FIX ADMIN PROFILE - Add admin user to profiles table
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- First, let's see what users exist in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'ruthvik@blockfortrust.com';

-- Copy the ID from the result above, then run this:
-- Replace 'YOUR-USER-ID-HERE' with the actual UUID from the query above

INSERT INTO profiles (id, email, role, created_at)
VALUES (
    'YOUR-USER-ID-HERE',  -- Replace with actual user ID
    'ruthvik@blockfortrust.com',
    'admin',
    NOW()
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = 'ruthvik@blockfortrust.com';

-- Verify the profile was created
SELECT * FROM profiles WHERE email = 'ruthvik@blockfortrust.com';

-- =====================================================
-- ALTERNATIVE: If you don't want to copy/paste the ID
-- =====================================================
-- This single query does it all automatically:

INSERT INTO profiles (id, email, role, created_at)
SELECT id, email, 'admin', NOW()
FROM auth.users
WHERE email = 'ruthvik@blockfortrust.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';

-- Verify
SELECT p.*, u.email as auth_email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'ruthvik@blockfortrust.com';
