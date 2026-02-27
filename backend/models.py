from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(100))
    email = Column(String(255), unique=True)
    password = Column(String(255))
    role = Column(String(50), default="user")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    inspections = relationship("Inspection", back_populates="owner")

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True)
    date = Column(Date)
    location = Column(String(255))
    item = Column(String(255))
    is_abnormal = Column(Boolean)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="inspections")
