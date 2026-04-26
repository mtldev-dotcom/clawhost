'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Database, LayoutDashboard, KanbanSquare, Clipboard, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkspacePageNode } from '@/lib/workspace'

function pageIcon(pageType: WorkspacePageNode['pageType']) {
  switch (pageType) {
    case 'database': return Database
    case 'board': return KanbanSquare
    case 'dashboard': return LayoutDashboard
    case 'capture': return Clipboard
    default: return FileText
  }
}

function PageNode({ node, selectedPageId }: { node: WorkspacePageNode; selectedPageId?: string }) {
  const [expanded, setExpanded] = useState(true)
  const Icon = pageIcon(node.pageType)
  const isSelected = node.id === selectedPageId
  const hasChildren = node.children.length > 0

  return (
    <li>
      <div className="group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-muted/70">
        <button
          type="button"
          onClick={() => hasChildren && setExpanded((v) => !v)}
          className={cn('h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform', {
            'rotate-90': hasChildren && expanded,
            'opacity-0 pointer-events-none': !hasChildren,
          })}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Link
          href={`/dashboard/workspace?page=${node.id}`}
          className={cn('flex-1 truncate text-sm', isSelected ? 'font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          {node.title}
        </Link>
      </div>
      {hasChildren && expanded && (
        <div className="ml-5 border-l pl-3">
          <WorkspacePageTree nodes={node.children} selectedPageId={selectedPageId} />
        </div>
      )}
    </li>
  )
}

export function WorkspacePageTree({ nodes, selectedPageId }: { nodes: WorkspacePageNode[]; selectedPageId?: string }) {
  return (
    <ul className="space-y-1">
      {nodes.map((node) => (
        <PageNode key={node.id} node={node} selectedPageId={selectedPageId} />
      ))}
    </ul>
  )
}
