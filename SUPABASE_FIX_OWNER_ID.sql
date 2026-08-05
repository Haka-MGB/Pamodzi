-- =====================================================
-- SUPABASE DIAGNOSTIC SCRIPT - FOR TROUBLESHOOTING ONLY
-- =====================================================
-- This script is for diagnosing owner_id issues during development
-- DO NOT RUN IN PRODUCTION unless you're experiencing owner_id problems
-- 
-- Purpose: Helps identify why owner_id might not be set correctly
-- Use case: When inserts succeed but owner_id is NULL
-- 
-- Status: Issue is RESOLVED - keeping for reference
-- =====================================================

-- SUPABASE FIX: Check and Fix owner_id Column Issues
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Check current table structure
-- =====================================================

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tenants'
  AND column_name = 'owner_id';

-- Expected result:
-- table_name | column_name | data_type | is_nullable | column_default
-- tenants    | owner_id    | text      | NO          | NULL

-- =====================================================
-- STEP 2: Check for triggers that might modify owner_id
-- =====================================================

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'tenants';

-- If you see any triggers that mention owner_id, that might be the problem

-- =====================================================
-- STEP 3: Check RLS policies
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tenants';

-- RLS policies can sometimes interfere even with service_role

-- =====================================================
-- STEP 4: Manual insert test
-- =====================================================

-- Try manually inserting a tenant to see if it works
-- Replace with your actual user ID
INSERT INTO tenants (
  id,
  owner_id,
  name,
  initials,
  unit,
  property_id,
  property_name,
  rent,
  lease_start,
  lease_end,
  status,
  email,
  phone,
  created_at,
  updated_at
) VALUES (
  't_manual_test_001',
  'u_9b626fcd-0a51-4b3f-aece-df94b0b250f8',  -- Your user ID
  'Manual Test Tenant',
  'MT',
  'Test Unit',
  'p_106a62d7-6417-4f38-828b-4925b480b225',  -- Your property ID
  'Test Property',
  1000.00,
  '2026-08-01',
  '2027-08-01',
  'active',
  'test@example.com',
  '1234567890',
  NOW(),
  NOW()
);

-- If this INSERT works, then the issue is in the application code/Supabase client
-- If this INSERT fails, then the issue is in the database schema/constraints

-- =====================================================
-- STEP 5: Check if manual insert worked
-- =====================================================

SELECT id, owner_id, name FROM tenants WHERE id = 't_manual_test_001';

-- Expected: Should show the tenant with owner_id populated
-- If owner_id is NULL here, there's a trigger or default overriding it

-- =====================================================
-- STEP 6: Cleanup test data
-- =====================================================

DELETE FROM tenants WHERE id = 't_manual_test_001';

-- =====================================================
-- POTENTIAL FIX 1: Remove any problematic defaults
-- =====================================================

-- If column_default in STEP 1 shows anything other than NULL, run:
-- ALTER TABLE tenants ALTER COLUMN owner_id DROP DEFAULT;

-- =====================================================
-- POTENTIAL FIX 2: Recreate the column (DANGEROUS - backup first!)
-- =====================================================

-- ONLY run this if you're sure there's a column definition issue
-- BACKUP your data first!

-- ALTER TABLE tenants DROP COLUMN owner_id;
-- ALTER TABLE tenants ADD COLUMN owner_id TEXT NOT NULL;

-- =====================================================
-- POTENTIAL FIX 3: Check if service_role can bypass RLS
-- =====================================================

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'tenants';

-- If rowsecurity is 'true', service_role SHOULD bypass it
-- But let's verify by temporarily disabling RLS for testing

-- TEMPORARY TEST (re-enable after):
-- ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- Try inserting from your app now
-- Then re-enable:
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DIAGNOSTIC QUERY: See what's actually being inserted
-- =====================================================

-- Enable query logging in Supabase:
-- Go to Supabase Dashboard > Logs > Postgres Logs
-- Look for INSERT statements when you try to add a tenant
-- This will show exactly what SQL is being executed

