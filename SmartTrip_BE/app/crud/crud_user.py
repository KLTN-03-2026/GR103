from bson import ObjectId 
from app.core.database import get_collection

# 1. Hàm tìm user theo Email (Cái bạn vừa bị mất)
async def get_user_by_email(email: str):
    """Tìm xem email này đã có ai đăng ký chưa"""
    user_collection = get_collection("users") 
    user = await user_collection.find_one({"email": email})
    return user

# 2. Hàm tạo user mới
async def create_user(user_data: dict) -> dict:
    """Lưu user mới vào MongoDB"""
    user_collection = get_collection("users")
    
    if "role" not in user_data:
        user_data["role"] = "customer"
        
    result = await user_collection.insert_one(user_data)
    created_user = await user_collection.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    return created_user

# 3. Hàm tìm user theo ID
async def get_user_by_id(user_id: str):
    """Tìm user bằng ID trong MongoDB"""
    try:
        user_collection = get_collection("users")
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        return user
    except Exception:
        return None

# 4. Hàm cập nhật User (Cái chúng ta vừa sửa tên)
async def update_user(user_id: str, update_data: dict):
    """Cập nhật thông tin profile hoặc status của user trong MongoDB"""
    try:
        user_collection = get_collection("users")
        
        # Dùng $set để cập nhật
        await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Lấy lại data mới
        updated_user = await user_collection.find_one({"_id": ObjectId(user_id)})
        
        if updated_user:
            updated_user["id"] = str(updated_user.pop("_id"))
            
        return updated_user
    except Exception as e:
        print(f"Lỗi update: {e}")
        return None