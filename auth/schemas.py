from pydantic import BaseModel, Field, field_validator


class RegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=12, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if value.count("@") != 1 or "." not in value.rsplit("@", 1)[1] or any(ch.isspace() for ch in value):
            raise ValueError("Enter a valid email address.")
        return value


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    email: str
    is_active: bool
