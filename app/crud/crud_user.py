from app.core.database import get_collection
from bson import ObjectId

async def get_user_by_email(email: str):
    user_collection = get_collection("users") 
    return await user_collection.find_one({"email": email})

async def create_user(user_data: dict) -> dict:
    user_collection = get_collection("users")
    user_data["role"] = "customer"
    
    result = await user_collection.insert_one(user_data)
    
    user = await user_collection.find_one({"_id": result.inserted_id})
    
    if user:
        user["id"] = str(user.pop("_id"))
        return user
    return None
async def update_user_profile(user_id: str, update_data: dict):
    user_collection = get_collection("users")
    result = await user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    if result.matched_count > 0:
        return await user_collection.find_one({"_id": ObjectId(user_id)})
    return None

async def get_user_by_id(user_id: str):
    user_collection = get_collection("users")
    return await user_collection.find_one({"_id": ObjectId(user_id)})

async def get_multi_users(skip: int = 0, limit: int = 100):
    user_collection = get_collection("users")
    cursor = user_collection.find().skip(skip).limit(limit)
    return await cursor.to_list(length=limit)
