from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# 1. Khuôn mẫu khi Đăng ký
class UserCreate(BaseModel):
    full_name: str = Field(..., description="Họ và tên")
    email: EmailStr = Field(..., description="Email định dạng chuẩn")
    password: str = Field(..., min_length=6, description="Mật khẩu ít nhất 6 ký tự")

# 2. Khuôn mẫu trả về cho Frontend (Đã che mật khẩu)
class UserProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str = "customer"
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None

# 3. Khuôn mẫu khi Đăng nhập
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
# 4. Khuôn mẫu yêu cầu OTP
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# 5. Khuôn mẫu đặt lại mật khẩu
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# 6. Khuôn mẫu cập nhật hồ sơ cá nhân (Dùng cho API Quản lý hồ sơ)
class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None