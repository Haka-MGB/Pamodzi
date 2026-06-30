import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import type { ActivityItem, MaintenanceIssue, Notification, Payment, Property, RevenueDataPoint, Tenant, User } from '@/types'
import { getDataFilePath } from './config'
import { hashPassword, verifyPassword } from './password'

interface StoredUser extends User {
  passwordHash: string
  createdAt: string
  updatedAt: string
}

type Owned<T> = T & { ownerId: string; createdAt: string; updatedAt: string }

interface AppDb {
  version: 1
  users: StoredUser[]
  properties: Owned<Property>[]
  tenants: Owned<Tenant>[]
  payments: Owned<Payment>[]
  issues: Owned<MaintenanceIssue>[]
  notifications: Owned<Notification>[]
  activity: Owned<ActivityItem>[]
  revenueData: Owned<RevenueDataPoint & { id: string }>[]
}

let writeQueue = Promise.resolve()

export async function getUserByEmail(email: string) {
  const db = await readDb()
  return db.users.find(user => user.email.toLowerCase() === email.toLowerCase()) ?? null
}

export async function getUserById(userId: string) {
  const db = await readDb()
  return publicUser(db.users.find(user => user.id === userId) ?? null)
}

export async function authenticate(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) return null
  const verified = await verifyPassword(password, user.passwordHash)
  return verified ? publicUser(user) : null
}

export async function createAccount(input: { name: string; company: string; phone: string; email: string; password: string }) {
  const passwordHash = await hashPassword(input.password)
  const now = new Date().toISOString()
  const userId = id('u')

  return updateDb(async db => {
    if (db.users.some(user => user.email.toLowerCase() === input.email.toLowerCase())) {
      return { ok: false as const, message: 'An account already exists for this email address.' }
    }

    const user: StoredUser = {
      id: userId,
      name: input.name,
      email: input.email,
      role: 'Landlord',
      location: 'Zambia',
      phone: input.phone,
      company: input.company,
      initials: initials(input.name),
      passwordHash,
      createdAt: now,
      updatedAt: now,
    }

    db.users.push(user)
    // Do not seed demo data for new accounts. Start with an empty workspace.
    return { ok: true as const, user: publicUser(user)! }
  })
}

export async function getAppData(userId: string) {
  const db = await readDb()
  const user = publicUser(db.users.find(item => item.id === userId) ?? null)
  if (!user) return null

  return {
    user,
    properties: stripOwner(db.properties.filter(item => item.ownerId === userId)),
    tenants: stripOwner(db.tenants.filter(item => item.ownerId === userId)),
    payments: stripOwner(db.payments.filter(item => item.ownerId === userId)),
    issues: stripOwner(db.issues.filter(item => item.ownerId === userId)),
    notifications: stripOwner(db.notifications.filter(item => item.ownerId === userId)),
    activity: stripOwner(db.activity.filter(item => item.ownerId === userId)),
    revenueData: stripOwner(db.revenueData.filter(item => item.ownerId === userId)).map(({ id: _id, ...point }) => point),
  }
}

export async function addProperty(userId: string, input: Omit<Property, 'id'>) {
  return updateDb(db => {
    const item = own({ id: id('p'), ...input }, userId)
    try { console.info(`addProperty owner=${userId} id=${item.id}`) } catch {}
    db.properties.unshift(item)
    return stripOne(item)
  })
}

export async function addTenant(userId: string, input: Omit<Tenant, 'id'>) {
  return updateDb(db => {
    const item = own({ id: id('t'), ...input }, userId)
    db.tenants.unshift(item)
    return stripOne(item)
  })
}

export async function addPayment(userId: string, input: Omit<Payment, 'id'>) {
  return updateDb(db => {
    const item = own({ id: id('pay'), ...input }, userId)
    db.payments.unshift(item)
    return stripOne(item)
  })
}

