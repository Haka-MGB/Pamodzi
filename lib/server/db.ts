import crypto from 'crypto'
import type { ActivityItem, MaintenanceIssue, Notification, Payment, Property, RevenueDataPoint, Tenant, Unit, User } from '@/types'
import { hashPassword, verifyPassword } from './password'
import { getSupabaseClient } from './supabase'
import type { Database } from '@/types/supabase'
import { logError, logOperation, logDebug } from './logger'

type DbUser = Database['public']['Tables']['users']['Row']
type DbProperty = Database['public']['Tables']['properties']['Row']
type DbTenant = Database['public']['Tables']['tenants']['Row']
type DbPayment = Database['public']['Tables']['payments']['Row']
type DbIssue = Database['public']['Tables']['issues']['Row']
type DbNotification = Database['public']['Tables']['notifications']['Row']
type DbActivity = Database['public']['Tables']['activity']['Row']
type DbRevenue = Database['public']['Tables']['revenue_data']['Row']
type DbUnit = Database['public']['Tables']['units']['Row']

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
    nrc: row.nrc,
    sex: row.sex as Tenant['sex'],
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
    nrc: input.nrc,
    sex: input.sex,
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

function resolveUnitStatus(row: DbUnit): Unit['status'] {
  if (row.tenant_id) return 'occupied'
  return row.status === 'maintenance' ? 'maintenance' : 'vacant'
}

function unitFromDb(row: DbUnit, tenantInfo?: { name?: string; email?: string; phone?: string }): Unit {
  return {
    id: row.id,
    propertyId: row.property_id,
    unitName: row.unit_name,
    unitNumber: row.unit_number ?? undefined,
    rentAmount: row.rent_amount,
    status: resolveUnitStatus(row),
    tenantId: row.tenant_id ?? undefined,
    tenantName: tenantInfo?.name,
    tenantEmail: tenantInfo?.email,
    tenantPhone: tenantInfo?.phone,
    notes: row.notes ?? undefined,
  }
}

function unitToDb(input: Omit<Unit, 'id' | 'tenantName' | 'tenantEmail' | 'tenantPhone'>) {
  const derivedStatus = input.tenantId ? 'occupied' : input.status === 'maintenance' ? 'maintenance' : 'vacant'
  return {
    property_id: input.propertyId,
    unit_name: input.unitName,
    unit_number: input.unitNumber ?? null,
    rent_amount: input.rentAmount,
    status: derivedStatus,
    tenant_id: input.tenantId ?? null,
    notes: input.notes ?? null,
  }
}

async function recalculatePropertySummary(userId: string, propertyId: string) {
  const supabase = await getSupabaseClient()

  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('id, rent_amount, status, tenant_id')
    .eq('owner_id', userId)
    .eq('property_id', propertyId)

  if (unitsError) {
    logError(unitsError, { operation: 'recalculatePropertySummary', userId, propertyId })
    return null
  }

  const propertyUnits = units || []
  const totalUnits = propertyUnits.length
  const occupiedUnits = propertyUnits.filter(unit => unit.tenant_id).length
  const monthlyRevenue = propertyUnits
    .filter(unit => unit.tenant_id)
    .reduce((sum, unit) => sum + Number(unit.rent_amount || 0), 0)

  const { error } = await supabase
    .from('properties')
    .update({
      total_units: totalUnits,
      occupied_units: occupiedUnits,
      monthly_revenue: monthlyRevenue,
      updated_at: new Date().toISOString(),
    })
    .eq('id', propertyId)
    .eq('owner_id', userId)

  if (error) {
    logError(error, { operation: 'recalculatePropertySummary', userId, propertyId, totalUnits, occupiedUnits, monthlyRevenue })
    return null
  }

  return { totalUnits, occupiedUnits, monthlyRevenue }
}

// ─── Public API ─────────────────────────────────────────────────────────

let isInitialized = false

export async function initializeDatabase() {
  if (isInitialized) return
  isInitialized = true

  // Database initialization removed for production security
  // Users must register through the normal registration flow
  const supabase = await getSupabaseClient()
  
  // Verify database connection
  const { error } = await supabase.from('users').select('count', { count: 'exact', head: true })
  
  if (error && error.code !== 'PGRST116') {
    console.error('Database connection error:', error)
  }
}

