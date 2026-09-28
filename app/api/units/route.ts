import type { NextRequest } from 'next/server'
import { addUnit, getUnitsByProperty, hasDuplicateUnit } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'
import { parseUnit } from '@/lib/server/validation'

export async function GET(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const { searchParams } = new URL(request.url)
  const propertyId = searchParams.get('propertyId')
  
  if (!propertyId) return fail('Property ID is required.', 400)

  const units = await getUnitsByProperty(userId, propertyId)
  return ok(units)
}

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const input = parseUnit(await readJson<Record<string, unknown>>(request))
  if (!input) return fail('Check the unit details.')

  const duplicate = await hasDuplicateUnit(userId, input.propertyId, input.unitName)
  if (duplicate) return fail('Duplicate unit name detected in this property.', 409)

  const unit = await addUnit(userId, input)

  if (!unit) {
    const stillDuplicate = await hasDuplicateUnit(userId, input.propertyId, input.unitName)
    if (stillDuplicate) return fail('Duplicate unit name detected in this property.', 409)
    return fail('Unable to create unit.', 500)
  }
  return ok(unit, { status: 201 })
}
