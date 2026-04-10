'use client'

import { useState, useRef, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isSubmittingRef = useRef(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  // 🚫 HARD LOCK (instant)
  if (isSubmittingRef.current) return
  isSubmittingRef.current = true

  setError(null)

  if (password !== confirmPassword) {
    setError('Passwords do not match.')
    isSubmittingRef.current = false
    return
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters.')
    isSubmittingRef.current = false
    return
  }

  setIsLoading(true)

  const supabase = createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    console.error('[Signup]:', error)
    setError(error.message)
    setIsLoading(false)
    isSubmittingRef.current = false
    return
  }

  setIsLoading(false)
  isSubmittingRef.current = false

  router.push('/dashboard')
}


  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create account</h1>

          <form onSubmit={handleSubmit} className={`space-y-4 ${isLoading ? 'pointer-events-none opacity-80' : ''}`}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                aria-describedby={error ? 'signup-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                aria-describedby={error ? 'signup-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                aria-describedby={error ? 'signup-error' : undefined}
              />
            </div>

            {error && (
              <p id="signup-error" className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

<button
  type="submit"
  disabled={isLoading || !email || !password || !confirmPassword}
  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
>
  {isLoading ? 'Creating account...' : 'Create account'}
</button>
          </form>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
