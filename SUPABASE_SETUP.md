# Supabase Setup Guide for Pamodzi

## ✅ Changes Made

Your code has been updated to use Supabase instead of file-based storage:

1. **Updated `lib/server/db.ts`** - Now queries Supabase PostgreSQL database
2. **Created `lib/server/supabase.ts`** - Supabase client initialization
3. **Updated `package.json`** - Added `@supabase/supabase-js` dependency
4. **Created `scripts/setup-supabase.sql`** - Database schema (run this in Supabase)

---

## 🚀 Step 1: Create Supabase Project

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"** or sign in
3. Click **"New Project"**
4. Fill in:
   - **Name:** `pamodzi`
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you (e.g., `Europe - Dublin`)
5. Click **"Create new project"** (takes ~2 minutes)

---

## 🔑 Step 2: Get Your Credentials

Once your project is created:

1. Click **Settings** (bottom left) → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **Anon Key** (public key, safe to expose)

3. Save them for Step 3

---

## 📝 Step 3: Set Up Database Schema

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire SQL from `scripts/setup-supabase.sql` and paste it
4. Click **"Run"** (or press `Ctrl+Enter`)
5. Wait for confirmation ✅

This creates all necessary tables and adds a test user.

---

## 🔐 Step 4: Add Environment Variables to Vercel

1. Go to your **Vercel Dashboard**
2. Select your **Pamodzi** project
3. Click **Settings** → **Environment Variables**
4. Add these three variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
PAMODZI_SESSION_SECRET = [generate below]
```

### Generate Session Secret

Run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as `PAMODZI_SESSION_SECRET` in Vercel.

---

## 📦 Step 5: Install Dependencies & Deploy

### Locally (to test):

```bash
npm install
npm run build
npm run start
```

Then visit `http://localhost:3000` and try creating an account.

### To Vercel:

```bash
git add .
git commit -m "feat: migrate to Supabase database"
git push origin main
```

Vercel will auto-deploy and redeploy your app.

---

## 🧪 Step 6: Test Login

After deployment to Vercel:

1. Visit your app at `https://pamodzi-phi.vercel.app`
2. Try **Sign In** with:
   - **Email:** `testuser@example.com`
   - **Password:** `password123`

3. Or **Create Account** with a new email

✅ **If both work, you're done!**

---

## 🐛 Troubleshooting

### "Environment variables missing" error

- Check Vercel Settings → Environment Variables
- Make sure all 3 variables are set
- **Redeploy** after adding variables: Go to Vercel Dashboard → Deployments → Click latest → Redeploy

### "Failed to create account" or login fails

1. Check Supabase **SQL Editor** → run:
   ```sql
   SELECT * FROM users;
   ```
   You should see the test user

2. If tables are empty, re-run the SQL schema from `scripts/setup-supabase.sql`

### Vercel build fails

1. Check **Build Logs** in Vercel Dashboard
2. Run locally first: `npm run build`
3. Make sure all dependencies installed: `npm install`

---

## 📊 Accessing Your Data

To view/manage your data in Supabase:

1. Go to Supabase Dashboard
2. Click **Table Editor** (left sidebar)
3. Browse any table: `users`, `properties`, `tenants`, `payments`, etc.

---

## 🔄 Local Development

For local development with Supabase:

1. Create a `.env.local` file (add to `.gitignore`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
   PAMODZI_SESSION_SECRET=your-32-char-secret
   ```

2. Run locally:
   ```bash
   npm run dev
   ```

---

## 🎯 What Changed

| Before | After |
|--------|-------|
| File-based JSON storage (`.data/pamodzi-db.json`) | Supabase PostgreSQL database |
| Data lost on Vercel redeploy | ✅ Data persists across deploys |
| Works only locally | ✅ Works everywhere (local + production) |
| No scalability | ✅ Unlimited scaling |

---

## ❓ Questions?

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- Check your Supabase project logs if queries fail

**You're all set! 🎉**
