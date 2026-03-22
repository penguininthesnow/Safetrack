from sqlalchemy import Column, Integer, String, Boolean, Date, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(100))
    email = Column(String(255), unique=True)
    password_hash = Column(String(255))
    role = Column(String(50), default="staff")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    name = Column(String(100))
    department = Column(String(100))


    inspections = relationship("Inspection", back_populates="owner")

# LINE 主管通知    
class NotificationSetting(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True)
    line_group_name = Column(String(100))
    line_group_id = Column(String(255))
    notify_abnormal = Column(Boolean, default=True)
    is_enabled = Column(Boolean, default= True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id"))



class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer) # 110~115
    date = Column(Date)
    location = Column(String(255))
    item = Column(String(255))
    is_abnormal = Column(Boolean, default=False)
    abnormal_count = Column(Integer, default=0)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    image_url = Column(String(255)) # 存照片連結
    inspection_number = Column(String(13), unique=True, index=True)

    owner = relationship("User", back_populates="inspections")
