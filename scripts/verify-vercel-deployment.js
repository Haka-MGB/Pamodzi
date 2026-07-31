#!/usr/bin/env node

/**
 * Vercel deployment readiness checks.
 *
 * This checks files and local env shape only. Vercel production must have
 * the same required variables configured in the Vercel dashboard.
 */

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const envLocalPath = path.join(root, '.env.local')

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/).reduce((env, line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) return env

    const value = match[2].trim().replace(/^['"]|['"]$/g, '')
    env[match[1]] = value
    return env
  }, {})
}

const env = readEnvFile(envLocalPath)
const checks = []

function check(name, pass, fix) {
  checks.push({ name, pass, fix })
}

check(
  'Environment file (.env.local)',
  fs.existsSync(envLocalPath),
  'Create .env.local with the required variables from .env.example.'
)

check(
  'PAMODZI_SESSION_SECRET is set and strong',
  typeof env.PAMODZI_SESSION_SECRET === 'string' && env.PAMODZI_SESSION_SECRET.length >= 32,
  'Set PAMODZI_SESSION_SECRET to at least 32 random characters.'
)

check(
  'NEXT_PUBLIC_SUPABASE_URL is set',
  typeof env.NEXT_PUBLIC_SUPABASE_URL === 'string' && /^https:\/\/.+\.supabase\.co$/.test(env.NEXT_PUBLIC_SUPABASE_URL),
  'Set NEXT_PUBLIC_SUPABASE_URL to your Supabase project URL.'
)

check(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY is set',
  typeof env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' && env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 40,
  'Set NEXT_PUBLIC_SUPABASE_ANON_KEY from Supabase Dashboard -> Settings -> API.'
)

check(
  'SUPABASE_SERVICE_ROLE_KEY is set',
  typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' && env.SUPABASE_SERVICE_ROLE_KEY.length > 40,
  'Set SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard -> Settings -> API. Keep it server-only and never expose it to the browser.'
)

check(
  'Vercel configuration (vercel.json)',
  fs.existsSync(path.join(root, 'vercel.json')),
  'vercel.json should exist in the project root.'
)

check(
  'Next.js configuration',
  fs.existsSync(path.join(root, 'next.config.js')) || fs.existsSync(path.join(root, 'next.config.ts')),
  'Create next.config.js or next.config.ts in the project root.'
)

const packageJsonPath = path.join(root, 'package.json')
let hasRequiredScripts = false
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  hasRequiredScripts = Boolean(pkg.scripts && pkg.scripts.build && pkg.scripts.start)
}

check(
  'Build and start scripts',
  hasRequiredScripts,
  'Ensure package.json has build and start scripts.'
)

check(
  'API authentication routes',
  fs.existsSync(path.join(root, 'app', 'api', 'auth')),
  'Authentication API routes should be in app/api/auth.'
)

check(
  'Supabase units SQL exists',
  fs.existsSync(path.join(root, 'supabase-units-table.sql')),
  'Keep supabase-units-table.sql available and run it in Supabase before using unit management.'
)

console.log('\nPamodzi Vercel Deployment Verification\n')
console.log('-'.repeat(60))

let allPass = true
for (const item of checks) {
  const status = item.pass ? 'PASS' : 'FAIL'
  console.log(`${status} ${item.name}`)
  if (!item.pass) {
    console.log(`     ${item.fix}`)
    allPass = false
  }
}

console.log('-'.repeat(60))

if (allPass) {
  console.log('\nAll local readiness checks passed.')
  console.log('Also confirm these same env vars are set in Vercel Production, Preview, and Development as needed.\n')
  process.exit(0)
}

console.log('\nSome checks failed. Fix them before deploying.\n')
process.exit(1)
