import os
import smtplib
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")


def send_otp_email(recipient: str, otp: str, purpose: str) -> None:
    if not all([
        SMTP_USERNAME,
        SMTP_PASSWORD,
        SMTP_FROM_EMAIL,
    ]):
        raise RuntimeError("Email SMTP configuration is incomplete.")

    if purpose == "register":
        subject = "Verify your Job Hunter AI account"
        heading = "Complete your registration"
    elif purpose == "reset_password":
        subject = "Job Hunter AI password reset"
        heading = "Reset your password"
    else:
        raise ValueError("Invalid email purpose.")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = recipient

    message.set_content(
        f"""
Hello,

{heading}.

Your verification code is:

{otp}

This code expires in 5 minutes.

If you did not request this code, please ignore this email.

Regards,
Job Hunter AI Support
"""
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as server:
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(message)