import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setAuth } from '../lib/api'
import { api } from '../lib/api'
import { Button, ErrorText, inputCls } from '../components/ui'

type Tab = 'login' | 'signup'

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const pwChecks = [
    { label: '8-12 characters', ok: password.length >= 8 && password.length <= 12 },
    { label: 'Uppercase A-Z', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase a-z', ok: /[a-z]/.test(password) },
    { label: 'Number 0-9', ok: /\d/.test(password) },
    { label: 'Special char', ok: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const body =
        tab === 'signup' ? { username, email, password } : { username, password }
      const data = await api.post(`/api/auth/${tab}`, body)
      setAuth(data.access_token, data.username)
      navigate('/chat')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base p-6">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-accent/[0.07] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-success/[0.05] blur-[100px]" />

      <div className="relative w-full max-w-[420px]">
        <Link to="/" className="mb-8 block text-center font-mono text-xl font-bold tracking-tight text-primary-text">
          Code<span className="text-accent">Guru</span>
        </Link>

        <div className="rounded-3xl border border-border-subtle bg-surface p-10 shadow-[var(--shadow-card-hover)]">
          {/* tabs */}
          <div className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-elevated p-1">
            {(['login', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  setError(null)
                }}
                className={`cursor-pointer rounded-lg py-2 text-[13px] font-semibold transition-all ${
                  tab === t ? 'bg-base text-primary-text shadow-sm' : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs font-semibold tracking-wider text-secondary-text">
                USERNAME
              </label>
              <input
                className={inputCls}
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {tab === 'signup' && (
              <div>
                <label className="mb-1.5 block font-mono text-xs font-semibold tracking-wider text-secondary-text">
                  EMAIL
                </label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="mt-1 font-mono text-[10px] text-muted">Gmail addresses only</p>
              </div>
            )}

            <div>
              <label className="mb-1.5 block font-mono text-xs font-semibold tracking-wider text-secondary-text">
                PASSWORD
              </label>
              <input
                type="password"
                className={inputCls}
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {tab === 'signup' && (
                <ul className="mt-2 space-y-1">
                  {pwChecks.map(({ label, ok }) => (
                    <li key={label} className={`flex items-center gap-2 font-mono text-[11px] ${ok ? 'text-success' : 'text-muted'}`}>
                      <span className={`inline-block h-1 w-1 rounded-full ${ok ? 'bg-success' : 'bg-muted'}`} />
                      {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ErrorText message={error} />

            <Button type="submit" loading={loading} className="w-full">
              {tab === 'login' ? 'Sign in →' : 'Create account →'}
            </Button>
          </form>

          <p className="mt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
            By signing up you agree to our Terms and Privacy Policy
          </p>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-muted">
          <Link to="/" className="transition-colors hover:text-secondary-text">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
