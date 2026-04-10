from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user_schema import UserProfileResponse, UserUpdateProfile
from app.api.deps import get_current_user 
from app.crud import crud_user

router = APIRouter()

# 1. API lấy hồ sơ cá nhân (GET)
@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return current_user

# 2. API CẬP NHẬT HỒ SƠ (PATCH)
@router.patch("/me", response_model=UserProfileResponse)
async def update_my_profile(
    user_in: UserUpdateProfile,
    current_user: dict = Depends(get_current_user)
):
    # 1. Bóc tách dữ liệu
    update_data = user_in.model_dump(exclude_unset=True)
    
    # 2. Chặn nếu JSON rỗng
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có thông tin nào để cập nhật")
        
    # 3. Gọi hàm CRUD xử lý DB (SỬA "_id" THÀNH "id" Ở ĐÂY)
    updated_user = await crud_user.update_user_profile(str(current_user["id"]), update_data)
    
    # 4. Bắt lỗi
    if not updated_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng hoặc cập nhật thất bại")
        
    # 5. Trả về kết quả
    return updated_user