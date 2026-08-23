# Rules — Engineering Standards & Boundaries

How we write code in this repo. New code must follow these rules; legacy code is migrated opportunistically, never rewritten speculatively.

---

## 1. Language & Runtime

- Python 3.10+ backend, TypeScript (strict) frontend.
- Run locally with your existing working environment (system/conda); no new virtualenv mandates for contributors with a working setup.
- Commands run from project root unless stated otherwise.

---

## 2. Libraries

### Backend — approved

| Purpose | Library | Note |
|---------|---------|------|
| API | fastapi, uvicorn | async handlers by default |
| Validation | pydantic v2 (+ EmailStr) | schemas live in `app/schemas/`, never inline in routers |
| ORM | sqlalchemy 2.x | models only in `app/models.py` |
| HTTP client | httpx (async) | always pass `timeout=` |
| Auth | bcrypt, python-jose[cryptography] | |
| Config | python-dotenv | read once in `app/core/config.py` |

### Backend — do NOT add without discussion

- `requests` (use httpx), `passlib` (bcrypt directly)
- flask/django mixing (never)
- task queues / redis (not yet needed)
- alembic (adopt together with first real schema migration)
- AI SDK wrappers (raw httpx keeps fallback control and cost visibility)
- heavy deps (numpy/pandas) outside the module that truly needs them

### Frontend — approved

react, react-router, @tanstack/react-query, zustand, tailwindcss, shadcn/ui (radix primitives), lucide-react icons, react-markdown + shiki, codemirror 6.

### Frontend — avoid

jQuery, CSS-in-JS libs (Tailwind tokens suffice), moment.js (use Intl/dayjs), MUI/AntD (fight Tailwind), axios (fetch + Query is enough).

---

## 3. Code Organization

1. **Routers are thin**: validate input -> call service/agent -> shape response. No business logic, no provider calls, no raw SQL in routers.
2. **One concept per file**; a router module owns one resource, its schema module mirrors it.
3. **Absolute imports only**: `from app.core.config import ...`; no `../..` chains.
4. **No circular imports**: shared dependencies in `app/core/deps.py`, shared constants/prompts in config or the owning module.
5. **Config is env-driven**: secrets/magic values never hardcoded; new knobs added to `core/config.py` + `.env.example` together.
6. **Comments explain why, not what**; docstrings on public service functions.
7. **No emojis anywhere** — code, logs, comments, API responses, UI text, docs. Frontend icons come from lucide-react.

---

## 4. Error Handling

### Backend

- Expected failures raise `HTTPException(status_code, detail="friendly message")`. Detail strings are user-facing: no stack traces, no internal paths.
- Never swallow exceptions silently; log with context (`logger.exception`) then handle or re-raise.
- Every outbound provider call catches exactly: `httpx.HTTPStatusError`, `httpx.TimeoutException`, generic `Exception` -> record reason, continue fallback chain.
- The global 500 middleware must not leak raw `str(e)` to clients in production; sanitize before responding.
- DB access always via `Depends(get_db)`; helpers that create their own session must say so in their docstring.
- Hard timeouts everywhere: subprocess 5s, provider calls 30s, agent loops max 3 iterations.

### Frontend

- Every query/mutation declares loading + error states via TanStack Query; no unhandled rejections, no bare `alert()`.
- Server `detail` messages render as toast/banner; network failures show a retry affordance.
- Client-side validation mirrors backend rules (signup password policy) but backend stays source of truth.

---

## 5. Security Boundaries

1. `.env` never committed, logged, or pasted anywhere; `.env.example` carries empty keys.
2. Passwords: bcrypt hash only; never logged, never returned by any endpoint.
3. JWT payload holds only username/user_id; expiry 7 days; explicit `JWT_SECRET` required in production.
4. CORS `*` is dev-only; production uses explicit origin allowlist via `CORS_ORIGINS`.
5. `/api/run`: temp-dir isolation + 5s cap + output treated as untrusted; dedicated sandbox required before public scaling.
6. Untrusted input never reaches SQL without bound params, shell without fixed arg lists, or HTML without safe rendering components.

---

## 6. AI-Specific Boundaries

1. Prompts are versioned code: they live in one place per agent (`services/ai_engine.py` today, `agents/prompts/` later), never inline ad hoc strings scattered across routers.
2. Cost guards: MAX_TOKENS=1024, TEMPERATURE=0.7, REQUEST_TIMEOUT=30s — change via config only.
3. Fallback chain is mandatory infrastructure: any new LLM-calling feature goes through it, never direct-to-provider.
4. Agent loops capped (max 3 self-corrections); every agent defines a degraded-mode answer when its loop exhausts.
5. MOCK_MODE=true path must exist for every AI feature so demos/tests run free and deterministic.
6. Student content (code/messages) is sent only to the chosen provider endpoint; never forwarded to third-party analytics or logs.
7. Model names centralized in `core/config.py`; swapping a model is a one-line config change.

---

## 7. Workflow & Git Hygiene

- Conventional commit prefixes: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`; small focused commits.
- Never commit: `.env`, `codeguru.db`, `__pycache__/`, `.DS_Store` (all gitignored already).
- No force-pushes to shared branches; PRs reference the phase/task they implement.
- Deprecate before delete: old behavior stays reachable for one release cycle when feasible.
