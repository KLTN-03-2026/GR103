from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user_schema import UserProfileResponse, UserUpdateProfile
from app.api.deps import get_current_active_user
from app.crud import crud_user

router = APIRouter()

# 1. API lấy hồ sơ cá nhân (Đã hiện - GET)
@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_active_user)):
    # ... logic xử lý ...
    return current_user

# 2. API CẬP NHẬT HỒ SƠ (Cái này đang bị thiếu - PATCH)
@router.patch("/me", response_model=UserProfileResponse)
async def update_my_profile(
    user_in: UserUpdateProfile,
    current_user: dict = Depends(get_current_active_user)
):
    # logic bóc tách dữ liệu và cập nhật MongoDB
    update_data = user_in.model_dump(exclude_unset=True)
    updated_user = await crud_user.update_user_profile(str(current_user["_id"]), update_data)
    
    # ... xử lý lỗi và trả về ...
    updated_user["id"] = str(updated_user["_id"])
    return updated_user