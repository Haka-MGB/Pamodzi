import type { NextRequest } from 'next/server'
import { addTenant, findTenantConflict, propertyExists } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'
import { parseTenant } from '@/lib/server/validation'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()

  if (!userId) return fail('Authentication required.', 401)

  const input = parseTenant(await readJson(request))
  if (!input) return fail('Check the tenant details.')

  // Validate propertyId exists
  const validProperty = await propertyExists(userId, input.propertyId)
  if (!validProperty) return fail('Property not found.', 404)

  const conflict = await findTenantConflict(userId, { email: input.email, phone: input.phone, nrc: input.nrc })
  if (conflict) return fail(`Duplicate tenant ${conflict} detected.`, 409)

  const tenant = await addTenant(userId, input)
  if (!tenant) {
    const stillConflict = await findTenantConflict(userId, { email: input.email, phone: input.phone, nrc: input.nrc })
    if (stillConflict) return fail(`Duplicate tenant ${stillConflict} detected.`, 409)
    return fail('Unable to save tenant.', 500)
  }
  return ok(tenant, { status: 201 })
}
