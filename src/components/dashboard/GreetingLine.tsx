'use client'

import { useEffect, useState } from 'react'

export function GreetingLine({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <p className="text-sm text-muted-foreground mb-4">
      {greeting}, {name}.
    </p>
  )
}
