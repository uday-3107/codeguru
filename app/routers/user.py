import datetime
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User, Activity
from app.utils.user_utils import seed_user_activity

router = APIRouter(tags=["user"])


@router.get("/user/profile")
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    activities = db.query(Activity).filter(Activity.user_id == current_user.id).all()
    solved_count = sum(a.count for a in activities)

    today = datetime.date.today()
    streak = 0
    check_date = today
    while True:
        date_key = check_date.isoformat()
        day_activity = next((a for a in activities if a.date == date_key), None)
        if day_activity and day_activity.count > 0:
            streak += 1
            check_date -= datetime.timedelta(days=1)
        else:
            break

    return {
        "username": current_user.username,
        "email": current_user.email,
        "joined_at": current_user.joined_at,
        "bio": current_user.bio,
        "avatar": current_user.avatar,
        "solved_count": solved_count,
        "streak": streak
    }


@router.get("/user/activity")
def get_activity(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user:
        return generate_demo_activity()

    activities = db.query(Activity).filter(Activity.user_id == current_user.id).all()
    if not activities:
        seed_user_activity(db, current_user.id)
        activities = db.query(Activity).filter(Activity.user_id == current_user.id).all()

    return {a.date: a.count for a in activities}


def generate_demo_activity():
    today = datetime.date.today()
    data = {}
    for i in range(100):
        date = today - datetime.timedelta(days=random.randint(0, 365))
        data[date.isoformat()] = random.randint(1, 10)
    return data
