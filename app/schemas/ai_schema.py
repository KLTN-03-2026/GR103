from pydantic import BaseModel, Field
from typing import List, Optional

# ==========================================
# 0. CẤU TRÚC TIN NHẮN (TRÍ NHỚ CHO AI)
# ==========================================
class ChatMessage(BaseModel):
    role: str = Field(..., example="user") # Chỉ nhận "user" (Khách) hoặc "model" (AI)
    text: str = Field(..., example="Lên lịch trình đi Đà Nẵng 3 ngày")

# ==========================================
# 1. DỮ LIỆU FRONTEND GỬI LÊN (INPUT)
# ==========================================
class PromptInput(BaseModel):
    user_prompt: str = Field(..., example="Thôi đổi sang đi Nha Trang đi")
    chat_history: Optional[List[ChatMessage]] = Field(default=[], description="Lịch sử chat trước đó")
    user_id: Optional[int] = None 

# ==========================================
# 2. SCHEMA CHO "AI LỄ TÂN" (NHẬN DIỆN Ý ĐỊNH)
# ==========================================
class TravelIntentResponse(BaseModel):
    departure_location: Optional[str] = Field(None, example="Sài Gòn")
    destination: Optional[str] = Field(None, example="Đà Nẵng")
    num_people: Optional[int] = Field(None, example=4)
    budget: Optional[int] = Field(None, example=10000000)
    duration_days: Optional[int] = Field(None, example=3)
    missing_info: List[str] = Field(..., example=[])
    is_ready: bool = Field(..., example=True)

# ==========================================
# 3. SCHEMA CHO "AI ĐIỀU HÀNH" (SINH LỊCH TRÌNH)
# ==========================================
class Activity(BaseModel):
    time: str = Field(..., example="08:00 - 10:00")
    location_name: str = Field(..., example="Bà Nà Hills")
    description: str = Field(..., example="Trải nghiệm cáp treo và cầu Vàng")
    estimated_cost: float = Field(..., example=900000)
    type: str = Field(..., example="attraction")

class DailyPlan(BaseModel):
    day: int = Field(..., example=1)
    date_title: str = Field(..., example="Ngày 1: Khám phá Bà Nà")
    activities: List[Activity]

class ItineraryResponse(BaseModel):
    total_budget_estimated: float = Field(..., example=10000000)
    num_people: int = Field(..., example=4)
    daily_plans: List[DailyPlan]
    ai_message: str = Field(..., example="Dạ, em đã lên lịch trình chi tiết cho gia đình mình rồi ạ...")

# ==========================================
# 4. SCHEMA CHO TÍNH NĂNG "ĐỔI ĐỊA ĐIỂM" (SWAP)
# ==========================================
class SwapRequest(BaseModel):
    city: str = Field(..., example="Đà Lạt")
    current_location: str = Field(..., example="Chợ đêm Đà Lạt")
    activity_type: str = Field(..., example="attraction") # attraction, restaurant, hotel
    reason: Optional[str] = Field(None, example="Mình không thích chỗ ồn ào")