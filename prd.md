# PRD — CodeGuru Product Requirements Document

Version: 1.0 | Status: Living document | Owner: Project maintainer

---

## 1. Vision

CodeGuru is an AI-powered coding teacher built specifically for Indian CS students. It answers programming doubts in the student's own language (Hindi, Telugu, Tamil, Marathi, Hinglish, English), explains and fixes code patiently, executes student code safely, and prepares students for university exams and company placements — with zero cost barriers.

One-line pitch: **"A senior who explains your doubts in your language, 24/7, for free."**

---

## 2. Problem Statement

Indian engineering students face three compounding problems:

1. **Language gap** — Most coding content online is in English. Students from Telugu/Hindi/Tamil medium schools understand concepts slower when taught in a second language.
2. **No patient tutor** — Seniors/teachers answer the same basic questions repeatedly; students stop asking out of embarrassment.
3. **Placement pressure** — University syllabi (JNTU, Anna, VTU) differ from company hiring patterns (TCS NQT, InfyTQ, Amazon OA). Students lack structured bridging material.

Existing tools (ChatGPT, Gemini) are generic, English-centric, and paid at scale. CodeGuru fills this niche with syllabus-aware, multilingual, free-tier-backed tutoring.

---

## 3. Target Users

| Persona | Description | Primary needs |
|---------|-------------|---------------|
| **First-year struggler (Priya, 18)** | Telugu-medium student, B.Tech CSE year 1 at a JNTU-affiliated college. Owns a mid-range Android phone. | Concepts explained simply in Telugu/Hinglish; patience for very basic questions |
| **Placement grinder (Rahul, 21)** | Year 3/4 student targeting TCS/Infosys/Wipro. Knows basics, needs pattern practice. | Company-specific test patterns, common coding questions, mock interview feedback |
| **Self-learner (Ananya, 20)** | Tier-3 college student whose classes move too fast/slow. Learns independently. | Syllabus mapping, practice problems with hints, streaks/motivation to stay consistent |

Secondary users: trainers at coaching centers, college clubs running peer-learning rooms.

---

## 4. Scope

### 4.1 In scope (v1)

- Multilingual AI tutoring: chat, Socratic mode, code explanation, debugging, code generation
- Multi-provider AI engine with automatic failover (free tiers first: Groq, Gemini, Cerebras, Mistral, OpenRouter)
- In-browser code execution: Python, Java, C++
- Accounts: signup/login (JWT), profiles with streaks and activity heatmap
- Practice problem bank with categories
- University syllabus browser (JNTU Hyderabad, Anna University, VTU Belgaum)
- Company placement-prep reference data
- Collaborative study rooms (persistent shared code)
- AI mock interviews (question generation + answer evaluation)
- Modern chat-style web interface (dark mode default)

### 4.2 In scope (v2 — planned)

- Multi-agent orchestration layer (8 agents: Orchestrator, Explainer, Debugger, Socratic Coach, Generator, Interviewer, Practice, Progress Tracker)
- Streaming responses (SSE)
- Personalization: weak-topic tracking driving difficulty and teaching mode
- Session memory across messages

### 4.3 Out of scope (non-goals)

- Native mobile apps (mobile-web responsive is enough for v1/v2)
- Payments/subscriptions (product stays free-tier backed)
- Video proctoring despite mock-interview camera instructions (honor-system in v1)
- Supporting every Indian university at launch (start with 3, expand by demand)
- Real compiler infrastructure (subprocess sandbox is acceptable short-term; dedicated judge service later)

---

## 5. Functional Requirements

### 5.1 AI Tutoring (core loop)

| ID | Requirement | Priority |
|----|-------------|----------|
| F-01 | Student sends a message + optional code; receives an explanation in selected language | P0 |
| F-02 | Language selector supports: english, hindi, telugu, tamil, marathi, hinglish | P0 |
| F-03 | Modes: chat, explain, debug, generate, socratic | P0 |
| F-04 | If a provider fails/rate-limits, next provider in FALLBACK_ORDER answers automatically; response tags which provider answered | P0 |
| F-05 | Responses render as markdown with syntax-highlighted code blocks | P0 |
| F-06 | Responses stream token-by-token | P1 |
| F-07 | Conversation history persists per session | P1 |

