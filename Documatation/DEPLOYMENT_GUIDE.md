# 🚀 Deployment Guide - Pamodzi Landlord Portal

## Current Status

✅ **YES - You can login and create accounts!**  
✅ **YES - You can deploy to Vercel!**  
⚠️ **BUT - Supabase is NOT currently integrated**

---

## 📊 Current Implementation

### What Works NOW:
- ✅ **Local Authentication**: Create account & login (JSON file storage)
- ✅ **All Features**: Payments, Tenants, Properties, Maintenance, Reports
- ✅ **Session Management**: Secure authentication with bcrypt
- ✅ **Data Persistence**: JSON file with automatic backups

### Deployment Options:

| Option | Status | Best For | Data Storage |
|--------|--------|----------|--------------|
| **Local Dev** | ✅ Ready | Testing, Demo | JSON file (`.data/`) |
| **Vercel (Current)** | ⚠️ Limited | Demos, Testing | Ephemeral (resets on deploy) |
| **Vercel + Supabase** | 🔄 Needs Setup | Production | PostgreSQL (persistent) |

---

## 🎯 Option 1: Deploy to Vercel NOW (Quick)

**What you get:**
- ✅ App works completely
- ✅ Can create accounts
- ✅ Can login
- ✅ All features functional
- ⚠️ Data resets on each deployment (serverless limitation)

### Steps:

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Add New Project"
- Import your GitHub repository
- Add environment variables:
  - `PAMODZI_SESSION_SECRET` = (generate with command below)
  - `PAMODZI_DATA_FILE` = `/tmp/pamodzi-db.json`

```bash
# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Your app is live!

### ⚠️ Important Limitations:
- **Data is ephemeral**: Each deployment creates a fresh database
- **No file persistence**: `/tmp` storage is cleared periodically
- **Good for**: Demos, testing, showcasing features
- **Not good for**: Production with real data

---

## 🎯 Option 2: Deploy to Vercel + Supabase (Production Ready)

**What you get:**
- ✅ App works completely
- ✅ Persistent data storage
- ✅ Scalable PostgreSQL database
- ✅ Production-ready
- ✅ No data loss on redeployment

### Prerequisites:
- Supabase account (free tier available)
- Your code pushed to GitHub

### Step 1: Setup Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Create Database Tables**

Run this SQL in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Landlord',
  location TEXT NOT NULL DEFAULT 'Zambia',
  phone TEXT,
  company TEXT,
  initials TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  total_units INTEGER NOT NULL,
  occupied_units INTEGER NOT NULL,
  monthly_revenue NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenants table
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  unit TEXT NOT NULL,
  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  rent NUMERIC NOT NULL,
  lease_start TEXT,
  lease_end TEXT,
  status TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  tenant TEXT NOT NULL,
  unit TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL,
  ref TEXT NOT NULL,
  date TEXT NOT NULL,
  period TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance issues table
CREATE TABLE issues (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  tenant TEXT NOT NULL,
  unit TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  icon TEXT NOT NULL,
  assignee TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  time TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity table
CREATE TABLE activity (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue data table
CREATE TABLE revenue_data (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  parklands NUMERIC NOT NULL,
  ndola NUMERIC NOT NULL,
  cbd NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_tenants_owner ON tenants(owner_id);
CREATE INDEX idx_payments_owner ON payments(owner_id);
CREATE INDEX idx_issues_owner ON issues(owner_id);
CREATE INDEX idx_notifications_owner ON notifications(owner_id);
CREATE INDEX idx_activity_owner ON activity(owner_id);
CREATE INDEX idx_revenue_owner ON revenue_data(owner_id);
CREATE INDEX idx_users_email ON users(email);
```

### Step 2: Install Supabase Package

```bash
npm install @supabase/supabase-js
```

### Step 3: Switch to Supabase Adapter

The Supabase adapter has been created at `lib/server/db-supabase.ts`.

To activate it:

