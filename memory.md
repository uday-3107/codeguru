# CodeGuru — Project Memory

## Overview

CodeGuru is a full-stack AI-powered coding tutor platform for Indian CS students. **FastAPI backend** (professional `app/` package) + **React/Vite/TypeScript frontend** (`frontend/`). Uses a fallback chain across 5 AI providers so if one hits a rate limit, the next is tried automatically.

Planning docs live at repo root: `prd.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.10+, FastAPI, Uvicorn |
| Database | SQLite via SQLAlchemy ORM |
| AI Providers | Groq (primary), Gemini, Cerebras, Mistral, OpenRouter |
| Code Execution | Local subprocess (Python/Java/C++), mock for JS |
| Auth | bcrypt password hashing, JWT (python-jose, HS256) |
| Frontend | React 18 + Vite + TypeScript (SPA in `frontend/`) |
| Styling | Tailwind CSS v4 + CSS variable design tokens |
| State | TanStack Query (planned), zustand (installed) |
| Icons | lucide-react (emojis banned per rules.md) |
| HTTP Client | httpx (backend AI calls) |

---

## Project Structure

```
codeguru/
├── app/
│   ├── main.py               # FastAPI app factory, CORS, middleware, router registration
│   ├── database.py           # Engine, SessionLocal, Base, get_db dependency
│   ├── models.py             # User, Feedback, Activity, Room
│   ├── core/
│   │   ├── config.py         # All settings from .env (keys, models, FALLBACK_ORDER,
│   │   │                     #   JWT_SECRET w/ env override, DATABASE_URL anchored to root,
│   │   │                     #   CORS_ORIGINS, MOCK_MODE)
│   │   ├── security.py       # bcrypt hash/verify + JWT encode/decode
│   │   └── deps.py           # oauth2_scheme + get_current_user shared dependency
│   ├── schemas/              # Pydantic models: auth, chat, debug, explain, generate,
│   │   │                     #   feedback, mock_interview, run
│   ├── routers/              # 14 route modules (auth, chat, company, debug, explain,
│   │   │                     #   feedback, generate, health, mock_interview, practice,
│   │   │                     #   rooms, run, syllabus, user)
│   ├── services/
│   │   └── ai_engine.py      # Provider callers + fallback chain + prompt builder
│   └── utils/
│       └── user_utils.py     # Activity seeding helper
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Router: public (/ , /login) + shell pages
│   │   ├── index.css         # Tailwind v4 @theme tokens (light default + .theme-dark scope)
│   │   ├── lib/api.ts        # fetch client, JWT storage (guru_token/guru_user keys)
│   │   ├── components/       # AppShell.tsx (sidebar), ui.tsx (Card/Button/inputs)
│   │   └── pages/            # Landing, Login, Chat, Practice, Syllabus, Rooms,
│   │                         #   Company, Interview, Profile
│   ├── vite.config.ts        # React + Tailwind plugins, /api proxy -> localhost:8000
│   └── package.json
├── data/problems.json        # Practice problem bank (3 problems currently)
├── static/index.html         # LEGACY single-file frontend (3276 lines) - kept as reference
├── scripts/
│   ├── check_models.py       # List available models across all providers
│   └── test_gemini.py        # Gemini connectivity smoke test
├── prd.md / architecture.md / rules.md / phases.md / design.md
├── .env.example              # Template for all env vars
├── requirements.txt          # Complete (fastapi, uvicorn, httpx, dotenv, sqlalchemy,
│                             #   bcrypt, python-jose[cryptography], email-validator)
├── .gitignore                # Secrets, caches, builds, node_modules, DB artifacts
└── memory.md                 # This file
```

**Run commands** (user runs backend via conda base `/opt/anaconda3/bin/python3`, no venv):

```bash
# Backend
/opt/anaconda3/bin/python3 -m uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev    # http://localhost:5173, proxies /api -> :8000
```

---

## Frontend Pages (React SPA)

| Route | Page | Status | Wired To |
|-------|------|--------|----------|
| `/` | Landing | Done - dark theme, ported from legacy design, lucide icons | - |
| `/login` | Auth tabs + live password checklist | Done | `/api/auth/*` |
| `/chat` | Code editor (dark panel) + AI tutor panel, mode pills, language switcher, Run + STDIN | Done | all AI endpoints + `/api/run` |
| `/practice` | Category filter tabs + difficulty cards | Done | `/api/practice/problems` |
| `/syllabus` | University dropdown -> year cards | Done | `/api/syllabus/*` |
| `/rooms` | Create/join room, click-to-copy code | Done | `/api/rooms/*` |
| `/company` | Company grid -> rounds + questions detail | Done | `/api/company/*` |
| `/interview` | Role/company/stage setup -> Q&A chat (camera deferred) | Done | `/api/mock-interview/*` |
| `/profile` | Avatar card, stats, 26-week heatmap, logout | Done | `/api/user/profile`, `/api/user/activity` |

### Theme system (design decision - locked)

- **Dark landing + light app.** One token system in `index.css`.
- Default tokens = light "Warm Paper" (Claude-style): bg `#faf9f5`, white cards, warm-brown text `#35322a`, accent `#6250e0`.
- `.theme-dark` class re-scopes all variables to the dark landing palette (bg `#0a0a0f`, accent `#7c6aff`).
- Landing page + code editor panels carry `.theme-dark`; everything else inherits light.
- Fonts: Inter (UI), Geist (headings), Geist Mono/JetBrains Mono (code).

---

## API Endpoints

22 endpoints under `/api` - see `architecture.md` section 8 or `README.md` API Reference for the full table. All verified working (health, auth round-trip, run, practice/syllabus/company, rooms, interview tested via TestClient).

---

## Database Schema (SQLite)

Same 4 tables: `users`, `feedbacks`, `activities`, `rooms`. Note: `users.avatar` default is now `""` (was an emoji). Tables auto-created via `create_all()` on startup; DB file anchored at project root regardless of CWD.

---

## AI Provider Fallback Chain

Order: **Groq → Gemini → Cerebras → Mistral → OpenRouter** (configurable via `FALLBACK_ORDER` in `app/core/config.py`).

| Provider | Model | Key |
|----------|-------|-----|
| Groq | `llama-3.3-70b-versatile` | `GROQ_API_KEY` |
| Gemini | `gemini-2.5-flash` | `GEMINI_API_KEY` |
| Cerebras | `llama3.1-8b` | `CEREBRAS_API_KEY` |
| Mistral | `codestral-latest` | `MISTRAL_API_KEY` |
| OpenRouter | `openrouter/free` | `OPENROUTER_API_KEY` |

AI modes: chat, explain, debug, generate, socratic. Languages: english, hindi, telugu, tamil, marathi, hinglish.

---

## Auth System

- bcrypt hashing, JWT HS256, 7-day expiry
- `JWT_SECRET` read from `.env` if set; auto-generated fallback (set it explicitly so tokens survive restarts)
- Token payload: `{ sub: username, user_id }`
- Shared `get_current_user` dependency lives in `app/core/deps.py`
- Frontend stores token/user in localStorage (`guru_token`, `guru_user`); api.ts clears on 401

---

## Session History

### Session: Restructure + Full Frontend Build (latest)

1. **Backend restructure** - moved to `app/` package layout, fixed all imports, extracted schemas, shared deps into `core/deps.py`, config via `.env`, deleted legacy dirs/files, verified all 22 endpoints.
2. **Emoji purge** - removed from all Python code, logs, API responses; replaced landing feature icons with lucide-react.
3. **Docs authored** - prd/architecture/rules/phases/design markdown files; professional README; expanded .gitignore.
4. **Frontend built from scratch** - Vite+React+TS scaffold, Tailwind v4, tokens, dark landing ported 1:1 from legacy HTML, then all 9 app pages built and wired to real backend via Vite proxy.
5. **Theme finalized** - user rejected all-dark; locked "dark landing + Warm Paper light app" split; polished light theme (solid cards, layered shadows, themed scrollbar/selection, removed muddy blobs behind light UI).

### Earlier sessions
- API keys moved from hardcoded `config/keys.py` to `.env`
- Multi-agent architecture discussion (see below) - planning doc produced in `phases.md` Phase 5-8

---

## Known Issues & Technical Debt

### Still open
- Code execution via subprocess with no sandbox - security risk before public scale
- No rate limiting on any endpoint
- Only 3 practice problems; syllabus data hardcoded (3 unis, 1 branch); company data minimal
- Zero automated tests, no CI/CD, no Alembic migrations
- JS execution returns mocked output
- Landing advertises Photo-to-Code, Voice Doubts, Google OAuth - not implemented
- Study rooms are REST-only (no WebSocket realtime)
- Camera monitoring in mock interview intentionally skipped in React rebuild
- Legacy `static/index.html` still served by backend at `/` when present - decide when to remove

### Resolved this session
- ~~requirements.txt incomplete~~ (added sqlalchemy, bcrypt, python-jose, email-validator)
- ~~JWT secret regenerates every restart~~ (now reads JWT_SECRET from env)
- ~~Monolithic 3276-line frontend~~ (React SPA built; legacy file kept only as reference)
- ~~alert() error handling~~ (proper inline errors/toasts in new UI)
- ~~avatar default was emoji~~ (empty string)
- ~~CORS hardwired to *~~ (configurable via CORS_ORIGINS)

---

## Next Steps (per phases.md)

1. Polish pass on light theme based on usage feedback
2. SSE streaming endpoint (`/api/chat/stream`) + frontend consumption
3. Session/conversation persistence
4. Agent foundation (Phase 5): refactor `ask_ai()` -> `llm_call()` primitive + orchestrator
5. More practice problems + real syllabus data pipeline
6. pytest test suite

---

## Multi-Agent Plan (approved direction)

8 agents planned: Orchestrator (Groq, intent routing), Explainer (Gemini), Socratic Coach, Generator, Debugger (Codestral + runner tool loop), Interviewer (OpenRouter), Practice Agent, Progress Tracker (DB logic). Fallback chain remains infrastructure under every agent. Full plan in conversation + `architecture.md` section 6; build order in `phases.md` Phases 5-8. Not yet started - foundation phase begins after frontend stabilizes.
