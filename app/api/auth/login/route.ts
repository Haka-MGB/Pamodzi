import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { authenticate } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin } from '@/lib/server/http'
import { rateLimit } from '@/lib/server/rate-limit'
import { SESSION_COOKIE } from '@/lib/server/config'
import { createSessionToken, getSessionCookieOptions } from '@/lib/server/session'
import { parseLoginInput } from '@/lib/server/validation'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const key = `login:${request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'local'}`
  if (!rateLimit(key, 8, 60_000)) return fail('Too many login attempts. Try again shortly.', 429)

  const input = parseLoginInput(await readJson(request))
  if (!input) return fail('Enter a valid email and password.')

  const user = await authenticate(input.email, input.password)
  if (!user) return fail('Invalid email or password.', 401)

  const token = createSessionToken(user.id)
  ;(await cookies()).set(SESSION_COOKIE, token, getSessionCookieOptions())
  // Expose the token in non-production for local automated testing only.
  if (process.env.NODE_ENV !== 'production') return ok({ user, sessionToken: token })
  return ok({ user })
}
