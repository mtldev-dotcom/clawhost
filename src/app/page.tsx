import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Your personal AI agent,
            <br />
            <span className="text-gray-500">hosted in 60 seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get your own OpenClaw instance with a custom subdomain, connect it
            to Telegram, Discord, or WhatsApp, and add powerful skills from our
            marketplace.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-black text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">1</div>
              <h3 className="font-semibold text-lg mb-2">Subscribe</h3>
              <p className="text-gray-600">
                Sign up and subscribe for $9/month to get your own hosted agent
                instance.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">2</div>
              <h3 className="font-semibold text-lg mb-2">Configure</h3>
              <p className="text-gray-600">
                Connect your preferred channel (Telegram, Discord, WhatsApp) and
                AI provider.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">3</div>
              <h3 className="font-semibold text-lg mb-2">Extend</h3>
              <p className="text-gray-600">
                Add skills from our marketplace to give your agent superpowers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Simple pricing</h2>
          <div className="bg-white border rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-5xl font-bold mb-2">$9</div>
            <div className="text-gray-500 mb-6">/month</div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Custom subdomain
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Telegram, Discord, or
                WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Skills marketplace
                access
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Bring your own AI API
                key
              </li>
            </ul>
            <Link
              href="/register"
              className="block w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
