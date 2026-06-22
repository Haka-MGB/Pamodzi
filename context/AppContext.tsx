'use client'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Payment, MaintenanceIssue, Tenant, Property, Toast, Notification } from '@/types'
import {
  MOCK_USER, MOCK_PROPERTIES, MOCK_TENANTS, MOCK_PAYMENTS,
  MOCK_ISSUES, MOCK_NOTIFICATIONS, MOCK_ACTIVITY, MOCK_REVENUE,
} from '@/lib/data'

interface AppContextValue {
  // Auth
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  registerAccount: (account: RegisterAccountInput) => Promise<{ ok: boolean; message: string }>
  logout: () => void

  // Data
  user: typeof MOCK_USER
  properties: Property[]
  tenants: Tenant[]
  payments: Payment[]
  issues: MaintenanceIssue[]
  notifications: Notification[]
  activity: typeof MOCK_ACTIVITY
  revenueData: typeof MOCK_REVENUE

  // Mutations
  confirmPayment: (id: string) => void
  addProperty: (p: Omit<Property, 'id'>) => void
  addPayment: (p: Omit<Payment, 'id'>) => void
  addTenant: (t: Omit<Tenant, 'id'>) => void
  updateTenant: (id: string, updates: Partial<Tenant>) => void
  addIssue: (i: Omit<MaintenanceIssue, 'id'>) => void
  updateIssue: (id: string, updates: Partial<MaintenanceIssue>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

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

interface RegisteredAccount {
  name: string
  company: string
  phone: string
  email: string
  password: string
}

interface RegisterAccountInput extends RegisteredAccount {}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn,        setIsLoggedIn]        = useState(false)
  const [properties,        setProperties]        = useState(MOCK_PROPERTIES)
  const [tenants,           setTenants]           = useState(MOCK_TENANTS)
  const [payments,          setPayments]          = useState(MOCK_PAYMENTS)
  const [issues,            setIssues]            = useState(MOCK_ISSUES)
  const [notifications,     setNotifications]     = useState(MOCK_NOTIFICATIONS)
  const [sidebarCollapsed,  setSidebarCollapsed]  = useState(false)
  const [darkMode,          setDarkMode]          = useState(false)
  const [toasts,            setToasts]            = useState<Toast[]>([])
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>([])

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pamodziRegisteredAccounts')
      if (saved) setRegisteredAccounts(JSON.parse(saved))
    } catch {
      setRegisteredAccounts([])
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 1300))
    const normalizedEmail = email.trim().toLowerCase()
    const hasDemoAccess = normalizedEmail === 'james.mwale@pamodzi.com' && password === 'password123'
    const hasRegisteredAccess = registeredAccounts.some(account =>
      account.email.toLowerCase() === normalizedEmail && account.password === password
    )

    if (hasDemoAccess || hasRegisteredAccess) {
      setIsLoggedIn(true)
      return true
    }
    return false
  }, [registeredAccounts])

  const registerAccount = useCallback(async (account: RegisterAccountInput) => {
    await new Promise(r => setTimeout(r, 900))

    const normalizedEmail = account.email.trim().toLowerCase()
    const isDemoEmail = normalizedEmail === 'james.mwale@pamodzi.com'
    const isDuplicate = registeredAccounts.some(saved => saved.email.toLowerCase() === normalizedEmail)

    if (isDemoEmail || isDuplicate) {
      return { ok: false, message: 'An account already exists for this email address.' }
    }

    const nextAccounts = [...registeredAccounts, { ...account, email: account.email.trim() }]
    setRegisteredAccounts(nextAccounts)
    localStorage.setItem('pamodziRegisteredAccounts', JSON.stringify(nextAccounts))
    setIsLoggedIn(true)

    return { ok: true, message: 'Account created successfully.' }
  }, [registeredAccounts])

  const logout = useCallback(() => setIsLoggedIn(false), [])

  const confirmPayment = useCallback((id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'paid', date: 'Today' } : p))
  }, [])

  const addProperty = useCallback((p: Omit<Property, 'id'>) => {
    setProperties(prev => [{ ...p, id: `p${Date.now()}` }, ...prev])
  }, [])

  const addPayment = useCallback((p: Omit<Payment, 'id'>) => {
    setPayments(prev => [{ ...p, id: `pay${Date.now()}` }, ...prev])
  }, [])

  const addTenant = useCallback((t: Omit<Tenant, 'id'>) => {
    setTenants(prev => [{ ...t, id: `t${Date.now()}` }, ...prev])
  }, [])

  const updateTenant = useCallback((id: string, updates: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const addIssue = useCallback((i: Omit<MaintenanceIssue, 'id'>) => {
    setIssues(prev => [{ ...i, id: `i${Date.now()}` }, ...prev])
  }, [])

  const updateIssue = useCallback((id: string, updates: Partial<MaintenanceIssue>) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
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
      isLoggedIn, login, registerAccount, logout,
      user: MOCK_USER, properties, tenants, payments, issues,
      notifications, activity: MOCK_ACTIVITY, revenueData: MOCK_REVENUE,
      confirmPayment, addProperty, addPayment, addTenant, updateTenant, addIssue, updateIssue,
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
