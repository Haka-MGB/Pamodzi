'use client'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ActivityItem, Payment, MaintenanceIssue, Tenant, Property, Toast, Notification, RevenueDataPoint, Unit, User } from '@/types'
// Start with empty defaults; do not rely on demo/mock data at startup.
import { apiGet, apiPatch, apiPost, apiDelete, type AppData } from '@/lib/client-api'

interface AppContextValue {
  // Auth
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  registerAccount: (account: RegisterAccountInput) => Promise<{ ok: boolean; message: string }>
  logout: () => void

  // Data
  user: User
  properties: Property[]
  units: Unit[]
  tenants: Tenant[]
  payments: Payment[]
  issues: MaintenanceIssue[]
  notifications: Notification[]
  activity: ActivityItem[]
  revenueData: RevenueDataPoint[]

  // Mutations
  confirmPayment: (id: string) => Promise<void>
  addProperty: (p: Omit<Property, 'id'>) => Promise<void>
  addPayment: (p: Omit<Payment, 'id'>) => Promise<void>
  addTenant: (t: Omit<Tenant, 'id'>) => Promise<void>
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  deleteProperty: (id: string, password?: string) => Promise<void>
  addIssue: (i: Omit<MaintenanceIssue, 'id'>) => Promise<void>
  updateIssue: (id: string, updates: Partial<MaintenanceIssue>) => Promise<void>
  deleteTenant: (id: string, password?: string) => Promise<void>
  deletePayment: (id: string, password?: string) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  
  // Unit mutations
  addUnit: (u: Omit<Unit, 'id' | 'tenantName' | 'tenantEmail' | 'tenantPhone'>) => Promise<void>
  updateUnit: (id: string, updates: Partial<Unit>) => Promise<void>
  deleteUnit: (id: string) => Promise<void>
  getUnitsByProperty: (propertyId: string) => Unit[]

  // UI
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  darkMode: boolean
  toggleDark: () => void
  toasts: Toast[]
  showToast: (type: Toast['type'], message: string) => void

  // Computed
  unreadCount: number
}

const AppContext = createContext<AppContextValue | null>(null)

interface RegisterAccountInput {
  name: string
  company: string
  phone: string
  email: string
  password: string
}

const emptyUser: User = { id: '', name: '', email: '', role: '', location: '', phone: '', company: '', initials: '' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && allowed.includes(value as T)
}

function safeArray<T>(value: unknown, guard: (item: unknown) => item is T): T[] {
  return Array.isArray(value) ? value.filter(guard) : []
}

function isUser(value: unknown): value is User {
  return isRecord(value)
    && isString(value.id)
    && isString(value.name)
    && isString(value.email)
    && isString(value.role)
    && isString(value.location)
    && isString(value.phone)
    && isString(value.company)
    && isString(value.initials)
}

function isProperty(value: unknown): value is Property {
  return isRecord(value)
    && isString(value.id)
    && isString(value.name)
    && isString(value.location)
    && isString(value.type)
    && isNumber(value.totalUnits)
    && isNumber(value.occupiedUnits)
    && isNumber(value.monthlyRevenue)
}

function isTenant(value: unknown): value is Tenant {
  return isRecord(value)
    && isString(value.id)
    && isString(value.name)
    && isString(value.initials)
    && isString(value.unit)
    && isString(value.propertyId)
    && isString(value.propertyName)
    && isNumber(value.rent)
    && isString(value.leaseStart)
    && isString(value.leaseEnd)
    && isOneOf(value.status, ['active', 'overdue', 'vacating'] as const)
    && isString(value.email)
    && isString(value.phone)
}

function isPayment(value: unknown): value is Payment {
  return isRecord(value)
    && isString(value.id)
    && isString(value.tenantId)
    && isString(value.tenant)
    && isString(value.unit)
    && isNumber(value.amount)
    && isString(value.method)
    && isString(value.ref)
    && isOneOf(value.status, ['paid', 'pending', 'overdue'] as const)
    && isString(value.date)
    && isString(value.period)
}

function isIssue(value: unknown): value is MaintenanceIssue {
  return isRecord(value)
    && isString(value.id)
    && isString(value.title)
    && isString(value.description)
    && isString(value.tenant)
    && isString(value.tenantId)
    && isString(value.unit)
    && isString(value.category)
    && isOneOf(value.status, ['open', 'in-progress', 'resolved'] as const)
    && isOneOf(value.priority, ['urgent', 'high', 'medium', 'low'] as const)
    && isString(value.date)
    && isString(value.icon)
}

