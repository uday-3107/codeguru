"""
Health check route — tells you if the server is running
Visit: http://localhost:8000/api/health
"""

from fastapi import APIRouter

from app.core.config import FALLBACK_ORDER, GEMINI_MODEL, GROQ_MODEL

router = APIRouter()

@router.get("/health")
def health_check():
    """Check if CodeGuru backend is running"""
    return {
        "status":         "CodeGuru is running!",
        "fallback_order": FALLBACK_ORDER,
        "models": {
            "primary":   GEMINI_MODEL,
            "secondary": GROQ_MODEL,
        }
    }
