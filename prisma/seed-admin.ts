import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.update({
    where: { email: 'nickybcotroni@gmail.com' },
    data: { role: 'admin' },
    select: { id: true, email: true, role: true },
  })
  console.log('Admin granted:', user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
