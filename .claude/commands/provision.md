# /provision

Manually provision a ClawHost instance for a user.

## Usage
```
/provision <userId>
```

## Steps
1. Look up user in DB by userId
2. Call `src/lib/dokploy.ts` → `provisionInstance(user)`
3. Update DB record with `dokployProjectId`, `appUrl`, `status: active`
4. Print result

## Code to run
```typescript
import { provisionInstance } from '@/lib/dokploy'
import { prisma } from '@/lib/prisma'
const user = await prisma.user.findUnique({ where: { id: '$ARGUMENTS' }, include: { instance: true } })
const result = await provisionInstance(user)
console.log(result)
```
