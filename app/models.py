from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    joined_at = Column(DateTime, default=datetime.datetime.now)
    bio = Column(String, default="Competitive Programmer | CodeGuru Student")
    avatar = Column(String, default="")

    # Relationships
    feedbacks = relationship("Feedback", back_populates="owner")
    activities = relationship("Activity", back_populates="owner")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="feedbacks")


class Activity(Base):
    """Stores daily submission counts for the heatmap"""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String)  # Format: YYYY-MM-DD
    count = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="activities")


class Room(Base):
    """Persistent study room storage"""
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, unique=True, index=True)
    owner = Column(String)
    code = Column(Text, default="# Shared coding space\n")
    members = Column(JSON, default=list)