```bash
# Backup current JSON adapter
mv lib/server/db.ts lib/server/db-json.ts

# Activate Supabase adapter
mv lib/server/db-supabase.ts lib/server/db.ts

# Install Supabase package
npm install @supabase/supabase-js
```

### Step 4: Configure Environment Variables

Update your `.env` file:

```env
# Session secret (generate new one)
PAMODZI_SESSION_SECRET="your-32-char-secret-here"

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Optional: Remove or comment out
# PAMODZI_DATA_FILE=".data/pamodzi-db.json"
```

Get your Supabase keys from:
- Project Settings → API → Project URL
- Project Settings → API → anon/public key
- Project Settings → API → service_role key (keep secret!)

### Step 5: Test Locally

```bash
npm run dev
```

- Create a new account
- Verify data persists in Supabase dashboard
- Test all features

### Step 6: Deploy to Vercel

1. **Add Environment Variables in Vercel**
   - Go to your project settings on Vercel
   - Add all environment variables from Step 4
   - Make sure to add `SUPABASE_SERVICE_ROLE_KEY` as a secret

2. **Deploy**
```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

Vercel will auto-deploy on push.

3. **Verify Deployment**
   - Visit your Vercel URL
   - Create account
   - Check Supabase dashboard for data
   - Test all features

---

## 🎯 Option 3: Keep JSON Storage (Local/Testing Only)

**Current setup - works as-is!**

### For Local Development:
```bash
npm run dev
```

### For Vercel (Demo/Testing):
Add environment variable:
- `PAMODZI_DATA_FILE` = `/tmp/pamodzi-db.json`

⚠️ **Warning**: Data will not persist across deployments!

---

## 📋 Quick Comparison

| Feature | Local (JSON) | Vercel (JSON) | Vercel + Supabase |
|---------|--------------|---------------|-------------------|
| **Setup Time** | 5 min | 10 min | 30 min |
| **Data Persistence** | ✅ Yes | ❌ No | ✅ Yes |
| **Cost** | Free | Free | Free tier |
| **Scalability** | Limited | Limited | High |
| **Multi-user** | ❌ No | ❌ No | ✅ Yes |
| **Production Ready** | ❌ No | ❌ No | ✅ Yes |

---

## 🔧 Troubleshooting

### "Cannot write to file system" on Vercel
**Solution**: Vercel serverless functions are read-only. Use Supabase for persistence.

### "Supabase environment variables missing"
**Solution**: Add all three Supabase env vars in Vercel project settings.

### "Database connection failed"
**Solution**: Check Supabase project URL and keys are correct.

### "Data disappears on Vercel"
**Solution**: This is expected with JSON storage. Switch to Supabase for persistence.

---

## 🎯 Recommended Approach

### For Testing/Demo:
**Use Option 1** (Vercel with JSON) - Quick deployment, no setup

### For Production:
**Use Option 2** (Vercel + Supabase) - Persistent, scalable, reliable

---

## ✅ Final Checklist

### Before Deploying to Vercel:

- [ ] Code pushed to GitHub
- [ ] Environment variables prepared
- [ ] Session secret generated
- [ ] Decided on storage approach (JSON vs Supabase)

### If Using Supabase:

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Supabase adapter activated
- [ ] Environment variables configured
- [ ] Tested locally

### After Deploying:

- [ ] App loads successfully
- [ ] Can create account
- [ ] Can login
- [ ] Can add data (payments, tenants, etc.)
- [ ] Data persists (if using Supabase)

---

## 📞 Need Help?

### Common Commands:

```bash
# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Install Supabase
npm install @supabase/supabase-js

# Build for production
npm run build

# Test production build locally
npm start

# Check for errors
npm run lint
```

### Quick Links:
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

---

## 🎉 You're Ready!

Choose your deployment path:
1. **Quick Demo**: Deploy to Vercel now (10 min)
2. **Production**: Set up Supabase first (30 min total)

Both will work - just depends on whether you need persistent data!
