# Troubleshooting Guide

Common issues and their solutions.

---

## Login/Registration Issues

### Issue: "Supabase environment variables are missing"

**Error Message:**
```
Error: Supabase environment variables are missing. 
Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.
```

**Causes & Solutions:**

1. **Local Development**
   - `.env.local` doesn't exist or is missing variables
   - Dev server started before `.env.local` was created

   **Fix:**
   ```bash
   # Stop server (Ctrl+C)
   # Verify .env.local exists
   cat .env.local
   # Should have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   
   # Restart server
   npm run dev
   ```

2. **Vercel Deployment**
   - Variables not set in Vercel dashboard
   - Variables only set for one environment (need Production, Preview, Development)

   **Fix:**
   ```bash
   # Check what's set in Vercel
   vercel env ls
   
   # Add missing variables
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   ```

---

### Issue: "Cannot create account" or "Database error"

**Symptoms:**
- Registration page appears
- Fill in details and click "Create Account"
- Get error message or 500 error

**Causes:**

1. **RLS Policies Not Applied**
   - Most common cause
   - Database tables exist but don't have Row Level Security policies

   **Fix:**
   ```bash
   # 1. Go to Supabase Dashboard
   # 2. SQL Editor → New Query
   # 3. Paste entire content of supabase-rls-policies.sql
   # 4. Click Run
   # 5. Should see success messages
   
   # Then verify:
   SELECT policyname FROM pg_policies WHERE tablename='users';
   # Should show policies like "Allow public user registration"
   ```

2. **Users Table Doesn't Exist**
   - Database tables weren't created

   **Fix:**
   ```sql
   -- Check if table exists
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'users';
   
   -- If empty, run supabase-rls-policies.sql to create all tables
   ```

3. **Wrong Supabase Project URL**
   - Environment variable points to wrong Supabase project

   **Fix:**
   ```bash
   # Verify the URL
   vercel env ls | findstr "SUPABASE_URL"
   
   # Should match your actual Supabase project:
   # https://ofspjpughthpahpxzyov.supabase.co
   
   # If wrong, update it:
   vercel env rm NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   # Paste correct URL
   ```

---

### Issue: "Email already exists" or duplicate email error

**This is actually correct!**
- The system prevents duplicate email registrations
- Try with a different email address

---

## Database Setup Issues

### Issue: "Relation users does not exist"

**Error:** `ERROR: relation "users" does not exist`

**Solution:**
1. Go to Supabase Dashboard
2. SQL Editor
3. Run this to check existing tables:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
4. If tables missing, run `supabase-rls-policies.sql` completely

---

### Issue: Row Level Security (RLS) Policy Violated

**Error:** `new row violates row-level security policy` (code 42501)

**Solutions:**

1. **Check RLS is enabled on users table**
   ```sql
   -- In Supabase, go to Table Editor
   -- Select users table
   -- Should see "RLS is on" in the top right
   ```

2. **Check policies exist**
   ```sql
   SELECT policyname, qual FROM pg_policies 
   WHERE tablename='users';
   ```

3. **Re-apply all policies**
   ```bash
   # Run supabase-rls-policies.sql again completely
   ```

---

## Vercel Deployment Issues

### Issue: Deployment fails with "Build error"

**Solutions:**

1. **Check build logs:**
   ```bash
   vercel logs --tail
   ```

2. **Build locally first:**
   ```bash
   npm run build
   # If it fails locally, fix first
   # If it succeeds locally but fails on Vercel, it's environment-related
   ```

3. **Check for required files:**
   - ✅ `next.config.js`
   - ✅ `tsconfig.json`
   - ✅ `package.json`

---

### Issue: Login works locally but not on Vercel

**Possible causes:**

1. **Environment variables not set**
   ```bash
   vercel env ls
   ```
   Should show all 3 variables for Production and Preview

2. **Wrong environment variable values**
   ```bash
   # Redeploy to pick up new env vars
   vercel --prod
   ```

3. **Clear browser cache**
   - Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
   - Clear cookies: DevTools → Application → Clear Storage

---

### Issue: "Page not loading" or blank page

