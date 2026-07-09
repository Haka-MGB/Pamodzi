-- ============================================================================
-- PAMODZI LANDLORD PORTAL - ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- This script sets up RLS policies for all tables in the Pamodzi application
-- Run this in your Supabase SQL Editor: 
-- https://supabase.com/dashboard/project/ofspjpughthpahpxzyov/sql/new
-- ============================================================================

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public user registration" ON users;
DROP POLICY IF EXISTS "Allow users to read" ON users;
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
DROP POLICY IF EXISTS "Allow users to delete own account" ON users;

-- Allow public user registration (anyone can insert a new user)
CREATE POLICY "Allow public user registration" ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow users to read all user data (needed for user lookups during auth)
CREATE POLICY "Allow users to read" ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow users to update their own data only
CREATE POLICY "Allow users to update own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id);

-- Allow users to delete their own account
CREATE POLICY "Allow users to delete own account" ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = id);


-- ============================================================================
-- PROPERTIES TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert own properties" ON properties;
DROP POLICY IF EXISTS "Allow users to view own properties" ON properties;
DROP POLICY IF EXISTS "Allow users to update own properties" ON properties;
DROP POLICY IF EXISTS "Allow users to delete own properties" ON properties;

-- Allow authenticated users to insert their own properties
CREATE POLICY "Allow users to insert own properties" ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Allow users to view their own properties
CREATE POLICY "Allow users to view own properties" ON properties
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to update their own properties
CREATE POLICY "Allow users to update own properties" ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to delete their own properties
CREATE POLICY "Allow users to delete own properties" ON properties
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner_id);


-- ============================================================================
-- TENANTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert own tenants" ON tenants;
DROP POLICY IF EXISTS "Allow users to view own tenants" ON tenants;
DROP POLICY IF EXISTS "Allow users to update own tenants" ON tenants;
DROP POLICY IF EXISTS "Allow users to delete own tenants" ON tenants;

-- Allow authenticated users to insert their own tenants
CREATE POLICY "Allow users to insert own tenants" ON tenants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Allow users to view their own tenants
CREATE POLICY "Allow users to view own tenants" ON tenants
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to update their own tenants
CREATE POLICY "Allow users to update own tenants" ON tenants
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to delete their own tenants
CREATE POLICY "Allow users to delete own tenants" ON tenants
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner_id);


-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert own payments" ON payments;
DROP POLICY IF EXISTS "Allow users to view own payments" ON payments;
DROP POLICY IF EXISTS "Allow users to update own payments" ON payments;
DROP POLICY IF EXISTS "Allow users to delete own payments" ON payments;

-- Allow authenticated users to insert their own payments
CREATE POLICY "Allow users to insert own payments" ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Allow users to view their own payments
CREATE POLICY "Allow users to view own payments" ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to update their own payments
CREATE POLICY "Allow users to update own payments" ON payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to delete their own payments
CREATE POLICY "Allow users to delete own payments" ON payments
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner_id);


-- ============================================================================
-- ISSUES (MAINTENANCE) TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert own issues" ON issues;
DROP POLICY IF EXISTS "Allow users to view own issues" ON issues;
DROP POLICY IF EXISTS "Allow users to update own issues" ON issues;
DROP POLICY IF EXISTS "Allow users to delete own issues" ON issues;

-- Allow authenticated users to insert their own issues
CREATE POLICY "Allow users to insert own issues" ON issues
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Allow users to view their own issues
CREATE POLICY "Allow users to view own issues" ON issues
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to update their own issues
CREATE POLICY "Allow users to update own issues" ON issues
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to delete their own issues
CREATE POLICY "Allow users to delete own issues" ON issues
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner_id);


-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to view own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to update own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to delete own notifications" ON notifications;

-- Allow authenticated users to insert their own notifications
CREATE POLICY "Allow users to insert own notifications" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Allow users to view their own notifications
CREATE POLICY "Allow users to view own notifications" ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Allow users to update own notifications" ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to delete their own notifications
CREATE POLICY "Allow users to delete own notifications" ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner_id);


-- ============================================================================
-- ACTIVITY TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert own activity" ON activity;
DROP POLICY IF EXISTS "Allow users to view own activity" ON activity;
DROP POLICY IF EXISTS "Allow users to update own activity" ON activity;
DROP POLICY IF EXISTS "Allow users to delete own activity" ON activity;

-- Allow authenticated users to insert their own activity
CREATE POLICY "Allow users to insert own activity" ON activity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Allow users to view their own activity
CREATE POLICY "Allow users to view own activity" ON activity
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to update their own activity
CREATE POLICY "Allow users to update own activity" ON activity
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to delete their own activity
CREATE POLICY "Allow users to delete own activity" ON activity
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner_id);


-- ============================================================================
-- REVENUE_DATA TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert own revenue_data" ON revenue_data;
DROP POLICY IF EXISTS "Allow users to view own revenue_data" ON revenue_data;
DROP POLICY IF EXISTS "Allow users to update own revenue_data" ON revenue_data;
DROP POLICY IF EXISTS "Allow users to delete own revenue_data" ON revenue_data;

-- Allow authenticated users to insert their own revenue data
CREATE POLICY "Allow users to insert own revenue_data" ON revenue_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = owner_id);

-- Allow users to view their own revenue data
CREATE POLICY "Allow users to view own revenue_data" ON revenue_data
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to update their own revenue data
CREATE POLICY "Allow users to update own revenue_data" ON revenue_data
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = owner_id);

-- Allow users to delete their own revenue data
CREATE POLICY "Allow users to delete own revenue_data" ON revenue_data
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = owner_id);


-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES (if not already enabled)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_data ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to check policies)
-- ============================================================================

-- List all policies for each table
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;

-- Check which tables have RLS enabled
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;
