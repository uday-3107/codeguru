import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export function ModuleHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
        // {subtitle}
      </p>
      <h2 className="mt-2 font-header text-3xl font-extrabold tracking-[-0.02em] text-primary-text">
        {title}
      </h2>
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
      className={`rounded-2xl border border-border-subtle bg-surface shadow-[var(--shadow-card)] ${
        hover
          ? 'cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[var(--shadow-card-hover)]'
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
    primary:
      'bg-accent text-white shadow-[0_1px_2px_rgba(53,50,42,0.1),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-accent-hover hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(98,80,224,0.3)]',
    ghost:
      'border border-border-strong bg-surface text-secondary-text shadow-[0_1px_2px_rgba(53,50,42,0.04)] hover:border-accent/40 hover:text-primary-text',
    green:
      'bg-success text-white shadow-[0_1px_2px_rgba(53,50,42,0.1)] hover:opacity-90 hover:-translate-y-px',
    danger:
      'border border-error/30 bg-surface text-error hover:bg-error/5',
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
  'w-full rounded-lg border border-border-strong bg-input px-3.5 py-2.5 font-mono text-[13px] text-primary-text outline-none transition-all placeholder:text-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-glow)]'

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface/50 p-16 text-center font-mono text-sm text-muted">
      {message}
    </div>
  )
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p className="rounded-lg border border-error/20 bg-error/5 px-4 py-2.5 font-mono text-xs text-error">
      {message}
    </p>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl p-10">{children}</div>
}
