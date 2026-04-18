from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm 
import time
from app.schemas.user_schema import (
    UserCreate, UserResponse, 
    UserAdminUpdate, UserProfileResponse, UserUpdateProfile, ForgotPasswordRequest, ResetPasswordRequest
)
from app.crud import crud_user
from app.api.deps import get_current_user
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.core.database import get_collection
from app.services.email_service import generate_otp, send_otp_email 

router = APIRouter()
OTP_STORE = {}

# 1. API REGISTER
@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    existing_user = await crud_user.get_user_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email này đã tồn tại!"
        )
    
    hashed_password = get_password_hash(user_in.password)
    
    user_data = {
        "full_name": user_in.full_name,
        "email": user_in.email,
        "password": hashed_password,
        "status": "active",
        "role": "customer"
    }
    
    new_user = await crud_user.create_user(user_data)
    return new_user

# 2. API LOGIN
@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await crud_user.get_user_by_email(form_data.username)
    
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email hoặc mật khẩu không chính xác!"
        )

    if user.get("status") == "locked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!"
        )

    token_data = {
        "sub": str(user["_id"]), 
        "role": user.get("role", "customer")
    }
    
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_info": {  
            "id": str(user["_id"]),
            "full_name": user.get("full_name"),
            "email": user.get("email"),
            "role": user.get("role", "customer"),
            "status": user.get("status", "active")
        }
    }

# 3. API GET PROFILE
@router.get("/me", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user


# 4. API FORGOT PASSWORD
@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await crud_user.get_user_by_email(request.email)
    if not user:
        raise HTTPException(status_code=404, detail="Email không tồn tại!")
        
    otp_code = generate_otp()
    OTP_STORE[request.email] = {"otp": otp_code, "exp": time.time() + 300}
    
    if send_otp_email(request.email, otp_code):
        return {"message": "Mã OTP đã được gửi đến email của bạn!"}
    
    raise HTTPException(status_code=500, detail="Không thể gửi email OTP lúc này!")

# 5. API RESET PASSWORD
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
        hashed_new_password = get_password_hash(request.new_password)
        
        await users_collection.update_one(
            {"email": request.email},
            {"$set": {"password": hashed_new_password}}
        )
        
        OTP_STORE.pop(request.email, None)
        return {"message": "Đặt lại mật khẩu thành công. Hãy đăng nhập lại!"}
    except Exception as e:
        import traceback
        traceback.print_exc() 
        print(f"LỖI RESET CHI TIẾT: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi thực sự: {str(e)}")

# 6. API UPDATE PROFILE
@router.put("/me", response_model=UserProfileResponse)
async def update_profile(
    user_in: UserUpdateProfile, 
    current_user: dict = Depends(get_current_user)
):
    update_data = user_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu để cập nhật!")

    user_id = str(current_user["id"])
    
    # Gọi hàm CRUD để cập nhật thông tin người dùng
    updated_user = await crud_user.update_user_profile(user_id, update_data)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng!")
        

    if "_id" in updated_user:
        updated_user["id"] = str(updated_user.pop("_id"))
    elif "id" not in updated_user:
        updated_user["id"] = user_id 
        
    return updated_user