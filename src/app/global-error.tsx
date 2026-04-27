'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background">
        <h1 className="text-4xl font-semibold">500</h1>
        <p className="mt-2 text-muted-foreground">Something went wrong</p>
        <button
          onClick={reset}
          className="mt-6 text-emerald-500 hover:underline"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
