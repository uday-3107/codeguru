from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str             # Student's question
    language: str = "english"  # hindi | telugu | tamil | hinglish | english
    code: str = ""           # Optional: student's code for context
    mode: str = "chat"       # chat | socratic


class ChatResponse(BaseModel):
    response: str
    provider: str            # Which AI answered (gemini/groq/etc)
    success: bool
