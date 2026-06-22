# Pamodzi — Property Management Platform
### Landlord Portal · Frontend MVP

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

**Demo login:**
- Email: `james.mwale@pamodzi.com`
- Password: `password123`

---

## 📁 Project Structure

```
pamodzi/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx         # Sidebar + Topnav shell
│   │   ├── dashboard/         # Main dashboard with charts
│   │   ├── payments/          # Payments management
│   │   ├── tenants/           # Tenant directory
│   │   ├── properties/        # Property portfolio
│   │   ├── maintenance/       # Maintenance work orders
│   │   ├── reports/           # Reports & analytics
│   │   └── settings/          # Account settings
│   ├── layout.tsx             # Root layout with providers
│   └── globals.css            # Design tokens + Tailwind
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # Collapsible sidebar nav
│   │   └── Topnav.tsx         # Top header bar
│   ├── ui/
│   │   ├── Badge.tsx          # Status badges
│   │   ├── Modal.tsx          # Reusable modal
│   │   ├── StatCard.tsx       # KPI stat cards
│   │   └── Toast.tsx          # Toast notifications
│   └── charts/
│       ├── RevenueChart.tsx   # Bar chart
│       ├── StatusDonut.tsx    # Doughnut chart
│       ├── ActivityFeed.tsx   # Activity log
│       └── AlertsPanel.tsx    # Active alerts
├── context/
│   └── AppContext.tsx         # Global state (replaces backend)
├── lib/
│   ├── data.ts                # Mock data (swap for API calls)
│   └── utils.ts               # Helpers (fmtK, cn, etc.)
└── types/
    └── index.ts               # All TypeScript types
```

---

## 🔌 Connecting a Real Backend (Next Steps)

All mock data lives in `lib/data.ts` and state mutations live in `context/AppContext.tsx`.

To connect Supabase (or any backend):

1. Install: `npm install @supabase/supabase-js`
2. Add `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. In `AppContext.tsx`, replace each `useState(MOCK_*)` initializer with a `useEffect` that fetches from Supabase.
4. Replace mutation functions (`addPayment`, `confirmPayment`, etc.) with Supabase `insert`/`update` calls.

### Supabase tables needed:
```sql
users, properties, tenants, payments, maintenance_issues, notifications
```

---

## ✅ Features Implemented

- [x] Login with animation + error handling
- [x] Collapsible sidebar navigation
- [x] Dark mode (persists via context)
- [x] Dashboard with revenue bar chart + payment donut
- [x] Payments: list, search, filter, confirm modal, add modal, CSV export
- [x] Tenants: directory, detail modal with payment history, add tenant modal
- [x] Properties: occupancy bars, revenue per property
- [x] Maintenance: priority sorting, status update modal, log issue modal
- [x] Reports: PDF/CSV export, multi-line revenue trend chart
- [x] Settings: profile, security, notifications toggles, dark mode
- [x] Notification bell with unread count
- [x] Toast notifications throughout
- [x] Fully typed with TypeScript

---

## 🛠 Tech Stack

| Layer       | Tool                     |
|-------------|--------------------------|
| Framework   | Next.js 14 (App Router)  |
| Language    | TypeScript               |
| Styling     | Tailwind CSS             |
| Charts      | Recharts                 |
| Icons       | Lucide React             |
| State       | React Context            |
| Fonts       | Inter (Google Fonts)     |
# Pamodzi
