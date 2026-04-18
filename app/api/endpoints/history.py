from fastapi import APIRouter, Depends
from app.core.database import get_database 
from app.api.deps import get_current_active_user
from app.crud.crud_history import get_user_tour_history

router = APIRouter()

@router.get("/my-history")
async def read_history(
    db = Depends(get_database), 
    # Sử dụng get_current_active_user để đảm bảo user còn hoạt động mới xem được lịch sử
    current_user: dict = Depends(get_current_active_user)
):
    # Trong deps.py bạn đã đổi _id thành id (kiểu string), nên dùng current_user["id"]
    history = await get_user_tour_history(db, current_user["id"])
    return history