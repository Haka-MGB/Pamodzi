import type { NextRequest } from 'next/server'
import { markNotificationRead } from '@/lib/server/db'
import { fail, ok, requireSameOrigin, requireUserId } from '@/lib/server/http'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const id = (await params).id
  const notification = await markNotificationRead(userId, id)
  if (!notification) return fail('Notification not found.', 404)
  return ok(notification)
}

