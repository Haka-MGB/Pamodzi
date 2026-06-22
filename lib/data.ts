import type {
  User, Property, Tenant, Payment, MaintenanceIssue,
  Notification, ActivityItem, RevenueDataPoint,
} from '@/types'

export const MOCK_USER: User = {
  id: 'u1',
  name: 'James Mwale',
  email: 'james.mwale@pamodzi.com',
  role: 'Landlord',
  location: 'Lusaka',
  phone: '+260 977 123456',
  company: 'Mwale Properties Ltd',
  initials: 'JM',
}

export const MOCK_PROPERTIES: Property[] = [
  { id: 'p1', name: 'Parklands Estate',        location: 'Lusaka',     type: 'Residential',    totalUnits: 12, occupiedUnits: 11, monthlyRevenue: 24200 },
  { id: 'p2', name: 'Ndola East Residences',   location: 'Ndola',      type: 'Residential',    totalUnits: 14, occupiedUnits: 13, monthlyRevenue: 19500 },
  { id: 'p3', name: 'Lusaka CBD Apartments',   location: 'Lusaka CBD', type: 'Commercial Mix', totalUnits: 10, occupiedUnits:  9, monthlyRevenue: 27000 },
]

export const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'Chanda Mulenga',  initials: 'CM', unit: 'A3', propertyId: 'p1', propertyName: 'Parklands Estate',      rent: 2200, leaseStart: 'Jan 2026', leaseEnd: 'Dec 2026', status: 'active',  email: 'chanda@example.com',   phone: '0977 123 456' },
  { id: 't2', name: 'Mutale Banda',    initials: 'MB', unit: 'B1', propertyId: 'p1', propertyName: 'Parklands Estate',      rent: 1800, leaseStart: 'Mar 2025', leaseEnd: 'Oct 2026', status: 'active',  email: 'mutale@example.com',   phone: '0966 789 012' },
  { id: 't3', name: 'Grace Phiri',     initials: 'GP', unit: 'C2', propertyId: 'p2', propertyName: 'Ndola East Residences', rent: 1500, leaseStart: 'Sep 2025', leaseEnd: 'Aug 2026', status: 'active',  email: 'grace@example.com',    phone: '0978 345 678' },
  { id: 't4', name: 'Isaac Tembo',     initials: 'IT', unit: 'D4', propertyId: 'p3', propertyName: 'Lusaka CBD Apartments', rent: 3000, leaseStart: 'Feb 2026', leaseEnd: 'Feb 2027', status: 'active',  email: 'isaac@example.com',    phone: '0955 987 654' },
  { id: 't5', name: 'Priscilla Zulu',  initials: 'PZ', unit: 'A5', propertyId: 'p1', propertyName: 'Parklands Estate',      rent: 2200, leaseStart: 'Jun 2025', leaseEnd: 'May 2026', status: 'overdue', email: 'priscilla@example.com', phone: '0971 456 789' },
  { id: 't6', name: 'Bupe Nkonde',     initials: 'BN', unit: 'C1', propertyId: 'p2', propertyName: 'Ndola East Residences', rent: 1600, leaseStart: 'Dec 2024', leaseEnd: 'Nov 2026', status: 'active',  email: 'bupe@example.com',     phone: '0968 234 567' },
  { id: 't7', name: 'Tendai Moyo',     initials: 'TM', unit: 'D2', propertyId: 'p2', propertyName: 'Ndola East Residences', rent: 1700, leaseStart: 'Oct 2025', leaseEnd: 'Sep 2026', status: 'active',  email: 'tendai@example.com',   phone: '0977 654 321' },
]

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay1', tenantId: 't1', tenant: 'Chanda Mulenga', unit: 'A3 · Parklands',   amount: 2200, method: 'Airtel Money',   ref: 'CM-PRKL-APR26', status: 'paid',    date: '3 Apr 2026',  period: 'April 2026' },
  { id: 'pay2', tenantId: 't2', tenant: 'Mutale Banda',   unit: 'B1 · Parklands',   amount: 1800, method: 'MTN MoMo',      ref: 'MB-PRKL-APR26', status: 'paid',    date: '2 Apr 2026',  period: 'April 2026' },
  { id: 'pay3', tenantId: 't3', tenant: 'Grace Phiri',    unit: 'C2 · Ndola East',  amount: 1500, method: 'Bank Transfer', ref: 'GP-NDLA-APR26', status: 'pending', date: '5 Apr 2026',  period: 'April 2026' },
  { id: 'pay4', tenantId: 't4', tenant: 'Isaac Tembo',    unit: 'D4 · Lusaka CBD',  amount: 3000, method: 'Direct Deposit',ref: 'IT-LCBD-APR26', status: 'pending', date: 'Today',       period: 'April 2026' },
  { id: 'pay5', tenantId: 't5', tenant: 'Priscilla Zulu', unit: 'A5 · Parklands',   amount: 2200, method: '—',             ref: 'OVERDUE',       status: 'overdue', date: 'Overdue 9d',  period: 'April 2026' },
  { id: 'pay6', tenantId: 't6', tenant: 'Bupe Nkonde',    unit: 'C1 · Ndola East',  amount: 1600, method: 'MTN MoMo',      ref: 'BN-NDLA-APR26', status: 'paid',    date: '1 Apr 2026',  period: 'April 2026' },
  { id: 'pay7', tenantId: 't7', tenant: 'Tendai Moyo',    unit: 'D2 · Ndola East',  amount: 1700, method: 'Bank Transfer', ref: 'TM-NDLA-APR26', status: 'paid',    date: '4 Apr 2026',  period: 'April 2026' },
]