export async function confirmPayment(userId: string, paymentId: string) {
  return updateDb(db => {
    const payment = db.payments.find(item => item.ownerId === userId && item.id === paymentId)
    if (!payment) return null
    payment.status = 'paid'
    payment.date = 'Today'
    payment.updatedAt = new Date().toISOString()
    return stripOne(payment)
  })
}

export async function updateProperty(userId: string, propertyId: string, updates: Partial<Property>) {
  return updateDb(db => {
    try { console.info(`updateProperty requested owner=${userId} id=${propertyId}`) } catch {}
    const prop = db.properties.find(item => item.ownerId === userId && item.id === propertyId)
    try { console.info('existing property ids=', db.properties.map(p=>p.id).join(',')) } catch {}
    if (!prop) return null
    Object.assign(prop, updates, { updatedAt: new Date().toISOString() })
    return stripOne(prop)
  })
}

export async function deleteProperty(userId: string, propertyId: string) {
  return updateDb(db => {
    try { console.info(`deleteProperty requested owner=${userId} id=${propertyId}`) } catch {}
    const idx = db.properties.findIndex(item => item.ownerId === userId && item.id === propertyId)
    if (idx === -1) return null
    const [removed] = db.properties.splice(idx, 1)
    return stripOne(removed)
  })
}

export async function addIssue(userId: string, input: Omit<MaintenanceIssue, 'id'>) {
  return updateDb(db => {
    const item = own({ id: id('i'), ...input }, userId)
    db.issues.unshift(item)
    return stripOne(item)
  })
}

export async function updateIssue(userId: string, issueId: string, updates: Partial<MaintenanceIssue>) {
  return updateDb(db => {
    const issue = db.issues.find(item => item.ownerId === userId && item.id === issueId)
    if (!issue) return null
    Object.assign(issue, updates, { updatedAt: new Date().toISOString() })
    return stripOne(issue)
  })
}

export async function updateTenant(userId: string, tenantId: string, updates: Partial<Tenant>) {
  return updateDb(db => {
    const tenant = db.tenants.find(item => item.ownerId === userId && item.id === tenantId)
    if (!tenant) return null
    Object.assign(tenant, updates, { updatedAt: new Date().toISOString() })
    return stripOne(tenant)
  })
}

export async function deleteTenant(userId: string, tenantId: string) {
  return updateDb(db => {
    const idx = db.tenants.findIndex(item => item.ownerId === userId && item.id === tenantId)
    if (idx === -1) return null
    const [removed] = db.tenants.splice(idx, 1)
    return stripOne(removed)
  })
}

export async function deletePayment(userId: string, paymentId: string) {
  return updateDb(db => {
    const idx = db.payments.findIndex(item => item.ownerId === userId && item.id === paymentId)
    if (idx === -1) return null
    const [removed] = db.payments.splice(idx, 1)
    return stripOne(removed)
  })
}

export async function verifyUserPassword(userId: string, password: string) {
  const db = await readDb()
  const user = db.users.find(u => u.id === userId)
  if (!user) return false
  return verifyPassword(password, user.passwordHash)
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return updateDb(db => {
    const notification = db.notifications.find(item => item.ownerId === userId && item.id === notificationId)
    if (!notification) return null
    notification.read = true
    notification.updatedAt = new Date().toISOString()
    return stripOne(notification)
  })
}

export async function markAllNotificationsRead(userId: string) {
  return updateDb(db => {
    const now = new Date().toISOString()
    db.notifications.forEach(notification => {
      if (notification.ownerId === userId) {
        notification.read = true
        notification.updatedAt = now
      }
    })
    return stripOwner(db.notifications.filter(item => item.ownerId === userId))
  })
}

