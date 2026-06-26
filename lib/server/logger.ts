import type { NextRequest } from 'next/server'

export function logRequest(request: NextRequest, extra: Record<string, unknown> = {}) {
  try {
    const meta = {
      type: 'request',
      method: request.method,
      url: request.url,
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
      ...extra,
    }
    // Structured JSON log for easy parsing by log collectors
    console.info(JSON.stringify(meta))
  } catch (e) {
    // best-effort: do not throw logging errors
    // eslint-disable-next-line no-console
    console.error('Failed to log request', e)
  }
}

export function logError(err: unknown, context: Record<string, unknown> = {}) {
  try {
    const meta = { type: 'error', error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err), timestamp: new Date().toISOString(), ...context }
    console.error(JSON.stringify(meta))
  } catch {
    // swallow
  }
}
