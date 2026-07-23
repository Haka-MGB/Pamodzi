# Pamodzi Landlord Portal

A modern property management platform for landlords to manage tenants, rent payments, maintenance requests, and property operations.

**Status:** ✅ Production Ready | **Version:** 0.1.0

---

## ✨ Features

- **Dashboard** - Real-time portfolio overview with metrics
- **Properties** - Multi-property portfolio management
- **Tenants** - Complete tenant directory with lease tracking
- **Payments** - Track and confirm rent payments
- **Maintenance** - Work order tracking with priorities
- **Reports** - Revenue analytics and trends
- **Notifications** - Activity feed and alerts
- **Dark Mode** - Full dark/light theme support
- **Responsive Design** - Mobile, tablet, and desktop
- **Secure Auth** - Password hashing, sessions, Row Level Security

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Auth:** Bcrypt password hashing + Session-based

---

## 🚀 Quick Start

### For Local Development
See [SETUP.md](./SETUP.md) for complete local setup instructions.

**TL;DR:**
```bash
npm install
cp .env.example .env.local
# Edit .env.local with Supabase credentials
npm run dev
```

### For Production Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

**TL;DR:**
1. Set environment variables in Vercel
2. Push to GitHub (auto-deploys)
3. Run Supabase SQL setup

---

## 📋 Common Tasks

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter
```

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Session-based authentication
- ✅ Row Level Security (RLS) policies
- ✅ Rate limiting on auth endpoints
- ✅ Protected routes
- ✅ Password-protected sensitive operations
- ✅ User data isolation

---

## 📊 Project Structure

```
app/
  ├── (auth)/           # Login/register pages
  ├── (dashboard)/      # Dashboard and app pages
  └── api/              # API routes
components/
  ├── charts/           # Dashboard charts
  ├── layout/           # Navigation components
  ├── modals/           # Modal dialogs
  └── ui/               # Reusable UI components
lib/
  ├── server/           # Server-side utilities
  └── client-api.ts     # Client API calls
types/                  # TypeScript types
```

---

## 🐛 Troubleshooting

Having issues? Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for:
- Login/registration failures
- Environment variable problems
- Supabase setup issues
- Debug scripts

---

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Local development setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues & fixes
- [Documatation/PROJECT_STATUS.md](./Documatation/PROJECT_STATUS.md) - Feature status

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
