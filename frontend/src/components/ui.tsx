import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export function ModuleHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent">// {subtitle}</p>
      <h2 className="mt-2 font-header text-3xl font-extrabold tracking-tight text-primary-text">{title}</h2>
    </div>
  )
}

export function Card({
  children,
  className = '',
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-surface/70 backdrop-blur-sm ${
        hover
          ? 'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-surface'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

type BtnVariant = 'primary' | 'ghost' | 'green' | 'danger'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}: {
  children: ReactNode
  variant?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer'
  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2 text-[13px]',
    lg: 'px-7 py-3 text-[15px] rounded-xl',
  }
  const variants = {
    primary: 'bg-accent text-white shadow-[0_0_20px_rgba(124,106,255,0.3)] hover:bg-accent-hover hover:-translate-y-px',
    ghost: 'border border-border-strong bg-transparent text-secondary-text hover:bg-elevated hover:text-primary-text',
    green: 'bg-success text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:opacity-90',
    danger: 'border border-error/30 bg-transparent text-error hover:bg-error/5',
  }
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

export const inputCls =
  'w-full rounded-lg border border-border-strong bg-input px-3.5 py-2.5 font-mono text-[13px] text-primary-text outline-none transition-colors placeholder:text-muted focus:border-accent'

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle p-16 text-center font-mono text-sm text-muted">
      {message}
    </div>
  )
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="rounded-lg border border-error/25 bg-error/10 px-4 py-2.5 font-mono text-xs text-error">
      {message}
    </p>
  )
}
