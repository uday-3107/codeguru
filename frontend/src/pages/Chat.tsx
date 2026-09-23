import { useRef, useState } from 'react'
import { Play, Send, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from '../components/ui'

type Mode = 'chat' | 'explain' | 'debug' | 'generate' | 'socratic'
type AiLang = 'hindi' | 'telugu' | 'tamil' | 'english'

const MODES: { key: Mode; label: string }[] = [
  { key: 'chat', label: 'Chat' },
  { key: 'explain', label: 'Explain' },
  { key: 'debug', label: 'Debug' },
  { key: 'generate', label: 'Generate' },
  { key: 'socratic', label: 'Socratic' },
]

const LANGS: { key: AiLang; label: string }[] = [
  { key: 'hindi', label: 'हिं' },
  { key: 'telugu', label: 'తె' },
  { key: 'tamil', label: 'த' },
  { key: 'english', label: 'EN' },
]

const STARTER_CODE = `def find_max(numbers):
    max_val = numbers[0]
    for n in numbers:
        if n > max_val
            max_val = n
    return max_val

# Try editing this code!`

const GREETINGS: Record<AiLang, string> = {
  hindi: 'Namaste! Main aapko code karne mein madad karunga.',
  telugu: 'Namaste! Nenu meeru code cheyyadaniki sahayapadataanu.',
  tamil: 'Vanakkam! Naan ungalukku code seiya udhavuven.',
  english: 'Hello! I am here to help you code.',
}

interface Message {
  role: 'user' | 'ai'
  text: string
  provider?: string
}

export default function Chat() {
  const [code, setCode] = useState(STARTER_CODE)
  const [stdin, setStdin] = useState('')
  const [mode, setMode] = useState<Mode>('chat')
  const [aiLang, setAiLang] = useState<AiLang>('telugu')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: GREETINGS.telugu },
  ])
  const [thinking, setThinking] = useState(false)

  const [output, setOutput] = useState<{ ok: boolean; text: string } | null>(null)
  const [running, setRunning] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToEnd = () =>
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)

  async function runCode() {
    setRunning(true)
    setOutput(null)
    try {
      const data = await api.post('/api/run', { code, language: 'Python', stdin })
      if (data.success) {
        setOutput({ ok: true, text: data.stdout || '(no output)' })
      } else {
        setOutput({ ok: false, text: data.stderr || 'Execution failed' })
      }
    } catch (err: any) {
      setOutput({ ok: false, text: err.message })
    } finally {
      setRunning(false)
    }
  }

  function buildRequest(message: string) {
    switch (mode) {
      case 'debug':
        return { path: '/api/debug', body: { code, error: message, language: aiLang, lang: 'python' } }
      case 'explain':
        return { path: '/api/explain', body: { code: code || message, language: aiLang, lang: 'python', mode } }
      case 'socratic':
        return { path: '/api/explain', body: { code: code || message, language: aiLang, lang: 'python', mode } }
      case 'generate':
        return { path: '/api/generate', body: { description: message, language: aiLang, lang: 'python' } }
      default:
        return { path: '/api/chat', body: { message, language: aiLang, code, mode } }
    }
  }

  async function send() {
    const message = input.trim()
    if (!message || thinking) return

    setMessages((m) => [...m, { role: 'user', text: message }])
    setInput('')
    setThinking(true)
    scrollToEnd()

    try {
      const { path, body } = buildRequest(message)
      const data = await api.post(path, body)
      if (data.success) {
        setMessages((m) => [...m, { role: 'ai', text: data.response, provider: data.provider }])
      } else {
        setMessages((m) => [
          ...m,
          { role: 'ai', text: 'All AI services are busy right now. Please try again in a minute.' },
        ])
      }
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: err.message.includes('Failed to fetch')
            ? 'Cannot reach the backend. Make sure FastAPI is running on port 8000.'
            : `Something went wrong: ${err.message}`,
        },
      ])
    } finally {
      setThinking(false)
      scrollToEnd()
    }
  }

  const lineCount = code.split('\n').length

  return (
    <div className="flex h-screen flex-col">
      {/* topbar */}
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface px-4 py-2.5">
        <span className="rounded-md border border-border-subtle bg-elevated px-3 py-1 font-mono text-xs font-medium text-secondary-text">
          main.py
        </span>
        <select
          className="ml-auto cursor-pointer rounded-md border border-border-strong bg-input px-2 py-1 font-mono text-xs text-primary-text outline-none focus:border-accent"
          defaultValue="Python"
        >
          <option>Python</option>
        </select>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ── CODE PANEL ── */}
        <div className="flex w-1/2 min-w-0 flex-col border-r border-border-subtle bg-surface/70 backdrop-blur-sm">
          <div className="relative flex-1 overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 select-none border-r border-border-subtle bg-surface/40 pt-4 text-right font-mono text-xs leading-6 text-muted">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="pr-2">{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="h-full w-full resize-none bg-transparent py-4 pl-12 pr-4 font-mono text-[13px] leading-6 text-primary-text outline-none"
            />
          </div>

          <div className="border-t border-border-subtle bg-surface/40 px-4 py-2.5">
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
              Custom input (stdin)
            </p>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Enter custom inputs here before clicking Run..."
              className="h-14 w-full resize-none rounded-md border border-border-subtle bg-black/20 px-2 py-1.5 font-mono text-xs text-secondary-text outline-none focus:border-accent"
            />
          </div>

          {/* output bar */}
          {output && (
            <div
              className={`max-h-40 overflow-auto border-t px-4 py-3 font-mono text-xs ${
                output.ok
                  ? 'border-success/20 bg-success/5 text-success'
                  : 'border-error/20 bg-error/[0.07] text-error'
              }`}
            >
              <pre className="whitespace-pre-wrap">{output.text}</pre>
            </div>
          )}

          {/* actions */}
          <div className="flex items-center gap-3 border-t border-border-subtle bg-surface px-4 py-2.5">
            <Button variant="green" size="sm" onClick={runCode} loading={running}>
              {!running && <Play size={13} />} Run
            </Button>

            <div className="flex gap-1 rounded-lg bg-elevated p-0.5">
              {MODES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-mono text-[11px] transition-all ${
                    mode === key ? 'bg-accent text-white' : 'text-secondary-text hover:text-primary-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="ml-auto font-mono text-[11px] text-muted">// mode: {mode}</span>
          </div>
        </div>

        {/* ── AI PANEL ── */}
        <div className="flex w-1/2 min-w-0 flex-col bg-surface/30">
          <div className="flex items-center gap-2 border-b border-border-subtle bg-surface/60 px-4 py-2.5 backdrop-blur">
            <Sparkles size={15} className="text-accent2" />
            <span className="font-header text-sm font-bold text-primary-text">CodeGuru AI</span>

            <div className="ml-auto flex gap-1">
              {LANGS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setAiLang(key)}
                  className={`cursor-pointer rounded-md px-2 py-0.5 font-mono text-[11px] transition-all ${
                    aiLang === key ? 'bg-accent/20 text-accent2 ring-1 ring-accent/40' : 'text-muted hover:text-secondary-text'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* messages */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-tr-sm border border-accent/25 bg-accent-glow text-primary-text'
                      : 'rounded-tl-sm border border-border-subtle bg-elevated text-primary-text'
                  }`}
                >
                  {m.role === 'ai' && m.provider && (
                    <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-accent2">
                      CodeGuru • via {m.provider} • {aiLang}
                    </div>
                  )}
                  <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-xl rounded-tl-sm border border-border-subtle bg-elevated px-3.5 py-2.5 font-mono text-xs italic text-muted">
                  CodeGuru is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* input */}
          <div className="flex gap-2.5 border-t border-border-subtle bg-surface/60 p-3 backdrop-blur">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={
                mode === 'debug'
                  ? 'Paste the error message here...'
                  : mode === 'generate'
                    ? 'Describe what to build...'
                    : 'Ask your doubt... (any language)'
              }
              className="flex-1 rounded-lg border border-border-strong bg-input px-3.5 py-2.5 font-sans text-[13px] text-primary-text outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <button
              onClick={send}
              disabled={thinking}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-accent text-white shadow-[0_0_16px_rgba(124,106,255,0.35)] transition-all hover:bg-accent-hover disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
