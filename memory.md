# CodeGuru — Project Memory

## Overview

CodeGuru is a full-stack AI-powered coding tutor platform for Indian CS students. Built with FastAPI backend + vanilla HTML/CSS/JS frontend (single-page app in `static/index.html`). Uses a fallback chain across 5 AI providers so if one hits a rate limit, the next is tried automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3, FastAPI, Uvicorn |
| Database | SQLite via SQLAlchemy ORM |
| AI Providers | Groq (primary), Gemini, Cerebras, Mistral, OpenRouter |
| Code Execution | Local subprocess (Python/Java/C++), mock for JS |
| Auth | bcrypt password hashing, JWT (python-jose, HS256) |
| Frontend | Vanilla HTML + CSS + JS (monolithic 3276-line file) |
| Styling | Custom CSS variables, dark theme, CSS animations |
| HTTP Client | httpx (AsyncClient for AI calls) |

---

## Project Structure

```
codeguru/
├── main.py                    # App entrypoint — FastAPI server
├── models.py                  # SQLAlchemy models (User, Feedback, Activity, Room)
├── database.py                # DB engine + session config
├── requirements.txt           # Python dependencies
├── memory.md                  # This file — project memory & context
├── .gitignore                 # Git ignore rules
├── .env                       # API keys (gitignored)
├── README.md                  # Old README (needs update)
│
├── config/
│   ├── __init__.py
│   └── keys.py                # Loads API keys from .env via python-dotenv
│
├── utils/
│   ├── ai_engine.py           # Core — fallback chain across 5 AI providers
│   ├── auth_utils.py          # Password hashing + JWT create/decode
│   └── user_utils.py          # Seed activity data for new users
│
├── routes/
│   ├── health.py              # GET  /api/health
│   ├── chat.py                # POST /api/chat
│   ├── debug.py               # POST /api/debug
│   ├── explain.py             # POST /api/explain
│   ├── generate.py            # POST /api/generate
│   ├── run.py                 # POST /api/run (code execution)
│   ├── auth.py                # POST /api/auth/signup, /api/auth/login
│   ├── feedback.py            # POST /api/feedback
│   ├── user.py                # GET  /api/user/profile, /api/user/activity
│   ├── practice.py            # GET  /api/practice/problems
│   ├── syllabus.py            # GET  /api/syllabus/universities, /api/syllabus/{university}
│   ├── company.py             # GET  /api/company/list, /api/company/{name}
│   ├── rooms.py               # POST /api/rooms/create, GET /api/rooms/{id}, POST /api/rooms/{id}/join
│   └── mock_interview.py      # POST /api/mock-interview/start, /api/mock-interview/answer
│
├── data/
│   └── problems.json          # 3 practice problems (hardcoded)
│
├── static/
│   └── index.html             # Entire frontend SPA (~3276 lines)
│
├── test_gemini.py             # Manual smoke test for Gemini API
└── check_models.py            # Diagnostic script to list available models per provider
```

---

## Frontend Pages

| Page ID | Name | Notes |
|---------|------|-------|
| `landing` | Landing | Hero, features, demo window, feedback form, college section |
| `login` | Auth | Login/signup tabs, @gmail.com validation, password rules |
| `dashboard` | Dashboard | Profile card, solved count, streak, ring chart, heatmap, progress bars |
| `editor` | Code Editor | Code textarea, language selector, stdin, Run, AI chat panel with modes |
| `practice` | Problems | Filterable problem cards (Algorithms/Data Structures/SQL) |
| `mock-interview` | Mock Interview | Video feed, AI interviewer, suspicion overlay on tab switch |
| `syllabus` | Syllabus | Uni selector, branch selector, year/subject cards |
| `study-room` | Study Rooms | Create/join by code, member list, shared code area |
| `company-prep` | Company Prep | TCS/Infosys/Wipro/Amazon cards with round details |
| `progress` | Progress | Weekly chart (mock), mock interview scores (mock), progress bars |

