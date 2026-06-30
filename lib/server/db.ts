import crypto from 'crypto'
import type { ActivityItem, MaintenanceIssue, Notification, Payment, Property, RevenueDataPoint, Tenant, User } from '@/types'
import { hashPassword, verifyPassword } from './password'
import { getSupabaseClient } from './supabase'
import type { Database } from '@/types/supabase'

type DbUser = Database['public']['Tables']['users']['Row']
type DbProperty = Database['public']['Tables']['properties']['Row']
type DbTenant = Database['public']['Tables']['tenants']['Row']
type DbPayment = Database['public']['Tables']['payments']['Row']
type DbIssue = Database['public']['Tables']['issues']['Row']
type DbNotification = Database['public']['Tables']['notifications']['Row']
type DbActivity = Database['public']['Tables']['activity']['Row']
type DbRevenue = Database['public']['Tables']['revenue_data']['Row']

interface StoredUser extends User {
  passwordHash: string
}

// ─── Mappers: DB (snake_case) <-> App (camelCase) ─────────────────────────

function userFromDb(row: DbUser): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    location: row.location,
    phone: row.phone,
    company: row.company,
    initials: row.initials,
    passwordHash: row.password_hash,
  }
}

function propertyFromDb(row: DbProperty): Property {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    type: row.type,
    totalUnits: row.total_units,
    occupiedUnits: row.occupied_units,
    monthlyRevenue: row.monthly_revenue,
  }
}

function propertyToDb(input: Omit<Property, 'id'>) {
  return {
    name: input.name,
    location: input.location,
    type: input.type,
    total_units: input.totalUnits,
    occupied_units: input.occupiedUnits,
    monthly_revenue: input.monthlyRevenue,
  }
}

function tenantFromDb(row: DbTenant): Tenant {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    unit: row.unit,
    propertyId: row.property_id,
    propertyName: row.property_name,
    rent: row.rent,
    leaseStart: row.lease_start,
    leaseEnd: row.lease_end,
    status: row.status as Tenant['status'],
    email: row.email,
    phone: row.phone,
  }
}

function tenantToDb(input: Omit<Tenant, 'id'>) {
  return {
    name: input.name,
    initials: input.initials,
    unit: input.unit,
    property_id: input.propertyId,
    property_name: input.propertyName,
    rent: input.rent,
    lease_start: input.leaseStart,
    lease_end: input.leaseEnd,
    status: input.status,
    email: input.email,
    phone: input.phone,
  }
}

function paymentFromDb(row: DbPayment): Payment {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    tenant: row.tenant,
    unit: row.unit,
    amount: row.amount,
    method: row.method,
    ref: row.ref,
    status: row.status as Payment['status'],
    date: row.date,
    period: row.period,
  }
}

function paymentToDb(input: Omit<Payment, 'id'>) {
  return {
    tenant_id: input.tenantId,
    tenant: input.tenant,
    unit: input.unit,
    amount: input.amount,
    method: input.method,
    ref: input.ref,
    status: input.status,
    date: input.date,
    period: input.period,
  }
}

function issueFromDb(row: DbIssue): MaintenanceIssue {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tenant: row.tenant,
    tenantId: row.tenant_id,
    unit: row.unit,
    category: row.category,
    status: row.status as MaintenanceIssue['status'],
    priority: row.priority as MaintenanceIssue['priority'],
    date: row.date,
    assignee: row.assignee ?? undefined,
    icon: row.icon,
  }
}

function issueToDb(input: Omit<MaintenanceIssue, 'id'>) {
  return {
    title: input.title,
    description: input.description,
    tenant: input.tenant,
    tenant_id: input.tenantId,
    unit: input.unit,
    category: input.category,
    status: input.status,
    priority: input.priority,
    date: input.date,
    assignee: input.assignee ?? null,
    icon: input.icon,
  }
}

function notificationFromDb(row: DbNotification): Notification {
  return {
    id: row.id,
    type: row.type as Notification['type'],
    title: row.title,
    message: row.message,
    time: row.time,
    read: row.read,
    link: row.link ?? undefined,
  }
}

function activityFromDb(row: DbActivity): ActivityItem {
  return {
    id: row.id,
    type: row.type as ActivityItem['type'],
    icon: row.icon,
    text: row.text,
    time: row.time,
  }
}

