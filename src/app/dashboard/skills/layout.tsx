import { getMessages } from 'next-intl/server'

export default async function SkillsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()
  const skills = (messages as { skills: Record<string, string> }).skills

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{skills.title}</h1>
        <p className="mt-1 text-gray-600">{skills.subtitle}</p>
      </div>
      {children}
    </div>
  )
}
