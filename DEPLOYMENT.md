# Deployment Guide

Quick reference for deploying Pamodzi Landlord Portal to production.

---

## Pre-Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables created (run `supabase-rls-policies.sql`)
- [ ] RLS policies applied
- [ ] Environment variables ready
- [ ] Local build tested (`npm run build`)

---

## Step 1: Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note: Project URL and Anon Key (Settings → API)

### Create Database Tables
1. Go to SQL Editor in Supabase
2. Copy entire content from `supabase-rls-policies.sql`
3. Run the SQL
4. Verify tables created: users, properties, tenants, payments, issues, etc.

---

## Step 2: Environment Variables

### Required Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
PAMODZI_SESSION_SECRET=<32-char-random-string>
```

### Generate Session Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Set in Vercel
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all 3 variables
3. Apply to: Production, Preview, Development

---

## Step 3: Deploy

### Option A: Git Push (Recommended)
```bash
git add .
git commit -m "deploy: production ready"
git push origin main
```

Vercel will auto-deploy.

### Option B: Vercel CLI
```bash
vercel --prod
```

---

## Step 4: Post-Deployment Testing

Test these flows on your live site:

1. **Registration**
   - Create new account
   - Verify email is unique (try duplicate)

2. **Authentication**
   - Login with new account
   - Logout
   - Login again

3. **Core Features**
   - Add a property
   - Add a tenant
   - Record a payment
   - Create maintenance issue
   - Check dashboard updates

4. **Security**
   - Try accessing dashboard while logged out (should redirect)
   - Verify data isolation (create second account, shouldn't see first account's data)

---

## Monitoring

### Vercel Dashboard
- Check deployment status
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
