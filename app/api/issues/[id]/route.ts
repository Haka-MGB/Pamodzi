import type { NextRequest } from 'next/server'
import { updateIssue } from '@/lib/server/db'
import { fail, ok, readJson, requireSameOrigin, requireUserId } from '@/lib/server/http'
import { parseIssueUpdates } from '@/lib/server/validation'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireSameOrigin(request)) return fail('Invalid request origin.', 403)
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const input = parseIssueUpdates(await readJson(request))
  if (!input) return fail('Check the issue update.')

  const id = (await params).id
  const issue = await updateIssue(userId, id, input)
  if (!issue) return fail('Issue not found.', 404)
  return ok(issue)
}

