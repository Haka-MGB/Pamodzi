import type { NextRequest } from 'next/server'
import { addPayment } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'
import { parsePayment } from '@/lib/server/validation'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const input = parsePayment(await readJson(request))
  if (!input) return fail('Check the payment details.')
  return ok(await addPayment(userId, input), { status: 201 })
}

