import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", "5"))
OTP_RESEND_SECONDS = int(os.getenv("OTP_RESEND_SECONDS", "60"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

OTP_PEPPER = os.getenv("OTP_PEPPER")

if not OTP_PEPPER:
    raise RuntimeError("OTP_PEPPER is missing from the environment.")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp(email: str, purpose: str, otp: str) -> str:
    message = f"{email.lower()}:{purpose}:{otp}".encode("utf-8")

    return hmac.new(
        OTP_PEPPER.encode("utf-8"),
        message,
        hashlib.sha256,
    ).hexdigest()


def verify_otp_hash(
    email: str,
    purpose: str,
    otp: str,
    stored_hash: str,
) -> bool:
    calculated_hash = hash_otp(email, purpose, otp)

    return hmac.compare_digest(
        calculated_hash,
        stored_hash,
    )


def otp_expiry_time() -> datetime:
    return utc_now() + timedelta(minutes=OTP_EXPIRE_MINUTES)


def resend_available_at(last_sent_at: datetime) -> datetime:
    return last_sent_at + timedelta(seconds=OTP_RESEND_SECONDS)


def is_otp_expired(expires_at: datetime) -> bool:
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return utc_now() >= expires_at