---

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | No | Server health + fallback order |
| POST | `/api/chat` | No | General AI chat / Socratic mode |
| POST | `/api/debug` | No | Debug code errors |
| POST | `/api/explain` | No | Explain code like a teacher |
| POST | `/api/generate` | No | Generate code from description |
| POST | `/api/run` | No | Execute Python/Java/C++/JS code |
| POST | `/api/auth/signup` | No | Register user (email + password) |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/feedback` | Optional | Submit feedback |
| GET | `/api/user/profile` | Yes | User profile + streak |
| GET | `/api/user/activity` | Yes | Activity heatmap data |
| GET | `/api/practice/problems` | No | List problems (optional `?category=`) |
| GET | `/api/practice/problems/{id}` | No | Single problem detail |
| GET | `/api/syllabus/universities` | No | List universities |
| GET | `/api/syllabus/{university}` | No | Get uni syllabus data |
| GET | `/api/company/list` | No | List companies |
| GET | `/api/company/{name}` | No | Company prep details |
| POST | `/api/rooms/create` | No | Create study room (`?owner=`) |
| GET | `/api/rooms/{room_id}` | No | Get room details |
| POST | `/api/rooms/{room_id}/join` | No | Join room (`?user=`) |
| POST | `/api/mock-interview/start` | No | Start AI mock interview |
| POST | `/api/mock-interview/answer` | No | Submit interview answer |
| GET | `/` | No | Serves `static/index.html` |

---

## Database Schema (SQLite)

### Table: `users`
| Column | Type | Default |
|--------|------|---------|
| id | INTEGER PK | autoincrement |
| username | VARCHAR UNIQUE | — |
| email | VARCHAR UNIQUE | — |
| hashed_password | VARCHAR | — |
| joined_at | DATETIME | now |
| bio | VARCHAR | "Competitive Programmer \| CodeGuru Student" |
| avatar | VARCHAR | "👤" |

### Table: `feedbacks`
| Column | Type |
|--------|------|
| id | INTEGER PK |
| message | TEXT |
| created_at | DATETIME |
| user_id | INTEGER FK → users.id (nullable) |

### Table: `activities`
| Column | Type |
|--------|------|
| id | INTEGER PK |
| date | VARCHAR (YYYY-MM-DD) |
| count | INTEGER |
| user_id | INTEGER FK → users.id |

### Table: `rooms`
| Column | Type |
|--------|------|
| id | INTEGER PK |
| room_id | VARCHAR UNIQUE |
| owner | VARCHAR |
| code | TEXT |
| members | JSON |

---

## AI Provider Fallback Chain

Order: **Groq → Gemini → Cerebras → Mistral → OpenRouter**

Each provider's API is called via a dedicated async function in `utils/ai_engine.py`. If a provider returns HTTP 429 (rate limit), 401 (bad key), or times out, it logs the error and moves to the next provider. If all fail, returns a fallback message.

### Provider Details
| Provider | API Base | Model | Key Location |
|----------|----------|-------|--------------|
| Groq | `api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | `.env` → `GROQ_API_KEY` |
| Gemini | `generativelanguage.googleapis.com` | `gemini-2.5-flash` | `.env` → `GEMINI_API_KEY` |
| Cerebras | `api.cerebras.ai/v1` | `llama3.1-8b` | `.env` → `CEREBRAS_API_KEY` |
| Mistral | `api.mistral.ai/v1` | `codestral-latest` | `.env` → `MISTRAL_API_KEY` |
| OpenRouter | `openrouter.ai/api/v1` | `openrouter/free` | `.env` → `OPENROUTER_API_KEY` |

### AI Modes
| Mode | Purpose |
|------|---------|
| `chat` | General Q&A, friendly teacher |
| `explain` | Line-by-line code explanation |
| `debug` | Find/fix errors, explain why |
| `generate` | Write code from description |
| `socratic` | Guiding questions instead of answers |

### Supported Languages
| Language | Script |
|----------|--------|
| `english` | English |
| `hindi` | Devanagari |
| `telugu` | Telugu |
| `tamil` | Tamil |
| `marathi` | Devanagari |
| `hinglish` | Mixed Hindi-English |

---

## Auth System

- Passwords hashed via `bcrypt` (direct `hashpw`/`checkpw`)
- JWT tokens with HS256, 7-day expiry
- Secret key: `secrets.token_hex(32)` in `config/keys.py` (regenerates on every server restart — **known issue**)
- Token payload: `{ sub: username, user_id: id, exp: expiry }`
- Protected routes use `OAuth2PasswordBearer` (auto_error=False) in `routes/feedback.py`

---

## Changes Made (Session History)

### 1. API Keys Moved to `.env`
- **Problem:** 5 API keys hardcoded in `config/keys.py` with real values
- **Action:** Created `.env` file with all 5 keys, updated `config/keys.py` to load via `os.getenv()` + `python-dotenv`
- **Status:** ✅ Done
- **Note:** `.env` already listed in `.gitignore`, `python-dotenv` already in `requirements.txt`

### 2. UI Improvement Discussion
- Identified that the monolithic `static/index.html` (3276 lines) is hard to maintain
- Discussed framework options: React (with Vite/shadcn/ui), Vue, Svelte, Next.js
- Key UI issues: inconsistent spacing, cramped editor layout, alert() popups, no loading states, mobile responsiveness gaps
- Decision needed on frontend framework migration

### 3. Syllabus Connection Discussion
- Discussed approaches for connecting Indian university syllabi
- Recommended: structured DB + vector embeddings (semantic similarity) over RAG
- RAG is overkill for cross-linking syllabi; use it only if adding free-form Q&A later

