
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User, CandidateProfile
from auth.schemas import (
    RegisterOTPRequest,
    RegisterCompleteRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
)
from auth.security import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from auth.dependencies import get_current_user
from auth.otp_manager import request_otp, verify_requested_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/request-otp")
def register_request_otp(
    request: RegisterOTPRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not existing_user:
        request_otp(db, request.email, "register")

    return {
        "message": "If this email can be registered, a verification code has been sent."
    }


@router.post(
    "/register/complete",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_complete(
    request: RegisterCompleteRequest,
    db: Session = Depends(get_db),
):
    verify_requested_otp(
        db,
        request.email,
        "register",
        request.otp,
    )

    existing_user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="This email cannot be registered.",
        )

    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        candidate_profile=CandidateProfile(),
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Account could not be created.",
        )

    return user


@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user or not verify_password(
        request.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account is inactive.",
        )

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


@router.post("/forgot-password/request-otp")
def forgot_password_request_otp(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if user and user.is_active:
        request_otp(db, request.email, "reset_password")

    return {
        "message": "If an active account exists for this email, a password-reset code has been sent."
    }


@router.post("/forgot-password/reset")
def forgot_password_reset(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    verify_requested_otp(
        db,
        request.email,
        "reset_password",
        request.otp,
    )

    user = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code.",
        )

    try:
        user.password_hash = hash_password(request.new_password)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Password could not be reset.",
        )

    return {
        "message": "Password reset successfully. You can now log in."
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
