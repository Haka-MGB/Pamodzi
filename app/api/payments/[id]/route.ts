import type { NextRequest } from 'next/server'
import { deletePayment, verifyUserPassword } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)
  const id = (await params).id
  const body = await readJson<{ password?: string }>(request)
  if (!body || !body.password) return fail('Password required to delete.', 400)

  const passwordValid = await verifyUserPassword(userId, body.password)
  if (!passwordValid) return fail('Invalid password.', 401)

  const removed = await deletePayment(userId, id)
  if (!removed) return fail('Payment not found.', 404)
  return ok(removed)
}
