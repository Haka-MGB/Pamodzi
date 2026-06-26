'use client'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { ActivityItem, Payment, MaintenanceIssue, Tenant, Property, Toast, Notification, RevenueDataPoint, User } from '@/types'
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn,        setIsLoggedIn]        = useState(false)
  const [isLoading,         setIsLoading]         = useState(true)
  const [user,              setUser]              = useState<User>({ id: '', name: '', email: '', role: '', location: '', phone: '', company: '', initials: '' })
  const [properties,        setProperties]        = useState<Property[]>([])
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

  const applyData = useCallback((data: AppData) => {
    setUser(data.user)
    setProperties(data.properties)
    setTenants(data.tenants)
    setPayments(data.payments)
    setIssues(data.issues)
    setNotifications(data.notifications)
    setActivity(data.activity)
    setRevenueData(data.revenueData)
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
    const payment = await apiPatch<Payment>(`/api/payments/${id}/confirm`)
    setPayments(prev => prev.map(p => p.id === id ? payment : p))
  }, [])

  const addProperty = useCallback(async (p: Omit<Property, 'id'>) => {
    const property = await apiPost<Property>('/api/properties', p)
    setProperties(prev => [property, ...prev])
  }, [])

  const addPayment = useCallback(async (p: Omit<Payment, 'id'>) => {
    const payment = await apiPost<Payment>('/api/payments', p)
    setPayments(prev => [payment, ...prev])
  }, [])

  const addTenant = useCallback(async (t: Omit<Tenant, 'id'>) => {
    const tenant = await apiPost<Tenant>('/api/tenants', t)
    setTenants(prev => [tenant, ...prev])
  }, [])

  const updateTenant = useCallback(async (id: string, updates: Partial<Tenant>) => {
    const tenant = await apiPatch<Tenant>(`/api/tenants/${id}`, updates)
    setTenants(prev => prev.map(t => t.id === id ? tenant : t))
  }, [])

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    const property = await apiPatch<Property>(`/api/properties/${id}`, updates)
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
    const issue = await apiPost<MaintenanceIssue>('/api/issues', i)
    setIssues(prev => [issue, ...prev])
  }, [])

  const updateIssue = useCallback(async (id: string, updates: Partial<MaintenanceIssue>) => {
    const issue = await apiPatch<MaintenanceIssue>(`/api/issues/${id}`, updates)
    setIssues(prev => prev.map(i => i.id === id ? issue : i))
  }, [])

  const markNotificationRead = useCallback(async (id: string) => {
    const notification = await apiPatch<Notification>(`/api/notifications/${id}`)
    setNotifications(prev => prev.map(n => n.id === id ? notification : n))
  }, [])

  const markAllNotificationsRead = useCallback(async () => {
    const nextNotifications = await apiPost<Notification[]>('/api/notifications/read-all')
    setNotifications(nextNotifications)
  }, [])

  const toggleSidebar = useCallback(() => setSidebarCollapsed(p => !p), [])
  const toggleDark    = useCallback(() => setDarkMode(p => !p), [])

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = `toast-${Date.now()}`
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      isLoggedIn, isLoading, login, registerAccount, logout,
      user, properties, tenants, payments, issues,
      notifications, activity, revenueData,
      confirmPayment, addProperty, addPayment, addTenant, updateTenant, updateProperty, deleteProperty, deleteTenant, deletePayment, addIssue, updateIssue,
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
