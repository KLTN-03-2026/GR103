from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# ==========================================
# 1. NHÓM ĐĂNG KÝ & XÁC THỰC
# ==========================================
class UserCreate(BaseModel):
    full_name: str = Field(..., description="Họ và tên")
    email: EmailStr = Field(..., description="Email định dạng chuẩn")
    password: str = Field(..., min_length=6, max_length=50, description="Mật khẩu từ 6-50 ký tự")

class VerifyAccountRequest(BaseModel):
    email: EmailStr
    otp_code: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

# ==========================================
# 2. NHÓM ĐĂNG NHẬP
# ==========================================
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

# ==========================================
# 3. NHÓM HỒ SƠ (PROFILE)
# ==========================================
class UserProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str = "customer"
    status: str 
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None

class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None

# ==========================================
# 4. NHÓM QUÊN & ĐỔI MẬT KHẨU
# ==========================================
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=6, description="Mật khẩu mới")