export async function getUserByEmail(email: string) {
  logOperation('getUserByEmail', 'started', { email })
  
  try {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .limit(1)
      .single()

    if (error) {
      if (error.code !== 'PGRST116') {
        logError(error, { operation: 'getUserByEmail', email })
      }
      logOperation('getUserByEmail', 'failed', { email, errorCode: error.code })
      return null
    }
    
    logOperation('getUserByEmail', 'completed', { email, found: !!data })
    return data ? userFromDb(data) : null
  } catch (err) {
    logError(err, { operation: 'getUserByEmail', email })
    logOperation('getUserByEmail', 'failed', { email })
    return null
  }
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
  logOperation('createAccount', 'started', { email: input.email, name: input.name })
  
  try {
    const supabase = await getSupabaseClient()
    const passwordHash = await hashPassword(input.password)
    const now = new Date().toISOString()
    const userId = id('u')

    const existingUser = await getUserByEmail(input.email)
    if (existingUser) {
      logOperation('createAccount', 'failed', { email: input.email, reason: 'duplicate_email' })
      return { ok: false as const, message: 'An account already exists for this email address.' }
    }

    const userData: Database['public']['Tables']['users']['Insert'] = {
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
    }

    const { data, error } = await supabase.from('users').insert([userData]).select().single()

    if (error || !data) {
      logError(error, { operation: 'createAccount', email: input.email })
      logOperation('createAccount', 'failed', { email: input.email })
      return { ok: false as const, message: 'Failed to create account. Please try again.' }
    }

    logOperation('createAccount', 'completed', { email: input.email, userId })
    return { ok: true as const, user: publicUser(userFromDb(data))! }
  } catch (err) {
    logError(err, { operation: 'createAccount', email: input.email })
    logOperation('createAccount', 'failed', { email: input.email })
    return { ok: false as const, message: 'An unexpected error occurred. Please try again.' }
  }
}

export async function getAppData(userId: string) {
  const supabase = await getSupabaseClient()
  const user = await getUserById(userId)
  if (!user) return null

  const [
    { data: properties },
    { data: units },
    { data: tenants },
    { data: payments },
    { data: issues },
    { data: notifications },
    { data: activity },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('properties').select('*').eq('owner_id', userId),
    supabase.from('units').select('*, tenants!units_tenant_id_fkey(name, email, phone)').eq('owner_id', userId),
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
    units: (units || []).map((row: any) => unitFromDb(row, row.tenants)),
    tenants: (tenants || []).map(tenantFromDb),
    payments: (payments || []).map(paymentFromDb),
    issues: (issues || []).map(issueFromDb),
    notifications: (notifications || []).map(notificationFromDb),
    activity: (activity || []).map(activityFromDb),
    revenueData: (revenueData || []).map(revenueFromDb),
  }
}

export async function hasDuplicateProperty(userId: string, input: Pick<Property, 'name' | 'location' | 'type'>) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('properties')
    .select('id, name, location, type')
    .eq('owner_id', userId)

  if (error || !data) return false

  const normalizedName = input.name.trim().toLowerCase()
  const normalizedLocation = input.location.trim().toLowerCase()
  const normalizedType = input.type.trim().toLowerCase()

  return data.some(row => (
    row.name.trim().toLowerCase() === normalizedName &&
    row.location.trim().toLowerCase() === normalizedLocation &&
    row.type.trim().toLowerCase() === normalizedType
  ))
}

export async function addProperty(userId: string, input: Omit<Property, 'id'>) {
  logOperation('addProperty', 'started', { userId, propertyName: input.name })
  
  try {
    const duplicate = await hasDuplicateProperty(userId, input)
    if (duplicate) {
      logOperation('addProperty', 'failed', { userId, propertyName: input.name, reason: 'duplicate_property' })
      return null
    }

    const supabase = await getSupabaseClient()
    const now = new Date().toISOString()
    const propertyId = id('p')

    const propertyData: Database['public']['Tables']['properties']['Insert'] = {
      id: propertyId,
      owner_id: userId,
      name: input.name,
      location: input.location,
      type: input.type,
      total_units: input.totalUnits,
      occupied_units: input.occupiedUnits,
      monthly_revenue: input.monthlyRevenue,
      created_at: now,
      updated_at: now,
    }

    logDebug('Inserting property', { userId, propertyData })

    // Try alternative insert method with explicit field list
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        id: propertyId,
        owner_id: userId,
        name: input.name,
        location: input.location,
        type: input.type,
        total_units: input.totalUnits,
        occupied_units: input.occupiedUnits,
        monthly_revenue: input.monthlyRevenue,
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single()

    if (error) {
      logError(error, { 
        operation: 'addProperty', 
        userId, 
        input,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint 
      })
      logOperation('addProperty', 'failed', { userId, propertyName: input.name, reason: error.message })
      return null
    }

    if (!data) {
      logError(new Error('No data returned from insert'), { operation: 'addProperty', userId, input })
      logOperation('addProperty', 'failed', { userId, propertyName: input.name, reason: 'no_data_returned' })
      return null
    }
    
    logOperation('addProperty', 'completed', { userId, propertyId, propertyName: input.name })
    return propertyFromDb(data)
  } catch (err) {
    logError(err, { operation: 'addProperty', userId, input })
    logOperation('addProperty', 'failed', { userId, propertyName: input.name })
    return null
  }
}

