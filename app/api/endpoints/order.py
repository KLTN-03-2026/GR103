from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.order_schema import OrderCreateRequest, OrderResponse
from app.core.database import get_collection # Nhập cái hàm xịn xò của bạn vào đây
from app.utils.email_sender import send_order_confirmation_email
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/create", response_model=OrderResponse)
async def create_new_order(order_data: OrderCreateRequest, background_tasks: BackgroundTasks):
    """
    API nhận dữ liệu lịch trình đã chốt + thông tin khách hàng để lưu thành Đơn Hàng
    """
    try:
        # 1. Tự động sinh mã đơn hàng
        order_id = f"TOUR-{str(uuid.uuid4())[:8].upper()}"

        # 2. Lưu vào MongoDB
        order_dict = order_data.model_dump() 
        order_dict["order_id"] = order_id
        order_dict["created_at"] = datetime.now()
        order_dict["status"] = "pending" 
        
        # GỌI HÀM CỦA BẠN ĐỂ LẤY BẢNG ORDERS RA VÀ LƯU DATA VÀO
        orders_collection = get_collection("orders")
        await orders_collection.insert_one(order_dict)

        # 3. GIAO VIỆC CHẠY NGẦM: Đi gửi Email cho khách
        background_tasks.add_task(
            send_order_confirmation_email,
            email_to=order_data.customer_info.email,
            customer_name=order_data.customer_info.full_name,
            order_id=order_id,
            destination=order_data.destination,
            total_price=order_data.total_price
        )

        # 4. Báo cáo thành công lập tức
        return OrderResponse(
            order_id=order_id,
            status="pending",
            message="Chúc mừng! Bạn đã chốt đơn thành công. Hãy kiểm tra Email nhé!"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo đơn hàng: {str(e)}")