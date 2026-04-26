import { Plus, Archive, TableProperties, Rows3, Folder, Users, BarChart3, NotebookPen, FileText, Database, KanbanSquare, LayoutDashboard, Clipboard, File, Download, Trash2 } from 'lucide-react'
import { addDatabaseField, addDatabaseRow, createWorkspacePage, archiveWorkspacePage, updateWorkspacePage, deleteWorkspaceFile, createFromTemplate } from '@/app/dashboard/workspace/actions'
import { WorkspacePageTree } from '@/components/dashboard/WorkspacePageTree'
import {
  databaseFieldTypeOptions,
  getWorkspacePageContent,
  type WorkspacePageNode,
  workspacePageTypeOptions,
} from '@/lib/workspace'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { WorkspaceFileUpload } from '@/components/dashboard/WorkspaceFileUpload'
import { WorkspaceFileSearch } from '@/components/dashboard/WorkspaceFileSearch'
import { GreetingLine } from '@/components/dashboard/GreetingLine'

interface WorkspaceShellProps {
  workspaceName: string
  pages: WorkspacePageNode[]
  selectedPageId?: string
  rootFolders: { id: string; name: string }[]
  rootFiles: { id: string; name: string; sizeBytes: number; createdBy: 'user' | 'agent' }[]
  userName?: string
}

function pageLabel(pageType: WorkspacePageNode['pageType']) {
  const match = workspacePageTypeOptions.find((option) => option.value === pageType)
  return match?.label ?? pageType.charAt(0).toUpperCase() + pageType.slice(1)
}

function findSelectedPage(nodes: WorkspacePageNode[], selectedPageId?: string): WorkspacePageNode | null {
  for (const node of nodes) {
    if (node.id === selectedPageId) return node
    const nested = findSelectedPage(node.children, selectedPageId)
    if (nested) return nested
  }
  return nodes[0] ?? null
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext ?? '')) {
    return <File className="h-4 w-4 text-blue-500 flex-shrink-0" />
  }
  if (['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'md'].includes(ext ?? '')) {
    return <FileText className="h-4 w-4 text-purple-500 flex-shrink-0" />
  }
  return <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
}

