'use client'

import { useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchResultFile {
  id: string
  name: string
  createdBy: 'user' | 'agent'
  sizeBytes: number
}

export function WorkspaceFileSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSearch() {
    if (!query.trim()) {
      setResults([])
      setError(null)
      return
    }

    startTransition(async () => {
      setError(null)
      const response = await fetch(`/api/workspace/files?search=${encodeURIComponent(query.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Search failed')
        return
      }

      setResults(data.files || [])
    })
  }

  return (
    <div className="space-y-3 rounded-lg border border-dashed p-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Search files</p>
      </div>

      <div className="flex gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or description" />
        <Button type="button" variant="outline" onClick={handleSearch} disabled={isPending}>
          {isPending ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {results.length > 0 ? (
        <div className="space-y-2">
          {results.map((file) => (
            <div key={file.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.createdBy} • {Math.max(1, Math.round(file.sizeBytes / 1024))} KB
                </p>
              </div>
              <a href={`/api/workspace/files/${file.id}/download`} className="text-xs font-medium text-foreground underline-offset-4 hover:underline">
                Download
              </a>
            </div>
          ))}
        </div>
      ) : query.trim() && !isPending && !error ? (
        <p className="text-sm text-muted-foreground">No matching files yet.</p>
      ) : null}
    </div>
  )
}