### 5.2 Code Execution

| ID | Requirement | Priority |
|----|-------------|----------|
| F-08 | Run Python/Java/C++ code with stdin support; return stdout/stderr | P0 |
| F-09 | Execution capped at 5s; infinite loops produce friendly timeout message | P0 |
| F-10 | Execution isolated in temp directories | P0 |

### 5.3 Auth & Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| F-11 | Signup requires @gmail.com email + strong password (8–12 chars, upper/lower/digit/special); returns JWT | P0 |
| F-12 | Login returns JWT; protected routes verify it | P0 |
| F-13 | Profile shows username, bio, avatar, joined date, total solved, current streak | P1 |
| F-14 | Activity heatmap (daily solve counts) rendered GitHub-style | P1 |

### 5.4 Learning Content

| ID | Requirement | Priority |
|----|-------------|----------|
| F-15 | Practice problems listed and filterable by category; individual problem view | P0 |
| F-16 | Syllabus browser: university -> course -> year-wise subjects | P1 |
| F-17 | Company pages: hiring pattern, rounds, durations, common questions | P1 |

### 5.5 Study Rooms

| ID | Requirement | Priority |
|----|-------------|----------|
| F-18 | Create room (returns shareable 8-char id), join room by id, view members + shared code buffer | P1 |
| F-19 | Room state persists in DB across sessions | P1 |

### 5.6 Mock Interviews

| ID | Requirement | Priority |
|----|-------------|----------|
| F-20 | Start interview by role/company/stage; receive first question | P1 |
| F-21 | Submit answer; receive score/10, strengths, improvements, ideal answer, follow-up | P1 |
| F-22 | Session report persisted (v2, with agent pipeline) | P2 |

### 5.7 v2 Agent Requirements

| ID | Requirement |
|----|-------------|
| F-23 | Orchestrator classifies intent/language/topic and routes; frontend shows active agent steps |
| F-24 | Debugger verifies fixes by executing code before presenting them (max 3 retry loop) |
| F-25 | Progress Tracker maintains weak-topic profile per student; Orchestrator consults it |
| F-26 | Practice Agent grades submissions and writes Activity records automatically |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Performance | AI responses under 10s p95 (fallback chain absorbs provider slowness); streaming first-token under 3s |
| Availability | Degrade gracefully: if all providers fail, friendly retry message; server itself stays up |
| Cost | Operate within combined free tiers of all five providers |
| Security | Secrets only via env vars; bcrypt password hashing; JWT expiry 7 days; CORS restricted in production |
| Privacy | Never log raw student code/messages to external services beyond the LLM call itself |
| Accessibility | Keyboard navigable, WCAG AA contrast in both themes, works on low-end Android browsers |
| Platform | Mobile-responsive single-page app; Chrome/Samsung Internet/Firefox latest two versions |

---

## 7. Success Metrics

| Metric | Target (90 days post-launch) |
|--------|------------------------------|
| Weekly active students | 500+ |
| Questions answered | 10,000+ |
| Answer success rate (any provider responded) | > 99% |
| Median response time | < 6s |
| % sessions using non-English language | > 50% (validates core thesis) |
| 7-day retention of signed-up users | > 25% |

---

## 8. Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| Free-tier rate limits exhausted during exam season | Five-provider fallback chain; MOCK_MODE flag for demo; queue/degrade messaging |
| Provider changes free model availability | Model names centralized in `app/core/config.py` for quick swap |
| `/api/run` abuse (malicious code) | Timeouts, temp-dir isolation, short-lived processes; dedicated sandbox before public scale |
| JWT secret regeneration logs everyone out | Documented `JWT_SECRET` env requirement |
| Single-file frontend rot (historical problem) | Full SPA rewrite governed by `design.md`, `rules.md`, `phases.md` |
