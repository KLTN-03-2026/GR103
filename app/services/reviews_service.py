# app/services/review_service.py
from datetime import datetime
from bson import ObjectId
from app.schemas.reviews import ReviewCreate

async def create_review_and_update_stats(db, review_data: ReviewCreate, user_id: str):
    review_doc = review_data.model_dump()
    review_doc["user_id"] = user_id
    review_doc["created_at"] = datetime.utcnow()
    
    insert_result = await db["reviews"].insert_one(review_doc)

    pipeline = [
        {"$match": {"service_id": review_data.service_id}},
        {"$group": {
            "_id": "$service_id", 
            "avg_rating": {"$avg": "$rating"}, 
            "total_reviews": {"$sum": 1}
        }}
    ]
    
    stats_cursor = db["reviews"].aggregate(pipeline)
    stats = await stats_cursor.to_list(length=1)

    if stats:
        await db["services"].update_one(
            {"_id": ObjectId(review_data.service_id)},
            {"$set": {
                "rating": round(stats[0]["avg_rating"], 1),
                "review_count": stats[0]["total_reviews"]
            }}
        )
        
    return str(insert_result.inserted_id)

async def get_service_reviews(db, service_id: str, skip: int = 0, limit: int = 10):
    cursor = db["reviews"].find({"service_id": service_id}).sort("created_at", -1).skip(skip).limit(limit)
    reviews = await cursor.to_list(length=limit)
    
    for r in reviews:
        r["id"] = str(r.pop("_id"))
        
    return reviews