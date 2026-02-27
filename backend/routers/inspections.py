from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas
from backend.auth import get_current_user
from backend.utils.line_notify import send_line_notify
from datetime import date

router = APIRouter(prefix="/inspections", tags=["inspections"])


@router.post("/", response_model=schemas.InspectionOut)
def create_inspection(
    inspection: schemas.InspectionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_inspection = models.Inspection(
        date=inspection.date or date.today(),
        location=inspection.location,
        item=inspection.item,
        is_abnormal=inspection.item,
        description=inspection.description,
        created_by=current_user.id,
    )
    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)

    # LINE Notify 異常提醒
    if new_inspection.is_abnormal:
        send_line_notify(
            f" 工安異常通知\n地點: {new_inspection.location}\n項目: {new_inspection.item}\n日期: {new_inspection.date}"
        )
    return new_inspection

# 主畫面
@router.get("/", response_model=list[schemas.InspectionOut])
def get_all_inspections(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return db.query(models.Inspection).offset(skip).limit(limit).all()

# 會員頁面
@router.get("/member", response_model=list[schemas.InspectionOut])
def get_my_inspections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return db.query(models.Inspection).filter(models.Inspection.created_by == current_user.id).all()


# GET 異常通知頁面
@router.get("/{inspection_id}", response_model=schemas.InspectionOut)
def get_inspection(inspection_id: int, db: Session = Depends(get_db)):
    inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection

# PUT
@router.put("/{inspection_id}", response_model=schemas.InspectionOut)
def update_inspection(
    inspection_id: int,
    update_data: schemas.InspectionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    if inspection.created_by !=current_user.id and current_user.role !="admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    
    for field, value in update_data.dict(exclude_unset=True).items():
        setattr(inspection, field, value)

    db.commit()
    db.refresh(inspection)

    # LINE_Notify 異常提醒(更新後若變成異常)
    if inspection.is_abnormal:
        send_line_notify(
            f" 工安異常更新通知\n地點: {inspection.location}\n項目: {inspection.item}\n日期: {inspection.date}"
        )
    return inspection

@router.delete("/{inspection_id}")
def delete_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inspection = db.query(models.Inspection).filter(models.Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    if inspection.created_by !=current_user.id and current_user.role !="admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    
    db.delete(inspection)
    db.commit()
    return {"detail": "Inspection deleted successfully"}