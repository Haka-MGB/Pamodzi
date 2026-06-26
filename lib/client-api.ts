import type { ActivityItem, MaintenanceIssue, Notification, Payment, Property, RevenueDataPoint, Tenant, User } from '@/types'

export interface AppData {
  user: User
  properties: Property[]
  tenants: Tenant[]
  payments: Payment[]
  issues: MaintenanceIssue[]
  notifications: Notification[]
  activity: ActivityItem[]
  revenueData: RevenueDataPoint[]
}

export async function apiGet<T>(path: string) {
  return apiRequest<T>(path)
}

export async function apiPost<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })
}

export async function apiPatch<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined })
}

export async function apiDelete<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined })
}

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error || 'Request failed.')
  }

  return data as T
}

