import uuid

from fastapi import APIRouter

from app.schemas.mock_interview import InterviewStartRequest, InterviewAnswerRequest
from app.services.ai_engine import ask_ai

router = APIRouter(tags=["Mock Interview"])


@router.post("/mock-interview/start")
async def start_interview(req: InterviewStartRequest):
    session_id = str(uuid.uuid4())[:8]
    prompt = (
        f"You are a technical interviewer at {req.company} interviewing for the role of {req.role}. "
        f"Generate a single relevant {req.stage} interview question. "
        f"Return only the question, no preamble or explanation."
    )
    result = await ask_ai(
        user_message=prompt,
        mode="chat",
        language="english",
        code=""
    )
    question = result["response"] if result["success"] else "Tell me about yourself."
    return {
        "session_id": session_id,
        "first_question": question,
        "instructions": "Please turn on your camera. CodeGuru will monitor your focus.",
        "provider": result.get("provider", "ai")
    }


@router.post("/mock-interview/answer")
async def submit_answer(req: InterviewAnswerRequest):
    prompt = (
        f"You are a technical interviewer at {req.company} for the role of {req.role} ({req.stage} stage).\n\n"
        f"Question: {req.question}\n\n"
        f"Candidate's answer: {req.answer}\n\n"
        f"Evaluate this answer as a hiring manager. Provide:\n"
        f"1. A score out of 10\n"
        f"2. What was good about the answer\n"
        f"3. What could be improved\n"
        f"4. The ideal answer (concise)\n"
        f"5. One follow-up question"
    )
    result = await ask_ai(
        user_message=prompt,
        mode="chat",
        language="english",
        code=""
    )
    return {
        "evaluation": result["response"],
        "provider": result.get("provider", "ai"),
        "success": result["success"]
    }
