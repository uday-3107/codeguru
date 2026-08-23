from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import Feedback, User
from app.schemas.feedback import FeedbackCreate

router = APIRouter(tags=["feedback"])


@router.post("/feedback")
def submit_feedback(req: FeedbackCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id if current_user else None
    new_feedback = Feedback(message=req.message, user_id=user_id)
    db.add(new_feedback)
    db.commit()
    return {"status": "success", "message": "Feedback received. Thank you!"}
