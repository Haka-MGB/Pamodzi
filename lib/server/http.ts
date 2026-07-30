import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from './session'
import { logRequest, logError } from './logger'

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
  } catch (err) {
    logError(err, { operation: 'readJson', contentLength })
    return null
  }
}

export function requireSameOrigin(request: NextRequest) {
  // Log incoming API request (best-effort structured log)
  try { 
    const requestId = logRequest(request)
    if (requestId) {
      // Attach requestId to request for tracking (if possible)
      Object.defineProperty(request, 'requestId', { value: requestId })
    }
  } catch {}
  
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
  } catch (err) {
    logError(err, { operation: 'requireSameOrigin', origin })
    return false
  }
}

/**
 * Wraps an API route handler with error handling and logging
 */
export function withErrorHandling<T>(
  handler: (request: NextRequest, context: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      logError(error, { 
        method: request.method,
        url: request.url,
        operation: 'apiRouteHandler'
      })

      // Don't leak internal errors to client
      const message = process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.'

      return fail(message, 500)
    }
  }
}
