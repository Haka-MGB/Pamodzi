import type { NextRequest } from 'next/server'
import { updateUnit, deleteUnit } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const input = await readJson<any>(request)
  if (!input) return fail('Invalid request body.')

  const id = (await params).id
  const updates: any = {}
  
  if (input.unitName !== undefined) updates.unitName = input.unitName
  if (input.unitNumber !== undefined) updates.unitNumber = input.unitNumber
  if (input.floor !== undefined) updates.floor = input.floor
  if (input.bedrooms !== undefined) updates.bedrooms = input.bedrooms
  if (input.bathrooms !== undefined) updates.bathrooms = input.bathrooms
  if (input.squareFeet !== undefined) updates.squareFeet = input.squareFeet
  if (input.rentAmount !== undefined) updates.rentAmount = input.rentAmount
  if (input.status !== undefined) updates.status = input.status
  if (input.tenantId !== undefined) updates.tenantId = input.tenantId
  if (input.notes !== undefined) updates.notes = input.notes

  const unit = await updateUnit(userId, id, updates)
  if (!unit) return fail('Unit not found.', 404)
  return ok(unit)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const id = (await params).id
  const unit = await deleteUnit(userId, id)
  if (!unit) return fail('Unit not found.', 404)
  return ok(unit)
}
