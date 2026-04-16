from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# ==========================================
# LUỒNG ĐĂNG KÝ
# ==========================================
# 1. Khuôn mẫu yêu cầu gửi OTP đăng ký
class OTPRequest(BaseModel):
    email: EmailStr = Field(..., example="khachhang@gmail.com")

# 2. Khuôn mẫu khi Đăng ký (Đã bao gồm mã OTP)
class UserCreate(BaseModel):
    full_name: str = Field(..., description="Họ và tên")
    email: EmailStr = Field(..., description="Email định dạng chuẩn")
    password: str = Field(..., min_length=6, description="Mật khẩu ít nhất 6 ký tự")
    otp_code: str = Field(..., description="Mã OTP gửi từ Email")

# ==========================================
# LUỒNG ĐĂNG NHẬP & TOKEN
# ==========================================
# 3. Khuôn mẫu khi Đăng nhập
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# 4. Khuôn mẫu trả về Token (Để API Login trả về chuẩn form)
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

# ==========================================
# LUỒNG QUẢN LÝ HỒ SƠ
# ==========================================
# 5. Khuôn mẫu trả về cho Frontend (Tuyệt đối KHÔNG có trường password)
class UserProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str = "customer"
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None

# 6. Khuôn mẫu cập nhật hồ sơ cá nhân
class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None

# ==========================================
# LUỒNG QUÊN & ĐỔI MẬT KHẨU
# ==========================================
# 7. Khuôn mẫu yêu cầu OTP (Quên mật khẩu)
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# 8. Khuôn mẫu đặt lại mật khẩu bằng OTP
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
