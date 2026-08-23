import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models import Activity


def seed_user_activity(db: Session, user_id: int):
    """Generates 100 days of random activity for a new user"""
    today = datetime.now()
    for i in range(100):
        # Higher chance of activity for more recent days
        if random.random() > (0.3 + (i * 0.005)):
            date_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            count = random.randint(1, 10)

            activity = Activity(
                date=date_str,
                count=count,
                user_id=user_id
            )
            db.add(activity)
    db.commit()
