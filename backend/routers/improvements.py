import time

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
    start_total = time.time()

    # 1. 建立改善資料
    t1 = time.time()
    new_improvement = models.Improvement(
        inspection_id=inspection_id,
        improvement_text=improvement_text,
        status=status
    )

    db.add(new_improvement)
    db.commit()
    db.refresh(new_improvement)

    print("改善資料建立耗時:", time.time() - t1)

    # 2. 上傳 s3
    t2 = time.time()

    for image in images:
        if image and image.filename:
            try:
                image_url = upload_to_s3(image)
                # 建立圖片資料
                new_image = models.ImprovementImage(
                    improvement_id=new_improvement.id,
                    image_url=image_url
                )
                db.add(new_image)
            except Exception as e:
                print("S3 上傳失敗:", e)
    
    print(" S3 上傳耗時:", time.time() - t2)

    # 3. DB commit 圖片
    t3 = time.time()
    db.commit()

    print("圖片 DB commit 耗時:", time.time() - t3)
    print("API 總耗時:", time.time() - start_total )
    return new_improvement