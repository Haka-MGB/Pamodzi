import type { NextRequest } from 'next/server'
import crypto from 'crypto'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface BaseLogEntry {
  timestamp: string
  level: LogLevel
  requestId?: string
  userId?: string
}

interface RequestLogEntry extends BaseLogEntry {
  type: 'request'
  method: string
  url: string
  host: string | null
  origin: string | null
  userAgent: string | null
  duration?: number
}

interface ErrorLogEntry extends BaseLogEntry {
  type: 'error'
  message: string
  stack?: string
  code?: string
  name?: string
  details?: string
  hint?: string
  context?: Record<string, unknown>
}

interface OperationLogEntry extends BaseLogEntry {
  type: 'operation'
  operation: string
  status: 'started' | 'completed' | 'failed'
  duration?: number
  metadata?: Record<string, unknown>
}

interface DebugLogEntry extends BaseLogEntry {
  type: 'debug'
  message: string
  metadata?: Record<string, unknown>
}

type LogEntry = RequestLogEntry | ErrorLogEntry | OperationLogEntry | DebugLogEntry

// Thread-local storage for request context
const asyncLocalStorage = new Map<string, string>()

export function generateRequestId(): string {
  return crypto.randomUUID()
}

export function setRequestContext(requestId: string) {
  asyncLocalStorage.set('requestId', requestId)
}

export function getRequestContext(): string | undefined {
  return asyncLocalStorage.get('requestId')
}

function formatLog(entry: LogEntry): string {
  // In production, you can integrate with services like:
  // - Datadog: datadog.log(entry)
  // - Sentry: Sentry.captureMessage(entry)
  // - CloudWatch: logger.log(entry)
  return JSON.stringify(entry)
}

function shouldLog(level: LogLevel): boolean {
  const logLevel = process.env.LOG_LEVEL || 'info'
  const levels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
  return levels[level] >= levels[logLevel as LogLevel]
}

export function logRequest(request: NextRequest, extra: Record<string, unknown> = {}) {
  if (!shouldLog('info')) return

  try {
    const requestId = generateRequestId()
    setRequestContext(requestId)

    const entry: RequestLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      type: 'request',
      method: request.method,
      url: request.url,
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      userAgent: request.headers.get('user-agent'),
      requestId,
      ...extra,
    }
    
    console.info(formatLog(entry))
    return requestId
  } catch (e) {
    // best-effort: do not throw logging errors
    console.error('Failed to log request', e)
  }
}

export function logError(err: unknown, context: Record<string, unknown> = {}) {
  if (!shouldLog('error')) return

  try {
    let errorDetails: { 
      message: string
      stack?: string
      code?: string
      name?: string
      details?: string
      hint?: string
    }
    
    if (err instanceof Error) {
      errorDetails = {
        message: err.message,
        stack: err.stack,
        name: err.name,
      }
      // Handle Supabase/Postgres errors
      if ('code' in err) errorDetails.code = String(err.code)
      if ('details' in err) errorDetails.details = String(err.details)
      if ('hint' in err) errorDetails.hint = String(err.hint)
    } else if (typeof err === 'object' && err !== null) {
      // Handle error-like objects (Supabase errors)
      errorDetails = {
        message: 'message' in err ? String(err.message) : JSON.stringify(err),
        code: 'code' in err ? String(err.code) : undefined,
        details: 'details' in err ? String(err.details) : undefined,
        hint: 'hint' in err ? String(err.hint) : undefined,
      }
    } else {
      errorDetails = {
        message: String(err),
      }
    }

    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      type: 'error',
      ...errorDetails,
      requestId: getRequestContext(),
      context,
    }
    
    console.error(formatLog(entry))

    // Optional: Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Uncomment when you integrate Sentry or similar:
      // Sentry.captureException(err, { contexts: { custom: context } })
    }
  } catch (logErr) {
    // swallow to prevent logging errors from crashing the app
    console.error('Failed to log error:', err, logErr)
  }
}

export function logOperation(
  operation: string,
  status: 'started' | 'completed' | 'failed',
  metadata?: Record<string, unknown>
) {
  if (!shouldLog('info')) return

  try {
    const entry: OperationLogEntry = {
      timestamp: new Date().toISOString(),
      level: status === 'failed' ? 'error' : 'info',
      type: 'operation',
      operation,
      status,
      requestId: getRequestContext(),
      metadata,
    }
    
    const logFn = status === 'failed' ? console.error : console.info
    logFn(formatLog(entry))
  } catch {
    // swallow
  }
}

export function logDebug(message: string, metadata?: Record<string, unknown>) {
  if (!shouldLog('debug')) return

  try {
    const entry: DebugLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug' as const,
      type: 'debug',
      message,
      requestId: getRequestContext(),
      metadata,
    }
    console.debug(formatLog(entry))
  } catch {
    // swallow
  }
}
