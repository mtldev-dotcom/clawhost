import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const ADMIN_EMAIL = 'nickybcotroni@gmail.com'

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!existing) {
    console.log(`Admin seed: ${ADMIN_EMAIL} not registered yet — skipping.`)
    return
  }
  if (existing.role === 'admin') {
    console.log(`Admin seed: ${ADMIN_EMAIL} is already admin — skipping.`)
    return
  }
  await prisma.user.update({
    where: { email: ADMIN_EMAIL },
    data: { role: 'admin' },
  })
  console.log(`Admin seed: ${ADMIN_EMAIL} promoted to admin.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
