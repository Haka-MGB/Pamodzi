import { ok } from '@/lib/server/http'

export async function GET() {
  return ok({ ok: true, now: new Date().toISOString(), uptime: process.uptime() })
}
