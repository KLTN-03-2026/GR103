from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema khi user gửi request tạo review
class ReviewCreate(BaseModel):
    service_id: str = Field(..., description="ID của tour hoặc dịch vụ")
    booking_id: str = Field(..., description="ID của booking để xác nhận khách đã đi")
    rating: int = Field(..., ge=1, le=5, description="Điểm đánh giá từ 1-5")
    comment: Optional[str] = Field(None, max_length=500, description="Nội dung đánh giá")

# Schema khi trả dữ liệu về cho Frontend
class ReviewResponse(ReviewCreate):
    id: str
    user_id: str
    created_at: datetime