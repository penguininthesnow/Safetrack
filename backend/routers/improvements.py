from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.services.s3 import upload_to_s3
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
        image_url = upload_to_s3(image)
        # 建立圖片資料
        new_image = models.ImprovementImage(
            improvement_id=new_improvement.id,
            image_url=image_url
        )
        db.add(new_image)
    db.commit()
    return new_improvement