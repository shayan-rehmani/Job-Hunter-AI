from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt

from database.connection import get_db
from database.models import User
from auth.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired authentication token.", headers={"WWW-Authenticate": "Bearer"})

    if credentials is None:
        raise credentials_error

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload.get("sub"))
    except (jwt.InvalidTokenError, TypeError, ValueError):
        raise credentials_error

    user = db.query(User).filter(User.id == user_id).first()

    if user is None or not user.is_active:
        raise credentials_error

    return user
