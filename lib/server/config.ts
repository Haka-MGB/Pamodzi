import path from 'path'

export const SESSION_COOKIE = 'pamodzi_session'
export const SESSION_TTL_SECONDS = 60 * 60 * 8

export function getSessionSecret() {
  const secret = process.env.PAMODZI_SESSION_SECRET
  if (secret && secret.length >= 32) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error('PAMODZI_SESSION_SECRET must be set to at least 32 characters in production.')
  }

  // Warn loudly in development when using the default dev secret so developers
  // don't accidentally run with a weak secret in staging/production.
  // Keep returning a usable dev secret to avoid breaking local workflows.
  // To generate a secure secret locally run:
  // node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  // Then set `PAMODZI_SESSION_SECRET` in your environment or .env file.
  console.warn('WARNING: using default dev session secret. Set PAMODZI_SESSION_SECRET (>=32 chars).')
  return 'dev-only-pamodzi-session-secret-change-before-production'
}

export function getDataFilePath() {
  return process.env.PAMODZI_DATA_FILE || path.join(process.cwd(), '.data', 'pamodzi-db.json')
}

