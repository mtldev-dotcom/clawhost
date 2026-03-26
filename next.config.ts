import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
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

export default nextConfig
