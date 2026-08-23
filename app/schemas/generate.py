from pydantic import BaseModel


class GenerateRequest(BaseModel):
    description: str           # What to build (required)
    language: str = "english"  # Response language
    lang: str = "python"       # Programming language to generate


class GenerateResponse(BaseModel):
    response: str
    provider: str
    success: bool
