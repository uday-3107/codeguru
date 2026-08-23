import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Room

router = APIRouter(tags=["Study Rooms"])


@router.post("/rooms/create")
async def create_room(owner: str, db: Session = Depends(get_db)):
    room_id = str(uuid.uuid4())[:8]
    room = Room(
        room_id=room_id,
        owner=owner,
        members=[owner],
        code="# Shared coding space\n"
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return {"room_id": room.room_id}


@router.get("/rooms/{room_id}")
async def get_room(room_id: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return {
        "room_id": room.room_id,
        "owner": room.owner,
        "members": room.members,
        "code": room.code
    }


@router.post("/rooms/{room_id}/join")
async def join_room(room_id: str, user: str, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if user not in room.members:
        room.members = room.members + [user]
        db.commit()
        db.refresh(room)
    return {"success": True, "members": room.members}
