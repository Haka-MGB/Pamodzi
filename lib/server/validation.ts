import type { IssuePriority, IssueStatus, PaymentStatus, Property, Tenant } from '@/types'

export interface RegisterInput {
  name: string
  company: string
  phone: string
  email: string
  password: string
}

export function cleanText(value: unknown, maxLength = 120) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength)
    : ''
}

export function cleanEmail(value: unknown) {
  return cleanText(value, 254).toLowerCase()
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function parseRegisterInput(value: Partial<RegisterInput> | null) {
  if (!value) return null
  const input = {
    name: cleanText(value.name),
    company: cleanText(value.company),
    phone: cleanText(value.phone, 40),
    email: cleanEmail(value.email),
    password: typeof value.password === 'string' ? value.password : '',
  }

  if (input.name.length < 2 || input.company.length < 2 || input.phone.length < 6) return null
  if (!isEmail(input.email) || input.password.length < 8 || input.password.length > 128) return null
  return input
}

export function parseLoginInput(value: { email?: unknown; password?: unknown } | null) {
  if (!value) return null
  const email = cleanEmail(value.email)
  const password = typeof value.password === 'string' ? value.password : ''
  if (!isEmail(email) || password.length < 1 || password.length > 128) return null
  return { email, password }
}

export function parseProperty(value: Partial<Property> | null) {
  if (!value) return null
  const property = {
    name: cleanText(value.name),
    location: cleanText(value.location),
    type: cleanText(value.type, 60) || 'Residential',
    totalUnits: cleanNumber(value.totalUnits),
    occupiedUnits: cleanNumber(value.occupiedUnits),
    monthlyRevenue: cleanNumber(value.monthlyRevenue),
  }
  if (!property.name || !property.location || property.totalUnits < 1) return null
  if (property.occupiedUnits < 0 || property.occupiedUnits > property.totalUnits) return null
  return property
}

export function parsePropertyUpdates(value: Record<string, unknown> | null) {
  if (!value) return null
  const updates: Partial<Property> = {}
  if (value.name !== undefined) updates.name = cleanText(value.name)
  if (value.location !== undefined) updates.location = cleanText(value.location)
  if (value.type !== undefined) updates.type = cleanText(value.type, 60)
  if (value.totalUnits !== undefined) updates.totalUnits = cleanNumber(value.totalUnits)
  if (value.occupiedUnits !== undefined) updates.occupiedUnits = cleanNumber(value.occupiedUnits)
  if (value.monthlyRevenue !== undefined) updates.monthlyRevenue = cleanNumber(value.monthlyRevenue)

  if (updates.totalUnits !== undefined && updates.totalUnits < 1) return null
  if (updates.occupiedUnits !== undefined && updates.totalUnits !== undefined && updates.occupiedUnits > updates.totalUnits) return null
  return updates
}

export function parseTenant(value: Partial<Tenant> | null) {
  if (!value) return null
  const tenant = {
    name: cleanText(value.name),
    initials: cleanText(value.initials, 4),
    unit: cleanText(value.unit, 30),
    propertyId: cleanText(value.propertyId, 60),
    propertyName: cleanText(value.propertyName),
    rent: cleanNumber(value.rent),
    leaseStart: cleanText(value.leaseStart, 40),
    leaseEnd: cleanText(value.leaseEnd, 40),
    status: normalizeEnum(value.status, ['active', 'overdue', 'vacating'] as const, 'active'),
    email: cleanEmail(value.email),
    phone: cleanText(value.phone, 40),
  }
  if (!tenant.name || !tenant.unit || !tenant.propertyId || tenant.rent < 0) return null
  if (tenant.email && !isEmail(tenant.email)) return null
  return tenant
}

export function parseTenantUpdates(value: Record<string, unknown> | null) {
  if (!value) return null
  const updates: Partial<Tenant> = {}
  if (value.name !== undefined) updates.name = cleanText(value.name)
  if (value.initials !== undefined) updates.initials = cleanText(value.initials, 4)
  if (value.unit !== undefined) updates.unit = cleanText(value.unit, 30)
  if (value.propertyId !== undefined) updates.propertyId = cleanText(value.propertyId, 60)
  if (value.propertyName !== undefined) updates.propertyName = cleanText(value.propertyName)
  if (value.rent !== undefined) updates.rent = cleanNumber(value.rent)
  if (value.leaseStart !== undefined) updates.leaseStart = cleanText(value.leaseStart, 40)
  if (value.leaseEnd !== undefined) updates.leaseEnd = cleanText(value.leaseEnd, 40)
  if (value.status !== undefined) updates.status = normalizeEnum(value.status, ['active', 'overdue', 'vacating'] as const, 'active')
  if (value.email !== undefined) updates.email = cleanEmail(value.email)
  if (value.phone !== undefined) updates.phone = cleanText(value.phone, 40)

  if (updates.rent !== undefined && updates.rent < 0) return null
  if (updates.email !== undefined && updates.email && !isEmail(updates.email)) return null
  return updates
}

export function parsePayment(value: Record<string, unknown> | null) {
  if (!value) return null
  const payment = {
    tenantId: cleanText(value.tenantId, 60),
    tenant: cleanText(value.tenant),
    unit: cleanText(value.unit),
    amount: cleanNumber(value.amount),
    method: cleanText(value.method, 60),
    ref: cleanText(value.ref, 80),
    status: normalizeEnum(value.status, ['paid', 'pending', 'overdue'] as const, 'pending') as PaymentStatus,
    date: cleanText(value.date, 40),
    period: cleanText(value.period, 40),
  }
  if (!payment.tenantId || !payment.tenant || !payment.ref || payment.amount < 0) return null
  return payment
}

export function parseIssue(value: Record<string, unknown> | null) {
  if (!value) return null
  const issue = {
    title: cleanText(value.title, 160),
    description: cleanText(value.description, 1000),
    tenant: cleanText(value.tenant),
    tenantId: cleanText(value.tenantId, 60),
    unit: cleanText(value.unit),
    category: cleanText(value.category, 80),
    status: normalizeEnum(value.status, ['open', 'in-progress', 'resolved'] as const, 'open') as IssueStatus,
    priority: normalizeEnum(value.priority, ['urgent', 'high', 'medium', 'low'] as const, 'medium') as IssuePriority,
    date: cleanText(value.date, 40),
    assignee: cleanText(value.assignee, 120) || undefined,
    icon: cleanText(value.icon, 40) || 'wrench',
  }
  if (!issue.title || !issue.tenantId) return null
  return issue
}

export function parseIssueUpdates(value: Record<string, unknown> | null) {
  if (!value) return null
  const status = value.status ? normalizeEnum(value.status, ['open', 'in-progress', 'resolved'] as const, 'open') : undefined
  const assignee = value.assignee ? cleanText(value.assignee, 120) : undefined
  return { ...(status ? { status } : {}), ...(assignee ? { assignee } : {}) }
}

function cleanNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, number) : 0
}

function normalizeEnum<T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number]) {
  return allowed.includes(value as T[number]) ? (value as T[number]) : fallback
}

