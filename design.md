# Design — CodeGuru Design System

Visual language for the CodeGuru SPA. Reference standard: the calm, focused interfaces of ChatGPT, Gemini, and Claude — content first, chrome invisible.

---

## 1. Design Principles

1. **Content is the interface** — the AI answer is the hero; UI recedes.
2. **Calm dark by default** — students use this at night in hostels; dark-first, low-glare.
3. **One accent, used sparingly** — color signals interaction and brand moments only.
4. **Language is a first-class control** — the language selector is always visible, never buried.
5. **Mobile-thumb friendly** — composer reachable one-handed; sidebar becomes a drawer.

---

## 2. Color System

Tokens are CSS variables; every component consumes tokens, never raw hex.

### Dark Theme (default)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#0F1117` | App background |
| `--bg-surface` | `#161A22` | Sidebar, cards, panels |
| `--bg-elevated` | `#1E2330` | Modals, dropdowns, hover surfaces |
| `--bg-input` | `#12151D` | Composer/input wells |
| `--border-subtle` | `#232936` | Dividers, input borders |
| `--text-primary` | `#E8EAED` | Headings, message text |
| `--text-secondary` | `#A6ADBB` | Meta labels, timestamps |
| `--text-muted` | `#5F6774` | Placeholders, disabled |
| `--accent` | `#7C5CFC` | Primary buttons, links, active states (brand indigo-violet) |
| `--accent-hover` | `#8F75FF` | Hover on primary |
| `--accent-soft` | `rgba(124,92,252,0.14)` | Selected rows, focus tints |
| `--code-bg` | `#0B0E14` | Code blocks |
| `--success` | `#34D399` | Run output success, streaks |
| `--warning` | `#FBBF24` | Rate-limit notices |
| `--error` | `#F87171` | Errors, destructive actions |

### Light Theme

| Token | Hex |
|-------|-----|
| `--bg-base` | `#FAFAFB` |
| `--bg-surface` | `#FFFFFF` |
| `--bg-elevated` | `#F3F4F8` |
| `--bg-input` | `#FFFFFF` |
| `--border-subtle` | `#E5E7EE` |
| `--text-primary` | `#171923` |
| `--text-secondary` | `#5B6472` |
| `--text-muted` | `#98A1AF` |
| `--accent` | `#6244E5` |
| `--accent-hover` | `#5538DB` |
| `--code-bg` | `#F6F7FB` |

### Gradients (brand moments only)

- Landing hero / logo mark: `linear-gradient(135deg, #7C5CFC, #38BDF8)` — never inside app chrome.

### Rules

- Never introduce a new hue outside this table without adding it here first.
- Accent covers < 10% of any screen.
- Semantic colors (`success/warning/error`) never used decoratively.

---

## 3. Typography

### Font stack

| Role | Font | Fallback |
|------|------|----------|
| UI + headings | **Inter** (variable) | system-ui, -apple-system, Segoe UI, sans-serif |
| Code | **JetBrains Mono** | ui-monospace, SFMono-Regular, Menlo, monospace |
| Indic scripts | **Noto Sans Devanagari / Telugu / Tamil** auto-fallback via Noto family | required so Hindi/Telugu/Tamil answers render cleanly |

Load Inter and JetBrains Mono as variable woff2 subsets; enable `font-display: swap`.

### Type Scale (px / rem)

| Token | Size | Weight | Line height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 36 / 2.25rem | 700 | 1.15 | Landing hero only |
| `h1` | 30 / 1.875rem | 700 | 1.2 | Page titles |
| `h2` | 24 / 1.5rem | 600 | 1.25 | Section titles |
| `h3` | 20 / 1.25rem | 600 | 1.3 | Card titles, interview question |
| `body-lg` | 16 / 1rem | 400 | 1.6 | AI answers (readability at length) |
| `body` | 14 / 0.875rem | 400 | 1.55 | Default UI text, sidebar |
| `small` | 13 / 0.8125rem | 400 | 1.45 | Secondary meta |
| `caption` | 12 / 0.75rem | 500 | 1.35 | Timestamps, provider badge, uppercase labels (tracking +0.04em) |
| `code` | 13.5 / 0.84375rem | 400 | 1.65 | Inline + block code |

