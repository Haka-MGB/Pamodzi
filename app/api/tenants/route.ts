import type { NextRequest } from 'next/server'
import { addTenant } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'
import { parseTenant } from '@/lib/server/validation'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const input = parseTenant(await readJson(request))
  if (!input) return fail('Check the tenant details.')
  return ok(await addTenant(userId, input), { status: 201 })
}

