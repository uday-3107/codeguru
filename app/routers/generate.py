"""
Generate Route — Generate code from plain English description
Endpoint: POST /api/generate

Student describes what they want → AI writes the code
with comments so the student can understand it.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.generate import GenerateRequest, GenerateResponse
from app.services.ai_engine import ask_ai

router = APIRouter()


@router.post("/generate", response_model=GenerateResponse)
async def generate_code(req: GenerateRequest):
    """
    Generate code from description.

    Example request body:
    {
        "description": "write a function that checks if a number is prime",
        "language":    "english",
        "lang":        "python"
    }
    """

    if not req.description.strip():
        raise HTTPException(status_code=400, detail="Please describe what code you want")

    message = (
        f"Write {req.lang} code for the following:\n\n"
        f"{req.description}\n\n"
        "Requirements:\n"
        "- Add clear comments on each important line\n"
        "- Keep the code simple and easy to understand\n"
        "- After the code, explain what it does in 3-4 simple lines"
    )

    result = await ask_ai(
        user_message = message,
        mode         = "generate",
        language     = req.language,
        code         = "",
    )

    return GenerateResponse(
        response = result["response"],
        provider = result["provider"],
        success  = result["success"],
    )