### Rules

- Message body always `body-lg`; never shrink AI answers below 15px equivalent.
- Headings use -0.01em letter-spacing; body uses default; captions uppercase with wide tracking.
- Max line length for reading text: ~70ch.

---

## 4. Spacing, Radius, Elevation

### Spacing (4px grid)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64` — use Tailwind equivalents (`space-1`..`space-16`). Chat column horizontal padding: 24px desktop, 16px mobile.

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 6px | Tags, badges, inline code |
| `radius-md` | 10px | Buttons, inputs |
| `radius-lg` | 14px | Cards, code blocks |
| `radius-xl` | 20px | Modals, composer container |
| `radius-full` | 9999px | Avatars, language pills |

### Elevation

Dark theme relies on surface contrast, not shadows:

- `shadow-1`: `0 1px 2px rgba(0,0,0,0.4)` — cards
- `shadow-2`: `0 8px 24px rgba(0,0,0,0.5)` — modals, drawers
- Light theme halves opacity of both.

Borders (`--border-subtle`) preferred over shadows for separating flat regions.

---

## 5. Core Component Specs

| Component | Spec |
|-----------|------|
| **Sidebar** | 264px expanded / 64px icon rail; `--bg-surface`; active item = `--accent-soft` bg + `--accent` icon |
| **Chat message (user)** | Right-aligned bubble, `--accent-soft` bg, `radius-xl` with 6px top-right corner |
| **Chat message (AI)** | Full-width, no bubble; avatar dot + provider caption above markdown body |
| **Composer** | Sticky bottom, `--bg-input`, `radius-xl`, auto-grow to max 200px; Enter=send, Shift+Enter=newline |
| **Language pill** | `radius-full`, border `--border-subtle`; selected = `--accent-soft` + `--accent` text |
| **Code block** | `--code-bg`, `radius-lg`, header row with language label + copy button (lucide icons) |
| **Buttons** | Primary: `--accent` bg white text; Secondary: transparent + border; Destructive: `--error`. Height 36px (sm 32px); all states defined |
| **Inputs** | `--bg-input` bg, `--border-subtle` border, focus ring 2px `--accent-soft` + 1px `--accent` |
| **Toasts** | Top-right, `--bg-elevated`, semantic left border 3px, auto-dismiss 4s |
| **Skeletons** | `--bg-elevated` blocks with subtle pulse; never spinners on blank screens |

Icons exclusively from **lucide-react**, 18px default / 16px in dense lists — emoji characters are banned per `rules.md`.

---

## 6. Layout Metrics

- Chat/content column: max-width 768px centered.
- Sidebar: 264px; collapses under 1024px to drawer with overlay scrim.
- Composer max-width matches chat column; safe-area padding on iOS bottom inset.
- Touch targets minimum 44px on mobile.

---

## 7. Motion

- Durations: 120ms (hover/focus), 180ms (menus/drawer), 240ms (route fade).
- Streaming text appears token-wise with smooth scroll pinned to bottom unless user scrolled up (show "jump to latest" chip).
- Respect `prefers-reduced-motion`: disable pulses/transitions.

---

## 8. Accessibility Checklist

- WCAG AA contrast verified for every token pair used together (all pairs in tables above pass).
- Visible focus ring on all interactive elements (never `outline: none` without replacement).
- Full keyboard flow: Tab order logical; Cmd/Ctrl+K command palette planned post-launch.
- Screen-reader labels on icon-only buttons; `aria-live="polite"` region for streamed answers.
- Both themes tested on low-brightness OLED and cheap LCD panels.