function normalizeTenantKey(value: string | undefined) {
  return value ? value.trim().toLowerCase() : ''
}

function normalizeNrc(value: string | undefined) {
  return value ? value.trim().toUpperCase() : ''
}

async function findTenantConflict(userId: string, input: { email?: string; phone?: string; nrc?: string; ignoreId?: string }) {
  // Rare exceptions are allowed: one tenant may rent more than one unit, and a unit may
  // host multiple tenants. The original strict uniqueness guard created false conflicts
  // for legitimate multi-unit leases, so we intentionally disable this in-app check.
  return null
}

export async function addTenant(userId: string, input: Omit<Tenant, 'id'>) {
  logOperation('addTenant', 'started', { userId, tenantName: input.name })
  
  try {
    const supabase = await getSupabaseClient()
    const now = new Date().toISOString()
    const tenantId = id('t')

    const conflict = await findTenantConflict(userId, { email: input.email, phone: input.phone, nrc: input.nrc })
    if (conflict) {
      logOperation('addTenant', 'failed', { userId, tenantName: input.name, reason: `duplicate_${conflict}` })
      return null
    }

    const tenantData: Database['public']['Tables']['tenants']['Insert'] = {
      id: tenantId,
      owner_id: userId,
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
      nrc: input.nrc,
      sex: input.sex,
      created_at: now,
      updated_at: now,
    }

    logDebug('Inserting tenant', { userId, tenantData })

    // WORKAROUND: Use explicit column list in insert to force owner_id
    const { data, error } = await supabase
      .from('tenants')
      .insert([{
        id: tenantId,
        owner_id: userId,
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
        nrc: input.nrc,
        sex: input.sex,
        created_at: now,
        updated_at: now,
      }])
      .select()
      .single()
    
    if (error) {
      logError(error, { 
        operation: 'addTenant', 
        userId, 
        input,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint 
      })
      logOperation('addTenant', 'failed', { userId, tenantName: input.name, reason: error.message })
      return null
    }

    if (!data) {
      logError(new Error('No data returned from insert'), { operation: 'addTenant', userId, input })
      logOperation('addTenant', 'failed', { userId, tenantName: input.name, reason: 'no_data_returned' })
      return null
    }
    
    const { data: unitsData } = await supabase
      .from('units')
      .select('id')
      .eq('owner_id', userId)
      .eq('property_id', input.propertyId)
      .eq('unit_name', input.unit)
      .single()
    
    if (unitsData?.id) {
      const { error: unitError } = await supabase
        .from('units')
        .update({ 
          status: 'occupied',
          tenant_id: tenantId,
          updated_at: now
        })
        .eq('id', unitsData.id)
      
      if (unitError) {
        console.error('[WARN] Failed to update unit status:', unitError)
      }
    }
    
    logOperation('addTenant', 'completed', { userId, tenantId, tenantName: input.name })
    return tenantFromDb(data)
  } catch (err) {
    logError(err, { operation: 'addTenant', userId, input })
    logOperation('addTenant', 'failed', { userId, tenantName: input.name })
    return null
  }
}

export async function hasDuplicatePayment(userId: string, input: Pick<Payment, 'tenantId' | 'ref' | 'amount' | 'date' | 'period' | 'method'>) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('payments')
    .select('id, tenant_id, ref, amount, date, period, method')
    .eq('owner_id', userId)

  if (error || !data) return false

  const normalizedRef = input.ref.trim().toLowerCase()
  const normalizedMethod = input.method.trim().toLowerCase()
  const normalizedDate = input.date.trim()
  const normalizedPeriod = input.period.trim().toLowerCase()

  return data.some(row => (
    row.tenant_id === input.tenantId &&
    row.ref.trim().toLowerCase() === normalizedRef &&
    Number(row.amount) === Number(input.amount) &&
    row.date.trim() === normalizedDate &&
    row.period.trim().toLowerCase() === normalizedPeriod &&
    row.method.trim().toLowerCase() === normalizedMethod
  ))
}

