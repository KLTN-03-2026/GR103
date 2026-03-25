from app.core.database import get_collection

# XÓA DÒNG NÀY: user_collection = get_collection("users") 

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