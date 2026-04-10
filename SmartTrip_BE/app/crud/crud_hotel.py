from bson import ObjectId
from app.core.database import get_collection

async def create_hotel(hotel_data: dict):
    """Thêm 1 khách sạn mới vào DB"""
    collection = get_collection("hotels")
    result = await collection.insert_one(hotel_data)
    
    created_hotel = await collection.find_one({"_id": result.inserted_id})
    if created_hotel:
        created_hotel["id"] = str(created_hotel.pop("_id"))
    return created_hotel

async def get_all_hotels(limit: int = 100):
    """Lấy danh sách tất cả khách sạn"""
    collection = get_collection("hotels")
    hotels_cursor = collection.find({}).limit(limit)
    
    # Chuyển đổi con trỏ MongoDB thành danh sách List (và đổi _id thành id)
    hotels = []
    async for h in hotels_cursor:
        h["id"] = str(h.pop("_id"))
        hotels.append(h)
    return hotels

async def get_hotel_by_id(hotel_id: str):
    """Lấy chi tiết 1 khách sạn"""
    collection = get_collection("hotels")
    try:
        hotel = await collection.find_one({"_id": ObjectId(hotel_id)})
        if hotel:
            hotel["id"] = str(hotel.pop("_id"))
        return hotel
    except:
        return None

async def update_hotel(hotel_id: str, update_data: dict):
    """Cập nhật thông tin khách sạn"""
    collection = get_collection("hotels")
    try:
        await collection.update_one(
            {"_id": ObjectId(hotel_id)},
            {"$set": update_data}
        )
        return await get_hotel_by_id(hotel_id)
    except:
        return None

async def delete_hotel(hotel_id: str):
    """Xóa khách sạn"""
    collection = get_collection("hotels")
    try:
        result = await collection.delete_one({"_id": ObjectId(hotel_id)})
        return result.deleted_count > 0
    except:
        return False