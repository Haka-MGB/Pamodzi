# Pamodzi Landlord Portal

A modern property management platform for landlords to manage tenants, rent payments, maintenance requests, and property operations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and update PAMODZI_SESSION_SECRET in .env
```

3. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Create your account**
- Click "Create one" on the login page
- Fill in your details
- Start managing your properties!

## 📦 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Verify Deployment
```bash
node scripts/verify-deployment.js
```

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete deployment guide.

## ✨ Features

### Dashboard
- Real-time portfolio overview with key metrics
- Revenue charts and payment status breakdown
- Activity feed and alerts with internal scrolling
- Responsive viewport-locked layout

### Payments Management
- Track paid, pending, and overdue payments
- Searchable tenant selector with keyboard navigation
- Confirm payments and send reminders
- Export to Excel/PDF formats
- Download individual receipts

### Tenant Management
- Complete tenant directory with search
- Manage lease details and contact information
- View payment history per tenant
- Password-protected deletions

### Property Management
- Multi-property portfolio support
- Unit occupancy tracking
- Revenue monitoring per property
- Manage individual units

### Maintenance
- Work order tracking with priority levels
- Filter by status (open, in-progress, resolved)
- Assign contractors
- Priority-based sorting

### Reports & Analytics
- Custom report generation
- Revenue trend visualization
- Quick export templates
- Multiple format support (Excel, PDF)

### Settings
- Profile management
- Notification preferences
- Dark mode support
- System customization

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: JSON file-based (development)
- **Authentication**: Session-based with bcrypt

## 📁 Project Structure

```
pamodzi/
├── app/                      # Next.js app router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Dashboard pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── charts/             # Chart components
│   ├── layout/             # Layout components
│   └── ui/                 # UI primitives
├── context/                # React context
├── lib/                    # Utilities and helpers
│   └── server/            # Server-only code
├── types/                  # TypeScript types
├── public/                 # Static assets
└── .data/                  # Database storage (gitignored)
```

## 🔐 Security Features

- Password hashing with bcrypt
- Session-based authentication
- Rate limiting on auth endpoints
- Same-origin request validation
- Password-protected sensitive operations
- User data isolation

## 🧪 Testing

### Manual Testing
Use the comprehensive checklist in [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Automated Verification
```bash
# Start the server first
npm run dev

# In another terminal, run verification
node scripts/verify-deployment.js
```

## 📊 Database

**Development/Demo**: JSON file storage (`.data/pamodzi-db.json`)
- Atomic writes with backup rotation
- Auto-recovery from corruption
- Keeps last 5 backups

**Production**: Replace `lib/server/db.ts` with your database adapter (PostgreSQL, MySQL, etc.)

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Smooth scroll panels for long lists
- Keyboard navigation
- Toast notifications
- Loading states
- Form validation
- Accessible modals

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create account
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Data
- `GET /api/app-data` - Get all user data
- `GET /api/health` - Health check

### Payments
- `POST /api/payments` - Create payment
- `PATCH /api/payments/[id]/confirm` - Confirm payment
- `DELETE /api/payments/[id]` - Delete payment

### Tenants
- `POST /api/tenants` - Create tenant
- `PATCH /api/tenants/[id]` - Update tenant
- `DELETE /api/tenants/[id]` - Delete tenant

### Properties
- `POST /api/properties` - Create property
- `PATCH /api/properties/[id]` - Update property
- `DELETE /api/properties/[id]` - Delete property

### Maintenance
- `POST /api/issues` - Create issue
- `PATCH /api/issues/[id]` - Update issue

### Notifications
- `PATCH /api/notifications/[id]` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read

## 🤝 Contributing

This is a demo application. For production use, consider:
- Migrating to a production database
- Adding email service integration
- Implementing file upload functionality
- Adding comprehensive test coverage
- Setting up CI/CD pipelines

## 📄 License

Private - All rights reserved

## 🎯 Status

**Current Version**: 0.1.0  
**Status**: ✅ **READY FOR TESTING**

All core features are implemented and functional. See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for production recommendations.
