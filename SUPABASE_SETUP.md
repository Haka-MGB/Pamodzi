# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in with your GitHub account
3. Click **"New Project"**
4. Fill in:
   - **Project name:** `pamodzi`
   - **Database password:** Create a strong password
   - **Region:** Choose closest to your location
5. Click **"Create new project"** and wait for it to initialize

## 2. Get Your API Keys

Once your project is created:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (use the "anon" key)

## 3. Create Database Tables

Go to the **SQL Editor** in Supabase and run this script:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Landlord',
  location TEXT,
  phone TEXT,
  company TEXT,
  initials TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  total_units INTEGER NOT NULL,
  occupied_units INTEGER NOT NULL,
  monthly_revenue NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT,
  unit TEXT NOT NULL,
  property_id UUID REFERENCES properties(id),
  property_name TEXT,
  rent NUMERIC NOT NULL,
  lease_start TEXT,
  lease_end TEXT,
  status TEXT DEFAULT 'active',
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  tenant TEXT NOT NULL,
  unit TEXT,
  amount NUMERIC NOT NULL,
  method TEXT,
  ref TEXT,
  status TEXT DEFAULT 'pending',
  date TEXT,
  period TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create maintenance_issues table
CREATE TABLE maintenance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tenant TEXT,
  tenant_id UUID REFERENCES tenants(id),
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  time TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

-- Create RLS policies for properties
CREATE POLICY "Users can view their own properties"
  ON properties FOR SELECT
  USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own properties"
  ON properties FOR INSERT
  WITH CHECK (owner_id::text = auth.uid()::text);

-- Create RLS policies for tenants
CREATE POLICY "Users can view their own tenants"
  ON tenants FOR SELECT
  USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own tenants"
  ON tenants FOR INSERT
  WITH CHECK (owner_id::text = auth.uid()::text);

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own payments"
  ON payments FOR INSERT
  WITH CHECK (owner_id::text = auth.uid()::text);

-- Create RLS policies for maintenance_issues
CREATE POLICY "Users can view their own maintenance issues"
  ON maintenance_issues FOR SELECT
  USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own maintenance issues"
  ON maintenance_issues FOR INSERT
  WITH CHECK (owner_id::text = auth.uid()::text);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (owner_id::text = auth.uid()::text);

CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (owner_id::text = auth.uid()::text);
```

## 4. Add Environment Variables

### Local Development (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PAMODZI_SESSION_SECRET=your-session-secret
```

### Vercel Deployment
1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `PAMODZI_SESSION_SECRET`
4. Redeploy

## 5. Update Your App

The app now has Supabase client configured in `lib/supabase.ts`. 

**Next steps:**
- Update authentication to use Supabase Auth
- Replace mock data fetching with real Supabase queries
- Update mutation functions to write to Supabase

## 6. Test It

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Test login with your test credentials

---

### Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/guides/cli)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
