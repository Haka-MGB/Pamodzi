import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from './session'
import { logRequest } from './logger'

export type ApiResult<T> = NextResponse<T | { error: string }>

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store',
      ...init?.headers,
    },
  })
}

export function fail(message: string, status = 400) {
  return ok({ error: message }, { status })
}

export async function requireUserId() {
  const session = await getCurrentSession()
  return session?.userId ?? null
}

export async function readJson<T>(request: NextRequest, limitBytes = 16_384): Promise<T | null> {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > limitBytes) return null

  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export function requireSameOrigin(request: NextRequest) {
  // Log incoming API request (best-effort structured log)
  try { logRequest(request) } catch {}
  const origin = request.headers.get('origin')
  if (!origin) return true

  try {
    const originHost = new URL(origin).host
    const host = request.headers.get('host')
    const forwardedHost = request.headers.get('x-forwarded-host')
    const allowedHosts = new Set([request.nextUrl.host])

    if (host) allowedHosts.add(host)
    forwardedHost?.split(',').forEach(value => {
      const forwarded = value.trim()
      if (forwarded) allowedHosts.add(forwarded)
    })

    return allowedHosts.has(originHost)
  } catch {
    return false
  }
}
