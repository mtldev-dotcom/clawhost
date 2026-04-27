import { prisma } from './prisma'
import type { PlatformSettings } from '@prisma/client'

const DEFAULTS: Omit<PlatformSettings, 'updatedAt'> = {
  id: 'global',
  signupEnabled: true,
  requireEmailConfirm: false,
  defaultCredits: 0,
  defaultSubStatus: 'inactive',
  maintenanceMode: false,
}

export async function getPlatformSettings(): Promise<typeof DEFAULTS> {
  const row = await prisma.platformSettings.findUnique({ where: { id: 'global' } })
  if (!row) return DEFAULTS
  return row
}
