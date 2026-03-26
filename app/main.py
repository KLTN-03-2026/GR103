from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.endpoints import auth, user 
from app.api.endpoints import hotel

# Quản lý vòng đời của App (Mở kết nối DB khi chạy, đóng khi tắt)
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

# Khởi tạo App FastAPI
app = FastAPI(title="AI Travel API", lifespan=lifespan)

# Gắn cái API Đăng ký / Đăng nhập vào hệ thống
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# CẬP NHẬT HỒ SƠ
app.include_router(user.router, prefix="/api/users", tags=["Users"])

# API QUẢN LÝ KHÁCH SẠN
app.include_router(hotel.router, prefix="/api/hotels", tags=["Hotels"])

@app.get("/")
async def root():
    return {"message": "Hệ thống Backend AI Travel đang chạy rất mượt!"}