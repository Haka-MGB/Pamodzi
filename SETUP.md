# Local Development Setup

Complete guide for setting up Pamodzi locally for development.

---

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- Supabase account ([sign up free](https://supabase.com))
- Git
- Text editor (VS Code recommended)

---

## Step 1: Install Dependencies

```bash
cd c:\Users\hakam\Desktop\pamodzi-landlord-portal\pamodzi
npm install
```

---

## Step 2: Environment Variables

### Create .env.local

```bash
cp .env.example .env.local
```

### Generate Session Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output.

### Update .env.local

Edit `.env.local` with your values:

```env
# Session Management (paste the generated secret)
PAMODZI_SESSION_SECRET=4db505ee5367a6b678d605db6faaa4f651dd1411e53a15104c8ee96b9e950cf9

# Supabase Credentials (see Step 3)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional for local data persistence
PAMODZI_DATA_FILE=".data/pamodzi-db.json"
```

---

## Step 3: Supabase Setup

### 3.1 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Enter project name
4. Set a strong password
5. Choose region closest to you
6. Click **Create New Project**

### 3.2 Get Your Credentials

1. Go to **Settings → API**
2. Copy `Project URL` → paste to `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
3. Copy `anon public` key → paste to `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

### 3.3 Create Database Tables & RLS Policies

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy the entire contents of `supabase-rls-policies.sql`
4. Paste into the SQL editor
5. Click **Run**

**You should see success messages for all policy creations.**

### 3.4 Verify Setup

In SQL Editor, run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- ✅ users
- ✅ properties
- ✅ tenants
- ✅ payments
- ✅ issues
- ✅ notifications
- ✅ activity
- ✅ revenue_data

---

## Step 4: Start Development Server

```bash
npm run dev
```

You should see:
```
✓ Ready in 7.6s

  ▲ Next.js 16.2.9
  - Local:         http://localhost:3000
  - Network:       http://192.168.x.x:3000
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 5: Create Your First Account

1. Click **"Create one"** on the login page
2. Fill in your details:
   - **Name:** Your name
   - **Company:** Your company name
   - **Phone:** Your phone number
   - **Email:** Your email
   - **Password:** Strong password

3. Click **Create Account**
4. You should be logged in to the dashboard

---

## Testing the App

### Add a Property

1. Click **Properties** in sidebar
2. Click **+ Add Property**
3. Fill in details (address, type, units)
4. Click **Add**

### Add a Tenant

1. Click **Tenants**
2. Click **+ Add Tenant**
3. Select property
4. Fill in tenant details
5. Click **Add**

### Record a Payment

1. Click **Payments**
2. Click **+ Record Payment**
3. Select tenant and property
4. Enter amount and method
5. Click **Record**

---

## Available Commands

```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm run type-check # Check TypeScript types
```

---

## Database Reset

If you need to reset your local database:

### Option 1: Delete Data File (if using local JSON)
```bash
rm .data/pamodzi-db.json
npm run dev
```

### Option 2: Reset Supabase Database

In Supabase SQL Editor:
```sql
-- Delete all data from tables
DELETE FROM revenue_data;
DELETE FROM activity;
DELETE FROM notifications;
DELETE FROM issues;
DELETE FROM payments;
DELETE FROM tenants;
DELETE FROM properties;
DELETE FROM users;
```

Then recreate tables by running `supabase-rls-policies.sql` again.

---

## Troubleshooting Local Setup

### Issue: "Supabase environment variables are missing"

**Solution:**
1. Verify `.env.local` exists and has the correct values
2. Restart dev server (`Ctrl+C` then `npm run dev`)
3. Check you copied the correct URL and key from Supabase

### Issue: "Cannot INSERT into users table"

**Solution:**
1. Go to Supabase SQL Editor
2. Verify RLS policies were applied (check the `supabase-rls-policies.sql` ran successfully)
3. Check that `Allow public user registration` policy exists on users table

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart:
npm run dev
```

### Issue: Modules not found / npm install fails

**Solution:**
```bash
# Clear cache and reinstall
rm -r node_modules
npm install
```

---

## Next Steps

- 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- 🐛 Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- 💻 Start coding! The app is fully functional
