from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_database
from app.api.deps import get_current_staff_user
from bson import ObjectId

router = APIRouter()

# Staff xem danh sách để quản lý, không xem doanh thu
@router.get("/staff/bookings")
async def list_all_bookings(
    db = Depends(get_database),
    current_staff = Depends(get_current_staff_user)
):
    cursor = db["orders"].find({}).sort("booking_date", -1)
    return await cursor.to_list(length=100)

# Staff cập nhật trạng thái (Ví dụ: Chốt tour đã xong)
@router.patch("/staff/bookings/{booking_id}/status")
async def update_booking_status(
    booking_id: str,
    new_status: str, # "completed", "cancelled"
    db = Depends(get_database),
    current_staff = Depends(get_current_staff_user)
):
    result = await db["orders"].update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": new_status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    return {"message": "Cập nhật trạng thái thành công"}