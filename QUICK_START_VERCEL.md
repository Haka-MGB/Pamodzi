# ⚡ Quick Start - Deploy to Vercel in 5 Minutes

Perfect for getting your MVP live right now.

## TL;DR - Copy & Paste Steps

### 1. Open Vercel
```
https://vercel.com/new
```

### 2. Import GitHub Repository
- Click "Import Project"
- Search for "Pamodzi"
- Select the repository
- Click "Import"

### 3. Add Environment Variables
In the "Environment Variables" section, add:

**KEY:** `PAMODZI_SESSION_SECRET`  
**VALUE:** Run this in your terminal and paste the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Click Deploy
That's it! ✨

---

## Getting Your Live URL

After deployment completes (~3-5 minutes):

1. Vercel shows: **Congratulations! Your site is live at...**
2. Click the URL (looks like `https://pamodzi-abc123.vercel.app`)
3. You should see the Pamodzi login page
4. Create an account and start using it!

---

## What Just Happened?

✅ Your code is deployed to Vercel's global CDN  
✅ Every push to `main` branch auto-deploys  
✅ Free SSL/HTTPS certificate included  
✅ Custom domain support (optional)  

---

## Next: Make it Your Own

### Custom Domain
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `pamodzi.yourcompany.com`)
4. Follow DNS setup instructions

### Share Your MVP
Just send them your Vercel URL! They can:
- Create accounts
- Test all features
- Leave feedback

---

## If Something Goes Wrong

**Build failed?**
- Click "View Logs" to see error details
- Check that environment variables are set

**Page not loading?**
- Wait 2-3 minutes for build to complete
- Try refreshing browser (Cmd+Shift+R or Ctrl+Shift+R)

**Login not working?**
- Make sure `PAMODZI_SESSION_SECRET` is in environment variables
- Clear browser cookies and try again

---

## Need Help?

Full guide with all options: → **[VERCEL_SETUP.md](./VERCEL_SETUP.md)**

Good luck! 🚀
