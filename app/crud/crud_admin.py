from motor.motor_asyncio import AsyncIOMotorClient

# 1. Lấy toàn bộ lịch sử tour của tất cả khách hàng
async def get_all_tour_history(db: AsyncIOMotorClient, skip: int = 0, limit: int = 100):
    cursor = db["orders"].find({}).sort("booking_date", -1).skip(skip).limit(limit)
    result = await cursor.to_list(length=limit)
    for item in result:
        item["_id"] = str(item["_id"])
    return result

# 2. Hàm thống kê doanh thu (Dùng Aggregation của MongoDB cực mạnh)
async def get_admin_stats(db: AsyncIOMotorClient):
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_revenue": {"$sum": "$total_price"},
                "total_bookings": {"$sum": 1},
                "completed_tours": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                }
            }
        }
    ]
    stats = await db["orders"].aggregate(pipeline).to_list(length=1)
    return stats[0] if stats else {"total_revenue": 0, "total_bookings": 0, "completed_tours": 0}