import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Users,
  Building2,
  Mic2,
  User,
} from 'lucide-react'

const navItems = [
  { label: 'Chat', icon: MessageSquare, href: '/chat' },
  { label: 'Practice', icon: BookOpen, href: '/practice' },
  { label: 'Syllabus', icon: GraduationCap, href: '/syllabus' },
  { label: 'Rooms', icon: Users, href: '/rooms' },
  { label: 'Company Prep', icon: Building2, href: '/company' },
  { label: 'Interview', icon: Mic2, href: '/interview' },
  { label: 'Profile', icon: User, href: '/profile' },
]

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-base">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border-subtle bg-surface">
        <div className="px-5 py-5">
          <Link to="/" className="font-mono text-lg font-bold tracking-tight text-primary-text">
            Code<span className="text-accent">Guru</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map(({ label, icon: Icon, href }) => (
            <NavLink
              key={label}
              to={href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-accent/10 font-semibold text-accent2'
                    : 'text-secondary-text hover:bg-elevated hover:text-primary-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-accent2' : 'text-muted'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-subtle p-4">
          <p className="font-mono text-[11px] leading-relaxed text-muted">
            AI teacher for Indian students
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">{<Outlet />}</main>
    </div>
  )
}
