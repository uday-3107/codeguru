import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { Card, EmptyState, ModuleHeader } from '../components/ui'

const CATEGORIES = ['Algorithms', 'Data Structures', 'SQL Queries']

interface Problem {
  id: string
  title: string
  category: string
  difficulty: string
}

const diffCls: Record<string, string> = {
  easy: 'text-success bg-success/10',
  medium: 'text-warning bg-warning/10',
  hard: 'text-error bg-error/10',
}

export default function Practice() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('Algorithms')
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api
      .get(`/api/practice/problems?category=${encodeURIComponent(category)}`)
      .then((data) => setProblems(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div className="mx-auto max-w-4xl p-10">
      <ModuleHeader title="Practice Problems" subtitle="master algorithms, data structures and sql" />

      {/* filter tabs */}
      <div className="mb-7 flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`cursor-pointer rounded-lg border px-4 py-1.5 font-mono text-xs transition-all ${
              category === c
                ? 'border-accent/50 bg-accent/15 text-accent2'
                : 'border-border-strong text-secondary-text hover:border-accent/30 hover:text-primary-text'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-xl bg-elevated/60" />
          ))}
        </div>
      )}

      {error && <EmptyState message={`Failed to load problems: ${error}`} />}

      {!loading && !error && problems.length === 0 && <EmptyState message="No problems found in this category yet." />}

      <div className="space-y-3">
        {problems.map((p) => (
          <Card key={p.id} hover className="group cursor-pointer">
            <button
              onClick={() => navigate('/chat')}
              className="flex w-full items-center justify-between px-6 py-4 text-left"
            >
              <div>
                <div className="font-semibold text-primary-text transition-colors group-hover:text-accent2">
                  {p.title}
                </div>
                <div className="mt-1 font-mono text-xs text-muted">{p.category}</div>
              </div>
              <span
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold uppercase ${
                  diffCls[p.difficulty.toLowerCase()] ?? 'text-secondary-text bg-elevated'
                }`}
              >
                {p.difficulty}
              </span>
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
