import crypto from 'crypto'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, SESSION_TTL_SECONDS, getSessionSecret } from './config'

interface SessionPayload {
  userId: string
  exp: number
}

export function createSessionToken(userId: string) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = sign(body)
  return `${body}.${signature}`
}

export function readSessionToken(token: string | undefined) {
  if (!token) return null

  const [body, signature] = token.split('.')
  if (!body || !signature || !safeEqual(signature, sign(body))) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload
    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export async function getCurrentSession() {
  const c = await cookies()
  return readSessionToken(c.get(SESSION_COOKIE)?.value)
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }
}

function sign(value: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer)
}

