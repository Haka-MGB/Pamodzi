import type { NextRequest } from 'next/server'
import { markAllNotificationsRead } from '@/lib/server/db'
import { fail, ok, requireSameOrigin, requireUserId } from '@/lib/server/http'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  return ok(await markAllNotificationsRead(userId))
}

