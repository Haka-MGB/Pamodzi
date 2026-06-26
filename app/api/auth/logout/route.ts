import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/server/config'
import { fail, ok as jsonOk, requireSameOrigin } from '@/lib/server/http'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return jsonOk({ success: true })
}
