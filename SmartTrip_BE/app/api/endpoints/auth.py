import time
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_user
from app.crud import crud_user
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.services.email_service import generate_otp, send_otp_email
from app.schemas.user_schema import (
    UserCreate, 
    UserProfileResponse, 
    UserLogin, 
    VerifyAccountRequest,
    ResendOTPRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserUpdateProfile
)

router = APIRouter()

# Bộ nhớ tạm lưu OTP (Dùng tạm cho đồ án, thực tế sẽ dùng Redis)
OTP_STORE = {}

# ==========================================
# 1. API ĐĂNG KÝ (LƯU DB TRƯỚC - TRẠNG THÁI INACTIVE)
# ==========================================
@router.post("/register", summary="Đăng ký tài khoản (Lưu DB trước, cần xác thực sau)")
async def register(user_in: UserCreate):
    existing_user = await crud_user.get_user_by_email(user_in.email)
    if existing_user:
        if existing_user.get("status") == "inactive":
            raise HTTPException(status_code=400, detail="Tài khoản này chưa được xác thực. Vui lòng bấm gửi lại mã OTP!")
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng!")

    hashed_password = get_password_hash(user_in.password)
    user_data = {
        "full_name": user_in.full_name,
        "email": user_in.email,
        "password": hashed_password,
        "role": "customer",
        "status": "inactive" # KHÓA TÀI KHOẢN
    }
    
    new_user = await crud_user.create_user(user_data)

    otp_code = generate_otp()
    OTP_STORE[user_in.email] = {"otp": otp_code, "exp": time.time() + 300}
    send_otp_email(user_in.email, otp_code, usage="register")

    return {
        "message": "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.",
        "user_id": str(new_user["_id"]) if "_id" in new_user else new_user.get("id"),
        "email": user_in.email
    }

# ==========================================
# 2. API XÁC THỰC TÀI KHOẢN (ACTIVE ACCOUNT)
# ==========================================
@router.post("/verify-account", summary="Xác minh OTP để kích hoạt tài khoản")
async def verify_account(payload: VerifyAccountRequest):
    user = await crud_user.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản!")
    
    if user.get("status") == "active":
        raise HTTPException(status_code=400, detail="Tài khoản này đã được kích hoạt từ trước!")

    saved_otp_info = OTP_STORE.get(payload.email)
    if not saved_otp_info:
        raise HTTPException(status_code=400, detail="Mã OTP không tồn tại hoặc bạn chưa yêu cầu gửi!")
        
    if time.time() > saved_otp_info["exp"]:
        OTP_STORE.pop(payload.email, None)
        raise HTTPException(status_code=400, detail="Mã OTP đã hết hạn!")
        
    if saved_otp_info["otp"] != payload.otp_code:
        raise HTTPException(status_code=400, detail="Mã OTP không chính xác!")

    user_id = str(user["_id"]) if "_id" in user else user["id"]
    await crud_user.update_user(user_id, {"status": "active"})
    OTP_STORE.pop(payload.email, None)

    return {"message": "Kích hoạt tài khoản thành công! Bây giờ bạn có thể đăng nhập."}

# ==========================================
# 3. API GỬI LẠI MÃ OTP
# ==========================================
@router.post("/resend-verification-otp", summary="Gửi lại mã OTP kích hoạt tài khoản")
async def resend_verification_otp(payload: ResendOTPRequest):
    user = await crud_user.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản!")
    
    if user.get("status") == "active":
        raise HTTPException(status_code=400, detail="Tài khoản này đã được kích hoạt, vui lòng đăng nhập!")

    otp_code = generate_otp()
    OTP_STORE[payload.email] = {"otp": otp_code, "exp": time.time() + 300}
    send_otp_email(payload.email, otp_code, usage="register")

    return {"message": "Mã OTP mới đã được gửi đến email của bạn. Mã có hiệu lực trong 5 phút."}

# ==========================================
# 4. API ĐĂNG NHẬP (LOGIN)
# ==========================================
@router.post("/login", summary="Đăng nhập nhận Token")
async def login(user_credentials: UserLogin):
    user = await crud_user.get_user_by_email(user_credentials.email)
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không chính xác!")

    if user.get("status") == "inactive":
        raise HTTPException(status_code=403, detail="Tài khoản chưa được kích hoạt! Vui lòng kiểm tra email để xác thực.")

    user_id = str(user["_id"]) if "_id" in user else user.get("id")
    token_data = {"sub": user_id, "role": user.get("role", "customer")}

    return {
        "message": "Đăng nhập thành công!",
        "access_token": create_access_token(data=token_data),
        "refresh_token": create_refresh_token(data=token_data),
        "token_type": "bearer",
        "user_info": {
            "id": user_id,
            "full_name": user.get("full_name"),
            "email": user.get("email"),
            "role": user.get("role"),
            "status": user.get("status")
        }
    }

# ==========================================
# 5. API QUÊN MẬT KHẨU
# ==========================================
@router.post("/forgot-password", summary="Yêu cầu gửi OTP để lấy lại mật khẩu")
async def forgot_password(payload: ForgotPasswordRequest):
    user = await crud_user.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="Email không tồn tại trong hệ thống!")
        
    otp_code = generate_otp()
    OTP_STORE[payload.email] = {"otp": otp_code, "exp": time.time() + 300}
    send_otp_email(payload.email, otp_code, usage="reset")
    
    return {"message": "Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn."}

# ==========================================
# 6. API ĐẶT LẠI MẬT KHẨU
# ==========================================
@router.post("/reset-password", summary="Xác nhận OTP và Đặt lại mật khẩu")
async def reset_password(payload: ResetPasswordRequest):
    saved_otp_info = OTP_STORE.get(payload.email)
    if not saved_otp_info:
        raise HTTPException(status_code=400, detail="Mã OTP không tồn tại hoặc bạn chưa yêu cầu gửi!")
        
    if time.time() > saved_otp_info["exp"]:
        OTP_STORE.pop(payload.email, None)
        raise HTTPException(status_code=400, detail="Mã OTP đã hết hạn!")
        
    if saved_otp_info["otp"] != payload.otp:
        raise HTTPException(status_code=400, detail="Mã OTP không chính xác!")
        
    user = await crud_user.get_user_by_email(payload.email)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    hashed_new_password = get_password_hash(payload.new_password)
    user_id = str(user["_id"]) if "_id" in user else user["id"]
    await crud_user.update_user(user_id, {"password": hashed_new_password})
    OTP_STORE.pop(payload.email, None)
    
    return {"message": "Đặt lại mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới!"}

# ==========================================
# 7. LẤY / CẬP NHẬT HỒ SƠ
# ==========================================
@router.get("/me", response_model=UserProfileResponse, summary="Lấy thông tin cá nhân")
async def get_profile(current_user: dict = Depends(get_current_user)):
    if "_id" in current_user:
        current_user["id"] = str(current_user.pop("_id"))
    return current_user

@router.put("/me", response_model=UserProfileResponse, summary="Cập nhật hồ sơ")
async def update_profile(user_in: UserUpdateProfile, current_user: dict = Depends(get_current_user)):
    update_data = user_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật!")

    user_id = str(current_user.get("_id") or current_user.get("id"))
    updated_user = await crud_user.update_user(user_id, update_data)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng!")
        
    return updated_user