export async function addPayment(userId: string, input: Omit<Payment, 'id'>) {
  logOperation('addPayment', 'started', { userId, tenantId: input.tenantId })
  
  try {
    const duplicate = await hasDuplicatePayment(userId, input)
    if (duplicate) {
      logOperation('addPayment', 'failed', { userId, tenantId: input.tenantId, reason: 'duplicate_payment' })
      return null
    }

    const supabase = await getSupabaseClient()
    const now = new Date().toISOString()
    const paymentId = id('pay')

    // ✅ FIXED: added `period: input.period` to satisfy NOT NULL constraint
    const paymentData: Database['public']['Tables']['payments']['Insert'] = {
      id: paymentId,
      owner_id: userId,
      tenant_id: input.tenantId,
      tenant: input.tenant,
      unit: input.unit,
      amount: input.amount,
      method: input.method,
      ref: input.ref,
      status: input.status,
      date: input.date,
      period: input.period,   // <-- THIS WAS MISSING
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single()

    if (error) {
      logError(error, { operation: 'addPayment', userId, input })
      logOperation('addPayment', 'failed', { userId, tenantId: input.tenantId, reason: error.message })
      return null
    }

    if (!data) {
      logError(new Error('No data returned from insert'), { operation: 'addPayment', userId, input })
      logOperation('addPayment', 'failed', { userId, tenantId: input.tenantId, reason: 'no_data_returned' })
      return null
    }
    
    logOperation('addPayment', 'completed', { userId, paymentId, tenantId: input.tenantId })
    return paymentFromDb(data)
  } catch (err) {
    logError(err, { operation: 'addPayment', userId, input })
    logOperation('addPayment', 'failed', { userId, tenantId: input.tenantId })
    return null
  }
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

export async function hasDuplicateIssue(userId: string, input: Pick<MaintenanceIssue, 'tenantId' | 'unit' | 'title' | 'description' | 'category' | 'date'>) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('issues')
    .select('id, tenant_id, unit, title, description, category, date')
    .eq('owner_id', userId)

  if (error || !data) return false

  const normalizedTenantId = input.tenantId.trim().toLowerCase()
  const normalizedUnit = input.unit.trim().toLowerCase()
  const normalizedTitle = input.title.trim().toLowerCase()
  const normalizedDescription = input.description.trim().toLowerCase()
  const normalizedCategory = input.category.trim().toLowerCase()
  const normalizedDate = input.date.trim()

  return data.some(row => (
    row.tenant_id.trim().toLowerCase() === normalizedTenantId &&
    row.unit.trim().toLowerCase() === normalizedUnit &&
    row.title.trim().toLowerCase() === normalizedTitle &&
    row.description.trim().toLowerCase() === normalizedDescription &&
    row.category.trim().toLowerCase() === normalizedCategory &&
    row.date.trim() === normalizedDate
  ))
}

export async function addIssue(userId: string, input: Omit<MaintenanceIssue, 'id'>) {
  logOperation('addIssue', 'started', { userId, title: input.title })
  
  try {
    const duplicate = await hasDuplicateIssue(userId, input)
    if (duplicate) {
      logOperation('addIssue', 'failed', { userId, title: input.title, reason: 'duplicate_issue' })
      return null
    }

    const supabase = await getSupabaseClient()
    const now = new Date().toISOString()
    const issueId = id('i')

    const issueData: Database['public']['Tables']['issues']['Insert'] = {
      id: issueId,
      owner_id: userId,
      tenant: input.tenant,
      tenant_id: input.tenantId,
      unit: input.unit,
      title: input.title,
      description: input.description,
      category: input.category,
      status: input.status,
      priority: input.priority,
      date: input.date,
      assignee: input.assignee ?? null,
      icon: input.icon,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from('issues')
      .insert([issueData])
      .select()
      .single()

    if (error) {
      logError(error, { operation: 'addIssue', userId, input })
      logOperation('addIssue', 'failed', { userId, title: input.title, reason: error.message })
      return null
    }

    if (!data) {
      logError(new Error('No data returned from insert'), { operation: 'addIssue', userId, input })
      logOperation('addIssue', 'failed', { userId, title: input.title, reason: 'no_data_returned' })
      return null
    }
    
    logOperation('addIssue', 'completed', { userId, issueId, title: input.title })
    return issueFromDb(data)
  } catch (err) {
    logError(err, { operation: 'addIssue', userId, input })
    logOperation('addIssue', 'failed', { userId, title: input.title })
    return null
  }
}

export async function getIssueById(userId: string, issueId: string) {
  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', issueId)
    .eq('owner_id', userId)
    .limit(1)
    .single()

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching issue by ID:', error)
    }
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

  const candidateEmail = updates.email ?? undefined
  const candidatePhone = updates.phone ?? undefined
  const candidateNrc = updates.nrc ?? undefined

  const conflict = await findTenantConflict(userId, {
    email: candidateEmail,
    phone: candidatePhone,
    nrc: candidateNrc,
    ignoreId: tenantId,
  })

  if (conflict) {
    return null
  }

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
  if (updates.nrc !== undefined) dbUpdates.nrc = updates.nrc
  if (updates.sex !== undefined) dbUpdates.sex = updates.sex

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
  logOperation('deleteTenant', 'started', { userId, tenantId })
  
  try {
    const supabase = await getSupabaseClient()
    const now = new Date().toISOString()

    // Get tenant data before deleting to find associated unit
    const { data: tenantData } = await supabase
      .from('tenants')
      .select('property_id, unit')
      .eq('id', tenantId)
      .eq('owner_id', userId)
      .single()

    const { data, error } = await supabase
      .from('tenants')
      .delete()
      .eq('id', tenantId)
      .eq('owner_id', userId)
      .select()
      .single()

    if (error || !data) {
      logError(error, { operation: 'deleteTenant', userId, tenantId })
      logOperation('deleteTenant', 'failed', { userId, tenantId })
      return null
    }
    
    if (tenantData?.property_id && tenantData?.unit) {
      const { data: unitsData } = await supabase
        .from('units')
        .select('id, status')
        .eq('owner_id', userId)
        .eq('property_id', tenantData.property_id)
        .eq('unit_name', tenantData.unit)
        .single()
      
      if (unitsData?.id) {
        const nextStatus = unitsData.status === 'maintenance' ? 'maintenance' : 'vacant'
        const { error: unitError } = await supabase
          .from('units')
          .update({ 
            status: nextStatus,
            tenant_id: null,
            updated_at: now
          })
          .eq('id', unitsData.id)
        
        if (unitError) {
          console.error('[WARN] Failed to reset unit status:', unitError)
        }
      }
    }
    
    logOperation('deleteTenant', 'completed', { userId, tenantId })
    return tenantFromDb(data)
  } catch (err) {
    logError(err, { operation: 'deleteTenant', userId, tenantId })
    logOperation('deleteTenant', 'failed', { userId, tenantId })
    return null
  }
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

// ─── Units CRUD ─────────────────────────────────────────────────────────

export async function getUnitsByProperty(userId: string, propertyId: string) {
  logOperation('getUnitsByProperty', 'started', { userId, propertyId })
  
  try {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from('units')
      .select('*, tenants!units_tenant_id_fkey(name, email, phone)')
      .eq('owner_id', userId)
      .eq('property_id', propertyId)
      .order('unit_name')

    if (error) {
      logError(error, { operation: 'getUnitsByProperty', userId, propertyId })
      logOperation('getUnitsByProperty', 'failed', { userId, propertyId })
      return []
    }

    logOperation('getUnitsByProperty', 'completed', { userId, propertyId, count: data?.length })
    return (data || []).map((row: any) => unitFromDb(row, row.tenants))
  } catch (err) {
    logError(err, { operation: 'getUnitsByProperty', userId, propertyId })
    return []
  }
}

export async function addUnit(userId: string, input: Omit<Unit, 'id' | 'tenantName' | 'tenantEmail' | 'tenantPhone'>) {
  logOperation('addUnit', 'started', { userId, unitName: input.unitName })

  try {
    const derivedStatus = input.tenantId ? 'occupied' : input.status === 'maintenance' ? 'maintenance' : 'vacant'
    if (derivedStatus === 'occupied' && !input.tenantId) {
      throw new Error('Occupied units must have a tenant assigned.')
    }

    const supabase = await getSupabaseClient()
    const now = new Date().toISOString()
    const unitId = id('unit')

    const unitData: Database['public']['Tables']['units']['Insert'] = {
      id: unitId,
      owner_id: userId,
      property_id: input.propertyId,
      unit_name: input.unitName,
      unit_number: input.unitNumber || null,
      rent_amount: input.rentAmount,
      status: derivedStatus,
      tenant_id: input.tenantId || null,
      notes: input.notes || null,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from('units')
      .insert([unitData])
      .select()
      .single()

    if (error) {
      logError(error, { operation: 'addUnit', userId, input })
      logOperation('addUnit', 'failed', { userId, unitName: input.unitName, reason: error.message })
      return null
    }

    if (!data) {
      logError(new Error('No data returned from insert'), { operation: 'addUnit', userId, input })
      logOperation('addUnit', 'failed', { userId, unitName: input.unitName, reason: 'no_data_returned' })
      return null
    }

    await recalculatePropertySummary(userId, input.propertyId)
    logOperation('addUnit', 'completed', { userId, unitId, unitName: input.unitName })
    return unitFromDb(data)
  } catch (err) {
    logError(err, { operation: 'addUnit', userId, input })
    logOperation('addUnit', 'failed', { userId, unitName: input.unitName })
    return null
  }
}

export async function updateUnit(userId: string, unitId: string, updates: Partial<Unit>) {
  logOperation('updateUnit', 'started', { userId, unitId })

  try {
    const supabase = await getSupabaseClient()
    const existingResult = await supabase
      .from('units')
      .select('property_id, status, tenant_id')
      .eq('id', unitId)
      .eq('owner_id', userId)
      .single()

    if (existingResult.error || !existingResult.data) {
      logError(existingResult.error, { operation: 'updateUnit', userId, unitId, updates })
      logOperation('updateUnit', 'failed', { userId, unitId, reason: 'unit_not_found' })
      return null
    }

    const nextTenantId = updates.tenantId !== undefined ? updates.tenantId ?? null : existingResult.data.tenant_id ?? null
    const requestedStatus = updates.status ?? existingResult.data.status
    const derivedStatus = nextTenantId ? 'occupied' : requestedStatus === 'maintenance' ? 'maintenance' : 'vacant'

    if (derivedStatus === 'occupied' && !nextTenantId) {
      throw new Error('Occupied units must have a tenant assigned.')
    }

    const now = new Date().toISOString()
    const dbUpdates: any = { updated_at: now }
    if (updates.unitName !== undefined) dbUpdates.unit_name = updates.unitName
    if (updates.unitNumber !== undefined) dbUpdates.unit_number = updates.unitNumber ?? null
    if (updates.rentAmount !== undefined) dbUpdates.rent_amount = updates.rentAmount
    dbUpdates.status = derivedStatus
    dbUpdates.tenant_id = nextTenantId
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null

    const { data, error } = await supabase
      .from('units')
      .update(dbUpdates)
      .eq('id', unitId)
      .eq('owner_id', userId)
      .select()
      .single()

    if (error || !data) {
      logError(error, { operation: 'updateUnit', userId, unitId, updates })
      logOperation('updateUnit', 'failed', { userId, unitId })
      return null
    }

    await recalculatePropertySummary(userId, existingResult.data.property_id)
    logOperation('updateUnit', 'completed', { userId, unitId })
    return unitFromDb(data)
  } catch (err) {
    logError(err, { operation: 'updateUnit', userId, unitId })
    return null
  }
}

export async function deleteUnit(userId: string, unitId: string) {
  logOperation('deleteUnit', 'started', { userId, unitId })

  try {
    const supabase = await getSupabaseClient()

    const { data, error } = await supabase
      .from('units')
      .delete()
      .eq('id', unitId)
      .eq('owner_id', userId)
      .select('id, property_id, unit_name, unit_number, rent_amount, status, tenant_id, notes')
      .single()

    if (error || !data) {
      logError(error, { operation: 'deleteUnit', userId, unitId })
      logOperation('deleteUnit', 'failed', { userId, unitId })
      return null
    }

    await recalculatePropertySummary(userId, data.property_id)
    logOperation('deleteUnit', 'completed', { userId, unitId })
    return unitFromDb(data as any)
  } catch (err) {
    logError(err, { operation: 'deleteUnit', userId, unitId })
    return null
  }
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