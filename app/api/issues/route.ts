import type { NextRequest } from 'next/server'
import { addIssue } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'
import { parseIssue } from '@/lib/server/validation'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const input = parseIssue(await readJson(request))
  if (!input) return fail('Check the issue details.')
  return ok(await addIssue(userId, input), { status: 201 })
}

