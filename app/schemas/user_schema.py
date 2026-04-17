from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from enum import Enum

class UserStatus(str, Enum):
    ACTIVE = "active"
    LOCKED = "locked"
    PENDING = "pending"

class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    CUSTOMER = "customer"

# 2. Schema for creating a new user
class UserCreate(BaseModel):
    full_name: str = Field(..., description="Họ và tên")
    email: EmailStr = Field(..., description="Email định dạng chuẩn")
    password: str = Field(..., min_length=6, description="Mật khẩu ít nhất 6 ký tự")

# 3. Schema for Admin update user
class UserAdminUpdate(BaseModel):
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None

# 4. Schema for User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# OTP password
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# Reset password
class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# 5. Schema for User update profile
class UserUpdateProfile(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None

# 6. Schema response user profile
class UserProfileResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    status: str="active"
    role: str="Customer"
    phone_number: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: UserRole = UserRole.CUSTOMER