function DatabasePageSection({ page }: { page: WorkspacePageNode }) {
  const content = getWorkspacePageContent(page)
  const fields = content.database?.fields ?? []
  const rows = content.database?.rows ?? []

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-xl border p-6">
        <div className="flex items-center gap-2">
          <TableProperties className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Database fields</h3>
        </div>

        {fields.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{field.name}</p>
                  <Badge variant="secondary">{field.type}</Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No fields yet. Add the first property to shape this database.</p>
        )}

        <form action={addDatabaseField} className="grid gap-3 rounded-lg border border-dashed p-4 md:grid-cols-[minmax(0,1fr)_180px_auto]">
          <input type="hidden" name="pageId" value={page.id} />
          <Input name="fieldName" placeholder="Field name" required />
          <Select name="fieldType" defaultValue="text" options={databaseFieldTypeOptions.map((option) => ({ value: option.value, label: option.label }))} />
          <Button type="submit" variant="outline">Add field</Button>
        </form>
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <div className="flex items-center gap-2">
          <Rows3 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rows</h3>
        </div>

        {fields.length > 0 ? (
          <form action={addDatabaseRow} className="space-y-4 rounded-lg border border-dashed p-4">
            <input type="hidden" name="pageId" value={page.id} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label htmlFor={`field_${field.id}`} className="text-sm font-medium">{field.name}</label>
                  <Input
                    id={`field_${field.id}`}
                    name={`field_${field.id}`}
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    placeholder={field.type === 'select' ? 'Option value' : `Enter ${field.name.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            <Button type="submit" variant="outline">Add row</Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">Add fields first, then you can create rows.</p>
        )}

        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {fields.map((field) => (
                    <th key={field.id} className="px-4 py-3 text-left font-medium text-muted-foreground">{field.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {rows.map((row, index) => (
                  <tr key={String(row.id ?? index)}>
                    {fields.map((field) => (
                      <td key={field.id} className="px-4 py-3 text-foreground">
                        {row[field.id] == null || row[field.id] === '' ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          String(row[field.id])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No rows yet. The first entry will show up here as a simple table view.</p>
        )}
      </div>
    </div>
  )
}

const pageTypeIcons: Record<WorkspacePageNode['pageType'], React.ElementType> = {
  standard: FileText,
  database: Database,
  board: KanbanSquare,
  dashboard: LayoutDashboard,
  capture: Clipboard,
}

function PageTypeSummary({ pageType }: { pageType: WorkspacePageNode['pageType'] }) {
  const descriptions: Record<WorkspacePageNode['pageType'], string> = {
    standard: 'Flexible notes and structured content.',
    database: 'A structured collection with fields, rows, and views coming next.',
    board: 'Kanban-style workflows will live here next.',
    dashboard: 'High-level overview pages and widgets will land here.',
    capture: 'Fast capture pages for raw thoughts, notes, and intake.',
  }

  const Icon = pageTypeIcons[pageType]

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">This page type</p>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{descriptions[pageType]}</p>
    </Card>
  )
}

const templates = [
  { key: 'client-crm',      label: 'Client CRM',      desc: 'Track clients, deals, and next actions',      icon: Users },
  { key: 'project-tracker', label: 'Project Tracker',  desc: 'Active projects, status, and milestones',      icon: KanbanSquare },
  { key: 'weekly-review',   label: 'Weekly Review',    desc: 'Wins, priorities, and reflections',            icon: BarChart3 },
  { key: 'daily-plan',      label: 'Daily Plan',       desc: 'Your top 3, meetings, and shutdown notes',     icon: Clipboard },
  { key: 'meeting-notes',   label: 'Meeting Notes',    desc: 'Fast capture for meetings and calls',          icon: NotebookPen },
]

export function WorkspaceShell({ workspaceName, pages, selectedPageId, rootFolders, rootFiles, userName }: WorkspaceShellProps) {
  const selectedPage = findSelectedPage(pages, selectedPageId)
  const selectedContent = selectedPage ? getWorkspacePageContent(selectedPage) : { text: '' }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 border-b pb-4">
          <div>
            <p className="text-sm text-muted-foreground">Workspace</p>
            <h1 className="text-lg font-semibold">{workspaceName}</h1>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <form action={createWorkspacePage} className="space-y-2">
            <input type="hidden" name="parentId" value={selectedPage?.id ?? ''} />
            <Input name="title" placeholder={selectedPage ? `Add a subpage under ${selectedPage.title}` : 'Add a page'} required />
            <Select
              name="pageType"
              defaultValue="standard"
              options={workspacePageTypeOptions.map((option) => ({ value: option.value, label: option.label }))}
            />
            <Button type="submit" size="sm" className="w-full justify-center gap-2">
              <Plus className="h-4 w-4" />
              {selectedPage ? 'Create subpage' : 'Create page'}
            </Button>
          </form>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pages</p>
            {pages.length > 0 ? (
              <WorkspacePageTree nodes={pages} selectedPageId={selectedPageId} />
            ) : (
              <p className="text-sm text-muted-foreground">No pages yet. Create your first page.</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {!selectedPage && pages.length > 0 && userName && (
          <GreetingLine name={userName.split(' ')[0] || userName} />
        )}
        {selectedPage ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold">{selectedPage.title}</h2>
                  <Badge variant="outline">{pageLabel(selectedPage.pageType)}</Badge>
                </div>
              </div>
              {!selectedPage.isRoot && (
                <form action={archiveWorkspacePage}>
                  <input type="hidden" name="pageId" value={selectedPage.id} />
                  <Button type="submit" variant="outline" size="sm" className="gap-2">
                    <Archive className="h-4 w-4" />
                    Archive page
                  </Button>
                </form>
              )}
            </div>

            <PageTypeSummary pageType={selectedPage.pageType} />

            {selectedPage.pageType === 'database' && <DatabasePageSection page={selectedPage} />}

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <Card className="p-4">
                <p className="text-sm font-medium mb-3">Folders</p>
                <div className="space-y-2">
                  {rootFolders.map((folder) => (
                    <div key={folder.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      {folder.name}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 space-y-4">
                <p className="text-sm font-medium">Latest root files</p>
                <WorkspaceFileUpload folders={rootFolders.map((folder) => ({ id: folder.id, name: folder.name }))} />
                <WorkspaceFileSearch />
                <div className="space-y-2">
                  {rootFiles.length > 0 ? (
                    rootFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileIcon name={file.name} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.createdBy} • {formatFileSize(file.sizeBytes)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <a
                            href={`/api/workspace/files/${file.id}/download`}
                            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <form action={deleteWorkspaceFile} className="inline">
                            <input type="hidden" name="fileId" value={file.id} />
                            <button
                              type="submit"
                              className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No uploaded files yet.</p>
                  )}
                </div>
              </Card>
            </div>

            <form action={updateWorkspacePage} className="space-y-4 rounded-xl border p-6">
              <input type="hidden" name="pageId" value={selectedPage.id} />
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input id="title" name="title" defaultValue={selectedPage.title} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  {selectedPage.pageType === 'database' ? 'Description' : 'Notes'}
                </label>
                <textarea
                  id="content"
                  name="content"
                  defaultValue={selectedContent.text}
                  placeholder={selectedPage.pageType === 'database' ? 'Describe what this database is for...' : 'Start writing here...'}
                  spellCheck={false}
                  className="min-h-[320px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-base leading-relaxed outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save page</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 text-center">
            <div>
              <h2 className="text-xl font-semibold">Start your workspace</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">Create a page above, or pick a starter template to hit the ground running.</p>
            </div>
            <div className="grid gap-3 w-full max-w-md sm:grid-cols-2">
              {templates.map((t) => {
                const Icon = t.icon
                return (
                  <form key={t.key} action={createFromTemplate}>
                    <input type="hidden" name="template" value={t.key} />
                    <button type="submit" className="w-full flex items-start gap-3 rounded-lg border p-4 text-left transition hover:border-gray-400">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted flex-shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{t.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </button>
                  </form>
                )
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
