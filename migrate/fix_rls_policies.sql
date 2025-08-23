-- Fix RLS Policy Infinite Recursion
-- Run this in Supabase SQL Editor to fix the user_profiles policies

-- Drop ALL existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view active profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin users can manage profiles" ON user_profiles;
DROP POLICY IF EXISTS "Staff and admins can manage profiles" ON user_profiles;

-- Check if any policies remain (for debugging)
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin policies without recursion
CREATE POLICY "Service role can manage all profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view profiles (for user lookup)
CREATE POLICY "Authenticated users can view active profiles" ON user_profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND is_active = true
  );

-- Insert policy for creating new profiles
CREATE POLICY "Service role can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Alternative admin check function (optional)
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND role = 'admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policy using function (if needed)
CREATE POLICY "Admin users can manage profiles" ON user_profiles
  FOR ALL USING (is_admin_user(auth.uid()));

COMMENT ON FUNCTION is_admin_user IS 'Check if user is admin without causing RLS recursion';
