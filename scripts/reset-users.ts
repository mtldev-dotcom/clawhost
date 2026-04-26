import { PrismaClient } from '@prisma/client'
import { deprovisionInstance } from '../src/lib/dokploy'

const prisma = new PrismaClient()

async function main() {
  console.log('Deprovisioning containers and deleting all users...')

  const instances = await prisma.instance.findMany()
  for (const instance of instances) {
    try {
      await deprovisionInstance(instance)
      console.log(`  - Deprovisioned container for instance ${instance.id}`)
    } catch (err) {
      console.warn(`  - Failed to deprovision instance ${instance.id}:`, err)
    }
  }

  // Delete in order to respect foreign keys
  const sessions = await prisma.session.deleteMany()
  console.log(`  - Deleted ${sessions.count} sessions`)

  const accounts = await prisma.account.deleteMany()
  console.log(`  - Deleted ${accounts.count} accounts`)

  const deletedInstances = await prisma.instance.deleteMany()
  console.log(`  - Deleted ${deletedInstances.count} instances`)

  const users = await prisma.user.deleteMany()
  console.log(`  - Deleted ${users.count} users`)

  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
