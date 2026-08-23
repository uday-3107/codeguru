# Architecture — CodeGuru System Design

Version: 1.0 | Companion docs: `prd.md`, `rules.md`, `phases.md`, `design.md`

---

## 1. High-Level Topology (target state)

```
┌─────────────────────┐         ┌──────────────────────────────┐
│  Frontend SPA       │  HTTPS  │  Backend API                 │
│  React + Vite       │────────▶│  FastAPI (uvicorn)           │
│  (Vercel)           │  /api/* │  (Render / PythonAnywhere)   │
└─────────────────────┘         └───────┬──────────┬───────────┘
                                        │          │
                          ┌─────────────▼──┐   ┌───▼────────┐
                          │ Agent Layer    │   │ SQLite DB  │
                          │ (orchestrator  │   │ codeguru.db│
                          │ + specialists) │   │ users, rooms│
                          └───────┬────────┘   │ activities │
                                  │            └────────────┘
                ┌─────────┬───────┼────────┬──────────┐
                ▼         ▼       ▼        ▼          ▼
             Groq      Gemini  Cerebras  Mistral   OpenRouter
             (fallback chain: try in order, failover on error)
```

- **Frontend**: SPA served from Vercel; talks only to `/api/*`.
- **Backend**: pure JSON API; also serves `static/` assets if present (legacy mode).
- **Agent layer** (v2): sits between routers and the AI engine; every LLM call still flows through the provider fallback chain.

---

## 2. Request Flows

### 2.1 Chat request (current, v1)

```
POST /api/chat {message, language, mode, code}
  → routers/chat.py validates via schemas/chat.py
  → services/ai_engine.ask_ai():
        build system prompt (mode instructions + language rule)
        for provider in FALLBACK_ORDER:
            try call_provider(...) → success → return {response, provider, success}
            catch HTTPStatusError / Timeout / Exception → next provider
  → response JSON to client
```

### 2.2 Auth flow

```
POST /api/auth/signup {username, email, password}
  → schema validation (@gmail.com, password rules)
  → core/security.get_password_hash (bcrypt)
  → insert user → create_access_token(JWT, sub=username, exp=7d)
  → {access_token, token_type}

Protected routes:
  Authorization: Bearer <jwt>
  → core/deps.get_current_user decodes token, loads User from DB (or None)
```

### 2.3 Debug flow with agents (v2 target)

```
POST /api/debug {code, error?, language}
  → Orchestrator classifies intent → Debugger agent
  → Debugger loop (max 3):
        propose fix → tools.run_code(fixed_code) → stderr clean?
  → Explainer agent writes student-facing explanation in chosen language
  → merged response: verified fix + lesson
```

---

## 3. Backend Folder Structure (current)

```
codeguru/
├── app/
│   ├── main.py               # FastAPI app, CORS, middleware, router registration
│   ├── database.py           # engine, SessionLocal, Base, get_db dependency
│   ├── models.py             # ORM: User, Feedback, Activity, Room
│   ├── core/
│   │   ├── config.py         # all settings from .env (keys, models, fallback order,
│   │   │                     #   JWT_SECRET, DATABASE_URL, CORS_ORIGINS)
│   │   ├── security.py       # bcrypt hash/verify, JWT encode/decode
│   │   └── deps.py           # oauth2_scheme + get_current_user shared dependency
│   ├── schemas/              # Pydantic request/response models per feature
│   ├── routers/              # 14 route modules (thin: validate → delegate → respond)
│   ├── services/
│   │   └── ai_engine.py      # provider callers + fallback chain + prompt builder
│   └── utils/
│       └── user_utils.py     # activity seeding helper
├── data/problems.json        # practice problem bank
├── scripts/                  # check_models.py, test_gemini.py utilities
├── static/                   # legacy single-page frontend (being replaced)
├── .env.example              # template for all env vars
├── requirements.txt
├── prd.md architecture.md rules.md phases.md design.md
```

### Planned additions (v2)

```
app/
├── agents/
│   ├── base.py               # BaseAgent: llm_call wrapper, retry/timeout policy
│   ├── orchestrator.py       # intent classification + routing
│   ├── explainer.py debugger.py socratic.py generator.py
│   ├── interviewer.py practice.py progress.py
│   └── prompts/              # one file per agent's system prompts
├── services/
│   ├── ai_engine.py          # becomes low-level llm_call primitive used by agents
│   ├── session_store.py      # conversation/session state persistence
│   └── runner.py             # extracted code-execution logic (tool-callable)
frontend/                     # separate SPA workspace (React + Vite)
```

