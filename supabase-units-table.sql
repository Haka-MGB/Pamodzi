-- ============================================================================
-- PAMODZI LANDLORD PORTAL - UNITS TABLE
-- ============================================================================
-- This script creates the units table for managing individual property units
-- Run this in your Supabase SQL Editor after the main tables are created
-- ============================================================================

-- Create units table
CREATE TABLE IF NOT EXISTS public.units (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_name TEXT NOT NULL,
  unit_number TEXT,
  floor TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  square_feet INTEGER,
  rent_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance')),
  tenant_id TEXT REFERENCES public.tenants(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_units_owner_id ON public.units(owner_id);
CREATE INDEX IF NOT EXISTS idx_units_property_id ON public.units(property_id);
CREATE INDEX IF NOT EXISTS idx_units_tenant_id ON public.units(tenant_id);
CREATE INDEX IF NOT EXISTS idx_units_status ON public.units(status);

-- Enable Row Level Security
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to insert own units" ON public.units;
DROP POLICY IF EXISTS "Allow users to view own units" ON public.units;
DROP POLICY IF EXISTS "Allow users to update own units" ON public.units;
DROP POLICY IF EXISTS "Allow users to delete own units" ON public.units;

-- RLS Policies for units table
CREATE POLICY "Allow users to insert own units" ON public.units
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Allow users to view own units" ON public.units
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid()::text);

CREATE POLICY "Allow users to update own units" ON public.units
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid()::text)
  WITH CHECK (owner_id = auth.uid()::text);

CREATE POLICY "Allow users to delete own units" ON public.units
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid()::text);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_units_updated_at ON public.units;
CREATE TRIGGER trigger_update_units_updated_at
  BEFORE UPDATE ON public.units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_units_updated_at();

-- Grant permissions (optional, RLS handles security)
-- GRANT ALL ON public.units TO authenticated;
-- GRANT ALL ON public.units TO service_role;

COMMENT ON TABLE public.units IS 'Individual units within properties';
COMMENT ON COLUMN public.units.status IS 'Unit status: vacant, occupied, or maintenance';
COMMENT ON COLUMN public.units.tenant_id IS 'Current tenant occupying this unit (null if vacant)';
