import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, LogOut, Target } from 'lucide-react'
import { api, clearAuth, getToken } from '../lib/api'
import { Button, Card, EmptyState, ModuleHeader } from '../components/ui'

interface Profile {
  username: string
  email: string
  bio: string
  solved_count: number
  streak: number
}

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activity, setActivity] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!getToken()) {
      setError('Sign in to see your profile and progress.')
      return
    }
    api
      .get('/api/user/profile')
      .then(setProfile)
      .catch((e) => setError(e.message))
    api
      .get('/api/user/activity')
      .then(setActivity)
      .catch(() => {})
  }, [])

  function logout() {
    clearAuth()
    navigate('/')
  }

  // build heatmap: last 26 weeks, GitHub style
  const cells: { date: string; count: number }[] = []
  if (activity) {
    const today = new Date()
    for (let i = 26 * 7 - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      cells.push({ date: key, count: activity[key] || 0 })
    }
  }
  const levelCls = (c: number) =>
    c === 0 ? 'bg-elevated' : c < 3 ? 'bg-accent/25' : c < 6 ? 'bg-accent/50' : c < 9 ? 'bg-accent/75' : 'bg-accent'

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-10">
        <ModuleHeader title="My Profile" subtitle="your coding journey" />
        <EmptyState message={error} />
        <div className="mt-5 text-center">
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Go to Login →
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-10">
        <div className="h-40 animate-pulse rounded-2xl bg-elevated/60" />
        <div className="h-24 animate-pulse rounded-2xl bg-elevated/60" />
      </div>
    )
  }

  const totalSolves = Object.values(activity || {}).reduce((a, b) => a + b, 0)

  return (
    <div className="mx-auto max-w-4xl p-10">
      {/* header row */}
      <div className="mb-8 flex items-start justify-between">
        <ModuleHeader title="My Profile" subtitle="your coding journey" />
        <Button variant="danger" size="sm" onClick={logout}>
          <LogOut size={13} /> Logout
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* profile card */}
        <Card className="h-fit p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-accent/15 font-header text-2xl font-extrabold text-accent2">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <h3 className="mt-4 font-header text-xl font-bold text-primary-text">{profile.username}</h3>
          <p className="font-mono text-xs text-muted">@{profile.username}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border-subtle bg-elevated p-4">
              <Target size={16} className="mx-auto text-accent2" />
              <div className="mt-1.5 font-header text-2xl font-extrabold text-primary-text">
                {profile.solved_count}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted">Solved</div>
            </div>
            <div className="rounded-xl border border-border-subtle bg-elevated p-4">
              <Flame size={16} className="mx-auto text-warning" />
              <div className="mt-1.5 font-header text-2xl font-extrabold text-primary-text">
                {profile.streak}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted">Streak</div>
            </div>
          </div>

          <p className="mt-5 rounded-lg border border-border-subtle bg-elevated px-3 py-2 font-mono text-xs text-secondary-text">
            {profile.bio}
          </p>
        </Card>

        {/* activity card */}
        <Card className="p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="font-header font-bold text-primary-text">Activity Heatmap</h3>
            <span className="font-mono text-xs text-muted">
              {totalSolves} submissions · last 26 weeks
            </span>
          </div>

          {activity ? (
            <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
              {cells.map(({ date, count }) => (
                <div
                  key={date}
                  title={`${date}: ${count} solved`}
                  className={`aspect-square w-full rounded-[3px] ${levelCls(count)}`}
                />
              ))}
            </div>
          ) : (
            <p className="py-10 text-center font-mono text-sm text-muted">Loading activity...</p>
          )}

          <div className="mt-4 flex items-center justify-end gap-1.5 font-mono text-[10px] text-muted">
            Less
            {[0, 2, 5, 8, 12].map((c) => (
              <span key={c} className={`inline-block h-3 w-3 rounded-[3px] ${levelCls(c)}`} />
            ))}
            More
          </div>
        </Card>
      </div>
    </div>
  )
}
