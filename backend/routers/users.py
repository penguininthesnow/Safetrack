from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.database import get_db
from backend.auth import get_current_user
from backend import models, schemas
from backend.utils.jwt import create_jwt, decode_jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

router = APIRouter(prefix="/users", tags=["users"])

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

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
        password=hashed_password, 
        role=user.role
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
    user = get_user_by_email(db,form_data.username)
    if not user or not verify_password(form_data.password, user.password):
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
