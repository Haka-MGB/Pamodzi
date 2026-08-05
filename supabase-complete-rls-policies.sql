-- ============================================================================
-- PAMODZI LANDLORD PORTAL - COMPLETE ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- This script sets up RLS policies for ALL tables in the Pamodzi application
-- Including both 'issues' and 'maintenance_issues' tables
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow public user registration" ON users;
DROP POLICY IF EXISTS "Allow users to read" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Allow users to delete own account" ON users;

CREATE POLICY "Allow public user registration" ON users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow users to read" ON users
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow users to update own data" ON users
  FOR UPDATE TO authenticated USING (auth.uid()::text = id);

CREATE POLICY "Allow users to delete own account" ON users
  FOR DELETE TO authenticated USING (auth.uid()::text = id);

-- ============================================================================
-- PROPERTIES TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to insert own properties" ON properties;
DROP POLICY IF EXISTS "Allow users to view own properties" ON properties;
DROP POLICY IF EXISTS "Allow users to update own properties" ON properties;
DROP POLICY IF EXISTS "Allow users to delete own properties" ON properties;

CREATE POLICY "Allow users to insert own properties" ON properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to view own properties" ON properties
  FOR SELECT TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to update own properties" ON properties
  FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to delete own properties" ON properties
  FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);

-- ============================================================================
-- UNITS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to insert own units" ON units;
DROP POLICY IF EXISTS "Allow users to view own units" ON units;
DROP POLICY IF EXISTS "Allow users to update own units" ON units;
DROP POLICY IF EXISTS "Allow users to delete own units" ON units;

CREATE POLICY "Allow users to insert own units" ON units
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to view own units" ON units
  FOR SELECT TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to update own units" ON units
  FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to delete own units" ON units
  FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);

-- ============================================================================
-- TENANTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to insert own tenants" ON tenants;
DROP POLICY IF EXISTS "Allow users to view own tenants" ON tenants;
DROP POLICY IF EXISTS "Allow users to update own tenants" ON tenants;
DROP POLICY IF EXISTS "Allow users to delete own tenants" ON tenants;

CREATE POLICY "Allow users to insert own tenants" ON tenants
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to view own tenants" ON tenants
  FOR SELECT TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to update own tenants" ON tenants
  FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to delete own tenants" ON tenants
  FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to insert own payments" ON payments;
DROP POLICY IF EXISTS "Allow users to view own payments" ON payments;
DROP POLICY IF EXISTS "Allow users to update own payments" ON payments;
DROP POLICY IF EXISTS "Allow users to delete own payments" ON payments;

CREATE POLICY "Allow users to insert own payments" ON payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to view own payments" ON payments
  FOR SELECT TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to update own payments" ON payments
  FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to delete own payments" ON payments
  FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);

-- ============================================================================
-- ISSUES TABLE POLICIES (Used by the application)
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to insert own issues" ON issues;
DROP POLICY IF EXISTS "Allow users to view own issues" ON issues;
DROP POLICY IF EXISTS "Allow users to update own issues" ON issues;
DROP POLICY IF EXISTS "Allow users to delete own issues" ON issues;

CREATE POLICY "Allow users to insert own issues" ON issues
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to view own issues" ON issues
  FOR SELECT TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to update own issues" ON issues
  FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to delete own issues" ON issues
  FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);

-- ============================================================================
-- MAINTENANCE_ISSUES TABLE POLICIES (If it exists)
-- ============================================================================
-- Note: This table exists in schema but is not currently used by the app
-- Including policies for completeness

DROP POLICY IF EXISTS "Allow users to insert own maintenance_issues" ON maintenance_issues;
DROP POLICY IF EXISTS "Allow users to view own maintenance_issues" ON maintenance_issues;
DROP POLICY IF EXISTS "Allow users to update own maintenance_issues" ON maintenance_issues;
DROP POLICY IF EXISTS "Allow users to delete own maintenance_issues" ON maintenance_issues;

-- Only create policies if the table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'maintenance_issues') THEN
    EXECUTE 'CREATE POLICY "Allow users to insert own maintenance_issues" ON maintenance_issues
      FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id)';
    
    EXECUTE 'CREATE POLICY "Allow users to view own maintenance_issues" ON maintenance_issues
      FOR SELECT TO authenticated USING (auth.uid()::text = owner_id)';
    
    EXECUTE 'CREATE POLICY "Allow users to update own maintenance_issues" ON maintenance_issues
      FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id)';
    
    EXECUTE 'CREATE POLICY "Allow users to delete own maintenance_issues" ON maintenance_issues
      FOR DELETE TO authenticated USING (auth.uid()::text = owner_id)';
  END IF;
END $$;

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to view own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to update own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to delete own notifications" ON notifications;

CREATE POLICY "Allow users to insert own notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to view own notifications" ON notifications
  FOR SELECT TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to delete own notifications" ON notifications
  FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);

-- ============================================================================
-- ACTIVITY TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to insert own activity" ON activity;
DROP POLICY IF EXISTS "Allow users to view own activity" ON activity;
DROP POLICY IF EXISTS "Allow users to update own activity" ON activity;
DROP POLICY IF EXISTS "Allow users to delete own activity" ON activity;

CREATE POLICY "Allow users to insert own activity" ON activity
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to view own activity" ON activity
  FOR SELECT TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to update own activity" ON activity
  FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to delete own activity" ON activity
  FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);

-- ============================================================================
-- REVENUE_DATA TABLE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to insert own revenue_data" ON revenue_data;
DROP POLICY IF EXISTS "Allow users to view own revenue_data" ON revenue_data;
DROP POLICY IF EXISTS "Allow users to update own revenue_data" ON revenue_data;
DROP POLICY IF EXISTS "Allow users to delete own revenue_data" ON revenue_data;

CREATE POLICY "Allow users to insert own revenue_data" ON revenue_data
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to view own revenue_data" ON revenue_data
  FOR SELECT TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to update own revenue_data" ON revenue_data
  FOR UPDATE TO authenticated USING (auth.uid()::text = owner_id);

CREATE POLICY "Allow users to delete own revenue_data" ON revenue_data
  FOR DELETE TO authenticated USING (auth.uid()::text = owner_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_data ENABLE ROW LEVEL SECURITY;

-- Enable RLS on maintenance_issues if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'maintenance_issues') THEN
    EXECUTE 'ALTER TABLE maintenance_issues ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- List all RLS-enabled tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Tables with RLS Policies:
-- ✓ users
-- ✓ properties
-- ✓ units
-- ✓ tenants
-- ✓ payments
-- ✓ issues (actively used)
-- ✓ maintenance_issues (if exists, not currently used)
-- ✓ notifications
-- ✓ activity
-- ✓ revenue_data
-- ============================================================================
