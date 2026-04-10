from pydantic import BaseModel, Field
from typing import List, Optional

class HotelBase(BaseModel):
    name: str = Field(..., description="Tên khách sạn", examples=["Mường Thanh Luxury Đà Nẵng"])
    address: str = Field(..., description="Địa chỉ cụ thể", examples=["270 Võ Nguyên Giáp, Đà Nẵng"])
    description: Optional[str] = Field(None, description="Mô tả chi tiết")
    price_per_night: float = Field(..., description="Giá phòng 1 đêm (VNĐ)", examples=[1500000])
    images: List[str] = Field(default=[], description="Danh sách link ảnh")
    amenities: List[str] = Field(default=[], description="Tiện ích (Wifi, Hồ bơi, Gym...)")
    is_active: bool = Field(default=True, description="Còn hoạt động/Còn phòng không?")

class HotelCreate(HotelBase):
    pass

class HotelUpdate(BaseModel):
    # Tất cả các trường đều là Optional (Cho phép sửa 1 hoặc nhiều trường)
    name: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    price_per_night: Optional[float] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    is_active: Optional[bool] = None

class HotelResponse(HotelBase):
    id: str # FastAPI sẽ trả về id dạng chuỗi thay vì _id của MongoDB