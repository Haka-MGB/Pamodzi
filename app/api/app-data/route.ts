import { getAppData } from '@/lib/server/db'
import { fail, ok, requireUserId } from '@/lib/server/http'

export async function GET() {
  const userId = await requireUserId()
  if (!userId) return fail('Authentication required.', 401)

  const data = await getAppData(userId)
  if (!data) return fail('Authentication required.', 401)
  return ok(data)
}

