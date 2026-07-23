# Production Deployment Guide

Complete guide for deploying Pamodzi to Vercel and setting up production.

---

## Pre-Deployment Checklist

- [ ] Local build tested: `npm run build`
- [ ] Supabase project created
- [ ] Database setup complete (see SETUP.md → Step 3)
- [ ] RLS policies applied
- [ ] Session secret generated

---

## Quick Deploy (5 Minutes)

### For Existing Vercel Project

**If already connected to GitHub:**
1. Push your code: `git push origin main`
2. Vercel auto-deploys automatically
3. Check dashboard at https://vercel.com

**Or manually deploy:**
```bash
vercel --prod
```

---

## Complete Deployment Setup

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel

---

### Step 2: Import Project to Vercel

1. Vercel Dashboard → **Add New** → **Project**
2. Search for **Pamodzi** repository
3. Click **Import**

**Project settings (auto-detected):**
- Framework: Next.js ✅
- Build Command: `npm run build` ✅
- Output Directory: `.next` ✅
- Install Command: `npm install` ✅

---

### Step 3: Add Environment Variables to Vercel

**Go to:** Vercel Dashboard → Your Project → **Settings** → **Environment Variables**

Add these 3 variables:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
Key:   NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
```
Apply to: **Production, Preview, Development**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key:   NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIs... (your anon key from Supabase)
```
Apply to: **Production, Preview, Development**

#### Variable 3: PAMODZI_SESSION_SECRET
```
Key:   PAMODZI_SESSION_SECRET
Value: 4db505ee5367a6b678d605db6faaa4f651dd1411e53a15104c8ee96b9e950cf9
```
Apply to: **Production, Preview, Development**

**How to find Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy URL and anon key

---

### Step 4: Deploy

Click **Deploy** button (or push to GitHub if already connected).

**Deployment takes 2-5 minutes.**

You'll get a URL like: `https://pamodzi-abc123.vercel.app`

---

## Post-Deployment Testing

After deployment completes, test these flows:

### 1. User Registration
- [ ] Visit your deployment URL
- [ ] Click "Create one"
- [ ] Create account with email, name, company, phone
- [ ] Should be logged in to dashboard

### 2. Authentication
- [ ] Logout
- [ ] Login with created credentials
- [ ] Should access dashboard

### 3. Core Features
- [ ] **Dashboard** - Check metrics display
- [ ] **Properties** - Add a property
- [ ] **Tenants** - Add a tenant
- [ ] **Payments** - Record a payment
- [ ] **Maintenance** - Create an issue
- [ ] **Dashboard** - Verify data updates

### 4. Security Check
- [ ] Open browser DevTools (F12)
- [ ] Check Console for errors
- [ ] Verify no sensitive data in Network tab
- [ ] Test data isolation:
  - Create second account
  - Should NOT see first account's properties/tenants

---

## Using Vercel CLI

### Setup (First Time)
```bash
npm install -g vercel
vercel login
cd c:\Users\hakam\Desktop\pamodzi-landlord-portal\pamodzi
vercel link
```

### Deploy Commands
```bash
vercel --prod          # Deploy to production
vercel                 # Deploy to preview
vercel env ls          # List all environment variables
vercel env add KEY     # Add new variable
vercel env rm KEY      # Remove variable
vercel logs            # View function logs
```

---

## Monitoring & Debugging

### Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Check **Deployments** tab for history
4. Click a deployment to see:
   - Build logs
   - Function logs
   - Performance metrics

### Function Logs
If registration/login fails:
1. Go to Deployments
2. Click latest deployment
3. Go to **Functions** tab
4. Find `/api/auth/register` or `/api/auth/login`
5. Check error logs

---

## Automatic Deployments

**GitHub Integration (Recommended):**
- Every push to `main` branch auto-deploys to production
- Pull requests create preview deployments
- No manual action needed

**Custom Domain (Optional):**
1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add your domain (e.g., `pamodzi.yourcompany.com`)
3. Update DNS settings (instructions provided)

---

## Scaling & Performance

### For MVP/Testing
- Vercel Free tier is sufficient
- 100GB bandwidth/month
- Auto-scales as needed

### Environment Variables Best Practices
- ✅ Mark sensitive values as "Sensitive"
- ✅ Use different secrets for dev/prod
- ✅ Rotate secrets periodically
- ✅ Never commit secrets to git

---

## Next Steps

- 📋 See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if issues occur
- 🔍 Check Vercel analytics: https://vercel.com/docs/analytics
- 🌐 Add custom domain (optional)
- 📊 Monitor performance in Vercel dashboard

---

## Rollback to Previous Deployment

If something breaks:

1. Go to Vercel Dashboard
2. **Deployments** tab
3. Click the previous working deployment
4. Click **"...Redeploy"**

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGci...` |
| `PAMODZI_SESSION_SECRET` | Session encryption key | `4db505ee...` (32 chars) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional admin key | Only if using admin features |
- View function logs
- Monitor errors

### Supabase Dashboard
- Check database usage
- View query logs
- Monitor API requests

---

## Rollback

If something goes wrong:

### Vercel
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Database
1. Supabase keeps backups automatically
2. Go to Database → Backups
3. Restore if needed

---

## Common Issues

### "Environment variables missing"
- Check Vercel environment variables are set
- Redeploy after adding variables

### "Row-level security policy violated"
- Run `supabase-rls-policies.sql` in Supabase
- Verify policies exist: Table Editor → Click table → Policies tab

### "Failed to create account"
- Check Supabase logs
- Verify database connection
- Check RLS policies allow INSERT on users table

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- Check logs in both dashboards for errors
