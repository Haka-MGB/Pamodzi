# Getting Started with Pamodzi

Quick start guide for developers and testers.

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy example file
cp .env.example .env.local

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Edit .env.local and add:
# - Generated session secret
# - Supabase URL and anon key
```

### 3. Set Up Database
1. Create Supabase account at [supabase.com](https://supabase.com)
2. Create new project
3. Get credentials from Settings → API
4. Run SQL from `../supabase-rls-policies.sql` in SQL Editor

### 4. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## First Time Setup

### Create Your Account
1. Go to http://localhost:3000/login
2. Click "Create one"
3. Fill in your details
4. Start using the app!

### Test Features
- Add a property
- Add tenants
- Record payments
- Create maintenance issues
- View dashboard updates

---

## Production Deployment

See `../DEPLOYMENT.md` for complete deployment guide.

Quick steps:
1. Set environment variables in Vercel
2. Push to GitHub (auto-deploys)
3. Test production site

---

## Need Help?

- **README.md** - Project overview
- **DEPLOYMENT.md** - Deployment guide
- **PROJECT_STATUS.md** - Current status and features

---

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter
```
