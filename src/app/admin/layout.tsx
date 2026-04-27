import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/system', label: 'System' },
  { href: '/admin/settings', label: 'Settings' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <aside className="w-48 shrink-0 border-r border-gray-800 p-4">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Admin
        </p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-gray-800 pt-4">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">
            ← Back to app
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
