'use client'

import { useEffect, useState, useCallback } from 'react'
import { SkillCard } from '@/components/dashboard/SkillCard'
import type { Skill } from '@prisma/client'

interface SkillsResponse {
  enabledSkills: string[]
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [enabledSkills, setEnabledSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch('/api/skills')
      if (!res.ok) throw new Error('Failed to fetch skills')
      const data = await res.json()
      setSkills(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills')
    }
  }, [])

  const fetchEnabledSkills = useCallback(async () => {
    try {
      const res = await fetch('/api/instance')
      if (res.ok) {
        const data = await res.json()
        setEnabledSkills(data.instance?.enabledSkills || [])
      }
    } catch {
      // Instance may not exist yet
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchSkills(), fetchEnabledSkills()]).finally(() =>
      setLoading(false)
    )
  }, [fetchSkills, fetchEnabledSkills])

  const handleToggle = async (skillSlug: string) => {
    const isEnabled = enabledSkills.includes(skillSlug)

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillSlug, enable: !isEnabled }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update skill')
      }

      const data: SkillsResponse = await res.json()
      setEnabledSkills(data.enabledSkills)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skill')
      setTimeout(() => setError(null), 3000)
    }
  }

  const categories = [...new Set(skills.map((s) => s.category))]

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {skills.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl">🛠️</div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No skills available yet
          </h3>
          <p className="mt-2 text-gray-600">
            Check back soon for new integrations and tools.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="mb-4 text-lg font-semibold capitalize text-gray-800">
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {skills
                  .filter((skill) => skill.category === category)
                  .map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      enabled={enabledSkills.includes(skill.slug)}
                      onToggle={() => handleToggle(skill.slug)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">How Skills Work</h3>
        <p className="mt-2 text-sm text-gray-600">
          Each skill is an MCP (Model Context Protocol) server that extends your
          agent&apos;s capabilities. When you enable a skill, it&apos;s automatically
          configured and deployed with your OpenClaw instance. Your agent will
          then have access to the skill&apos;s tools and can use them to complete
          tasks.
        </p>
      </div>
    </div>
  )
}
