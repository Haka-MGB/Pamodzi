import crypto from 'crypto'
import type { ActivityItem, MaintenanceIssue, Notification, Payment, Property, RevenueDataPoint, Tenant, User } from '@/types'
import { hashPassword, verifyPassword } from './password'
import { getSupabaseClient } from './supabase'

interface StoredUser extends User {
  passwordHash: string
  createdAt: string
  updatedAt: string
}

type Owned<T> = T & { ownerId: string; createdAt: string; updatedAt: string }

// Helper type for database operations
type DbResult<T> = { data: T | null; error: any }

let isInitialized = false

// Initialize database schema if needed
export async function initializeDatabase() {
  if (isInitialized) return
  isInitialized = true
  
  const supabase = await getSupabaseClient()
  
  // Check if tables exist by querying them
  const { error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true })
  
  if (usersError && usersError.code === 'PGRST116') {
    // Table doesn't exist, create initial data
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
  
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email)
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by email:', error)
    return null
  }
  
  return users as StoredUser | null
}

export async function getUserById(userId: string) {
  const supabase = await getSupabaseClient()
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by ID:', error)
  }
  
  return publicUser(user as StoredUser | null)
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

  // Check if email already exists
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

  if (error) {
    console.error('Error creating account:', error)
    return { ok: false as const, message: 'Failed to create account. Please try again.' }
  }

  return { ok: true as const, user: publicUser(data as StoredUser)! }
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
    properties: stripOwner(properties || []),
    tenants: stripOwner(tenants || []),
    payments: stripOwner(payments || []),
    issues: stripOwner(issues || []),
    notifications: stripOwner(notifications || []),
    activity: stripOwner(activity || []),
    revenueData: stripOwner(revenueData || []).map(({ id: _id, ...point }: any) => point),
  }
}

export async function addProperty(userId: string, input: Omit<Property, 'id'>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const propertyId = id('p')

  const { data, error } = await supabase.from('properties').insert({
    id: propertyId,
    owner_id: userId,
    ...input,
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error) {
    console.error('Error adding property:', error)
    return null
  }

  return stripOne(data as Owned<Property>)
}

export async function addTenant(userId: string, input: Omit<Tenant, 'id'>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const tenantId = id('t')

  const { data, error } = await supabase.from('tenants').insert({
    id: tenantId,
    owner_id: userId,
    ...input,
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error) {
    console.error('Error adding tenant:', error)
    return null
  }

  return stripOne(data as Owned<Tenant>)
}

export async function addPayment(userId: string, input: Omit<Payment, 'id'>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const paymentId = id('pay')

  const { data, error } = await supabase.from('payments').insert({
    id: paymentId,
    owner_id: userId,
    ...input,
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error) {
    console.error('Error adding payment:', error)
    return null
  }

  return stripOne(data as Owned<Payment>)
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

  if (error) {
    console.error('Error confirming payment:', error)
    return null
  }

  return stripOne(data as Owned<Payment>)
}

export async function updateProperty(userId: string, propertyId: string, updates: Partial<Property>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('properties')
    .update({ ...updates, updated_at: now })
    .eq('id', propertyId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating property:', error)
    return null
  }

  return stripOne(data as Owned<Property>)
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

  if (error) {
    console.error('Error deleting property:', error)
    return null
  }

  return stripOne(data as Owned<Property>)
}

export async function addIssue(userId: string, input: Omit<MaintenanceIssue, 'id'>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()
  const issueId = id('i')

  const { data, error } = await supabase.from('issues').insert({
    id: issueId,
    owner_id: userId,
    ...input,
    created_at: now,
    updated_at: now,
  }).select().single()

  if (error) {
    console.error('Error adding issue:', error)
    return null
  }

  return stripOne(data as Owned<MaintenanceIssue>)
}

export async function updateIssue(userId: string, issueId: string, updates: Partial<MaintenanceIssue>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('issues')
    .update({ ...updates, updated_at: now })
    .eq('id', issueId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating issue:', error)
    return null
  }

  return stripOne(data as Owned<MaintenanceIssue>)
}

export async function updateTenant(userId: string, tenantId: string, updates: Partial<Tenant>) {
  const supabase = await getSupabaseClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('tenants')
    .update({ ...updates, updated_at: now })
    .eq('id', tenantId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating tenant:', error)
    return null
  }

  return stripOne(data as Owned<Tenant>)
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

  if (error) {
    console.error('Error deleting tenant:', error)
    return null
  }

  return stripOne(data as Owned<Tenant>)
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

  if (error) {
    console.error('Error deleting payment:', error)
    return null
  }

  return stripOne(data as Owned<Payment>)
}

export async function verifyUserPassword(userId: string, password: string) {
  const user = await getUserById(userId)
  if (!user) return false
  
  const supabase = await getSupabaseClient()
  const { data: storedUser, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single()

  if (error || !storedUser) return false
  return verifyPassword(password, storedUser.password_hash)
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

  if (error) {
    console.error('Error marking notification as read:', error)
    return null
  }

  return stripOne(data as Owned<Notification>)
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

  return stripOwner(data || [])
}

function publicUser(user: StoredUser | null): User | null {
  if (!user) return null
  const { password_hash: _passwordHash, passwordHash: _old, created_at: _createdAt, updated_at: _updatedAt, createdAt: _old2, updatedAt: _old3, ...safeUser } = user as any
  return safeUser as User
}

function stripOwner<T>(items: Owned<T>[]) {
  return items.map(stripOne)
}

function stripOne<T>(item: Owned<T>): T {
  const { owner_id: _ownerId, ownerId: _ownerId2, created_at: _createdAt, updated_at: _updatedAt, createdAt: _old, updatedAt: _old2, ...rest } = item as any
  return rest as T
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function initials(name: string) {
  return name.split(/\s+/).map(part => part[0]).join('').toUpperCase().slice(0, 2)
}
