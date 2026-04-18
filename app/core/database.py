from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

class DataBase:
    client: AsyncIOMotorClient = None
    db = None

db_instance = DataBase()

async def connect_to_mongo():
    """Hàm gọi khi app start"""
    print("Đang kết nối tới MongoDB...")
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db_instance.db = db_instance.client[settings.DATABASE_NAME]
    print("Đã kết nối MongoDB thành công!")

async def close_mongo_connection():
    """Hàm gọi khi app tắt"""
    if db_instance.client:
        db_instance.client.close()
        print("Đã đóng kết nối MongoDB!")

# Hàm helper để lấy collection (tương đương với lấy table bên SQL)
def get_collection(collection_name: str):
    return db_instance.db[collection_name]
def get_database():
    return db_instance.db