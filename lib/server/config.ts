import path from 'path'
import os from 'os'

export const SESSION_COOKIE = 'pamodzi_session'
export const SESSION_TTL_SECONDS = 60 * 60 * 8

export function getSessionSecret() {
  const secret = process.env.PAMODZI_SESSION_SECRET
  if (secret && secret.length >= 32) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error('PAMODZI_SESSION_SECRET must be set to at least 32 characters in production.')
  }

  console.warn('WARNING: using default dev session secret. Set PAMODZI_SESSION_SECRET (>=32 chars).')
  return 'dev-only-pamodzi-session-secret-change-before-production'
}

export function getDataFilePath() {
  // Vercel serverless environments only allow writing to /tmp
  const isVercel = process.env.VERCEL === '1'
  const baseDir = isVercel ? os.tmpdir() : process.cwd()
  return path.join(baseDir, 'pamodzi-data.json')
}