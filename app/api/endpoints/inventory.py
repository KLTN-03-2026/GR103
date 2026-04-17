from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status, UploadFile, File, Form
from app.schemas.hotel_schema import HotelResponse, InventoryType
from app.api.deps import get_current_staff_user
from app.crud import crud_inventory
from app.services.upload_service import upload_image_to_cloudinary 
from typing import List, Optional

router = APIRouter()

async def push_to_vector_db(item: dict):
    print(f"[TRIGGER] Đã nhận tín hiệu đồng bộ cho: {item.get('name')}")

# 1. LẤY DANH SÁCH 
@router.get("/{item_type}", response_model=List[HotelResponse])
async def read_items(item_type: InventoryType, skip: int = 0, limit: int = 20):
    return await crud_inventory.get_items_by_type(item_type.value, skip, limit)

# 2. XEM CHI TIẾT 
@router.get("/detail/{item_id}", response_model=HotelResponse)
async def read_item_detail(item_id: str):
    item = await crud_inventory.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa điểm này")
    return item

# 3. THÊM MỚI 
@router.post("/", response_model=HotelResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    address: str = Form(...),
    description: Optional[str] = Form(None),
    price_range: Optional[str] = Form(None),
    type: InventoryType = Form(...),
    image: UploadFile = File(...), 
    current_user: dict = Depends(get_current_staff_user)
):
    # 1. Upload ảnh lên Cloudinary
    image_url = upload_image_to_cloudinary(image.file)
    if not image_url:
        raise HTTPException(status_code=400, detail="Không thể upload ảnh lên Cloudinary")

    # 2. Lưu vào MongoDB
    item_data = {
        "name": name,
        "address": address,
        "description": description,
        "price_range": price_range,
        "type": type.value,
        "image_url": image_url 
    }

    new_item = await crud_inventory.create_item(item_data)
    
    # 3. Kích hoạt trigger 
    background_tasks.add_task(push_to_vector_db, new_item)
    return new_item

# 4. CẬP NHẬT (Admin/Staff)
@router.put("/{item_id}", response_model=HotelResponse)
async def update_inventory(
    item_id: str,
    background_tasks: BackgroundTasks,
    name: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None), 
    current_user: dict = Depends(get_current_staff_user)
):
    update_data = {}
    if name: update_data["name"] = name
    if address: update_data["address"] = address
    if description: update_data["description"] = description
    
    if image:
        new_url = upload_image_to_cloudinary(image.file)
        if new_url: update_data["image_url"] = new_url

    updated_item = await crud_inventory.update_item(item_id, update_data)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Không tìm thấy")
    
    background_tasks.add_task(push_to_vector_db, updated_item)
    return updated_item

# 5. XÓA (Admin/Staff)
@router.delete("/{item_id}")
async def delete_inventory(item_id: str, current_user: dict = Depends(get_current_staff_user)):
    if not await crud_inventory.delete_item(item_id):
        raise HTTPException(status_code=404, detail="Không tìm thấy")
    return {"message": "Xóa thành công!"}