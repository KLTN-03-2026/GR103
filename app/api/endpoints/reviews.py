from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from app.schemas.reviews import ReviewCreate, ReviewResponse
from app.services.reviews_service import create_review_and_update_stats, get_service_reviews

# --- ĐÂY LÀ BIẾN 'router' MÀ MAIN.PY ĐANG TÌM KIẾM NÈ ---
router = APIRouter(tags=["Reviews"])

# --- MOCK DEPENDENCIES ---
async def get_db():
    pass 

async def get_current_user():
    return {"id": "user_12345", "name": "Kim Chi"} 
# -------------------------

@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    review: ReviewCreate, 
    db = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    try:
        user_id = current_user["id"]
        review_id = await create_review_and_update_stats(db, review, user_id)
        
        return {
            "id": review_id,
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            **review.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")

@router.get("/service/{service_id}", response_model=List[ReviewResponse])
async def list_reviews(service_id: str, skip: int = 0, limit: int = 10, db = Depends(get_db)):
    reviews = await get_service_reviews(db, service_id, skip, limit)
    return reviews