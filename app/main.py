from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.endpoints import auth, user 
from app.api.endpoints.inventory import router as inventory_router
from app.api.endpoints import history, admin_history, staff_history
from app.api.endpoints import reviews
from app.api.endpoints import staff_bookings
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="SmartTrip API", lifespan=lifespan)

# Đăng ký router 
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(user.router, prefix="/api/users", tags=["Users"])
app.include_router(inventory_router, prefix="/api/inventory", tags=["Inventory Management"])
app.include_router(history.router, prefix="/api/v1", tags=["Customer"])
app.include_router(admin_history.router, prefix="/api/v1", tags=["Admin"])
app.include_router(staff_history.router, prefix="/api/v1", tags=["Staff"])
app.include_router(reviews.router, prefix="/api/v1")
app.include_router(staff_bookings.router, prefix="/api/v1")
@app.get("/")
async def root():
    return {"message": "Hệ thống SmartTrip đang chạy....!"}