### 4. General Improvements Needed
- Many features are stubs, mock data, or advertised but unimplemented
- App has good breadth but lacks depth in most features
- Prioritization needed for next development phase

---

## Known Issues & Technical Debt

### Security
- JWT secret regenerates on every server restart → invalidates all existing tokens
- Code execution via `subprocess` with no sandbox — **security risk**
- CORS allows all origins (`*`)
- No rate limiting on any endpoint
- No HTTPS enforcement

### Missing Features (Advertised but not built)
- **Photo-to-Code** — advertised on landing, no implementation
- **Voice Doubts** — advertised, no implementation
- **Google OAuth** — button in UI, no backend endpoint
- **Forgot password** — link in UI, no implementation
- **Real-time study rooms** — REST polling only, no WebSocket

### Content Gaps
- Only 3 practice problems in `data/problems.json`
- Syllabus data is hardcoded for only 3 universities (JNTU, Anna, VTU) with 1 branch each
- Company prep data is static with minimal content
- Progress page uses hardcoded mock data

### Code Quality
- Zero automated tests (no pytest, no test directory)
- No CI/CD pipeline
- No database migrations (Alembic)
- `requirements.txt` is incomplete — missing `bcrypt`, `jose`, `sqlalchemy`
- Frontend is a single 3276-line HTML file — no component structure
- `MOCK_MODE` flag defined but never used anywhere
- JavaScript execution returns hardcoded output instead of actually running Node
- `alert()` used for error handling throughout frontend

### Dependencies Missing from requirements.txt
- `bcrypt`
- `python-jose` (or `jose`)
- `sqlalchemy`
- `pydantic` (and `pydantic[email]` / `pydantic[email-validator]`)
- `email-validator`

---

## Ongoing Discussion Points

1. **Frontend migration** — vanilla HTML → React/Vue/Svelte?
2. **UI/UX overhaul** — what to prioritize first?
3. **Syllabus data pipeline** — how to collect and connect real syllabus data at scale?
4. **Feature depth vs. breadth** — polish existing features or add new ones?
5. **Testing strategy** — where to start with automated tests?

---

## Agent Architecture Discussion

### Idea: Replace Monolithic `ask_ai()` with Dedicated Agents

Currently, one function (`ask_ai` in `utils/ai_engine.py`) handles all workflows — explain, debug, generate, interview, chat — by swapping system prompts. This makes every workflow behave the same way with different instructions.

### Proposed Agent Breakdown

| Agent | Specialization | Tools It Would Need | Ideal Model |
|-------|---------------|-------------------|-------------|
| **Code Explain Agent** | Line-by-line explanation with analogies | None (text-only) | Cheap/fast (Cerebras) |
| **Debug Agent** | Find/fix errors with exact line numbers | Code runner tool to test student's code before responding | Smart (Groq/Gemini) |
| **Mock Interview Agent** | Stateful interview with follow-ups | Session state, rubric/scoring tool | Smart (Gemini) |
| **Socratic Tutor Agent** | Guided questions, hint tracking | "Don't reveal answer" enforcement, hint counter | Any |
| **Syllabus Advisor Agent** | Suggest topics based on uni/semester | Syllabus DB query tool | Cheap (Cerebras) |
| **Practice Grader Agent** | Auto-grade solutions against test cases | Code runner + test case DB | Any |

### Benefits for CodeGuru
- Each agent gets its **own model** (spend less on simple tasks, more on complex ones)
- Agents can have **actual tools** (current AI is text-in-text-out, no tools at all)
- **Stateful interviews** become natural (current mock interview is stateless)
- **Isolated debugging** — failures in one workflow don't affect others
- Each agent can have **specialized system prompts and guardrails**

### Trade-offs
- Need an **orchestrator/router** to decide which agent handles a request
- More moving parts to maintain
- Adds latency if routing is complex

### Clarification: Agents ≠ Replace API Providers

Agents and API providers solve different problems — they are orthogonal:

- **5 API providers** (Groq, Gemini, Cerebras, Mistral, OpenRouter) = **reliability**. The fallback chain ensures uptime if one provider is down. This is essential regardless of whether agents exist.
- **Agents** = **specialized workflows**. Each agent has unique behavior, tools, and guardrails.

**What agents enable:** Pick the right model per task. For example:
- Simple code explanations → route to Cerebras (cheap, fast)
- Complex debugging or interviews → route to Gemini or Groq (smarter)
- All still use the fallback chain within their assigned providers

**Conclusion:** Adding agents doesn't reduce the need for multiple API providers. If anything, agents make the fallback chain more valuable because different agents can have different primary providers with different fallback orders.

### Status
- ❓ Discussion phase — not implemented
- Current `ask_ai()` still uses the monolithic approach
