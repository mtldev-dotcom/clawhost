import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Deleting all users and related data...')

  // Delete in order to respect foreign keys
  const sessions = await prisma.session.deleteMany()
  console.log(`  - Deleted ${sessions.count} sessions`)

  const accounts = await prisma.account.deleteMany()
  console.log(`  - Deleted ${accounts.count} accounts`)

  const providerConfigs = await prisma.providerConfig.deleteMany()
  console.log(`  - Deleted ${providerConfigs.count} provider configs`)

  const instances = await prisma.instance.deleteMany()
  console.log(`  - Deleted ${instances.count} instances`)

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
