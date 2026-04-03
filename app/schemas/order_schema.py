from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.ai_schema import DailyPlan

class CustomerInfo(BaseModel):
    full_name: str = Field(..., example="Nguyễn Văn A")
    email: str = Field(..., example="nguyenvana@gmail.com")
    phone: str = Field(..., example="0901234567")

class OrderCreateRequest(BaseModel):
    user_id: Optional[int] = None # Khách chưa đăng nhập thì là null
    customer_info: CustomerInfo
    destination: str = Field(..., example="Nha Trang")
    start_date: str = Field(..., example="2026-04-15") # Ngày bắt đầu đi
    total_price: float = Field(..., example=10000000)
    itinerary: List[DailyPlan] # Bê nguyên mảng daily_plans của con AI vào đây

class OrderResponse(BaseModel):
    order_id: str = Field(..., example="TOUR-A1B2C3D4")
    status: str = Field(..., example="pending")
    message: str = Field(..., example="Tạo đơn hàng thành công!")