'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E3829]">
            <Zap className="h-5 w-5 text-[#C4A35A]" />
          </div>
          <div>
            <span className="text-[#1E3829] font-bold text-2xl leading-none">VENDOR</span>
            <span className="text-[#C4A35A] font-bold text-2xl leading-none">HUB</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#D6CCBC] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#1E3829] mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-6">Welcome back to VendorHub</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1E3829] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-[#D6CCBC] bg-[#F5F0E8] px-3 py-2 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A] focus:ring-1 focus:ring-[#C4A35A] transition-colors"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1E3829] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-[#D6CCBC] bg-[#F5F0E8] px-3 py-2 text-sm text-[#1E3829] outline-none focus:border-[#C4A35A] focus:ring-1 focus:ring-[#C4A35A] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-[#1E3829] py-2.5 text-sm font-semibold text-[#C4A35A] hover:bg-[#2E5A40] disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-[#C4A35A] hover:underline font-medium">
              Request access
            </a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Where Vendors, Communication, and Projects Align
        </p>
      </div>
    </div>
  )
}
