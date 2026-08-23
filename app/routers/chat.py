"""
Chat Route — General AI conversation
Endpoint: POST /api/chat

This handles the main chat panel in CodeGuru's editor.
Student types a question, gets an answer in their language.
"""

from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_engine import ask_ai

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Main chat endpoint.

    Example request body:
    {
        "message":  "what is a for loop?",
        "language": "hindi",
        "code":     "",
        "mode":     "chat"
    }
    """

    result = await ask_ai(
        user_message = req.message,
        mode         = req.mode,
        language     = req.language,
        code         = req.code,
    )

    return ChatResponse(
        response = result["response"],
        provider = result["provider"],
        success  = result["success"],
    )
