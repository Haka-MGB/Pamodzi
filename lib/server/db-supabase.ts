/**
 * Supabase Database Adapter for Pamodzi
 * 
 * To use this adapter:
 * 1. Install: npm install @supabase/supabase-js
 * 2. Set up Supabase database with tables (see DEPLOYMENT_GUIDE.md)
 * 3. Add environment variables to .env:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    - SUPABASE_SERVICE_ROLE_KEY (for server operations)
 * 4. Rename lib/server/db.ts to db-json.ts
 * 5. Rename this file to db.ts
 */

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import type { ActivityItem, MaintenanceIssue, Notification, Payment, Property, RevenueDataPoint, Tenant, User } from '@/types'
import { hashPassword, verifyPassword } from './password'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface StoredUser extends User {
  password_hash: string
  created_at: string
  updated_at: string
}

// ===== USER FUNCTIONS =====

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !data) return null
  return dbUserToStored(data)
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return publicUser(dbUserToStored(data))
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user) return null
  const verified = await verifyPassword(password, user.password_hash)
  return verified ? publicUser(user) : null
}

export async function createAccount(input: { name: string; company: string; phone: string; email: string; password: string }) {
  // Check if user exists
  const existing = await getUserByEmail(input.email)
  if (existing) {
    return { ok: false as const, message: 'An account already exists for this email address.' }
  }

  const passwordHash = await hashPassword(input.password)
  const userId = id('u')

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      name: input.name,
      email: input.email.toLowerCase(),
      role: 'Landlord',
      location: 'Zambia',
      phone: input.phone,
      company: input.company,
      initials: initials(input.name),
      password_hash: passwordHash,
    })
    .select()
    .single()

  if (error || !data) {
    return { ok: false as const, message: 'Unable to create account.' }
  }

  return { ok: true as const, user: publicUser(dbUserToStored(data))! }
}

export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single()

  if (error || !data) return false
  return verifyPassword(password, data.password_hash)
}

// ===== APP DATA =====

export async function getAppData(userId: string) {
  const user = await getUserById(userId)
  if (!user) return null

  const [properties, tenants, payments, issues, notifications, activity, revenueData] = await Promise.all([
    supabase.from('properties').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
    supabase.from('tenants').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
    supabase.from('payments').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
    supabase.from('issues').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
    supabase.from('notifications').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
    supabase.from('activity').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
    supabase.from('revenue_data').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
  ])

  return {
    user,
    properties: (properties.data || []).map(stripOwner),
    tenants: (tenants.data || []).map(stripOwner),
    payments: (payments.data || []).map(stripOwner),
    issues: (issues.data || []).map(stripOwner),
    notifications: (notifications.data || []).map(stripOwner),
    activity: (activity.data || []).map(stripOwner),
    revenueData: (revenueData.data || []).map(({ id: _id, ...rest }) => stripOwner(rest)),
  }
}

// ===== PROPERTIES =====

export async function addProperty(userId: string, input: Omit<Property, 'id'>) {
  const { data, error } = await supabase
    .from('properties')
    .insert({ ...input, id: id('p'), owner_id: userId })
    .select()
    .single()

  if (error || !data) throw new Error('Failed to add property')
  return stripOwner(data)
}

export async function updateProperty(userId: string, propertyId: string, updates: Partial<Property>) {
  const { data, error } = await supabase
    .from('properties')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', propertyId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return stripOwner(data)
}

export async function deleteProperty(userId: string, propertyId: string) {
  const { data, error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return stripOwner(data)
}

// ===== TENANTS =====

export async function addTenant(userId: string, input: Omit<Tenant, 'id'>) {
  const { data, error } = await supabase
    .from('tenants')
    .insert({ ...input, id: id('t'), owner_id: userId })
    .select()
    .single()

  if (error || !data) throw new Error('Failed to add tenant')
  return stripOwner(data)
}

export async function updateTenant(userId: string, tenantId: string, updates: Partial<Tenant>) {
  const { data, error } = await supabase
    .from('tenants')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', tenantId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return stripOwner(data)
}

export async function deleteTenant(userId: string, tenantId: string) {
  const { data, error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return stripOwner(data)
}

// ===== PAYMENTS =====

export async function addPayment(userId: string, input: Omit<Payment, 'id'>) {
  const { data, error } = await supabase
    .from('payments')
    .insert({ ...input, id: id('pay'), owner_id: userId })
    .select()
    .single()

  if (error || !data) throw new Error('Failed to add payment')
  return stripOwner(data)
}

export async function confirmPayment(userId: string, paymentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'paid', date: 'Today', updated_at: new Date().toISOString() })
    .eq('id', paymentId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return stripOwner(data)
}

export async function deletePayment(userId: string, paymentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return stripOwner(data)
}

// ===== ISSUES =====

export async function addIssue(userId: string, input: Omit<MaintenanceIssue, 'id'>) {
  const { data, error } = await supabase
    .from('issues')
    .insert({ ...input, id: id('i'), owner_id: userId })
    .select()
    .single()

  if (error || !data) throw new Error('Failed to add issue')
  return stripOwner(data)
}

export async function updateIssue(userId: string, issueId: string, updates: Partial<MaintenanceIssue>) {
  const { data, error } = await supabase
    .from('issues')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', issueId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return stripOwner(data)
}

// ===== NOTIFICATIONS =====

export async function markNotificationRead(userId: string, notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('owner_id', userId)
    .select()
    .single()

  if (error || !data) return null
  return stripOwner(data)
}

export async function markAllNotificationsRead(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq('owner_id', userId)
    .select()

  if (error) return []
  return (data || []).map(stripOwner)
}

// ===== HELPER FUNCTIONS =====

function dbUserToStored(dbUser: any): StoredUser {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    location: dbUser.location,
    phone: dbUser.phone,
    company: dbUser.company,
    initials: dbUser.initials,
    password_hash: dbUser.password_hash,
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at,
  }
}

function publicUser(user: StoredUser | null): User | null {
  if (!user) return null
  const { password_hash: _passwordHash, created_at: _createdAt, updated_at: _updatedAt, ...safeUser } = user
  return safeUser
}

function stripOwner(item: any) {
  const { owner_id, created_at, updated_at, ...rest } = item
  return rest
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function initials(name: string) {
  return name.split(/\s+/).map(part => part[0]).join('').toUpperCase().slice(0, 2)
}
