"""
CodeGuru — AI Coding Teacher Backend
Supports: Gemini, Groq, Cerebras, Mistral, OpenRouter with auto fallback

HOW TO RUN:
  1. Fill in your API keys in .env (copy from .env.example)
  2. Install dependencies:  pip install -r requirements.txt
  3. Start server:          python -m uvicorn app.main:app --reload
                            (or: python -m app.main)
  4. Open browser:          http://localhost:8000
  5. API docs:              http://localhost:8000/docs

DEPLOY TO PYTHONANYWHERE:
  - Upload this folder
  - Set WSGI file to point to: from app.main import app

DEPLOY TO RENDER:
  - Push to GitHub
  - Connect repo on render.com
  - Start command: uvicorn app.main:app --host 0.0.0.0 --port 10000
"""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

from app.routers.auth           import router as auth_router
from app.routers.chat           import router as chat_router
from app.routers.company        import router as company_router
from app.routers.debug          import router as debug_router
from app.routers.explain        import router as explain_router
from app.routers.feedback       import router as feedback_router
from app.routers.generate       import router as generate_router
from app.routers.health         import router as health_router
from app.routers.mock_interview import router as interview_router
from app.routers.practice       import router as practice_router
from app.routers.rooms          import router as rooms_router
from app.routers.run            import router as run_router
from app.routers.syllabus       import router as syllabus_router
from app.routers.user           import router as user_router

import app.database as database
import app.models as models
from app.core.config import CORS_ORIGINS

# Project root = <root>/app/main.py -> parents[1]
PROJECT_ROOT = Path(__file__).resolve().parents[1]

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

# ── App setup ─────────────────────────────────────────────────
app = FastAPI(
    title       = "CodeGuru API",
    description = "AI Coding Teacher for Indian Students",
    version     = "1.0.0"
)

# ── CORS — allows your frontend to talk to this backend ───────
app.add_middleware(
    CORSMiddleware,
    allow_origins  = CORS_ORIGINS,   # Set CORS_ORIGINS in .env for production
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)


# ── Error Logging Middleware
@app.middleware("http")
async def catch_exceptions_middleware(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR: {e}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal Server Error: {str(e)}", "type": str(type(e))}
        )

# ── Routes ────────────────────────────────────────────────────
app.include_router(health_router,    prefix="/api")
app.include_router(chat_router,      prefix="/api")
app.include_router(debug_router,     prefix="/api")
app.include_router(explain_router,   prefix="/api")
app.include_router(generate_router,  prefix="/api")
app.include_router(run_router,       prefix="/api")
app.include_router(auth_router,      prefix="/api")
app.include_router(feedback_router,  prefix="/api")
app.include_router(user_router,      prefix="/api")
app.include_router(practice_router,  prefix="/api")
app.include_router(syllabus_router,  prefix="/api")
app.include_router(company_router,   prefix="/api")
app.include_router(rooms_router,     prefix="/api")
app.include_router(interview_router, prefix="/api")

# ── Serve frontend HTML if present ────────────────────────────
@app.get("/")
def serve_frontend():
    index_html = PROJECT_ROOT / "static" / "index.html"
    if index_html.exists():
        return FileResponse(index_html)
    return {
        "message": "CodeGuru API is running!",
        "docs":    "Visit /docs to see all endpoints",
        "status":  "healthy"
    }

# ── Start server ──────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
