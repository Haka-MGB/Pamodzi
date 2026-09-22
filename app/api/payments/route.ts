import type { NextRequest } from 'next/server'
import { addPayment, hasDuplicatePayment } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'
import { parsePayment } from '@/lib/server/validation'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const input = parsePayment(await readJson(request))
  if (!input) return fail('Check the payment details.')

  const duplicate = await hasDuplicatePayment(userId, input)
  if (duplicate) return fail('Duplicate payment detected. Each payment must be unique.', 409)

  const payment = await addPayment(userId, input)
  if (!payment) return fail('Unable to save payment.', 500)
  return ok(payment, { status: 201 })
}
