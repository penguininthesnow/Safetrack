from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas

router = APIRouter(
    prefix="/api/improvements",
    tags=["Improvements"]
)

# 建立 POST API
@router.post("/", response_model=schemas.ImprovementOut)
async def create_improvement(
        inspection_id: int = Form(...),
        improvement_text : str = Form(...),
        status: str = Form(...),
        images: list[UploadFile] = File([]),
        db: Session = Depends(get_db)
):
    new_improvement = models.Improvement(
        inspection_id=inspection_id,
        improvement_text=improvement_text,
        status=status
    )

    db.add(new_improvement)
    db.commit()
    db.refresh(new_improvement)

    for image in images:
        print("圖片名稱", image.filename)
    return new_improvement