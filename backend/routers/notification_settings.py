from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.auth import get_current_user
from backend import models, schemas


router = APIRouter(prefix="/api/notification-settings", tags=["notification-settings"])

# LINE主管通知，取得通知設定
@router.get("", response_model=schemas.NotificationSettingOut)
def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="沒有權限")
    
    setting = db.query(models.NotificationSetting).first()

    if not setting:
        return {
            "id": 0,
            "line_group_name": "",
            "line_group_id": "",
            "notify_abnormal": True,
            "is_enabled": True,
            "updated_by": current_user.id,
            "updated_at": None
        }
    
    return setting

# 更新通知設定
@router.put("")
def update_notification_settings(
    data: schemas.NotificationSettingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="沒有權限")
    
    setting = db.query(models.NotificationSetting).first()

    if not setting:
        setting = models.NotificationSetting(
            line_group_name=data.line_group_name,
            line_group_id=data.line_group_id,
            notify_abnormal=data.notify_abnormal,
            is_enabled=data.is_enabled,
            updated_by=current_user.id
        )
        db.add(setting)
    else:
        setting.line_group_name = data.line_group_name
        setting.line_group_id = data.line_group_id
        setting.notify_abnormal = data.notify_abnormal
        setting.is_enabled = data.is_enabled
        setting.updated_by = current_user.id

    db.commit()
    db.refresh(setting)
    
    return {"message": "通知設定已更新"}