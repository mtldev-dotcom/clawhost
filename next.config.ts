import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // TODO M5: add Content-Security-Policy after testing all third-party integrations
        ],
      },
    ]
  },
  allowedDevOrigins: ['100.119.162.2'],
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000', '100.119.162.2:3000'] },
  },
  // Workaround for next-auth + app router build issue
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Transpile next-auth to avoid document import issues
  transpilePackages: ['next-auth', '@auth/core'],
}

export default withNextIntl(nextConfig)
