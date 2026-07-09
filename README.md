# Pamodzi Landlord Portal

A modern property management platform for landlords to manage tenants, rent payments, maintenance requests, and property operations.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Update with your values:
```env
PAMODZI_SESSION_SECRET="your-32-char-secret"
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Generate session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. **Set up Supabase database**

- Go to [Supabase SQL Editor](https://supabase.com/dashboard)
- Run the SQL from `supabase-rls-policies.sql`
- This creates tables and security policies

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Production Deployment

### 1. Set Environment Variables in Vercel

Go to **Vercel Dashboard → Settings → Environment Variables**

Add these 3 variables (for all environments):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PAMODZI_SESSION_SECRET=your-32-char-secret
```

### 2. Deploy

```bash
git push origin main
```

Or use Vercel CLI:
```bash
vercel --prod
```

### 3. Verify Deployment

- Create a test account
- Add a property
- Add a tenant
- Record a payment
- Verify all features work

---

## ✨ Features

- **Dashboard** - Real-time portfolio overview with metrics
- **Properties** - Multi-property portfolio management
- **Tenants** - Complete tenant directory with lease tracking
- **Payments** - Track and confirm rent payments
- **Maintenance** - Work order tracking with priorities
- **Reports** - Revenue analytics and trends
- **Notifications** - Activity feed and alerts

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Auth:** Session-based with bcrypt

---

## 🔐 Security

- Password hashing (bcrypt)
- Session-based authentication
- Row Level Security (RLS) in Supabase
- Rate limiting on auth endpoints
- Security headers (CSP, X-Frame-Options, etc.)
- Data isolation per user

---

## 📁 Project Structure

```
pamodzi/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities
│   └── server/           # Server-only code
├── types/                 # TypeScript types
└── supabase-rls-policies.sql  # Database setup
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build
```

### Authentication Issues
- Verify environment variables are set correctly
- Check Supabase RLS policies are applied
- Ensure database tables exist

### Database Errors
- Check Supabase logs in dashboard
- Verify RLS policies allow the operation
- Ensure user has proper permissions

---

## 📄 License

Private - All rights reserved

---

## 🎯 Status

**Version:** 0.1.0  
**Status:** ✅ Production Ready
