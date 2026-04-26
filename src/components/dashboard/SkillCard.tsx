'use client'

import { useState } from 'react'
import { Mail, Calendar, NotebookPen, Github, MessageSquare, Zap, Puzzle, Loader2 } from 'lucide-react'
import type { Skill } from '@prisma/client'

interface SkillCardProps {
  skill: Skill
  enabled: boolean
  onToggle: () => Promise<void>
}

const categoryColors: Record<string, string> = {
  productivity: 'bg-blue-100 text-blue-800',
  dev: 'bg-purple-100 text-purple-800',
  messaging: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800',
}

const slugIcons: Record<string, React.ElementType> = {
  gmail: Mail,
  gcal: Calendar,
  notion: NotebookPen,
  github: Github,
  telegram: MessageSquare,
  discord: Zap,
}

export function SkillCard({ skill, enabled, onToggle }: SkillCardProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await onToggle()
    } finally {
      setLoading(false)
    }
  }

  const categoryColor = categoryColors[skill.category] ?? categoryColors.default
  const Icon = slugIcons[skill.slug] ?? Puzzle

  return (
    <div className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {skill.iconUrl ? (
            <img
              src={skill.iconUrl}
              alt={skill.name}
              className="h-10 w-10 rounded-lg"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{skill.name}</h3>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor}`}>
              {skill.category}
            </span>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
            enabled ? 'bg-primary' : 'bg-gray-200'
          }`}
          role="switch"
          aria-checked={enabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="mt-3 text-sm text-gray-600">{skill.description}</p>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
