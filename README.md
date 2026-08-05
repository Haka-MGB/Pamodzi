# Pamodzi Landlord Portal

A modern property management platform for landlords to manage properties, tenants, rent payments, maintenance requests, and portfolio analytics.

**Status:** ✅ Production Ready | **Version:** 0.1.0

---

## ✨ Core Features

### 🏢 **Property Management**
- Add and manage multiple properties (residential, commercial, retail, office, industrial)
- Track property details: location, type, units, occupancy, monthly revenue
- Create detailed unit profiles with bedrooms, bathrooms, square footage, and rent amounts
- Manage unit status (vacant, occupied, maintenance)
- Visual occupancy tracking with percentage indicators
- Edit and delete properties (password-protected)

### 👥 **Tenant Management**
- Complete tenant directory with contact information
- Assign tenants to specific properties and units
- Track lease periods (start date, end date)
- Monitor tenant status (active, overdue, vacating)
- Store tenant email and phone for communication
- Edit and delete tenant records

### 💰 **Payment Tracking**
- Record rent payments from tenants
- Payment details: amount, method (Airtel Money, MTN, Bank Transfer, Cash), reference number
- Payment status management (pending, paid, overdue)
- Track payment periods and collection dates
- Confirm payments to update status
- View payment history by tenant and property
- Delete payment records

### 🔧 **Maintenance Management**
- Track maintenance issues and work orders
- Issue categorization (Plumbing, Electrical, HVAC, Structural, etc.)
- Priority levels (urgent, high, medium, low)
- Status tracking (open, in-progress, resolved)
- Link issues to specific tenants and units
- Assign issues to team members
- Update issue status and details

### 📊 **Dashboard & Analytics**
- Real-time portfolio metrics:
  - Total rent collected per period
  - Active tenant count with new tenant tracking
  - Open maintenance issues with urgent alerts
  - Portfolio-wide occupancy percentage
- Revenue trend charts with customizable time periods (1M, 4M, 6M, 12M, all time)
- Payment status breakdown (paid/pending/overdue) with donut chart
- Recent activity feed
- Alerts panel for overdue payments and urgent issues

### 🔔 **Notifications**
- Activity feed for portfolio events
- Mark notifications as read
- Bulk mark all as read
- Notification types: payment, maintenance, tenant events

### 📈 **Reports**
- Revenue analytics by property
- Payment trends over time
- Occupancy tracking
- Maintenance request patterns

---

## 🔄 How It Works: System Flow

### **1. Setting Up Properties**
1. **Add a Property** → Landlord creates a property with name, location, type
2. **Define Units** → Each property can have multiple units (apartments, shops, offices)
3. **Set Unit Details** → Configure rent amount, bedrooms, bathrooms, size, floor for each unit

### **2. Managing Tenants**
1. **Add Tenant** → Create tenant profile with name, contact info
2. **Assign to Property & Unit** → Link tenant to specific property and unit
3. **Set Lease Terms** → Define rent amount, lease start/end dates
4. **Track Status** → System monitors lease status (active, overdue, vacating)

**Key Relationship:** Tenant → Property + Unit (one tenant per unit, but tenant history is tracked)

### **3. Recording Payments**
1. **Select Tenant** → Choose from tenants in your portfolio
2. **Payment Details** → Amount, method, period, reference number
3. **Initial Status** → Payment starts as "pending"
4. **Confirmation** → Landlord reviews and confirms payment → status changes to "paid"
5. **Dashboard Updates** → Revenue charts and collection metrics update automatically

**Key Relationship:** Payment → Tenant → Property (payments are always linked to a tenant at a specific property)

### **4. Handling Maintenance**
1. **Report Issue** → Create maintenance request linked to tenant and unit
2. **Categorize** → Assign category (plumbing, electrical, etc.) and priority
3. **Track Status** → Update from open → in-progress → resolved
4. **Assign Team** → Optionally assign to specific maintenance personnel

**Key Relationship:** Issue → Tenant → Unit → Property

