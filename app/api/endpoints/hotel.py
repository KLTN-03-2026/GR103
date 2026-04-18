from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.hotel_schema import HotelCreate, HotelUpdate, HotelResponse
from app.crud import crud_hotel
from app.api.deps import get_current_staff # Khóa chặn quyền Staff/Admin

router = APIRouter()

# 1. API LẤY DANH SÁCH (Public - Ai cũng xem được)
@router.get("/", response_model=List[HotelResponse])
async def read_hotels(limit: int = 100):
    hotels = await crud_hotel.get_all_hotels(limit)
    return hotels

# 2. API LẤY CHI TIẾT 1 KHÁCH SẠN (Public)
@router.get("/{hotel_id}", response_model=HotelResponse)
async def read_hotel(hotel_id: str):
    hotel = await crud_hotel.get_hotel_by_id(hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách sạn")
    return hotel

# 3. API THÊM MỚI KHÁCH SẠN (Chỉ Staff/Admin)
@router.post("/", response_model=HotelResponse, status_code=status.HTTP_201_CREATED)
async def create_new_hotel(
    hotel_in: HotelCreate,
    current_staff: dict = Depends(get_current_staff) # Yêu cầu token của Staff
):
    hotel_data = hotel_in.model_dump()
    new_hotel = await crud_hotel.create_hotel(hotel_data)
    return new_hotel

# 4. API CẬP NHẬT (Chỉ Staff/Admin)
@router.put("/{hotel_id}", response_model=HotelResponse)
async def update_existing_hotel(
    hotel_id: str,
    hotel_in: HotelUpdate,
    current_staff: dict = Depends(get_current_staff)
):
    update_data = hotel_in.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu cập nhật")
        
    updated_hotel = await crud_hotel.update_hotel(hotel_id, update_data)
    if not updated_hotel:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách sạn")
    return updated_hotel

# 5. API XÓA (Chỉ Staff/Admin)
@router.delete("/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_hotel(
    hotel_id: str,
    current_staff: dict = Depends(get_current_staff)
):
    success = await crud_hotel.delete_hotel(hotel_id)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách sạn")
    return None