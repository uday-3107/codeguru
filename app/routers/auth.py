from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token
from app.database import get_db
from app.models import User
from app.schemas.auth import UserSignup, UserLogin
from app.utils.user_utils import seed_user_activity

router = APIRouter(tags=["auth"])


@router.post("/auth/signup")
def signup(req: UserSignup, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(User).filter((User.username == req.username) | (User.email == req.email)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    new_user = User(
        username=req.username,
        email=req.email,
        hashed_password=get_password_hash(req.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.username, "user_id": new_user.id})
    return {"access_token": token, "token_type": "bearer", "username": new_user.username}


@router.post("/auth/login")
def login(req: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == req.username).first()
    if not db_user or not verify_password(req.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token = create_access_token(data={"sub": db_user.username, "user_id": db_user.id})
    return {"access_token": token, "token_type": "bearer", "username": db_user.username}
