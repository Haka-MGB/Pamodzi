-- Pamodzi Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Landlord',
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  initials TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  total_units INTEGER NOT NULL,
  occupied_units INTEGER NOT NULL,
  monthly_revenue DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  unit TEXT NOT NULL,
  property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  property_name TEXT NOT NULL,
  rent DECIMAL(12,2) NOT NULL,
  lease_start TEXT NOT NULL,
  lease_end TEXT NOT NULL,
  status TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tenant TEXT NOT NULL,
  unit TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  method TEXT NOT NULL,
  ref TEXT NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  period TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Issues (Maintenance) table
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tenant TEXT NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  date TEXT NOT NULL,
  assignee TEXT,
  icon TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  time TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Activity table
CREATE TABLE IF NOT EXISTS activity (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  icon TEXT NOT NULL,
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Revenue Data table
CREATE TABLE IF NOT EXISTS revenue_data (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  parklands DECIMAL(12,2) NOT NULL,
  ndola DECIMAL(12,2) NOT NULL,
  cbd DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_tenants_owner_id ON tenants(owner_id);
CREATE INDEX idx_tenants_property_id ON tenants(property_id);
CREATE INDEX idx_payments_owner_id ON payments(owner_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_issues_owner_id ON issues(owner_id);
CREATE INDEX idx_issues_tenant_id ON issues(tenant_id);
CREATE INDEX idx_notifications_owner_id ON notifications(owner_id);
CREATE INDEX idx_activity_owner_id ON activity(owner_id);
CREATE INDEX idx_revenue_data_owner_id ON revenue_data(owner_id);

-- Create test user (email: testuser@example.com, password: password123)
INSERT INTO users (id, name, email, role, location, phone, company, initials, password_hash, created_at, updated_at)
VALUES (
  'u_' || gen_random_uuid()::text,
  'Test User',
  'testuser@example.com',
  'Landlord',
  'Zambia',
  '+260000000000',
  'Pamodzi',
  'TU',
  '$2b$10$k4DzMN4Kd7RXCgKRR.qNeOF6B1TQ5Xr5OQ6E5qXqUGbRiY6iVp4sC', -- password123 hashed with bcrypt
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
