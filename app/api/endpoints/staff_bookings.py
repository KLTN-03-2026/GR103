# app/api/endpoints/staff_bookings.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional

from app.schemas.booking import BookingStatus, BookingStatusUpdate
from app.services.booking_service import get_staff_bookings, update_booking_status

router = APIRouter(prefix="/staff/bookings", tags=["Staff Booking Management"])

# --- MOCK DEPENDENCIES ---
async def get_db():
    pass 

# Hàm mock này giả lập việc check Role trong JWT token
async def verify_staff_role():
    # Tưởng tượng user giải mã từ Token ra có role là staff
    user = {"id": "staff_999", "role": "staff", "name": "Admin Team"}
    if user["role"] not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Bạn không có quyền truy cập")
    return user
# -------------------------

@router.get("/")
async def list_all_bookings(
    status: Optional[BookingStatus] = None,
    search: Optional[str] = Query(None, description="Tìm theo tên khách, mã booking, sđt"),
    skip: int = 0, 
    limit: int = 20,
    db = Depends(get_db),
    current_staff = Depends(verify_staff_role)
):
    try:
        # Pydantic Enum status khi truyền vào sẽ là object, ta gọi .value để lấy string
        status_val = status.value if status else None
        
        result = await get_staff_bookings(db, status_val, search, skip, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy xuất dữ liệu: {str(e)}")


@router.patch("/{booking_id}/status")
async def change_booking_status(
    booking_id: str, 
    update_data: BookingStatusUpdate,
    db = Depends(get_db),
    current_staff = Depends(verify_staff_role)
):
    is_updated = await update_booking_status(
        db, 
        booking_id, 
        update_data.status.value, 
        update_data.staff_note,
        current_staff["id"]
    )
    
    if not is_updated:
        raise HTTPException(status_code=404, detail="Không tìm thấy booking hoặc trạng thái không thay đổi")
        
    return {"message": f"Đã cập nhật trạng thái booking thành {update_data.status.value}"}