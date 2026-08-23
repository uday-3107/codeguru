"""
Central configuration for CodeGuru.

All settings are loaded from environment variables (.env file).
Copy .env.example to .env and fill in your keys.

IMPORTANT: Never share .env or upload it to GitHub!
"""

from pathlib import Path
import os
import secrets

from dotenv import load_dotenv

# Project root = <root>/app/core/config.py -> parents[2]
PROJECT_ROOT = Path(__file__).resolve().parents[2]

load_dotenv(PROJECT_ROOT / ".env")

# ── SET THIS TO False TO USE REAL AI, True FOR MOCK RESPONSES ──
MOCK_MODE = os.getenv("MOCK_MODE", "False").lower() == "true"

GEMINI_API_KEY     = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY       = os.getenv("GROQ_API_KEY")
CEREBRAS_API_KEY   = os.getenv("CEREBRAS_API_KEY")
MISTRAL_API_KEY    = os.getenv("MISTRAL_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ── MODEL NAMES ────────────────────────────────────────────────
# These are the exact model strings each API expects

GEMINI_MODEL     = "gemini-2.5-flash"          # Best free multilingual model
GROQ_MODEL       = "llama-3.3-70b-versatile"   # Best free Groq model
CEREBRAS_MODEL   = "llama3.1-8b"               # Cerebras fast model
MISTRAL_MODEL    = "codestral-latest"          # Code-specific model
OPENROUTER_MODEL = "openrouter/free"           # Free model

# ── FALLBACK ORDER ─────────────────────────────────────────────
# System tries APIs in this order when one hits rate limits
# Change the order here if you want a different priority

FALLBACK_ORDER = [
    "groq",       # Primary    — best Hindi/Telugu
    "gemini",     # Secondary  — fastest
    "cerebras",   # Tertiary   — ultra fast backup
    "mistral",    # Quaternary — best for code tasks
    "openrouter", # Last resort — always has free models
]

# ── JWT SECRET ─────────────────────────────────────────────────
# Set JWT_SECRET in .env so tokens survive server restarts.
# Generate one with: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET = os.getenv("JWT_SECRET") or secrets.token_hex(32)

# ── DATABASE ───────────────────────────────────────────────────
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{PROJECT_ROOT / 'codeguru.db'}"
)

# ── CORS ───────────────────────────────────────────────────────
# Comma-separated origins, e.g. "https://myapp.vercel.app,http://localhost:3000"
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "*").split(",")
    if o.strip()
]

# ── APP SETTINGS ───────────────────────────────────────────────
APP_NAME        = "CodeGuru"
MAX_TOKENS      = 1024  # Max tokens per response
TEMPERATURE     = 0.7   # 0 = focused, 1 = creative
REQUEST_TIMEOUT = 30    # Seconds before timeout