**Solutions:**

1. **Wait for build to complete**
   - Deployment usually takes 2-5 minutes
   - Check https://vercel.com to see build progress

2. **Check for JavaScript errors**
   - Open DevTools: `F12`
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Check function logs**
   - Go to Vercel Dashboard
   - Click deployment
   - Go to **Functions** tab
   - Look for errors

---

## Supabase Connection Issues

### Issue: Slow API responses or timeouts

**Solutions:**

1. **Check Supabase status:**
   - Go to https://status.supabase.com
   - Look for any ongoing incidents

2. **Check your RLS policies for N+1 queries:**
   - Complex policies can slow things down
   - Verify policies in `supabase-rls-policies.sql`

3. **Monitor usage:**
   - Supabase Dashboard → Analytics
   - Check if you're hitting rate limits

---

### Issue: "Invalid API key"

**Causes:**
- Wrong anon key being used
- Anon key doesn't have necessary permissions

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy anon key again
3. Update environment variables
4. Redeploy

---

## Environment Variable Issues

### Issue: Variables not showing in deployed app

**Solution:**

1. **Variables must be redeclared for preview/production:**
   ```bash
   # Add for production
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   
   # Add for preview
   vercel env add NEXT_PUBLIC_SUPABASE_URL preview
   ```

2. **Redeploy after changing variables:**
   ```bash
   # Option 1: Git push (auto-deploy)
   git push origin main
   
   # Option 2: Manual redeploy
   vercel --prod
   ```

---

### Issue: Can't find environment variable in Vercel CLI

**Solution:**
```bash
# List all variables
vercel env ls

# If variable not there, add it
vercel env add VARIABLE_NAME production

# For sensitive variables:
vercel env add VARIABLE_NAME production --sensitive
```

---

## Quick Debugging Checklist

**For "Can't Login/Register" errors:**

- [ ] `.env.local` has correct Supabase URL and key
- [ ] Dev server restarted after `.env.local` changes
- [ ] `supabase-rls-policies.sql` was run in Supabase
- [ ] Users table has RLS enabled
- [ ] "Allow public user registration" policy exists
- [ ] Vercel variables set for Production and Preview
- [ ] No JavaScript errors in browser console

**For Supabase connection errors:**

- [ ] Supabase project still exists and is not paused
- [ ] Correct Supabase URL in environment variables
- [ ] Correct anon key (not service role key)
- [ ] Network is not blocked (try from different network)
- [ ] Check https://status.supabase.com for incidents

**For Vercel deployment issues:**

- [ ] Build succeeds locally: `npm run build`
- [ ] All environment variables are set
- [ ] Variables set for both Production and Preview
- [ ] Project builds at https://vercel.com
- [ ] Latest deployment is selected

---

## Debug Scripts

### Test Local Connection to Supabase

```bash
# Create a test file to verify connection
cat > test-supabase.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Environment variables missing');
  process.exit(1);
}

console.log('✅ URL:', url);
console.log('✅ Key exists:', key.substring(0, 20) + '...');

const supabase = createClient(url, key);

// Test connection
supabase.from('users').select('count', { count: 'exact' })
  .then(({ data, error, count }) => {
    if (error) {
      console.error('❌ Query failed:', error);
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Users count:', count);
    }
  });
EOF

# Run the test
node test-supabase.js
```

### Test Account Creation

```bash
# Local test
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test-'$(date +%s)'@example.com",
    "password": "TestPassword123!",
    "company": "Test Co",
    "phone": "+1234567890"
  }'

# Or with Vercel (replace with your URL)
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "company": "Test Co",
    "phone": "+1234567890"
  }'
```

---

## Getting Help

If you're still stuck:

1. **Check existing issues:** https://github.com/Haka-MGB/Pamodzi/issues
2. **Check logs:**
   - Local: Check terminal output
   - Vercel: Check function logs in dashboard
   - Supabase: Check error logs in dashboard
3. **Verify all setup steps** in [SETUP.md](./SETUP.md)
4. **Reset everything:**
   - Delete `.env.local`
   - Create new `.env.local` from scratch
   - Restart dev server