export const MOCK_ISSUES: MaintenanceIssue[] = [
  { id: 'i1', title: 'Roof leak — water damage on ceiling', description: 'Water leaking from ceiling in the main bedroom. Stains visible, carpet damaged.', tenant: 'Tendai Moyo',    tenantId: 't7', unit: 'D2 · Ndola East', category: 'Roof',      status: 'open',        priority: 'urgent', date: '4 days ago', icon: 'home'    },
  { id: 'i2', title: 'Kitchen tap leaking at base',         description: 'Constant drip from kitchen tap base. Cabinet below sink water damaged.',            tenant: 'Chanda Mulenga', tenantId: 't1', unit: 'A3 · Parklands',  category: 'Plumbing',  status: 'in-progress', priority: 'medium', date: '2 days ago', assignee: 'John Soko',         icon: 'droplet'  },
  { id: 'i3', title: 'Circuit breaker trips frequently',    description: 'Trips when stove + geyser run simultaneously.',                                      tenant: 'Bupe Nkonde',    tenantId: 't6', unit: 'C1 · Ndola East', category: 'Electrical',status: 'open',        priority: 'high',   date: '1 week ago', icon: 'zap'      },
  { id: 'i4', title: 'Broken gate lock — security risk',   description: 'Main entrance gate lock broken. Replaced deadbolt needed.',                          tenant: 'Mutale Banda',   tenantId: 't2', unit: 'B1 · Parklands',  category: 'Security',  status: 'in-progress', priority: 'low',    date: '5 days ago', assignee: 'Mwamba Security',   icon: 'lock'     },
  { id: 'i5', title: 'Painting needed in living area',     description: 'Walls peeling in living room, needs full repaint.',                                  tenant: 'Grace Phiri',    tenantId: 't3', unit: 'C2 · Ndola East', category: 'General',   status: 'in-progress', priority: 'low',    date: '10 days ago',icon: 'paint-bucket'},
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'warning', title: 'Rent overdue',           message: 'Priscilla Zulu — A5 Parklands is 9 days overdue (K2,200)',                   time: '2 hours ago',  read: false },
  { id: 'n2', type: 'info',    title: 'Payment pending',        message: 'Grace Phiri — K1,500 bank transfer awaiting confirmation',                    time: '5 hours ago',  read: false },
  { id: 'n3', type: 'error',   title: 'Urgent maintenance',     message: 'Roof leak reported at D2 Ndola East — Tendai Moyo',                          time: '1 day ago',    read: false },
  { id: 'n4', type: 'warning', title: 'Lease expiring soon',    message: 'Priscilla Zulu · A5 Parklands lease expires May 2026 (30 days)',              time: '2 days ago',   read: true  },
  { id: 'n5', type: 'success', title: 'Payment confirmed',      message: 'Mutale Banda paid K1,800 via MTN MoMo for April 2026',                       time: '3 days ago',   read: true  },
  { id: 'n6', type: 'info',    title: 'Payment pending',        message: 'Isaac Tembo — K3,000 direct deposit awaiting confirmation',                   time: '4 days ago',   read: true  },
]

export const MOCK_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'success', icon: 'check-circle', text: '<strong>Mutale Banda</strong> paid K1,800 via MTN MoMo',           time: '2 hours ago' },
  { id: 'a2', type: 'warning', icon: 'alert-triangle',text: '<strong>Priscilla Zulu</strong> rent overdue — 9 days',           time: '4 hours ago' },
  { id: 'a3', type: 'info',    icon: 'wrench',         text: 'New maintenance: Roof leak at D2 Ndola East',                    time: 'Yesterday'   },
  { id: 'a4', type: 'success', icon: 'check-circle', text: '<strong>Chanda Mulenga</strong> paid K2,200 via Airtel Money',     time: '3 Apr'       },
  { id: 'a5', type: 'warning', icon: 'clock',          text: '<strong>Grace Phiri</strong> bank transfer pending confirmation', time: '5 Apr'       },
]

export const MOCK_REVENUE: RevenueDataPoint[] = [
  { month: 'Nov', parklands: 22000, ndola: 17000, cbd: 25000, total: 64000 },
  { month: 'Dec', parklands: 22000, ndola: 18000, cbd: 26500, total: 66500 },
  { month: 'Jan', parklands: 23000, ndola: 17500, cbd: 25000, total: 65500 },
  { month: 'Feb', parklands: 23500, ndola: 18500, cbd: 26000, total: 68000 },
  { month: 'Mar', parklands: 24000, ndola: 19000, cbd: 26500, total: 69500 },
  { month: 'Apr', parklands: 24200, ndola: 19500, cbd: 27000, total: 70700 },
]

// ─── Demo credentials ──────────────────────────────────────────────────────────
export const DEMO_EMAIL    = 'james.mwale@pamodzi.com'
export const DEMO_PASSWORD = 'password123'
