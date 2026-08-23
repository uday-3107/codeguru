from pydantic import BaseModel


class InterviewStartRequest(BaseModel):
    role: str
    company: str
    stage: str = "Technical"


class InterviewAnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str
    role: str
    company: str
    stage: str = "Technical"
