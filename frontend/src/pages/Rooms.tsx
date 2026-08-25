import { useState } from 'react'
import { Copy, LogIn, Plus } from 'lucide-react'
import { api, getUser } from '../lib/api'
import { Button, Card, EmptyState, ErrorText, ModuleHeader, inputCls } from '../components/ui'

interface RoomState {
  roomId: string
  members: string[]
}

export default function Rooms() {
  const [room, setRoom] = useState<RoomState | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'create' | 'join' | null>(null)
  const [copied, setCopied] = useState(false)

  async function create() {
    setError(null)
    setLoading('create')
    try {
      const data = await api.post(`/api/rooms/create?owner=${encodeURIComponent(getUser() || 'Anonymous')}`)
      setRoom({ roomId: data.room_id, members: [getUser() || 'Anonymous'] })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  async function join() {
    const code = joinCode.trim()
    if (!code) return
    setError(null)
    setLoading('join')
    try {
      const data = await api.post(`/api/rooms/${code}/join?user=${encodeURIComponent(getUser() || 'Anonymous')}`)
      setRoom({ roomId: code, members: data.members })
    } catch (e: any) {
      setError(e.message.includes('not found') ? 'Room not found. Check the code.' : e.message)
    } finally {
      setLoading(null)
    }
  }

  function copyCode() {
    if (!room) return
    navigator.clipboard.writeText(room.roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mx-auto max-w-3xl p-10">
      <ModuleHeader title="Study Rooms" subtitle="collaborate and learn with your friends" />

      <Card className="mb-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={create} loading={loading === 'create'}>
            {!loading && <Plus size={14} />} Create New Room
          </Button>
          <span className="font-mono text-xs text-muted">— or —</span>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && join()}
            placeholder="Enter room code"
            className={`${inputCls} max-w-[200px]`}
          />
          <Button variant="ghost" onClick={join} loading={loading === 'join'}>
            {!loading && <LogIn size={14} />} Join
          </Button>
        </div>
        <ErrorText message={error} />
      </Card>

      {room ? (
        <Card className="p-10 text-center">
          <p className="font-header text-lg font-bold text-primary-text">
            {room.members.length > 1 ? 'Joined Room' : 'Your Private Room is Ready'}
          </p>

          <button
            onClick={copyCode}
            className="group mx-auto mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 px-6 py-3 transition-all hover:border-accent/60"
            title="Click to copy"
          >
            <span className="font-mono text-2xl font-extrabold tracking-[0.2em] text-accent">{room.roomId}</span>
            <Copy size={15} className={`transition-colors ${copied ? 'text-success' : 'text-muted group-hover:text-accent2'}`} />
          </button>
          <p className="mt-2 font-mono text-[11px] text-success">{copied ? 'Copied to clipboard' : 'Click the code to copy'}</p>

          <p className="mx-auto mt-5 max-w-sm font-mono text-xs leading-relaxed text-secondary-text">
            Share this code with your friends. Members:{' '}
            <span className="text-accent2">{room.members.join(', ')}</span>
          </p>
        </Card>
      ) : (
        !error && <EmptyState message="Create a room to start collaborating." />
      )}
    </div>
  )
}
