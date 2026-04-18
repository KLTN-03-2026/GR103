from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user_schema import UserProfileResponse, UserUpdateProfile, UserAdminUpdate
from app.api.deps import get_current_active_user, get_current_admin_user
from app.crud import crud_user


router = APIRouter()

#  API get profile user
@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_active_user)):
    current_user["id"] = str(current_user["_id"])
    return current_user

# API update profile user
@router.patch("/me", response_model=UserProfileResponse)
async def update_my_profile(
    user_in: UserUpdateProfile,
    current_user: dict = Depends(get_current_active_user)
):
    update_data = user_in.model_dump(exclude_unset=True)
    updated_user = await crud_user.update_user_profile(str(current_user["_id"]), update_data)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    updated_user["id"] = str(updated_user["_id"])
    return updated_user
# A. API list all user(Admin)
@router.get("/", response_model=list[UserProfileResponse])
async def get_all_users(
    admin_user: dict = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    # Get to list all user from database
    users = await crud_user.get_multi_users(skip=skip, limit=limit)
    
    # Create a clean list of users w id
    clean_users = []
    for u in users:
        u["id"] = str(u["_id"]) 
        clean_users.append(u)
        
    return clean_users

#  API Khóa/Mở khóa hoặc Đổi quyền (Admin)
@router.patch("/{user_id}/admin-update", response_model=UserProfileResponse)
async def admin_update_user(
    user_id: str,
    obj_in: UserAdminUpdate,
    admin_user: dict = Depends(get_current_admin_user)
):
    update_data = obj_in.model_dump(exclude_unset=True)
    updated_user = await crud_user.update_user_profile(user_id, update_data)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
        
    updated_user["id"] = str(updated_user["_id"])
    return updated_user