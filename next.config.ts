import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
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