---

## 4. Data Model

```
users(id PK, username UNIQUE, email UNIQUE, hashed_password, joined_at, bio, avatar)
feedbacks(id PK, message, created_at, user_id FK→users.id NULLABLE)
activities(id PK, date TEXT 'YYYY-MM-DD', count INT, user_id FK→users.id)     # heatmap
rooms(id PK, room_id UNIQUE 8-char, owner TEXT, code TEXT, members JSON list)

planned:
sessions(id PK, session_id UNIQUE, user_id FK NULLABLE, messages JSON,
         language, weak_topics JSON, created_at, updated_at)                  # v2 memory
interview_reports(id PK, session_id, role, company, stage, scores JSON,
                  report TEXT, created_at)                                    # v2
```

SQLite for v1/v2 (zero-ops). Migration path documented but deferred: swap `DATABASE_URL` to Postgres when concurrency demands it.

---

## 5. AI Provider Fallback Chain

```
FALLBACK_ORDER = [groq, gemini, cerebras, mistral, openrouter]
```

| Provider | Role | Strength |
|----------|------|----------|
| Groq | Primary | Fastest tokens/sec, good Hindi/Telugu |
| Gemini | Secondary | Best multilingual quality |
| Cerebras | Tertiary | Ultra-fast backup |
| Mistral | Quaternary | Codestral for code tasks |
| OpenRouter | Last resort | Free-model pool |

Rules (enforced in `ai_engine.py`):
- Each call: timeout 30s, max_tokens 1024, temperature 0.7
- Failover triggers: HTTPStatusError (429 rate limit, 401 bad key), TimeoutException, any Exception
- Response always reports which `provider` answered; total failure returns friendly retry message with `success: False`
- All five model strings live in `core/config.py` only

---

## 6. Multi-Agent Design (v2)

8 agents, each = system prompt + backing model + optional tools:

| Agent | Backing model | Tools | Consumed by |
|-------|--------------|-------|-------------|
| Orchestrator | Groq (fast) | none | every chat-family request |
| Explainer | Gemini | none | explain intent |
| Socratic Coach | Groq | session history | socratic intent |
| Generator | Cerebras/Groq | none | generate intent |
| Debugger | Codestral | `tools.run_code` | debug intent |
| Interviewer | OpenRouter | session history | mock-interview routes |
| Practice | Groq | problems bank, run_code | practice routes |
| Progress Tracker | none (DB queries first) | activities table | orchestrator context |

Orchestration contract: Orchestrator emits strict JSON `{intent, language, topic}` → router dispatches → specialists return text → response merges and tags agents involved. Every specialist inherits BaseAgent policies (timeout, retries, fallback).

---

## 7. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| API framework | FastAPI + Uvicorn | async-first |
| Validation | Pydantic v2 | schemas separated from ORM models |
| Database | SQLite + SQLAlchemy 2.x | Postgres-ready via DATABASE_URL |
| Auth | python-jose JWT + bcrypt | 7-day expiry |
| AI access | httpx.AsyncClient | one client per call; timeouts mandatory |
| Config | python-dotenv + `.env` | single source: `app/core/config.py` |
| Frontend | React 18 + Vite + TypeScript | SPA in `frontend/` |
| Styling | Tailwind CSS + design tokens (`design.md`) | dark theme default |
| Components | shadcn/ui patterns, Radix primitives, lucide-react icons | no emoji icons |
| Editor | CodeMirror 6 | replaces textarea in run/practice views |
| Markdown | react-markdown + Shiki | AI answer rendering |
| State | TanStack Query (server) + Zustand (UI) | |
| Hosting | Vercel (web) + Render or PythonAnywhere (API) | start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000` |

---

## 8. Environment & Configuration

Single source of truth: `app/core/config.py` reading `.env` (template: `.env.example`).

| Var | Purpose |
|-----|---------|
| GEMINI/GROQ/CEREBRAS/MISTRAL/OPENROUTER_API_KEY | provider keys |
| JWT_SECRET | signing key (set explicitly in prod) |
| DATABASE_URL | default sqlite at project root |
| CORS_ORIGINS | comma-separated allowlist (`*` dev only) |
| MOCK_MODE | true → canned responses, zero cost, safe demos/tests |

Frontend config: `VITE_API_BASE_URL` pointing at backend origin per environment.
