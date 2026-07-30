import type { NextRequest } from 'next/server'
import { addUnit, getUnitsByProperty } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'

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

  const input = await readJson<any>(request)
  if (!input || !input.propertyId || !input.unitName) {
    return fail('Property ID and unit name are required.')
  }

  const unit = await addUnit(userId, {
    propertyId: input.propertyId,
    unitName: input.unitName,
    unitNumber: input.unitNumber,
    floor: input.floor,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    squareFeet: input.squareFeet,
    rentAmount: input.rentAmount || 0,
    status: input.status || 'vacant',
    tenantId: input.tenantId,
    notes: input.notes,
  })

  if (!unit) return fail('Unable to create unit.', 500)
  return ok(unit, { status: 201 })
}
