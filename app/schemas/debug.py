from pydantic import BaseModel


class DebugRequest(BaseModel):
    code: str              # The broken code (required)
    error: str = ""        # Error message if any (optional)
    language: str = "english"  # Response language
    lang: str = "python"   # Programming language


class DebugResponse(BaseModel):
    response: str
    provider: str
    success: bool
