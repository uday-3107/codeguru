# CodeGuru

**An AI-powered coding teacher for Indian CS students — FastAPI backend + React frontend.**

CodeGuru answers programming doubts in the student's own language (Hindi, Telugu, Tamil, Hinglish, English), explains and debugs code, generates examples, executes student code, hosts collaborative study rooms, and runs AI mock interviews — all backed by a multi-provider AI engine with automatic failover so a single rate limit never breaks the experience.

The app ships as two packages: a cleanly layered **FastAPI API** (`app/`) and a **React + Vite + TypeScript SPA** (`frontend/`) with a dark marketing landing page and a warm, light in-app theme.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.x-orange)
![License](https://img.shields.io/badge/License-Unspecified-lightgrey)

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Example Requests](#example-requests)
- [Utility Scripts](#utility-scripts)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Roadmap](#roadmap)

---

## Features

| Category | What it does |
|----------|--------------|
| **Multilingual AI Tutoring** | Chat, Socratic questioning, code explanation, debugging, and code generation in Hindi, Telugu, Tamil, Marathi, Hinglish, and English |
| **Multi-Provider Fallback** | Automatic failover across Groq, Gemini, Cerebras, Mistral, and OpenRouter when a provider hits rate limits or fails |
| **In-Browser Code Runner** | Executes Python, Java, and C++ submissions in isolated temp directories with timeouts |
| **Authentication & Profiles** | JWT-based signup/login, bcrypt password hashing, user profiles with streaks and activity heatmaps |
| **Practice Engine** | Curated problem bank (`data/problems.json`) served by category and ID |
| **University Syllabi** | Course mappings for JNTU Hyderabad, Anna University, and VTU Belgaum |
| **Company Placement Prep** | Hiring patterns and commonly asked questions for TCS, Infosys, Wipro, Amazon |
| **Study Rooms** | Persistent collaborative coding rooms with member management (SQLite-backed) |
| **Mock Interviews** | AI-generated interview questions with answer evaluation and scoring |
| **Modern Web App** | React + Vite SPA: dark landing page, warm light app theme, code editor with AI tutor panel, activity heatmaps |

---

## Architecture

```
                    ┌──────────────────────────┐
 Student request ──▶│      FastAPI App         │
                    │   (routers + schemas)    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │   AI Engine (fallback)   │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
        ┌──────────┐       ┌──────────┐       ┌──────────┐   ...
        │   Groq   │──────▶│  Gemini  │──────▶│ Cerebras │──▶ Mistral ──▶ OpenRouter
        └──────────┘       └──────────┘       └──────────┘
         primary           secondary          tertiary
```

Each request walks the configured `FALLBACK_ORDER`. If a provider returns an HTTP error (429/401), times out, or throws, the next provider is tried automatically. The response reports which provider actually answered.

---

## Documentation

Detailed project documentation lives alongside the code:

| Document | Contents |
|----------|----------|
| [prd.md](prd.md) | Product requirements: vision, target users, features, success metrics |
| [architecture.md](architecture.md) | System design: request flows, folder structure, data model, agent layer |
| [rules.md](rules.md) | Engineering standards: approved libraries, error handling, security and AI boundaries |
| [phases.md](phases.md) | Build plan: phased roadmap with deliverables and exit criteria |
| [design.md](design.md) | Design system: color tokens, typography, components for the React frontend |

---

## Project Structure

```
codeguru/
├── app/
│   ├── main.py               # FastAPI application factory and router registration
│   ├── database.py           # SQLAlchemy engine, session factory, get_db dependency
│   ├── models.py             # ORM models: User, Feedback, Activity, Room
│   ├── core/
│   │   ├── config.py         # Settings loaded from environment (.env)
│   │   ├── security.py       # Password hashing (bcrypt) and JWT helpers
│   │   └── deps.py           # Shared dependencies (get_current_user)
│   ├── schemas/              # Pydantic request/response models
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── debug.py
│   │   ├── explain.py
│   │   ├── feedback.py
│   │   ├── generate.py
│   │   ├── mock_interview.py
│   │   └── run.py
│   ├── routers/              # API route handlers (one module per feature)
│   │   ├── auth.py           # POST /api/auth/signup, /api/auth/login
│   │   ├── chat.py           # POST /api/chat
│   │   ├── company.py        # GET  /api/company/*
│   │   ├── debug.py          # POST /api/debug
│   │   ├── explain.py        # POST /api/explain
│   │   ├── feedback.py       # POST /api/feedback
│   │   ├── generate.py       # POST /api/generate
│   │   ├── health.py         # GET  /api/health
│   │   ├── mock_interview.py # POST /api/mock-interview/*
│   │   ├── practice.py       # GET  /api/practice/problems*
│   │   ├── rooms.py          # CRUD for study rooms
│   │   ├── run.py            # POST /api/run (code execution)
│   │   ├── syllabus.py       # GET  /api/syllabus/*
│   │   └── user.py           # GET  /api/user/profile, /api/user/activity
│   ├── services/
│   │   └── ai_engine.py      # Multi-provider AI client with fallback chain
│   └── utils/
│       └── user_utils.py     # Activity seeding helper
├── data/
│   └── problems.json         # Practice problem bank
├── scripts/
│   ├── check_models.py       # Lists available models across all providers
│   └── test_gemini.py        # Quick Gemini connectivity test
├── static/
│   └── index.html            # Legacy single-file frontend (reference only)
├── frontend/                 # React + Vite + TypeScript SPA
│   ├── src/
│   │   ├── App.tsx           # Router (public pages + shell pages)
│   │   ├── index.css         # Tailwind v4 tokens: light theme default, .theme-dark scope
│   │   ├── lib/api.ts        # Typed API client with JWT handling
│   │   ├── components/       # AppShell (sidebar), shared UI primitives
│   │   └── pages/            # Landing, Login, Chat, Practice, Syllabus, Rooms,
│   │                         #   Company, Interview, Profile
│   └── vite.config.ts        # Dev proxy: /api -> localhost:8000
├── .env.example              # Environment variable template
├── prd.md                    # Product requirements document
├── architecture.md           # System design and architecture
├── rules.md                  # Engineering standards and boundaries
├── phases.md                 # Phased build plan
├── design.md                 # Frontend design system
├── requirements.txt
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | FastAPI + Uvicorn |
| Database | SQLite via SQLAlchemy 2.x |
| Validation | Pydantic v2 |
| Auth | JWT (`python-jose`) + bcrypt |
| HTTP Client | httpx (async) |
| Config | python-dotenv |
| AI Providers | Groq, Google Gemini, Cerebras, Mistral, OpenRouter |
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 + design tokens (dark landing / light app) |
| Icons & Markdown | lucide-react, react-markdown (planned), CodeMirror 6 (planned) |

---

## Getting Started

### Prerequisites

- Python 3.10 or newer
- At least one AI provider API key (see [Configuration](#configuration))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/codeguru.git
   cd codeguru
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your keys.

4. Start the backend:

   ```bash
   uvicorn app.main:app --reload
   ```

5. In a second terminal, start the frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. Open the app:

   - Web app: <http://localhost:5173> (React SPA, proxies `/api` to the backend)
   - API docs (Swagger): <http://localhost:8000/docs>

Database tables are created automatically on first start (`codeguru.db` at the project root).

---

## Configuration

All configuration is loaded from `.env` (see `.env.example`).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | one provider needed | – | Google Gemini key ([aistudio.google.com](https://aistudio.google.com)) |
| `GROQ_API_KEY` | one provider needed | – | Groq key ([console.groq.com](https://console.groq.com)) |
| `CEREBRAS_API_KEY` | one provider needed | – | Cerebras key ([cloud.cerebras.ai](https://cloud.cerebras.ai)) |
| `MISTRAL_API_KEY` | one provider needed | – | Mistral key ([console.mistral.ai](https://console.mistral.ai)) |
| `OPENROUTER_API_KEY` | one provider needed | – | OpenRouter key ([openrouter.ai](https://openrouter.ai)) |
| `JWT_SECRET` | recommended | auto-generated | JWT signing secret. Generate: `python -c "import secrets; print(secrets.token_hex(32))"`. Set it explicitly so tokens survive restarts. |
| `DATABASE_URL` | no | SQLite at project root | Override to point at another database |
| `CORS_ORIGINS` | no | `*` | Comma-separated allowed origins, e.g. `https://myapp.vercel.app,http://localhost:3000` |
| `MOCK_MODE` | no | `False` | Set `True` to return mock responses without calling any AI provider |

Provider priority is defined by `FALLBACK_ORDER` in `app/core/config.py`.

---

## API Reference

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server status, fallback order, active models |

### AI Tutoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | General Q&A chat (supports `socratic` mode) |
| POST | `/api/explain` | Line-by-line code explanation |
| POST | `/api/debug` | Bug finding with corrected code |
| POST | `/api/generate` | Code generation from a description |
| POST | `/api/run` | Execute Python / Java / C++ code |

### Auth & User

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register (returns JWT). Gmail addresses only, strong password rules enforced |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/feedback` | Submit feedback (auth optional) |
| GET | `/api/user/profile` | Profile, solved count, current streak (requires JWT) |
| GET | `/api/user/activity` | Activity heatmap data |

### Learning Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/practice/problems` | List problems, optional `?category=` filter |
| GET | `/api/practice/problems/{id}` | Single problem |
| GET | `/api/syllabus/universities` | Supported universities |
| GET | `/api/syllabus/{university}` | Year-wise syllabus |
| GET | `/api/company/list` | Company names |
| GET | `/api/company/{name}` | Placement pattern and common questions |

### Study Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rooms/create?owner=` | Create room, returns `room_id` |
| GET | `/api/rooms/{room_id}` | Room details (members, shared code) |
| POST | `/api/rooms/{room_id}/join?user=` | Join room |

### Mock Interviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mock-interview/start` | Get first interview question for a role/company |
| POST | `/api/mock-interview/answer` | Submit answer, receive scored evaluation |

Full request/response schemas are documented interactively at `/docs`.

---

## Example Requests

Chat in Hindi via curl:

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "for loop kya hota hai?",
    "language": "hindi",
    "code": "",
    "mode": "chat"
  }'
```

Same request in Python:

```python
import requests

response = requests.post("http://localhost:8000/api/chat", json={
    "message":  "for loop kya hota hai?",
    "language": "hindi",
    "code":     "",
    "mode":     "chat",
})

print(response.json()["response"])
print(response.json()["provider"])   # which provider answered
```

Authenticated request:

```python
token = requests.post("http://localhost:8000/api/auth/login", json={
    "username": "myuser",
    "password": "Str0ng!pass",
}).json()["access_token"]

requests.get(
    "http://localhost:8000/api/user/profile",
    headers={"Authorization": f"Bearer {token}"},
).json()
```

---

## Utility Scripts

```bash
# List every model available to your keys across all five providers
python scripts/check_models.py

# One-shot Gemini connectivity test
python scripts/test_gemini.py
```

Both scripts add the project root to `sys.path`, so they run from any working directory.

---

## Deployment

### Render

1. Push the repository to GitHub (never commit `.env`).
2. On [render.com](https://render.com), create a new Web Service connected to the repo.
3. Add the environment variables from [Configuration](#configuration) in the Render dashboard.
4. Use this start command:

   ```
   uvicorn app.main:app --host 0.0.0.0 --port 10000
   ```

### PythonAnywhere

1. Upload the project folder.
2. In a Bash console: `pip install -r requirements.txt`.
3. Web tab -> Add new web app -> Manual/WSGI config.
4. Point the WSGI file at the app: `from app.main import app as application`.

Note: the free tier provides a single worker; the code-execution sandbox (`/api/run`) is intended for development use and should be replaced with a proper sandbox (e.g., containerized judge) before public production use.

---

## Security Notes

- Never commit `.env`; it is already listed in `.gitignore`.
- Set an explicit `JWT_SECRET` in production; otherwise a random secret is generated per process and all issued tokens invalidate on restart.
- Restrict `CORS_ORIGINS` to your actual frontend origins in production instead of `*`.
- Passwords are hashed with bcrypt; signup enforces Gmail-only emails and password complexity rules.
- The `/api/run` endpoint executes submitted code locally with short timeouts and temp-directory isolation. Do not expose it publicly without hardening.

---

## Roadmap

The full phased build plan lives in [phases.md](phases.md). Highlights:

- [x] React + Vite SPA frontend (landing, auth, chat, practice, syllabus, rooms, company, interview, profile)
- [ ] Streaming responses (SSE) and session memory
- [ ] Multi-agent orchestration layer (8 agents: orchestrator, explainer, debugger, and more)
- [ ] Automated test suite (pytest + TestClient)
- [ ] Alembic migrations instead of `create_all()`
- [ ] Sandboxed code execution service
- [ ] WebSocket support for real-time study room collaboration
- [ ] Rate limiting and request quotas per user

---

## Contributing

Issues and pull requests are welcome. For significant changes, please open an issue first to discuss what you would like to change.
