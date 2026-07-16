'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Chrome, Github, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'

const VALID_USERNAME = 'admin'
const VALID_PASSWORD = 'test@123'

type AuthView = 'login' | 'register' | 'forgot'

export default function LoginPage() {
  const router = useRouter()
  const [view, setView] = useState<AuthView>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      router.push('/dashboard')
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError('')

    setTimeout(() => {
      if (
        (username === VALID_USERNAME || username === 'admin@tracko.com') && 
        password === VALID_PASSWORD
      ) {
        localStorage.setItem('isLoggedIn', 'true')
        document.cookie = `isLoggedIn=true; path=/; max-age=86400`
        router.push('/dashboard')
      } else {
        setError('Invalid username or password. (Hint: admin / test@123)')
        setLoading(false)
      }
    }, 1200)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError('Please complete all required fields.')
      return
    }

    setLoading(true)
    setError('')

    setTimeout(() => {
      setMessage('Account created successfully! Redirecting you in...')
      localStorage.setItem('isLoggedIn', 'true')
      document.cookie = `isLoggedIn=true; path=/; max-age=86400`
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }, 1500)
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    setError('')

    setTimeout(() => {
      setMessage('A reset token link has been sent to your registered inbox.')
      setLoading(false)
      setTimeout(() => {
        setView('login')
        setMessage('')
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background select-none">
      
      {/* Left side panel: Premium visual marketing graphic */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-b from-neutral-900 to-black text-white relative overflow-hidden border-r border-neutral-800">
        
        {/* Glow grid background */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="absolute top-[20%] left-[20%] right-[20%] bottom-[20%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Header logo */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-extrabold text-lg shadow-md">
            T
          </div>
          <span className="text-xl font-bold tracking-tight">Tracko</span>
          <span className="rounded-full bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-neutral-400">
            Enterprise v2.0
          </span>
        </div>

        {/* Glowing mock Kanban Graphic */}
        <div className="relative z-10 w-full max-w-md mx-auto aspect-video rounded-xl border border-neutral-800 bg-neutral-950/80 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/50" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
              <span className="h-3 w-3 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[10px] font-mono text-neutral-500">stack-crafter.tracko.app</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Column 1 */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Todo</div>
              <div className="bg-neutral-900 border border-neutral-800 p-2.5 rounded-lg space-y-1.5 shadow-sm">
                <div className="h-2 w-12 bg-blue-500/30 rounded" />
                <div className="h-1.5 w-full bg-neutral-700 rounded" />
                <div className="h-1.5 w-2/3 bg-neutral-700 rounded" />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Progress</div>
              <div className="bg-neutral-900 border border-indigo-500/40 p-2.5 rounded-lg space-y-1.5 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse" />
                <div className="h-2 w-8 bg-purple-500/30 rounded" />
                <div className="h-1.5 w-full bg-neutral-500 rounded" />
                <div className="h-1.5 w-1/2 bg-neutral-600 rounded" />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Done</div>
              <div className="bg-neutral-900/40 border border-neutral-900 p-2.5 rounded-lg space-y-1.5 opacity-60">
                <div className="h-2 w-10 bg-emerald-500/20 rounded" />
                <div className="h-1.5 w-full bg-neutral-800 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Tagline footer */}
        <div className="space-y-3 relative z-10 max-w-sm">
          <h2 className="text-xl font-semibold tracking-tight leading-snug">
            Designed for the future of software engineering.
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Manage projects, issue metrics, team velocity, and release timelines in a single, keyboard-shortcut-driven SaaS cockpit.
          </p>
          <div className="flex gap-4 pt-1">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Shield className="h-3.5 w-3.5" /> SOC-2 Ready
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Zap className="h-3.5 w-3.5" /> Sub-100ms Action
            </span>
          </div>
        </div>
      </div>

      {/* Right side panel: Minimal Form Cards */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24 xl:px-32 relative bg-card">
        <div className="mx-auto w-full max-w-sm space-y-6">
          
          {/* Header titles */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {view === 'login' && 'Welcome back'}
              {view === 'register' && 'Create your account'}
              {view === 'forgot' && 'Reset your password'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === 'login' && 'Enter your organization credentials to connect.'}
              {view === 'register' && 'Get started with Tracko for your team today.'}
              {view === 'forgot' && 'We will send a validation code to your email.'}
            </p>
          </div>

          {/* Social login block (only for login/register) */}
          {view !== 'forgot' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-9 text-xs"
                onClick={() => {
                  localStorage.setItem('isLoggedIn', 'true')
                  document.cookie = `isLoggedIn=true; path=/; max-age=86400`
                  router.push('/dashboard')
                }}
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-9 text-xs"
                onClick={() => {
                  localStorage.setItem('isLoggedIn', 'true')
                  document.cookie = `isLoggedIn=true; path=/; max-age=86400`
                  router.push('/dashboard')
                }}
              >
                <Chrome className="h-3.5 w-3.5" /> Google
              </Button>
            </div>
          )}

          {view !== 'forgot' && (
            <div className="relative flex items-center justify-center my-4 shrink-0">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <span className="relative bg-card px-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Or continue with
              </span>
            </div>
          )}

          {/* Display feedback alerts */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {/* FORM: Login */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Workspace ID or Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin or admin@tracko.com"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError('')
                  }}
                  disabled={loading}
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  disabled={loading}
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="remember" defaultChecked />
                <label
                  htmlFor="remember"
                  className="text-xs text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Remember session details for 30 days
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-4 h-9 text-xs">
                {loading ? 'Validating credentials...' : 'Sign In'}
                {!loading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
              </Button>
            </form>
          )}

          {/* FORM: Register */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Amit Razz"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setError('')
                  }}
                  disabled={loading}
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  disabled={loading}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  disabled={loading}
                  className="h-9 text-sm"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I agree to the Terms of Service & Privacy Policy
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-4 h-9 text-xs">
                {loading ? 'Creating workspace profile...' : 'Create Account'}
                {!loading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
              </Button>
            </form>
          )}

          {/* FORM: Forgot Password */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Registered Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  disabled={loading}
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-4 h-9 text-xs">
                {loading ? 'Sending code link...' : 'Send Reset Link'}
                {!loading && <ArrowRight className="ml-2 h-3.5 w-3.5" />}
              </Button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="text-xs text-muted-foreground hover:text-foreground text-center w-full block hover:underline pt-2 focus:outline-none"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Toggle between views */}
          {view !== 'forgot' && (
            <div className="text-xs text-center text-muted-foreground pt-4 border-t border-muted/50 shrink-0">
              {view === 'login' ? (
                <>
                  New to Tracko?{' '}
                  <button
                    type="button"
                    onClick={() => setView('register')}
                    className="font-semibold text-foreground hover:underline focus:outline-none"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="font-semibold text-foreground hover:underline focus:outline-none"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          )}

          {/* Hints Helper */}
          <div className="text-[10px] text-center text-muted-foreground/60 border border-muted rounded-lg p-2.5 bg-muted/10 shrink-0">
            <span className="font-semibold text-foreground">Quick Access Credentials:</span>
            <br />
            Username: <code className="bg-background px-1 border rounded text-[10px]">admin</code> | Password: <code className="bg-background px-1 border rounded text-[10px]">test@123</code>
          </div>

        </div>
      </div>
    </div>
  )
}
