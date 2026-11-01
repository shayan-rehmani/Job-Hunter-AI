from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User, CandidateProfile
from auth.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from auth.security import hash_password, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from auth.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()

    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        candidate_profile=CandidateProfile()
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Account could not be created.")

    return user


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account is inactive.")

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
