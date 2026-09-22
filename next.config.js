/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production'
const devOriginList = (process.env.ALLOWED_DEV_ORIGINS || '192.168.1.250')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (isProduction && devOriginList.length > 0) {
  console.warn('WARNING: ALLOWED_DEV_ORIGINS is set in production. Remove it unless absolutely required.')
}

const nextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: isProduction ? [] : devOriginList,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig