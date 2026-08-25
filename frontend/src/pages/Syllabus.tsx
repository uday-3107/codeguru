import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { api } from '../lib/api'
import { Card, EmptyState, ModuleHeader } from '../components/ui'

interface SyllabusData {
  [branch: string]: { [year: string]: string[] }
}

export default function Syllabus() {
  const [universities, setUniversities] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [data, setData] = useState<SyllabusData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get('/api/syllabus/universities')
      .then(setUniversities)
      .catch(() => setError('Could not load universities.'))
  }, [])

  async function load(uni: string) {
    setSelected(uni)
    if (!uni) return
    setLoading(true)
    setError(null)
    try {
      setData(await api.get(`/api/syllabus/${encodeURIComponent(uni)}`))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const years = data?.['Computer Science'] ?? null

  return (
    <div className="mx-auto max-w-5xl p-10">
      <ModuleHeader title="University Syllabus" subtitle="integrated curriculum for indian universities" />

      <select
        value={selected}
        onChange={(e) => load(e.target.value)}
        className="mb-8 cursor-pointer rounded-lg border border-border-strong bg-input px-4 py-2.5 font-mono text-sm text-primary-text outline-none focus:border-accent"
      >
        <option value="">Select University</option>
        {universities.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      {loading && (
        <div className="grid gap-5 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-elevated/60" />
          ))}
        </div>
      )}

      {error && <EmptyState message={error} />}

      {!loading && !error && !years && selected && <EmptyState message="No curriculum found for this selection." />}

      {!selected && !loading && <EmptyState message="Pick a university above to browse its year-wise curriculum." />}

      {years && (
        <div className="grid gap-5 md:grid-cols-2">
          {Object.entries(years).map(([year, subjects]) => (
            <Card key={year} hover className="p-6">
              <h3 className="font-header text-lg font-bold text-accent">{year}</h3>
              <ul className="mt-4">
                {subjects.map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-3 border-b border-border-subtle py-2.5 text-sm text-secondary-text last:border-none"
                  >
                    <BookOpen size={14} className="shrink-0 text-accent/60" />
                    {s}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
