# JWT 驗證
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
from backend.utils.jwt import decode_jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = decode_jwt(token)
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(models.User).filter(models.User.id == user_id).first()

        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user

    except Exception:
        raise HTTPException(status_code=401, detail="Invlid token")
    

    
def get_current_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access requuired")
    return current_user