import { useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '../lib/api'
import { Button, Card, ModuleHeader, inputCls } from '../components/ui'

interface Msg {
  role: 'ai' | 'user'
  text: string
}

export default function Interview() {
  const [started, setStarted] = useState(false)
  const [role, setRole] = useState('Software Engineer')
  const [company, setCompany] = useState('General')
  const [stage, setStage] = useState('Technical')
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: 'Welcome to your mock interview. Fill in the details and press Start Interview when ready.' },
  ])
  const [answer, setAnswer] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const push = (m: Msg) => {
    setMessages((prev) => [...prev, m])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  async function start() {
    setLoading(true)
    push({ role: 'ai', text: 'Starting session...' })
    try {
      const data = await api.post('/api/mock-interview/start', { role, company, stage })
      setSessionId(data.session_id)
      setCurrentQuestion(data.first_question)
      setStarted(true)
      push({ role: 'ai', text: `Let's begin.\n\n${data.first_question}` })
    } catch (e: any) {
      push({ role: 'ai', text: `Could not start: ${e.message}` })
    } finally {
      setLoading(false)
    }
  }

  async function submitAnswer() {
    const ans = answer.trim()
    if (!ans || loading) return
    push({ role: 'user', text: ans })
    setAnswer('')
    setLoading(true)
    try {
      const data = await api.post('/api/mock-interview/answer', {
        session_id: sessionId,
        question: currentQuestion,
        answer: ans,
        role,
        company,
        stage,
      })
      push({ role: 'ai', text: data.evaluation })
      setCurrentQuestion('')
    } catch (e: any) {
      push({ role: 'ai', text: `Evaluation failed: ${e.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col p-10">
      <ModuleHeader title="AI Mock Interview" subtitle="practice like it is the real day" />

      {/* setup card */}
      {!started && (
        <Card className="mb-5 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block font-mono text-xs font-semibold tracking-wider text-secondary-text">ROLE</label>
              <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs font-semibold tracking-wider text-secondary-text">COMPANY</label>
              <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-xs font-semibold tracking-wider text-secondary-text">STAGE</label>
              <select className={`${inputCls} cursor-pointer`} value={stage} onChange={(e) => setStage(e.target.value)}>
                <option>HR</option>
                <option>Technical</option>
                <option>System Design</option>
              </select>
            </div>
          </div>
          <Button onClick={start} loading={loading} className="mt-5 w-full">
            Start Interview
          </Button>
        </Card>
      )}

      {/* chat */}
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-tr-sm border border-accent/25 bg-accent/15 text-primary-text'
                    : 'rounded-tl-sm border border-border-subtle bg-elevated text-primary-text'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && started && (
            <div className="rounded-xl rounded-tl-sm border border-border-subtle bg-elevated px-4 py-3 font-mono text-xs italic text-muted">
              Interviewer is evaluating...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {started && currentQuestion && (
          <div className="flex gap-2.5 border-t border-border-subtle p-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer..."
              rows={2}
              className={`${inputCls} resize-none`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitAnswer()
                }
              }}
            />
            <button
              onClick={submitAnswer}
              disabled={loading}
              className="h-auto shrink-0 cursor-pointer rounded-lg bg-accent px-4 text-white shadow-[0_0_16px_rgba(124,106,255,0.35)] transition-all hover:bg-accent-hover disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
