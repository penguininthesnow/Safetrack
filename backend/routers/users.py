from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.database import get_db
from backend.auth import get_current_user
from backend import models, schemas
from backend.utils.jwt import create_jwt, decode_jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter(prefix="/api/users", tags=["users"])

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)



# 會員註冊
@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)

    new_user = models.User(
        username=user.username,
        email=user.email, 
        password_hash=hashed_password, 
        role="staff"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# 會員登入
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    token = create_jwt({
        "user_id": user.id,
        "role": user.role
    })
    return {"access_token": token, "token_type": "bearer"}

# 會員頁面
@router.get("/member", response_model=schemas.UserOut)
def read_current_user(
    current_user: models.User = Depends(get_current_user)
):
    return current_user

# 會員登出
@router.post("/logout")
def logout(current_user: models.User = Depends(get_current_user)):
    return{"message" : "已登出"}

# 更新個人資料 /api/users/me
@router.put("/me")
def update_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 有傳/改才更新
    if user_update.username is not None:
        current_user.username = user_update.username

    if user_update.email is not None:
        # 檢查 email 是被別人使用
        existing_user = db.query(models.User).filter(
            models.User.email == user_update.email,
            models.User.id != current_user.id 
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email 已被註冊過")
        current_user.email = user_update.email

    if user_update.name is not None:
        current_user.name = user_update.name

    if user_update.department is not None:
        current_user.department = user_update.department
    
    db.commit()
    db.refresh(current_user)

    return {"message": "資料更新成功~"}

# 密碼修改 /api/users/me/password
@router.put("/me/password")
def change_password(
    data: schemas.ChangePassword,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(data.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="舊密碼錯誤!!")
    
    current_user.password_hash = get_password_hash(data.new_password)

    db.commit()
    return {"message": "密碼修改成功!"}

# 主管權限:取得所有會員資料 /api/users
@router.get("/")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="沒有權限查看。")
    
    users = db.query(models.User).all()
    return users

# 主管權限: 修改職位 /api/users/{id}/role
@router.put("/{user_id}/role")
def update_user_role(
    user_id: int,
    data: schemas.UpdateRole,
    db:  Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="沒有權限查看。")
    
    # 職位限制 只能"admin", "staff"
    if data.role not in ["admin", "staff"]:
        raise HTTPException(status_code=400, detail="職位只能是 admin 或 staff")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="使用者不存在。")
    
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="不能修改自己的職位，如有問題請洽管理者。")
    
    user.role = data.role
    db.commit()

    return {"message": "職位更新成功~"}


