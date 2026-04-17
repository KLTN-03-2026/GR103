from pydantic import BaseModel
from enum import Enum
from typing import Optional
from datetime import datetime

# Định nghĩa các trạng thái hợp lệ của một booking
class BookingStatus(str, Enum):
    PENDING = "pending"       # Đang chờ xử lý
    CONFIRMED = "confirmed"   # Đã xác nhận/Đã thanh toán
    COMPLETED = "completed"   # Đã hoàn thành chuyến đi
    CANCELLED = "cancelled"   # Đã hủy

# Schema dùng khi nhân viên gửi request đổi trạng thái
class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    staff_note: Optional[str] = None # Lý do hủy hoặc ghi chú nội bộ