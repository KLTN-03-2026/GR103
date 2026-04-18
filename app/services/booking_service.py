# app/services/booking_service.py
from datetime import datetime
from bson import ObjectId

async def get_staff_bookings(db, status: str = None, search: str = None, skip: int = 0, limit: int = 20):
    query = {}
    
    # Nếu nhân viên chọn lọc theo trạng thái
    if status:
        query["status"] = status
        
    # Nếu nhân viên gõ vào ô tìm kiếm (tìm theo tên, mã booking hoặc số điện thoại)
    if search:
        query["$or"] = [
            {"customer_name": {"$regex": search, "$options": "i"}},
            {"booking_code": {"$regex": search, "$options": "i"}},
            {"customer_phone": {"$regex": search, "$options": "i"}}
        ]

    # Lấy data và sắp xếp mới nhất lên đầu
    cursor = db["bookings"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    bookings = await cursor.to_list(length=limit)
    
    # Đếm tổng số để Frontend làm phân trang
    total_count = await db["bookings"].count_documents(query)

    # Đổi ObjectId thành String
    for b in bookings:
        b["id"] = str(b.pop("_id"))

    return {
        "data": bookings,
        "total": total_count,
        "page": (skip // limit) + 1,
        "limit": limit
    }


async def update_booking_status(db, booking_id: str, new_status: str, staff_note: str = None, staff_id: str = None):
    update_fields = {
        "status": new_status,
        "updated_at": datetime.utcnow()
    }
    # Lưu lại người cập nhật và ghi chú nếu có
    if staff_note:
        update_fields["staff_note"] = staff_note
    if staff_id:
        update_fields["updated_by"] = staff_id

    result = await db["bookings"].update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": update_fields}
    )
    
    return result.modified_count > 0