import os
from pathlib import Path
from dotenv import load_dotenv

# Xác định đường dẫn đến file .env (vì file config nằm sâu trong app/core)
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    # Không để giá trị mặc định là localhost nữa để dễ bắt lỗi
    MONGODB_URL: str = os.getenv("MONGODB_URL")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "ai_travel_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")

settings = Settings()

# Thêm dòng này để kiểm tra lúc khởi động
if not settings.MONGODB_URL:
    print("❌ LỖI: Không tìm thấy MONGODB_URL trong file .env!")