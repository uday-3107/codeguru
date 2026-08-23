# Phases — CodeGuru Build Plan

Sequencing decision (recorded): **frontend first, agents second.** The backend works today; the interface is what blocks users. Agent phases land behind a working UI, and the frontend build produces the primitives (SSE, session state) that agents need anyway.

Each phase has an exit criterion — do not start the next phase until it passes.

---

## Phase 0 — Foundation & Hygiene (done / ongoing)

Goal: a stable, documented base.

Deliverables:
- [x] Professional package layout (`app/` with core/routers/services/schemas)
- [x] Env-driven config + `.env.example`
- [x] All 22 endpoints verified (health, auth flow, run, content routes)
- [x] Docs: `prd.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`

Exit: repo clones clean; `pip install -r requirements.txt` then `uvicorn app.main:app` works on a fresh machine.

---

## Phase 1 — Frontend Foundation (1.5–2 weeks)

Goal: replace the broken single-file frontend with a professional SPA shell.

Deliverables:
- Vite + React + TypeScript scaffold in `frontend/`; Tailwind + design tokens from `design.md`
- App shell: collapsible sidebar (New chat, History, Practice, Rooms, Interview, Profile), centered 768px chat column, sticky composer
- Dark theme default + light toggle via CSS variables
- Auth screens rebuilt: live password-policy checklist, show/hide password, loading states, inline errors
- JWT storage + authenticated client wrapper; route guards
- Landing page ported from current design into tokens

Exit: signup/login/profile round-trips work in the SPA against the existing API; no CSS leakage possible by construction.

---

## Phase 2 — Core Chat Experience (1–1.5 weeks)

Goal: the ChatGPT-grade tutoring loop — the product's heart.

Deliverables:
- Chat view wired to `/api/chat`: markdown rendering, syntax-highlighted code blocks, copy buttons, message actions (copy/regenerate)
- Language selector pill visible in composer (hindi/telugu/tamil/marathi/hinglish/english)
- Mode selector: chat vs socratic
- Skeleton loaders and provider badge ("via Groq")
- Backend: SSE streaming endpoint (`/api/chat/stream`) added to `ai_engine` providers
- Conversation history in local state + session persistence hook

Exit: a first-year student can ask "for loop kya hota hai?" in Telugu and get a streamed, well-rendered answer on mobile.

---

## Phase 3 — Learning Features in the SPA (1.5 weeks)

Goal: full product surface, not just chat.

Deliverables:
- Code editor view (CodeMirror 6) wired to `/api/run`: Python/Java/C++ tabs, stdin box, stdout/stderr panel
- Practice module: problem list, category filter, problem detail with "explain this" -> prefilled chat
- Syllabus browser (university -> year -> subjects)
- Company prep pages
- Profile page: stats + GitHub-style activity heatmap from `/api/user/activity`

Exit: all v1 features usable without touching the legacy static page.

---

## Phase 4 — Study Rooms & Interviews UI (1 week)

Deliverables:
- Rooms: create/join by code, shared editor buffer with polling refresh, member list
- Mock interview flow UI: role/company/stage picker, question card, answer capture, scored evaluation display

Exit: two browsers in one room see consistent state; interview start->answer->evaluation completes end-to-end.

---

## Phase 5 — Multi-Agent Foundation (backend, 1–1.5 weeks)

Goal: infrastructure for intelligence without changing user-visible behavior yet.

Deliverables:
- Refactor `ask_ai()` into generic `llm_call(role_prompt, message)` primitive (fallback chain untouched underneath)
- `app/agents/base.py`: BaseAgent with timeout/retry/degraded-mode policy
- Session store (`sessions` table): messages, language, weak-topics per student
- Orchestrator agent: intent/language/topic classification returning strict JSON; `/api/chat` routed through it with graceful fallback to today's behavior

Exit: same UX as Phase 2, but routing is now dynamic; classification failures never break a request.

---

## Phase 6 — Specialist Agents (1.5 weeks)

Deliverables:
- Explainer, Socratic Coach, Generator extracted from mode-instructions dict into real agents
- Debugger agent with runner tool: propose -> execute via extracted `runner.py` -> read stderr -> retry (max 3) -> hand verified fix to Explainer for the lesson
- Frontend: agent activity steps shown as collapsible "thinking" cards ("Debugging... running your code... verified")

Exit: `/api/debug` responses demonstrably include only fixes that executed successfully.

---

## Phase 7 — Interview Pipeline (1 week)

Deliverables:
- Interviewer -> Evaluator -> Report agent chain over session store
- Persisted per-session reports (scores, topics, improvement areas) surfaced in profile

Exit: a mock interview produces a saved report card the student can revisit.

---

## Phase 8 — Personalization Loop (1.5 weeks)

Deliverables:
- Progress Tracker aggregates Activity/practice results into weak-topic profiles
- Orchestrator consults profiles: adjusts difficulty, prefers Socratic when struggling, recommends practice problems
- Practice Agent grades submissions via run_code and writes Activity rows automatically (streaks reflect real work)

Exit: two different students asking similar questions get measurably adapted experiences.

---

## Phase 9 — Hardening & Launch (1 week)

Deliverables:
- Evaluation harness: golden Q&A set per language/mode, scored before each agent change
- Rate limiting per IP/user; request quotas
- Production CORS allowlist + explicit JWT_SECRET checklist
- Logging module replaces prints; error middleware sanitized for prod
- Render/Vercel deploy verified end-to-end; uptime check on `/api/health`

Exit: launch checklist green; metrics from `prd.md` section 7 begin tracking.
