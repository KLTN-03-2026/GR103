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
    UserUpdateProfile 
)

# Khởi tạo Router cho nhóm API Xác thực
router = APIRouter()

# Bộ nhớ tạm để lưu OTP (Trong thực tế nên dùng Redis)
OTP_STORE = {}

# ==========================================
# 1. API ĐĂNG KÝ (REGISTER)
# ==========================================
@router.post("/register", response_model=UserProfileResponse)
async def register(user_in: UserCreate):
    # 1. Kiểm tra Email tồn tại
    existing_user = await crud_user.get_user_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã được đăng ký trong hệ thống!"
        )
    
    # 2. Băm mật khẩu và lưu
    hashed_password = get_password_hash(user_in.password)
    user_data = {
        "full_name": user_in.full_name,
        "email": user_in.email,
        "password": hashed_password,
        "role": "customer",
        "status": "active"
    }
    
    new_user = await crud_user.create_user(user_data)
    new_user["id"] = str(new_user["_id"])
    return new_user

# ==========================================
# 2. API ĐĂNG NHẬP (LOGIN)
# ==========================================
@router.post("/login")
async def login(user_credentials: UserLogin):
    try:
        user = await crud_user.get_user_by_email(user_credentials.email)
        if not user:
            raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác!")

        if not verify_password(user_credentials.password, user["password"]):
            raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác!")

        token_data = {
            "sub": str(user["_id"]),
            "role": user.get("role", "customer")
        }

        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data=token_data)

        return {
            "message": "Đăng nhập thành công!",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_info": {
                "id": str(user["_id"]),
                "full_name": user.get("full_name"),
                "email": user.get("email"),
                "role": user.get("role")
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        print(f"🔥 LỖI LOGIN: {str(e)}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi đăng nhập!")
# ==========================================
# 3. API LẤY THÔNG TIN CÁ NHÂN (PROFILE)
# ==========================================
@router.get("/me", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    current_user["id"] = str(current_user["_id"])
    return current_user

# ==========================================
# 4. API YÊU CẦU QUÊN MẬT KHẨU
# ==========================================
@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await crud_user.get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=404, detail="Email không tồn tại!")
        
    otp_code = generate_otp()
    OTP_STORE[request.email] = {"otp": otp_code, "exp": time.time() + 300}
    
    # Giả lập gửi mail (hoặc gọi email_service thật)
    if send_otp_email(request.email, otp_code):
        return {"message": "Mã OTP đã được gửi đến email của bạn!"}
    
    raise HTTPException(status_code=500, detail="Không thể gửi email OTP lúc này!")

# ==========================================
@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    saved_otp_info = OTP_STORE.get(request.email)
    
    if not saved_otp_info or saved_otp_info["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Mã OTP không chính xác!")
        
    if time.time() > saved_otp_info["exp"]:
        OTP_STORE.pop(request.email, None)
        raise HTTPException(status_code=400, detail="Mã OTP đã hết hạn!")
        
    try:
        users_collection = get_collection("users")
        # Chỗ này thường là nơi gây lỗi 500 nếu thư viện bcrypt bị lỗi
        hashed_new_password = get_password_hash(request.new_password)
        
        await users_collection.update_one(
            {"email": request.email},
            {"$set": {"password": hashed_new_password}}
        )
        
        OTP_STORE.pop(request.email, None)
        return {"message": "Đặt lại mật khẩu thành công. Hãy đăng nhập lại!"}
    except Exception as e:
        # THÊM DÒNG NÀY ĐỂ HIỆN LỖI CHI TIẾT RA TERMINAL
        import traceback
        traceback.print_exc() 
        print(f"🔥 LỖI RESET CHI TIẾT: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi thực sự: {str(e)}")
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

    user_id = str(current_user["_id"])
    updated_user = await crud_user.update_user(user_id, update_data)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng!")
        
    updated_user["id"] = str(updated_user["_id"])
    return updated_user