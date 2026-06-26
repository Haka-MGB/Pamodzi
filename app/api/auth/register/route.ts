import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { createAccount } from '@/lib/server/db'
import { fail, ok as jsonOk, readJson, requireSameOrigin } from '@/lib/server/http'
import { rateLimit } from '@/lib/server/rate-limit'
import { SESSION_COOKIE } from '@/lib/server/config'
import { createSessionToken, getSessionCookieOptions } from '@/lib/server/session'
import { parseRegisterInput } from '@/lib/server/validation'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const key = `register:${request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'local'}`
  if (!rateLimit(key, 4, 60_000)) return fail('Too many account attempts. Try again shortly.', 429)

  const input = parseRegisterInput(await readJson(request))
  if (!input) return fail('Check your account details. Passwords must be at least 8 characters.')

  const result = await createAccount(input)
  if (!result.ok || !result.user) return fail(result.message, 409)
  const user = result.user

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), getSessionCookieOptions())
  return jsonOk({ user }, { status: 201 })
}
