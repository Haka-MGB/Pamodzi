import type { NextRequest } from 'next/server'
import { addIssue, hasDuplicateIssue } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'
import { parseIssue } from '@/lib/server/validation'

export async function POST(request: NextRequest) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const input = parseIssue(await readJson(request))
  if (!input) return fail('Check the issue details.')

  const duplicate = await hasDuplicateIssue(userId, input)
  if (duplicate) return fail('Duplicate maintenance log detected. This exact log already exists.', 409)

  const issue = await addIssue(userId, input)
  if (!issue) return fail('Unable to save issue.', 500)
  return ok(issue, { status: 201 })
}
