'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface WorkspaceFileUploadProps {
  folders: { id: string; name: string }[]
}

export function WorkspaceFileUpload({ folders }: WorkspaceFileUploadProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const response = await fetch('/api/workspace/files', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setSuccess(`Uploaded ${data.file.name}`)
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-3 rounded-lg border border-dashed p-4">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">Upload to workspace</p>
      </div>

      <Input name="file" type="file" required />
      <Select
        name="folderId"
        defaultValue=""
        options={[
          { value: '', label: 'Root workspace' },
          ...folders.map((folder) => ({ value: folder.id, label: folder.name })),
        ]}
      />
      <Input name="description" placeholder="Optional description" />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <Button type="submit" disabled={isPending} className="gap-2">
        <Upload className="h-4 w-4" />
        {isPending ? 'Uploading...' : 'Upload file'}
      </Button>
    </form>
  )
}