### **5. Data Relationships**
```
User (Landlord)
  ├── Properties (many)
  │     └── Units (many)
  │           └── Tenant (one per unit)
  ├── Tenants (many)
  │     └── Payments (many)
  │     └── Maintenance Issues (many)
  ├── Payments (many, across all tenants)
  ├── Issues (many, across all properties)
  └── Dashboard metrics (calculated from above)
```

**Data Isolation:** All data is scoped to the logged-in user via Row Level Security (RLS). Each landlord only sees their own properties, tenants, and payments.

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router) with React 18
- **Language:** TypeScript 5
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Authentication:** Session-based auth with bcryptjs password hashing
- **Styling:** Tailwind CSS 3.4 with custom CSS variables
- **Charts:** Recharts 3.9
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **State Management:** React Context API

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

Open [http://localhost:3000](http://localhost:3000) and create your account.

### For Production Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

---

## 📋 Available Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint checks
```

---

## 🔒 Security Features

- ✅ **Password Hashing:** Bcryptjs with salt rounds for secure password storage
- ✅ **Session-Based Auth:** HTTP-only secure cookies, 7-day expiration
- ✅ **Row Level Security (RLS):** Database-level data isolation per user
- ✅ **Rate Limiting:** Protection on authentication endpoints
- ✅ **CSRF Protection:** Same-origin validation on API routes
- ✅ **Input Validation:** Server-side sanitization and type checking
- ✅ **Password-Protected Deletes:** Sensitive operations require password confirmation
- ✅ **Secure Headers:** CSP, X-Frame-Options, HSTS configured

---

## 📁 Project Structure

```
pamodzi/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Public auth routes
│   │   └── login/page.tsx       # Login & registration
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── layout.tsx          # Dashboard shell with sidebar
│   │   ├── dashboard/page.tsx   # Main dashboard with metrics
│   │   ├── properties/page.tsx  # Property & unit management
│   │   ├── tenants/page.tsx     # Tenant directory
│   │   ├── payments/page.tsx    # Payment tracking
│   │   ├── maintenance/page.tsx # Issue tracking
│   │   ├── reports/page.tsx     # Analytics & reports
│   │   └── settings/page.tsx    # Account settings
│   └── api/                     # REST API routes
│       ├── auth/               # Login, logout, register, session
│       ├── properties/         # Property CRUD + units
│       ├── tenants/            # Tenant CRUD
│       ├── payments/           # Payment CRUD + confirm
│       ├── issues/             # Maintenance CRUD
│       ├── notifications/      # Notification management
│       └── app-data/           # Full portfolio data fetch
├── components/
│   ├── charts/                 # Dashboard visualizations
│   │   ├── RevenueChart.tsx   # Line chart for revenue trends
│   │   ├── StatusDonut.tsx    # Payment status breakdown
│   │   ├── ActivityFeed.tsx   # Recent activity list
│   │   └── AlertsPanel.tsx    # Overdue/urgent alerts
│   ├── layout/                 # Navigation components
│   │   ├── Sidebar.tsx        # Left navigation menu
│   │   └── Topnav.tsx         # Top header with user menu
│   └── ui/                     # Reusable UI components
│       ├── Modal.tsx          # Dialog for forms
│       ├── StatCard.tsx       # Dashboard metric cards
│       ├── Toast.tsx          # Notification toasts
│       └── Badge.tsx          # Status badges
├── lib/
│   ├── server/                 # Server-only code
│   │   ├── db.ts              # Database operations (Supabase client)
│   │   ├── validation.ts      # Input sanitization & parsing
│   │   ├── http.ts            # HTTP helpers (response builders)
│   │   ├── password.ts        # Password hashing & verification
│   │   ├── session.ts         # Session token management
│   │   ├── rate-limit.ts      # Rate limiting logic
│   │   └── logger.ts          # Server-side logging
│   ├── client-api.ts           # Client-side API wrapper functions
│   ├── supabase.ts             # Supabase client config
│   └── utils.ts                # Shared utilities (formatting, etc.)
├── types/
│   ├── index.ts                # Core TypeScript types
│   └── supabase.ts             # Database schema types
├── context/
│   └── AppContext.tsx          # Global state provider
├── .data/                       # Local JSON database (fallback)
│   └── pamodzi-db.json         # Development data storage
└── supabase-rls-policies.sql   # Database schema & RLS policies
```

---

## 🔐 Authentication & Authorization

### How Auth Works
1. **Registration:** User submits email + password → bcrypt hashes password → stored in Supabase
2. **Login:** User submits credentials → password verified → session token created → cookie set
3. **Session:** HTTP-only secure cookie with 7-day expiration
4. **Authorization:** All API routes check session → extract userId → RLS enforces data isolation
5. **Logout:** Session token deleted, cookie cleared

### Row Level Security (RLS)
Every database table has `owner_id` column. RLS policies ensure:
- Users can only INSERT/SELECT/UPDATE/DELETE their own data
- Public registration allowed for `users` table only
- All other operations require authenticated user matching `owner_id`

---

## 🧩 Key Components

### Database Layer (`lib/server/db.ts`)
- **User Management:** `createAccount()`, `authenticate()`, `getUserById()`
- **Properties:** `addProperty()`, `updateProperty()`, `deleteProperty()`, `getUnitsByProperty()`
- **Units:** `addUnit()`, `updateUnit()`, `deleteUnit()`
- **Tenants:** `addTenant()`, `updateTenant()`, `deleteTenant()`
- **Payments:** `addPayment()`, `confirmPayment()`, `deletePayment()`
- **Issues:** `addIssue()`, `updateIssue()`
- **Data Fetch:** `getAppData()` - loads entire portfolio in one call

### Validation Layer (`lib/server/validation.ts`)
- Input sanitization (remove control characters, trim, length limits)
- Type coercion and parsing
- Business rule validation (occupied ≤ total units, valid email, etc.)
- Separate parsers for create vs update operations

### Client API (`lib/client-api.ts`)
- Wraps fetch calls to API routes
- Handles JSON serialization
- Error handling and toast notifications
- Used by React components for data mutations

---

## 🐛 Troubleshooting

### Common Issues

**Login fails after registration**
- Check Supabase RLS policies are applied
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Check browser console for error details

**Property/Tenant not saving**
- Verify all required fields are filled
- Check validation rules (occupied units ≤ total units, valid dates, etc.)
- Open browser DevTools → Network tab → check API response

**Database connection errors**
- Ensure Supabase project is active and not paused
- Verify API keys are correct
- Check Supabase dashboard for error logs

**Build fails**
- Run `npm run build` locally to see detailed errors
- Check TypeScript errors with `tsc --noEmit`
- Verify all environment variables are set in Vercel

For more help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Step-by-step local development setup
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide (Vercel + Supabase)
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Documentation/PROJECT_STATUS.md](./Documentation/PROJECT_STATUS.md)** - Feature status and roadmap

---

## 📄 License

Private - All rights reserved

---

## 🎯 Status

**Version:** 0.1.0  
**Status:** ✅ Production Ready  
**Last Updated:** February 2, 2026

---

## 👥 For Developers

### Adding New Features

1. **Database:** Add table/columns in Supabase → update RLS policies → update `types/supabase.ts`
2. **Validation:** Add parser in `lib/server/validation.ts`
3. **Database Operations:** Add functions in `lib/server/db.ts`
4. **API Route:** Create endpoint in `app/api/[feature]/route.ts`
5. **Client API:** Add wrapper in `lib/client-api.ts`
6. **UI:** Create page in `app/(dashboard)/[feature]/page.tsx`
7. **Context:** Update `context/AppContext.tsx` if needed

### Code Conventions

- Use TypeScript strict mode
- Server-only code in `lib/server/` (marked with `'use server'` directive or used only in API routes)
- Client components marked with `'use client'`
- All API routes validate: origin, authentication, input
- Database functions return `null` on error (check response before using)
- Toast notifications for user feedback on all mutations
