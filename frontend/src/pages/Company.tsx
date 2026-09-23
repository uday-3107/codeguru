import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import { Button, Card, EmptyState, ModuleHeader } from '../components/ui'

interface CompanyDetail {
  pattern: string
  rounds: { name: string; duration?: string; name_type?: string; count?: number }[]
  common_questions: string[]
}

export default function Company() {
  const [companies, setCompanies] = useState<string[]>([])
  const [detail, setDetail] = useState<{ name: string; data: CompanyDetail } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get('/api/company/list')
      .then(setCompanies)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function open(name: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get(`/api/company/${encodeURIComponent(name)}`)
      if (data.error) throw new Error(data.error)
      setDetail({ name, data })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-10">
      <ModuleHeader title="Company Preparation" subtitle="crack the code for top tech giants" />

      {/* detail view */}
      {detail ? (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setDetail(null)} className="mb-6">
            <ArrowLeft size={13} /> Back
          </Button>

          <h2 className="font-header text-3xl font-extrabold tracking-tight text-primary-text">
            {detail.name} Prep Pattern
          </h2>
          <p className="mt-1 font-mono text-sm text-muted">{detail.data.pattern}</p>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="font-header mb-4 font-bold text-primary-text">Interview Rounds</h3>
              <ul>
                {detail.data.rounds.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b border-border-subtle py-3 text-sm text-secondary-text last:border-none"
                  >
                    <span>
                      {r.name}
                      {r.count ? <span className="ml-2 font-mono text-xs text-muted">({r.count} Qs)</span> : null}
                    </span>
                    <span className="font-mono text-xs text-accent">{r.duration || r.name_type || ''}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-header mb-4 font-bold text-primary-text">Top Questions</h3>
              <ul>
                {detail.data.common_questions.map((q) => (
                  <li
                    key={q}
                    className="border-b border-border-subtle py-3 text-sm text-secondary-text last:border-none"
                  >
                    {q}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <>
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-elevated/60" />
              ))}
            </div>
          )}

          {error && <EmptyState message={error} />}

          {!loading && !error && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {companies.map((name) => (
                <Card
                  key={name}
                  hover
                  className="cursor-pointer p-8 text-center"
                >
                  <button onClick={() => open(name)} className="group w-full cursor-pointer">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border-strong bg-gradient-to-br from-white/[0.08] to-transparent font-header text-xl font-extrabold text-accent2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      {name.charAt(0)}
                    </div>
                    <div className="mt-4 font-header text-lg font-bold text-primary-text">{name}</div>
                    <div className="mt-1.5 font-mono text-[11px] text-muted transition-colors group-hover:text-secondary-text">
                      View prep pattern →
                    </div>
                  </button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
