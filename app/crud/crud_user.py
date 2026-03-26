from bson import ObjectId # BẮT BUỘC PHẢI IMPORT CÁI NÀY
from app.core.database import get_collection

async def get_user_by_email(email: str):
    """Tìm xem email này đã có ai đăng ký chưa"""
    # Lấy collection bên trong hàm
    user_collection = get_collection("users") 
    user = await user_collection.find_one({"email": email})
    return user

async def create_user(user_data: dict) -> dict:
    """Lưu user mới vào MongoDB"""
    # Lấy collection bên trong hàm
    user_collection = get_collection("users")
    
    user_data["role"] = "customer"
    result = await user_collection.insert_one(user_data)
    
    created_user = await user_collection.find_one({"_id": result.inserted_id})
    created_user["id"] = str(created_user.pop("_id"))
    return created_user

async def get_user_by_id(user_id: str):
    """
    Tìm user bằng ID trong MongoDB
    """
    try:
        # Dùng get_collection cho đồng bộ với các hàm ở trên
        user_collection = get_collection("users")
        user = await user_collection.find_one({"_id": ObjectId(user_id)})
        return user
    except Exception:
        return None
async def update_user_profile(user_id: str, update_data: dict):
    """
    Cập nhật thông tin profile của user trong MongoDB
    """
    try:
        user_collection = get_collection("users")
        
        # Dùng $set của MongoDB để chỉ cập nhật những trường được gửi lên
        await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Lấy lại thông tin user sau khi đã cập nhật thành công
        updated_user = await user_collection.find_one({"_id": ObjectId(user_id)})
        
        # Đổi _id thành id dạng string để FastAPI trả về JSON không bị lỗi
        if updated_user:
            updated_user["id"] = str(updated_user.pop("_id"))
            
        return updated_user
    except Exception as e:
        print(f"Lỗi update: {e}")
        return None