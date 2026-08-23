"""
Explain Route — Explain code like a teacher
Endpoint: POST /api/explain

Student pastes any code → AI explains it line by line
in their language using simple words and analogies.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.explain import ExplainRequest, ExplainResponse
from app.services.ai_engine import ask_ai

router = APIRouter()


@router.post("/explain", response_model=ExplainResponse)
async def explain_code(req: ExplainRequest):
    """
    Explain code to student.

    Example request body:
    {
        "code":     "for i in range(10):\\n    print(i)",
        "language": "hindi",
        "lang":     "python",
        "mode":     "explain"
    }
    """

    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Please provide code to explain")

    message = f"Please explain this {req.lang} code to me. I am a beginner student."

    # Socratic mode — AI asks questions instead of explaining directly
    if req.mode == "socratic":
        message = (
            f"I have written this {req.lang} code. "
            "Instead of explaining it directly, please use the Socratic method — "
            "ask me guiding questions to help me figure out what it does myself."
        )

    result = await ask_ai(
        user_message = message,
        mode         = req.mode,
        language     = req.language,
        code         = req.code,
    )

    return ExplainResponse(
        response = result["response"],
        provider = result["provider"],
        success  = result["success"],
    )
