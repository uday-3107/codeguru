from pydantic import BaseModel


class RunRequest(BaseModel):
    code: str
    language: str = "Python"
    stdin: str = ""


class RunResponse(BaseModel):
    stdout: str
    stderr: str
    success: bool
