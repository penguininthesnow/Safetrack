from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

# User schema
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    # role: Optional[str] = "staff"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    username: Optional[str] = None
    email: EmailStr
    role: str
    name: Optional[str] = None
    department: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes" : True 
    }     
# 修改資料
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    department: Optional[str] = None

# 修改密碼
class ChangePassword(BaseModel):
    old_password: str
    new_password: str

# 職位修改
class UpdateRole(BaseModel):
    role: str

# LINE主管通知
class NotificationSettingUpdate(BaseModel):
    line_group_name: str
    line_group_id: str
    notify_abnormal: bool
    is_enabled: bool

# 回傳資料
class NotificationSettingOut(BaseModel):
    id: int
    line_group_name: Optional[str] = None
    line_group_id: Optional[str] = None
    notify_abnormal: bool
    is_enabled: bool
    updated_by: Optional[int] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


# Inspections schema
class InspectionBase(BaseModel):
    date: date
    location: str
    item: str
    is_abnormal: bool
    description: Optional[str] = None
    inspection_number: str
    image_url: Optional[str] = None

class InspectionCreate(InspectionBase):
    pass

class InspectionUpdate(BaseModel):
    location: Optional[str]
    item: Optional[str]
    is_abnormal: Optional[bool]
    description: Optional[str]

# 系統產生欄位
class InspectionOut(InspectionBase):
    id: int
    created_by: int
    inspection_number: str

    model_config = {
        "from_attributes" : True 
    } 

    # class Config:
    #     orm_mode = True