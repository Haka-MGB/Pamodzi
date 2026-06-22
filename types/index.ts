// ─── Core domain types ────────────────────────────────────────────────────────

export type PaymentStatus = 'paid' | 'pending' | 'overdue'
export type IssueStatus   = 'open' | 'in-progress' | 'resolved'
export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low'
export type TenantStatus  = 'active' | 'overdue' | 'vacating'

export interface User {
  id: string
  name: string
  email: string
  role: string
  location: string
  phone: string
  company: string
  initials: string
}

export interface Property {
  id: string
  name: string
  location: string
  type: string
  totalUnits: number
  occupiedUnits: number
  monthlyRevenue: number
}

export interface Tenant {
  id: string
  name: string
  initials: string
  unit: string
  propertyId: string
  propertyName: string
  rent: number
  leaseStart: string
  leaseEnd: string
  status: TenantStatus
  email: string
  phone: string
}

export interface Payment {
  id: string
  tenantId: string
  tenant: string
  unit: string
  amount: number
  method: string
  ref: string
  status: PaymentStatus
  date: string
  period: string
}

export interface MaintenanceIssue {
  id: string
  title: string
  description: string
  tenant: string
  tenantId: string
  unit: string
  category: string
  status: IssueStatus
  priority: IssuePriority
  date: string
  assignee?: string
  icon: string
}

export interface Notification {
  id: string
  type: 'warning' | 'info' | 'success' | 'error'
  title: string
  message: string
  time: string
  read: boolean
  link?: string
}

export interface ActivityItem {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  icon: string
  text: string
  time: string
}

export interface RevenueDataPoint {
  month: string
  parklands: number
  ndola: number
  cbd: number
  total: number
}

// ─── Store / Context types ─────────────────────────────────────────────────────

export interface AppState {
  user: User
  properties: Property[]
  tenants: Tenant[]
  payments: Payment[]
  issues: MaintenanceIssue[]
  notifications: Notification[]
  activity: ActivityItem[]
  revenueData: RevenueDataPoint[]
  sidebarCollapsed: boolean
  darkMode: boolean
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}
