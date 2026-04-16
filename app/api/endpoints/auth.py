import time
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.crud import crud_user
from app.core.database import get_collection
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.services.email_service import generate_otp, send_otp_email
from app.schemas.user_schema import (
    UserCreate, 
    UserProfileResponse, 
    UserLogin, 
    ForgotPasswordRequest, 
    ResetPasswordRequest, 
    UserUpdateProfile, 
    OTPRequest 
)

router = APIRouter()

# Bộ nhớ tạm để lưu OTP
OTP_STORE = {}

# ==========================================
# 1. API YÊU CẦU GỬI MÃ OTP ĐĂNG KÝ
# ==========================================
@router.post("/request-otp")
async def request_otp(payload: OTPRequest): # Đổi tên biến thành payload để tránh trùng với keyword request
    existing_user = await crud_user.get_user_by_email(payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được đăng ký trong hệ thống!"
        )
        
    otp_code = generate_otp()
    OTP_STORE[payload.email] = {"otp": otp_code, "exp": time.time() + 300}
    
    if send_otp_email(payload.email, otp_code, usage="register"):
        return {"message": "Mã OTP đăng ký đã được gửi đến email của bạn!"}
    
    raise HTTPException(status_code=500, detail="Không thể gửi email OTP lúc này!")

# ==========================================
# 1.1 API ĐĂNG KÝ (CÓ XÁC THỰC OTP)
# ==========================================
@router.post("/register", response_model=UserProfileResponse)
async def register(user_in: UserCreate):
    # 1. Kiểm tra Email tồn tại
    existing_user = await crud_user.get_user_by_email(user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký!")
    
    # 2. Kiểm tra OTP
    saved_otp_info = OTP_STORE.get(user_in.email)
    if not saved_otp_info:
        raise HTTPException(status_code=400, detail="Bạn chưa yêu cầu gửi mã OTP!")
        
    if time.time() > saved_otp_info["exp"]:
        OTP_STORE.pop(user_in.email, None)
        raise HTTPException(status_code=400, detail="Mã OTP đã hết hạn!")
        
    if saved_otp_info["otp"] != user_in.otp_code:
        raise HTTPException(status_code=400, detail="Mã OTP không chính xác!")
    
    # 3. OTP đúng -> Tạo tài khoản
    hashed_password = get_password_hash(user_in.password)
    user_data = {
        "full_name": user_in.full_name,
        "email": user_in.email,
        "password": hashed_password,
        "role": "customer",
        "status": "active"
    }
    
    # GỌI CRUD: Hàm create_user của fen đã pop _id và thêm id rồi
    new_user = await crud_user.create_user(user_data)
    
    # 4. Dọn dẹp OTP
    OTP_STORE.pop(user_in.email, None)
    
    return new_user

# ==========================================
# 2. API ĐĂNG NHẬP (LOGIN)
# ==========================================
@router.post("/login")
async def login(user_credentials: UserLogin):
    user = await crud_user.get_user_by_email(user_credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác!")

    if not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác!")

    token_data = {
        "sub": str(user["_id"]) if "_id" in user else user["id"],
        "role": user.get("role", "customer")
    }

    return {
        "message": "Đăng nhập thành công!",
        "access_token": create_access_token(data=token_data),
        "refresh_token": create_refresh_token(data=token_data),
        "token_type": "bearer",
        "user_info": {
            "id": user.get("id") or str(user.get("_id")),
            "full_name": user.get("full_name"),
            "email": user.get("email"),
            "role": user.get("role")
        }
    }

# ==========================================
# 3. API LẤY THÔNG TIN CÁ NHÂN (PROFILE)
# ==========================================
@router.get("/me", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    # Đảm bảo trả về trường 'id' cho Schema
    if "_id" in current_user:
        current_user["id"] = str(current_user.pop("_id"))
    return current_user

# ==========================================
# 4. API YÊU CẦU QUÊN MẬT KHẨU
# ==========================================
@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    user = await crud_user.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="Email không tồn tại!")
        
    otp_code = generate_otp()
    OTP_STORE[payload.email] = {"otp": otp_code, "exp": time.time() + 300}
    
    if send_otp_email(payload.email, otp_code, usage="reset"):
        return {"message": "Mã OTP đã được gửi đến email của bạn!"}
    
    raise HTTPException(status_code=500, detail="Không thể gửi email OTP lúc này!")

# ==========================================
# 5. API RESET MẬT KHẨU
# ==========================================
@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    saved_otp_info = OTP_STORE.get(payload.email)
    
    if not saved_otp_info or saved_otp_info["otp"] != payload.otp:
        raise HTTPException(status_code=400, detail="Mã OTP không chính xác!")
        
    if time.time() > saved_otp_info["exp"]:
        OTP_STORE.pop(payload.email, None)
        raise HTTPException(status_code=400, detail="Mã OTP đã hết hạn!")
        
    try:
        users_collection = get_collection("users")
        hashed_new_password = get_password_hash(payload.new_password)
        
        await users_collection.update_one(
            {"email": payload.email},
            {"$set": {"password": hashed_new_password}}
        )
        
        OTP_STORE.pop(payload.email, None)
        return {"message": "Đặt lại mật khẩu thành công. Hãy đăng nhập lại!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi reset mật khẩu")

# ==========================================
# 6. API CẬP NHẬT HỒ SƠ (UPDATE PROFILE)
# ==========================================
@router.put("/me", response_model=UserProfileResponse)
async def update_profile(
    user_in: UserUpdateProfile, 
    current_user: dict = Depends(get_current_user)
):
    update_data = user_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật!")

    # current_user có thể chứa _id hoặc id tùy vào dependency get_current_user
    user_id = str(current_user.get("_id") or current_user.get("id"))
    updated_user = await crud_user.update_user(user_id, update_data)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng!")
        
    return updated_user