function revenueFromDb(row: DbRevenue): RevenueDataPoint {
  return {
    month: row.month,
    cbd: row.cbd,
    ndola: row.ndola,
    parklands: row.parklands,
    total: row.total,
  }
}

// ─── Public API ─────────────────────────────────────────────────────────

let isInitialized = false

export async function initializeDatabase() {
  if (isInitialized) return
  isInitialized = true

  const supabase = await getSupabaseClient()
  const { error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true })

  if (usersError && usersError.code === 'PGRST116') {
    const now = new Date().toISOString()
    const passwordHash = await hashPassword('password123')
    const userId = id('u')

    await supabase.from('users').insert({
      id: userId,
      name: 'Test User',
      email: 'testuser@example.com',
      role: 'Landlord',
      location: 'Zambia',
      phone: '+260000000000',
      company: 'Pamodzi',
      initials: initials('Test User'),
      password_hash: passwordHash,
      created_at: now,
      updated_at: now,
    })
  }
}

export async function getUserByEmail(email: string) {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email)
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by email:', error)
    return null
  }
  return data ? userFromDb(data) : null
}

export async function getUserById(userId: string) {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by ID:', error)
  }
  return data ? publicUser(userFromDb(data)) : null
}

export async function authenticate(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) return null
  const verified = await verifyPassword(password, user.passwordHash)
  return verified ? publicUser(user) : null
}

export async function createAccount(input: { name: string; company: string; phone: string; email: string; password: string }) {
  const supabase = await getSupabaseClient()
  const passwordHash = await hashPassword(input.password)
  const now = new Date().toISOString()
  const userId = id('u')

  const existingUser = await getUserByEmail(input.email)
  if (existingUser) {
    return { ok: false as const, message: 'An account already exists for this email address.' }
  }

  const { data, error } = await supabase.from('users').insert({
    id: userId,
    name: input.name,
    email: input.email,
    role: 'Landlord',
    location: 'Zambia',
    phone: input.phone,
    company: input.company,
    initials: initials(input.name),
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error || !data) {
    console.error('Error creating account:', error)
    return { ok: false as const, message: 'Failed to create account. Please try again.' }
  }

  return { ok: true as const, user: publicUser(userFromDb(data))! }
}

export async function getAppData(userId: string) {
  const supabase = await getSupabaseClient()
  const user = await getUserById(userId)
  if (!user) return null

  const [
    { data: properties },
    { data: tenants },
    { data: payments },
    { data: issues },
    { data: notifications },
    { data: activity },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('properties').select('*').eq('owner_id', userId),
    supabase.from('tenants').select('*').eq('owner_id', userId),
    supabase.from('payments').select('*').eq('owner_id', userId),
    supabase.from('issues').select('*').eq('owner_id', userId),
    supabase.from('notifications').select('*').eq('owner_id', userId),
    supabase.from('activity').select('*').eq('owner_id', userId),
    supabase.from('revenue_data').select('*').eq('owner_id', userId),
  ])

  return {
    user,
    properties: (properties || []).map(propertyFromDb),
    tenants: (tenants || []).map(tenantFromDb),
    payments: (payments || []).map(paymentFromDb),
    issues: (issues || []).map(issueFromDb),
    notifications: (notifications || []).map(notificationFromDb),
    activity: (activity || []).map(activityFromDb),
    revenueData: (revenueData || []).map(revenueFromDb),
  }
}

export async function addProperty(userId: string, input: Omit<Property, 'id'>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const propertyId = id('p')

  const { data, error } = await supabase.from('properties').insert({
    id: propertyId,
    owner_id: userId,
    ...propertyToDb(input),
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error || !data) {
    console.error('Error adding property:', error)
    return null
  }
  return propertyFromDb(data)
}

export async function addTenant(userId: string, input: Omit<Tenant, 'id'>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const tenantId = id('t')

  const { data, error } = await supabase.from('tenants').insert({
    id: tenantId,
    owner_id: userId,
    ...tenantToDb(input),
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error || !data) {
    console.error('Error adding tenant:', error)
    return null
  }
  return tenantFromDb(data)
}

export async function addPayment(userId: string, input: Omit<Payment, 'id'>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const paymentId = id('pay')

  const { data, error } = await supabase.from('payments').insert({
    id: paymentId,
    owner_id: userId,
    ...paymentToDb(input),
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error || !data) {
    console.error('Error adding payment:', error)
    return null
  }
  return paymentFromDb(data)
}

export async function confirmPayment(userId: string, paymentId: string) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'paid', date: 'Today', updated_at: now })
    .eq('id', paymentId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error confirming payment:', error)
    return null
  }
  return paymentFromDb(data)
}

