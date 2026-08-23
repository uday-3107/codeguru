from pydantic import BaseModel


class ExplainRequest(BaseModel):
    code: str              # Code to explain (required)
    language: str = "english"  # Response language
    lang: str = "python"   # Programming language
    mode: str = "explain"  # explain | socratic


class ExplainResponse(BaseModel):
    response: str
    provider: str
    success: bool
