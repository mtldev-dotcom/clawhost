import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Only enable query logging in development
const isDevelopment = process.env.NODE_ENV === 'development'

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['error', 'warn'], // Production: only log errors and warnings
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