async function readDb(): Promise<AppDb> {
  const filePath = getDataFilePath()
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as AppDb
  } catch (error) {
    // If file not found, create initial DB
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      const db = await createInitialDb()
      await writeDb(db)
      return db
    }

    // If file exists but is invalid/corrupt, attempt to recover from latest backup
    try {
      const dir = path.dirname(filePath)
      const base = path.basename(filePath)
      const files = await fs.readdir(dir)
      const backups = files
        .filter(f => f.startsWith(base + '.bak.'))
        .map(f => ({ f, m: 0 }))

      if (backups.length) {
        // pick the most recent backup by timestamp suffix
        backups.sort((a, b) => (a.f < b.f ? 1 : -1))
        const latest = backups[0].f
        const backupPath = path.join(dir, latest)
        const data = await fs.readFile(backupPath, 'utf8')
        const db = JSON.parse(data) as AppDb
        // restore backup to primary path
        await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf8')
        return db
      }
    } catch (recoveryErr) {
      // fall through to throwing original error
      // eslint-disable-next-line no-console
      console.error('Failed to recover DB from backup:', recoveryErr)
    }

    throw error
  }
}

async function updateDb<T>(mutate: (db: AppDb) => T | Promise<T>) {
  const run = writeQueue.then(async () => {
    const db = await readDb()
    const result = await mutate(db)
    await writeDb(db)
    return result
  })

  writeQueue = run.then(() => undefined, () => undefined)
  return run
}

async function writeDb(db: AppDb) {
  const filePath = getDataFilePath()
  const dir = path.dirname(filePath)
  await fs.mkdir(dir, { recursive: true })

  const data = JSON.stringify(db, null, 2)
  const tmpPath = filePath + '.tmp'

  // If an existing file exists, rotate it to a timestamped backup before writing
  try {
    const stat = await fs.stat(filePath).catch(() => null)
    if (stat) {
      const bakName = `${path.basename(filePath)}.bak.${Date.now()}`
      const bakPath = path.join(dir, bakName)
      await fs.copyFile(filePath, bakPath)

      // keep only the last 5 backups
      const files = await fs.readdir(dir)
      const backups = files.filter(f => f.startsWith(path.basename(filePath) + '.bak.'))
      if (backups.length > 5) {
        backups.sort()
        const toRemove = backups.slice(0, backups.length - 5)
        await Promise.all(toRemove.map(f => fs.unlink(path.join(dir, f)).catch(() => undefined)))
      }
    }
  } catch (err) {
    // best-effort: do not fail writes because backup rotation failed
    // eslint-disable-next-line no-console
    console.error('DB backup rotation failed', err)
  }

  // atomic write: write to tmp file then rename
  await fs.writeFile(tmpPath, data, 'utf8')
  await fs.rename(tmpPath, filePath)
}

async function createInitialDb(): Promise<AppDb> {
  const now = new Date().toISOString()
  const passwordHash = await hashPassword('password123')
  const userId = id('u')

  const db: AppDb = {
    version: 1,
    users: [
      {
        id: userId,
        name: 'Test User',
        email: 'testuser@example.com',
        role: 'Landlord',
        location: 'Zambia',
        phone: '+260000000000',
        company: 'Pamodzi',
        initials: initials('Test User'),
        passwordHash,
        createdAt: now,
        updatedAt: now,
      },
    ],
    properties: [],
    tenants: [],
    payments: [],
    issues: [],
    notifications: [],
    activity: [],
    revenueData: [],
  }

  return db
}

function own<T extends { id: string }>(item: T, ownerId: string): Owned<T> {
  const now = new Date().toISOString()
  return { ...item, ownerId, createdAt: now, updatedAt: now }
}

function publicUser(user: StoredUser | null): User | null {
  if (!user) return null
  const { passwordHash: _passwordHash, createdAt: _createdAt, updatedAt: _updatedAt, ...safeUser } = user
  return safeUser
}

function stripOwner<T>(items: Owned<T>[]) {
  return items.map(stripOne)
}

function stripOne<T>(item: Owned<T>): T {
  const { ownerId: _ownerId, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = item
  return rest as T
}

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

function initials(name: string) {
  return name.split(/\s+/).map(part => part[0]).join('').toUpperCase().slice(0, 2)
}
