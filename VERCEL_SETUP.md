# 🚀 Vercel Deployment Setup Guide

Complete setup for deploying **Pamodzi** to Vercel in less than 10 minutes.

## Prerequisites
- ✅ GitHub account (you already have this)
- ✅ Vercel account (free tier is fine for MVP)
- ✅ Supabase account (optional, for production database)

---

## Step 1: Create Vercel Account & Link GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → Choose **GitHub**
3. Authorize Vercel to access your GitHub account
4. You'll be redirected to Vercel dashboard

---

## Step 2: Import Your Project

1. In Vercel dashboard, click **Add New** → **Project**
2. Search for and select **Pamodzi** repository
3. Click **Import**

### Project Settings:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `.` (current directory)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## Step 3: Add Environment Variables

In the **Environment Variables** section, add:

### Required:
```
PAMODZI_SESSION_SECRET = [generate using command below]
```

**Generate secure session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it into `PAMODZI_SESSION_SECRET`

### Optional (if using Supabase):
```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
```

[Get these from Supabase](https://app.supabase.com/project/_/settings/api)

---

## Step 4: Deploy

Click **Deploy** button at the bottom of the page.

Vercel will:
1. ✅ Clone your repository
2. ✅ Install dependencies
3. ✅ Build your Next.js app
4. ✅ Deploy to production

**Deployment takes 2-5 minutes.** You'll get a URL like: `https://pamodzi-abc123.vercel.app`

---

## Step 5: Setup Automatic Deployments (Optional but Recommended)

Once deployed, Vercel automatically:
- 🔄 Deploys on every push to `main` branch
- 👁️ Creates preview URLs for pull requests
- 📊 Shows deployment analytics

---

## Step 6: Configure GitHub Secrets (for CI/CD)

If you want GitHub Actions to trigger Vercel deployments:

1. Go to your **GitHub repository** → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `VERCEL_TOKEN` - [Generate from Vercel Settings](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - Find in Vercel dashboard
   - `VERCEL_PROJECT_ID` - Find in Vercel project settings

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically deploy on push.

---

## Step 7: Test Your Deployment

1. Open your Vercel URL
2. You should see the **Pamodzi login page**
3. Create an account to test the MVP
4. Navigate through features

---

## Troubleshooting

### Build Failed?
- Check Vercel build logs for error details
- Ensure `package.json` has all dependencies
- Verify environment variables are set

### 404 Pages?
- Next.js app is deployed correctly
- Make sure you're accessing the right URL

### Session/Login Issues?
- Verify `PAMODZI_SESSION_SECRET` is set in Vercel env vars
- Check browser cookies are enabled

### Need to Update Code?
- Push changes to GitHub
- Vercel automatically redeploys on push to main

---

## Production Checklist

Before going live:

- [ ] Test all features on Vercel deployment
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic)
- [ ] Configure analytics (optional)
- [ ] Set up monitoring/alerting
- [ ] Document deployment process for team
- [ ] Consider Supabase for production data persistence

---

## Next Steps for MVP

1. **Database**: Currently uses local JSON storage. For production, consider:
   - Supabase PostgreSQL
   - Firebase Realtime Database
   - MongoDB Atlas

2. **Authentication**: Current is session-based. Consider:
   - Auth0
   - Supabase Auth
   - NextAuth.js

3. **Email**: For notifications and reminders:
   - SendGrid
   - Mailgun
   - AWS SES

4. **Monitoring**:
   - Vercel Analytics (built-in)
   - Sentry for error tracking
   - LogRocket for user sessions

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Discord**: https://vercel.com/discord

Good luck with your MVP! 🎉
