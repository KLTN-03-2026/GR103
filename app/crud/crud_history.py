from motor.motor_asyncio import AsyncIOMotorClient

async def get_user_tour_history(db: AsyncIOMotorClient, user_id: str):
    # Giả sử bạn lưu lịch sử ở collection 'orders'
    # user_id truyền vào là chuỗi string từ token
    history_cursor = db["orders"].find({
        "user_id": user_id, 
        "status": "completed" # Hoặc bỏ điều kiện này nếu muốn xem tất cả (cả tour đã hủy)
    }).sort("booking_date", -1)
    
    result = await history_cursor.to_list(length=100)
    
    # Convert ObjectId sang string cho toàn bộ list để tránh lỗi JSON
    for item in result:
        if "_id" in item:
            item["id"] = str(item.pop("_id"))
            
    return result