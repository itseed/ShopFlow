-- Alternative: Complete RLS Reset for user_profiles
-- Run this if the above still has conflicts

-- Disable RLS temporarily
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies completely
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles' 
          AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON user_profiles';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create minimal working policies
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role full access
CREATE POLICY "user_profiles_service_role" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to view active profiles (needed for admin checks)
CREATE POLICY "user_profiles_view_active" ON user_profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' 
    AND is_active = true
  );

-- Verify policies were created
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles' 
ORDER BY policyname;
