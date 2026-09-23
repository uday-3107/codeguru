import { Link } from 'react-router-dom'
import { Camera, GraduationCap, Brain, Building2, Mic, Users } from 'lucide-react'
import '../styles/landing.css'

const featureCards = [
  {
    Icon: Camera,
    title: 'Photo → Code',
    text: 'Click a photo of your notebook. AI reads, debugs, explains it instantly.',
    tag: 'Only on CodeGuru',
  },
  {
    Icon: GraduationCap,
    title: 'Syllabus Mode',
    text: "Tied to JNTU, Anna, VTU, Mumbai. AI explains only what's in your exam.",
    tag: 'Only on CodeGuru',
  },
  {
    Icon: Brain,
    title: 'Socratic Learning',
    text: 'AI asks YOU questions first. Forces real understanding — not copy-paste.',
    tag: null,
  },
  {
    Icon: Building2,
    title: 'Company Prep',
    text: 'TCS, Infosys, Wipro, Amazon patterns. Practice what actually gets asked.',
    tag: null,
  },
  {
    Icon: Mic,
    title: 'Voice Doubts',
    text: 'Speak your doubt in Hindi or Telugu. No typing, no English required.',
    tag: 'Only on CodeGuru',
  },
  {
    Icon: Users,
    title: 'Study Rooms',
    text: 'Share a room link. Your whole group sees the same code and AI explanation live.',
    tag: null,
  },
]

const langPills = [
  { label: 'हिंदी', active: true },
  { label: 'తెలుగు', active: true },
  { label: 'தமிழ்', active: true },
  { label: 'मराठी', active: false },
  { label: 'ਪੰਜਾਬੀ', active: false },
  { label: 'ગુજરાતી', active: false },
  { label: 'Hinglish', active: false },
  { label: 'English', active: false },
]

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base text-primary-text">
      {/* Animated background - same as static page */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          filter: 'blur(80px)',
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      >
        <div
          className="blob"
          style={{ top: -100, left: -100, background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
        />
        <div
          className="blob"
          style={{
            bottom: -100,
            right: -100,
            animationDelay: '-5s',
            background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          }}
        />
        <div
          className="blob"
          style={{
            top: '40%',
            left: '50%',
            width: 600,
            height: 600,
            animationDelay: '-10s',
            background: 'radial-gradient(circle, #1e1b4b 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <nav className="landing-nav">
        <div className="logo">
          Code<span>Guru</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#languages">Languages</a>
          <a href="#feedback">Feedback</a>
          <a href="#colleges">For Colleges</a>
        </div>
        <div className="nav-cta">
          <Link to="/login">
            <button className="btn btn-ghost">Sign in</button>
          </Link>
          <Link to="/login">
            <button className="btn btn-primary">Get started free</button>
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          <span className="badge-dot" />
          Built for Indian CS students — in your language
        </div>

        <h1>
          Learn to code.
          <br />
          <em>Actually</em> understand it.
          <br />
          In <span className="hl">Hindi. Telugu. Tamil.</span>
        </h1>

        <p className="hero-sub">
          // AI that teaches like a patient guru — not just fixes your code silently.
        </p>

        <div className="hero-cta">
          <Link to="/login">
            <button className="btn btn-primary btn-lg">Start for free →</button>
          </Link>
          <Link to="/chat">
            <button className="btn btn-ghost btn-lg">Try the editor</button>
          </Link>
        </div>

        <div className="lang-pills" id="languages">
          {langPills.map(({ label, active }) => (
            <span key={label} className={`lang-pill${active ? ' active' : ''}`}>
              {label}
            </span>
          ))}
        </div>

        <div className="demo-window">
          <div className="demo-bar">
            <span className="dot" style={{ background: '#ff5f57' }} />
            <span className="dot" style={{ background: '#febc2e' }} />
            <span className="dot" style={{ background: '#28c840' }} />
            <span
              style={{
                marginLeft: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-muted)',
              }}
            >
              main.py — CodeGuru Editor
            </span>
          </div>
          <div className="demo-body">
            <div className="demo-code">
              <span className="kw">def</span> <span className="fn">find_max</span>(numbers):
              <br />
              &nbsp;&nbsp;max_val = numbers[0]
              <br />
              &nbsp;&nbsp;<span className="kw">for</span> n <span className="kw">in</span> numbers:
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="kw">if</span> n &gt; max_val
              <span style={{ color: 'var(--color-error)', textDecoration: 'underline wavy' }}>⬅</span>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;max_val = n
              <br />
              &nbsp;&nbsp;<span className="kw">return</span> max_val
              <br />
              <br />
              <span style={{ color: 'var(--color-muted)' }}># SyntaxError on line 4</span>
            </div>
            <div className="demo-chat">
              <div className="chat-ai">
                <div className="who">CodeGuru • Hindi mode</div>
                Bhai, line 4 mein <code className="inline-code">if</code> ke baad <strong>colon (:)</strong>{' '}
                missing hai!
                <br />
                <br />
                Python mein har <code className="inline-code">if</code>,{' '}
                <code className="inline-code">for</code>, <code className="inline-code">def</code> ke baad colon
                lagana zaroori hai — ye rule hai.
              </div>
              <div className="chat-user">kyun chahiye colon? samajh nahi aaya</div>
              <div className="chat-ai">
                Socho — colon ek signal hai Python ko: "ab iske andar ka kaam shuru hota hai"
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <p className="section-label">// features</p>
        <h2 className="section-title">
          Everything you need.
          <br />
          Nothing you don't.
        </h2>
        <div className="feat-grid">
          {featureCards.map(({ Icon, title, text, tag }) => (
            <div key={title} className="feat-card">
              <div className="feat-icon">
                <Icon size={28} color="var(--color-accent2)" strokeWidth={1.8} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              {tag && <span className="feat-tag">{tag}</span>}
            </div>
          ))}
        </div>
      </section>

      <section id="feedback" style={{ padding: '60px 40px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <p className="section-label">// feedback</p>
        <h2 className="section-title" style={{ marginBottom: 32 }}>
          Help us improve
        </h2>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16,
            padding: 32,
            textAlign: 'left',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-secondary-text)',
                marginBottom: 8,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.05em',
              }}
            >
              YOUR FEEDBACK
            </label>
            <textarea
              placeholder="Tell us what you think..."
              style={{
                width: '100%',
                background: 'var(--color-elevated)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 9,
                padding: 16,
                color: 'var(--color-primary-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                outline: 'none',
                transition: 'all 0.2s',
                resize: 'vertical',
                minHeight: 120,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,106,255,0.3)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
            Submit Feedback →
          </button>
        </div>
      </section>

      <section
        id="colleges"
        style={{
          padding: '80px 40px',
          textAlign: 'center',
          background: 'linear-gradient(to bottom, transparent, var(--color-elevated))',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h2 className="section-title" style={{ marginBottom: 16, fontSize: 32 }}>
          Bring CodeGuru to your College
        </h2>
        <p
          style={{
            color: 'var(--color-secondary-text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            marginBottom: 32,
            maxWidth: 500,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Get custom syllabus integration, student progress analytics, and private study rooms for your institution.
        </p>
        <button className="btn btn-ghost btn-lg">Contact Education Team</button>
      </section>

      <footer
        style={{
          textAlign: 'center',
          padding: 40,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--color-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          background: 'var(--color-elevated)',
        }}
      >
        © 2025 CodeGuru — Built for 4 million Indian CS students
      </footer>
      </div>
    </div>
  )
}
