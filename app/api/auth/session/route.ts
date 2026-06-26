import { getUserById } from '@/lib/server/db'
import { ok } from '@/lib/server/http'
import { getCurrentSession } from '@/lib/server/session'

export async function GET() {
  const session = await getCurrentSession()
  const user = session ? await getUserById(session.userId) : null
  return ok({ user })
}

