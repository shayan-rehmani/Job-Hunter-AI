
from datetime import timezone

from fastapi import HTTPException
from sqlalchemy import update
from sqlalchemy.orm import Session

from database.models import EmailOTP
from auth.otp_service import (
    OTP_MAX_ATTEMPTS,
    OTP_RESEND_SECONDS,
    generate_otp,
    hash_otp,
    verify_otp_hash,
    otp_expiry_time,
    utc_now,
    is_otp_expired,
)
from services.email_service import send_otp_email


def request_otp(db: Session, email: str, purpose: str) -> None:
    now = utc_now()

    existing = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == email,
            EmailOTP.purpose == purpose,
            EmailOTP.consumed_at.is_(None),
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if existing:
        last_sent = existing.last_sent_at

        if last_sent.tzinfo is None:
            last_sent = last_sent.replace(tzinfo=timezone.utc)

        if (now - last_sent).total_seconds() < OTP_RESEND_SECONDS:
            raise HTTPException(
                status_code=429,
                detail="Please wait before requesting another OTP.",
            )

        existing.consumed_at = now

    otp = generate_otp()

    record = EmailOTP(
        email=email,
        purpose=purpose,
        otp_hash=hash_otp(email, purpose, otp),
        expires_at=otp_expiry_time(),
        attempts=0,
        last_sent_at=now,
    )

    try:
        db.add(record)
        db.commit()
        db.refresh(record)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not generate verification code.",
        )

    try:
        send_otp_email(email, otp, purpose)
    except Exception:
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=503,
            detail="Could not send verification email. Please try again later.",
        )


def verify_requested_otp(
    db: Session,
    email: str,
    purpose: str,
    otp: str,
) -> EmailOTP:
    now = utc_now()

    record = (
        db.query(EmailOTP)
        .filter(
            EmailOTP.email == email,
            EmailOTP.purpose == purpose,
            EmailOTP.consumed_at.is_(None),
        )
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not record or is_otp_expired(record.expires_at):
        if record:
            record.consumed_at = now
            db.commit()

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code.",
        )

    if record.attempts >= OTP_MAX_ATTEMPTS:
        record.consumed_at = now
        db.commit()

        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Request a new verification code.",
        )

    valid = verify_otp_hash(
        email,
        purpose,
        otp,
        record.otp_hash,
    )

    values = {"attempts": EmailOTP.attempts + 1}

    if valid or record.attempts + 1 >= OTP_MAX_ATTEMPTS:
        values["consumed_at"] = now

    result = db.execute(
        update(EmailOTP)
        .where(
            EmailOTP.id == record.id,
            EmailOTP.consumed_at.is_(None),
            EmailOTP.attempts < OTP_MAX_ATTEMPTS,
        )
        .values(**values)
    )

    if result.rowcount != 1:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code.",
        )

    db.commit()

    if not valid:
        if record.attempts + 1 >= OTP_MAX_ATTEMPTS:
            raise HTTPException(
                status_code=429,
                detail="Too many attempts. Request a new verification code.",
            )

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification code.",
        )

    db.refresh(record)
    return record
