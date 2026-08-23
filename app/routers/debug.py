"""
Debug Route — Find and fix code errors
Endpoint: POST /api/debug

Student pastes broken code → AI finds the bug,
explains WHY it happened, and shows the fixed version.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.debug import DebugRequest, DebugResponse
from app.services.ai_engine import ask_ai

router = APIRouter()


@router.post("/debug", response_model=DebugResponse)
async def debug_code(req: DebugRequest):
    """
    Debug student's code.

    Example request body:
    {
        "code":     "def greet(name)\\n  print('Hello' + name)",
        "error":    "IndentationError: expected an indented block",
        "language": "telugu",
        "lang":     "python"
    }
    """

    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Please provide code to debug")

    # Build a clear message for the AI
    message = f"Please debug this {req.lang} code."
    if req.error.strip():
        message += f"\n\nThe error I am getting is:\n{req.error}"
    message += "\n\nFind all bugs, explain each one clearly, and show me the fixed code."

    result = await ask_ai(
        user_message = message,
        mode         = "debug",
        language     = req.language,
        code         = req.code,
    )

    return DebugResponse(
        response = result["response"],
        provider = result["provider"],
        success  = result["success"],
    )
