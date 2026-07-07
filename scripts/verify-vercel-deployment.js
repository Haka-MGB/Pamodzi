#!/usr/bin/env node

/**
 * Vercel Deployment Verification Script
 * 
 * This script verifies that all environment variables and configurations
 * are properly set for Vercel deployment.
 */

const fs = require('fs');
const path = require('path');

const checks = [];

// Check 1: .env.local exists
const envLocalPath = path.join(__dirname, '..', '.env.local');
checks.push({
  name: 'Environment file (.env.local)',
  pass: fs.existsSync(envLocalPath),
  fix: 'Create .env.local with required variables. See VERCEL_DEPLOYMENT_GUIDE.md'
});

// Check 2: vercel.json exists
const vercelJsonPath = path.join(__dirname, '..', 'vercel.json');
checks.push({
  name: 'Vercel configuration (vercel.json)',
  pass: fs.existsSync(vercelJsonPath),
  fix: 'vercel.json should exist in root directory'
});

// Check 3: next.config.js or next.config.ts exists
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
const nextConfigTsPath = path.join(__dirname, '..', 'next.config.ts');
checks.push({
  name: 'Next.js configuration',
  pass: fs.existsSync(nextConfigPath) || fs.existsSync(nextConfigTsPath),
  fix: 'Create next.config.js in root directory'
});

// Check 4: package.json exists and has required scripts
const packageJsonPath = path.join(__dirname, '..', 'package.json');
let hasRequiredScripts = false;
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  hasRequiredScripts = !!(pkg.scripts?.build && pkg.scripts?.start);
}
checks.push({
  name: 'Build and start scripts',
  pass: hasRequiredScripts,
  fix: 'Ensure package.json has "build" and "start" scripts'
});

// Check 5: API routes exist
const apiAuthPath = path.join(__dirname, '..', 'app', 'api', 'auth');
checks.push({
  name: 'API authentication routes',
  pass: fs.existsSync(apiAuthPath),
  fix: 'Authentication API routes should be in app/api/auth'
});

// Check 6: Database configuration
const dbPath = path.join(__dirname, '..', 'lib', 'server', 'db.ts');
checks.push({
  name: 'Database configuration',
  pass: fs.existsSync(dbPath),
  fix: 'Database adapter should be in lib/server/db.ts'
});

// Print results
console.log('\n📋 Vercel Deployment Verification\n');
console.log('━'.repeat(60));

let allPass = true;
checks.forEach((check, index) => {
  const status = check.pass ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  if (!check.pass) {
    console.log(`   → ${check.fix}`);
    allPass = false;
  }
});

console.log('━'.repeat(60));

if (allPass) {
  console.log('\n✨ All checks passed! Your project is ready for Vercel deployment.\n');
  console.log('Next steps:');
  console.log('1. Generate session secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  console.log('2. Add to .env.local as PAMODZI_SESSION_SECRET');
  console.log('3. Push to GitHub: git push origin main');
  console.log('4. Connect repo to Vercel and set environment variables');
  console.log('5. Deploy!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}
