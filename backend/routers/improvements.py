from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas

router = APIRouter(
    prefix="/api/improvements",
    tags=["Improvements"]
)

# 建立 POST API
@router.post("/", response_model=schemas.ImprovementOut)
def create_improvement(
    improvement: schemas.ImprovementCreate,
    db: Session = Depends(get_db)
):
    new_improvement = models.Improvement(
        inspection_id=improvement.inspection_id,
        improvement_text=improvement.improvement_text,
        status=improvement.status
    )
    db.add(new_improvement)
    db.commit()
    db.refresh(new_improvement)
    return new_improvement