function isNotification(value: unknown): value is Notification {
  return isRecord(value)
    && isString(value.id)
    && isOneOf(value.type, ['warning', 'info', 'success', 'error'] as const)
    && isString(value.title)
    && isString(value.message)
    && isString(value.time)
    && typeof value.read === 'boolean'
}

function isActivityItem(value: unknown): value is ActivityItem {
  return isRecord(value)
    && isString(value.id)
    && isOneOf(value.type, ['success', 'warning', 'info', 'error'] as const)
    && isString(value.icon)
    && isString(value.text)
    && isString(value.time)
}

function isRevenueDataPoint(value: unknown): value is RevenueDataPoint {
  return isRecord(value) && isString(value.month) && isNumber(value.total)
}

function isUnit(value: unknown): value is Unit {
  return isRecord(value)
    && isString(value.id)
    && isString(value.propertyId)
    && isString(value.unitName)
    && isNumber(value.rentAmount)
    && isOneOf(value.status, ['vacant', 'occupied', 'maintenance'] as const)
}

function requireApiItem<T>(value: unknown, guard: (item: unknown) => item is T, message: string): T {
  if (guard(value)) return value
  throw new Error(message)
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn,        setIsLoggedIn]        = useState(false)
  const [isLoading,         setIsLoading]         = useState(true)
  const [user,              setUser]              = useState<User>(emptyUser)
  const [properties,        setProperties]        = useState<Property[]>([])
  const [units,             setUnits]             = useState<Unit[]>([])
  const [tenants,           setTenants]           = useState<Tenant[]>([])
  const [payments,          setPayments]          = useState<Payment[]>([])
  const [issues,            setIssues]            = useState<MaintenanceIssue[]>([])
  const [notifications,     setNotifications]     = useState<Notification[]>([])
  const [activity,          setActivity]          = useState<ActivityItem[]>([])
  const [revenueData,       setRevenueData]       = useState<RevenueDataPoint[]>([])
  const [sidebarCollapsed,  setSidebarCollapsed]  = useState(false)
  const [darkMode,          setDarkMode]          = useState(false)
  const [toasts,            setToasts]            = useState<Toast[]>([])

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const applyData = useCallback((data: AppData | null) => {
    if (!isRecord(data)) {
      setUser(emptyUser)
      setProperties([])
      setUnits([])
      setTenants([])
      setPayments([])
      setIssues([])
      setNotifications([])
      setActivity([])
      setRevenueData([])
      return
    }

    setUser(isUser(data.user) ? data.user : emptyUser)
    setProperties(safeArray(data.properties, isProperty))
    setUnits(safeArray(data.units, isUnit))
    setTenants(safeArray(data.tenants, isTenant))
    setPayments(safeArray(data.payments, isPayment))
    setIssues(safeArray(data.issues, isIssue))
    setNotifications(safeArray(data.notifications, isNotification))
    setActivity(safeArray(data.activity, isActivityItem))
    setRevenueData(safeArray(data.revenueData, isRevenueDataPoint))
  }, [])

  const refreshData = useCallback(async () => {
    const data = await apiGet<AppData>('/api/app-data')
    applyData(data)
    return data
  }, [applyData])

  useEffect(() => {
    let mounted = true

    async function restoreSession() {
      try {
        const { user: sessionUser } = await apiGet<{ user: User | null }>('/api/auth/session')
        if (!mounted) return

        if (sessionUser) {
          await refreshData()
          if (mounted) setIsLoggedIn(true)
        }
      } catch {
        if (mounted) setIsLoggedIn(false)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    restoreSession()
    return () => { mounted = false }
  }, [refreshData])

  const login = useCallback(async (email: string, password: string) => {
    try {
      await apiPost<{ user: User }>('/api/auth/login', { email, password })
      await refreshData()
      setIsLoggedIn(true)
      return true
    } catch {
      return false
    }
  }, [refreshData])

  const registerAccount = useCallback(async (account: RegisterAccountInput) => {
    try {
      await apiPost<{ user: User }>('/api/auth/register', account)
      await refreshData()
      setIsLoggedIn(true)
      return { ok: true, message: 'Account created successfully.' }
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Unable to create account.' }
    }
  }, [refreshData])

  const logout = useCallback(() => {
    apiPost('/api/auth/logout').catch(() => undefined)
    setIsLoggedIn(false)
  }, [])

  const confirmPayment = useCallback(async (id: string) => {
    const payment = requireApiItem(await apiPatch<Payment>(`/api/payments/${id}/confirm`), isPayment, 'Unable to confirm payment.')
    setPayments(prev => prev.map(p => p.id === id ? payment : p))
  }, [])

  const addProperty = useCallback(async (p: Omit<Property, 'id'>) => {
    const property = requireApiItem(await apiPost<Property>('/api/properties', p), isProperty, 'Unable to save property.')
    setProperties(prev => [property, ...prev])
  }, [])

  const addPayment = useCallback(async (p: Omit<Payment, 'id'>) => {
    const payment = requireApiItem(await apiPost<Payment>('/api/payments', p), isPayment, 'Unable to save payment.')
    setPayments(prev => [payment, ...prev])
  }, [])

  const addTenant = useCallback(async (t: Omit<Tenant, 'id'>) => {
    const tenant = requireApiItem(await apiPost<Tenant>('/api/tenants', t), isTenant, 'Unable to save tenant.')
    setTenants(prev => [tenant, ...prev])
  }, [])

  const updateTenant = useCallback(async (id: string, updates: Partial<Tenant>) => {
    const tenant = requireApiItem(await apiPatch<Tenant>(`/api/tenants/${id}`, updates), isTenant, 'Unable to update tenant.')
    setTenants(prev => prev.map(t => t.id === id ? tenant : t))
  }, [])

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    const property = requireApiItem(await apiPatch<Property>(`/api/properties/${id}`, updates), isProperty, 'Unable to update property.')
    setProperties(prev => prev.map(p => p.id === id ? property : p))
  }, [])

  const deleteProperty = useCallback(async (id: string, password?: string) => {
    await apiDelete(`/api/properties/${id}`, password ? { password } : undefined)
    setProperties(prev => prev.filter(p => p.id !== id))
  }, [])

  const deleteTenant = useCallback(async (id: string, password?: string) => {
    await apiDelete(`/api/tenants/${id}`, password ? { password } : undefined)
    setTenants(prev => prev.filter(t => t.id !== id))
  }, [])

  const deletePayment = useCallback(async (id: string, password?: string) => {
    await apiDelete(`/api/payments/${id}`, password ? { password } : undefined)
    setPayments(prev => prev.filter(p => p.id !== id))
  }, [])

  const addIssue = useCallback(async (i: Omit<MaintenanceIssue, 'id'>) => {
    const issue = requireApiItem(await apiPost<MaintenanceIssue>('/api/issues', i), isIssue, 'Unable to log issue.')
    setIssues(prev => [issue, ...prev])
  }, [])

  const updateIssue = useCallback(async (id: string, updates: Partial<MaintenanceIssue>) => {
    const issue = requireApiItem(await apiPatch<MaintenanceIssue>(`/api/issues/${id}`, updates), isIssue, 'Unable to update issue.')
    setIssues(prev => prev.map(i => i.id === id ? issue : i))
  }, [])

  const markNotificationRead = useCallback(async (id: string) => {
    const notification = requireApiItem(await apiPatch<Notification>(`/api/notifications/${id}`), isNotification, 'Unable to update notification.')
    setNotifications(prev => prev.map(n => n.id === id ? notification : n))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    const nextNotifications = await apiPost<Notification[]>('/api/notifications/read-all')
    setNotifications(safeArray(nextNotifications, isNotification))
  }, [])

  const addUnit = useCallback(async (u: Omit<Unit, 'id' | 'tenantName' | 'tenantEmail' | 'tenantPhone'>) => {
    const unit = requireApiItem(await apiPost<Unit>('/api/units', u), isUnit, 'Unable to add unit.')
    setUnits(prev => [unit, ...prev])
  }, [])

  const updateUnit = useCallback(async (id: string, updates: Partial<Unit>) => {
    const unit = requireApiItem(await apiPatch<Unit>(`/api/units/${id}`, updates), isUnit, 'Unable to update unit.')
    setUnits(prev => prev.map(u => u.id === id ? unit : u))
  }, [])

  const deleteUnit = useCallback(async (id: string) => {
    await apiDelete(`/api/units/${id}`)
    setUnits(prev => prev.filter(u => u.id !== id))
  }, [])

  const getUnitsByProperty = useCallback((propertyId: string) => {
    return units.filter(u => u.propertyId === propertyId)
  }, [units])

  const toggleSidebar = useCallback(() => setSidebarCollapsed(p => !p), [])
  const toggleDark    = useCallback(() => setDarkMode(p => !p), [])

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      isLoggedIn, isLoading, login, registerAccount, logout,
      user, properties, units, tenants, payments, issues,
      notifications, activity, revenueData,
      confirmPayment, addProperty, addPayment, addTenant, updateTenant, updateProperty, deleteProperty, deleteTenant, deletePayment, addIssue, updateIssue,
      addUnit, updateUnit, deleteUnit, getUnitsByProperty,
      markNotificationRead, markAllNotificationsRead,
      sidebarCollapsed, toggleSidebar, darkMode, toggleDark,
      toasts, showToast, unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
