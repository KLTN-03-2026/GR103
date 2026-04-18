from app.core.database import get_collection
from bson import ObjectId

async def create_item(data: dict):
    col = get_collection("inventory")
    result = await col.insert_one(data)
    item = await col.find_one({"_id": result.inserted_id})
    item["id"] = str(item.pop("_id"))
    return item

async def get_items_by_type(item_type: str, skip: int = 0, limit: int = 20):
    col = get_collection("inventory")
    cursor = col.find({"type": item_type}).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    for i in items:
        i["id"] = str(i.pop("_id"))
    return items

async def get_item_by_id(item_id: str):
    col = get_collection("inventory")
    item = await col.find_one({"_id": ObjectId(item_id)})
    if item: item["id"] = str(item.pop("_id"))
    return item

async def update_item(item_id: str, data: dict):
    col = get_collection("inventory")
    await col.update_one({"_id": ObjectId(item_id)}, {"$set": data})
    return await get_item_by_id(item_id)

async def delete_item(item_id: str):
    col = get_collection("inventory")
    res = await col.delete_one({"_id": ObjectId(item_id)})
    return res.deleted_count > 0