export async function updateProperty(userId: string, propertyId: string, updates: Partial<Property>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const dbUpdates: Database['public']['Tables']['properties']['Update'] = { updated_at: now }
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.location !== undefined) dbUpdates.location = updates.location
  if (updates.type !== undefined) dbUpdates.type = updates.type
  if (updates.totalUnits !== undefined) dbUpdates.total_units = updates.totalUnits
  if (updates.occupiedUnits !== undefined) dbUpdates.occupied_units = updates.occupiedUnits
  if (updates.monthlyRevenue !== undefined) dbUpdates.monthly_revenue = updates.monthlyRevenue

  const { data, error } = await supabase
    .from('properties')
    .update(dbUpdates)
    .eq('id', propertyId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating property:', error)
    return null
  }
  return propertyFromDb(data)
}

export async function deleteProperty(userId: string, propertyId: string) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error deleting property:', error)
    return null
  }
  return propertyFromDb(data)
}

export async function addIssue(userId: string, input: Omit<MaintenanceIssue, 'id'>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const issueId = id('i')

  const { data, error } = await supabase.from('issues').insert({
    id: issueId,
    owner_id: userId,
    ...issueToDb(input),
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error || !data) {
    console.error('Error adding issue:', error)
    return null
  }
  return issueFromDb(data)
}

export async function updateIssue(userId: string, issueId: string, updates: Partial<MaintenanceIssue>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const dbUpdates: Database['public']['Tables']['issues']['Update'] = { updated_at: now }
  if (updates.title !== undefined) dbUpdates.title = updates.title
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.tenant !== undefined) dbUpdates.tenant = updates.tenant
  if (updates.tenantId !== undefined) dbUpdates.tenant_id = updates.tenantId
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority
  if (updates.date !== undefined) dbUpdates.date = updates.date
  if (updates.assignee !== undefined) dbUpdates.assignee = updates.assignee
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon

  const { data, error } = await supabase
    .from('issues')
    .update(dbUpdates)
    .eq('id', issueId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating issue:', error)
    return null
  }
  return issueFromDb(data)
}

export async function updateTenant(userId: string, tenantId: string, updates: Partial<Tenant>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const dbUpdates: Database['public']['Tables']['tenants']['Update'] = { updated_at: now }
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.initials !== undefined) dbUpdates.initials = updates.initials
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit
  if (updates.propertyId !== undefined) dbUpdates.property_id = updates.propertyId
  if (updates.propertyName !== undefined) dbUpdates.property_name = updates.propertyName
  if (updates.rent !== undefined) dbUpdates.rent = updates.rent
  if (updates.leaseStart !== undefined) dbUpdates.lease_start = updates.leaseStart
  if (updates.leaseEnd !== undefined) dbUpdates.lease_end = updates.leaseEnd
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone

  const { data, error } = await supabase
    .from('tenants')
    .update(dbUpdates)
    .eq('id', tenantId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error updating tenant:', error)
    return null
  }
  return tenantFromDb(data)
}

export async function deleteTenant(userId: string, tenantId: string) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error deleting tenant:', error)
    return null
  }
  return tenantFromDb(data)
}

export async function deletePayment(userId: string, paymentId: string) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error deleting payment:', error)
    return null
  }
  return paymentFromDb(data)
}

export async function verifyUserPassword(userId: string, password: string) {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single()

  if (error || !data) return false
  return verifyPassword(password, data.password_hash)
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: now })
    .eq('id', notificationId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) {
    console.error('Error marking notification as read:', error)
    return null
  }
  return notificationFromDb(data)
}

export async function markAllNotificationsRead(userId: string) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: now })
    .eq('owner_id', userId)
    .select()

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return []
  }
  return (data || []).map(notificationFromDb)
}

function publicUser(user: StoredUser | null): User | null {
  if (!user) return null
  const { passwordHash: _passwordHash, ...safeUser } = user
  return safeUser
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function initials(name: string) {
  return name.split(/\s+/).map(part => part[0]).join('').toUpperCase().slice(0, 2)
}