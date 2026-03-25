import jwt
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

# Kéo cấu hình từ config.py sang đây
from app.core.config import settings

# --- Phần băm mật khẩu (giữ nguyên) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# ==========================================
# --- PHẦN TẠO TOKEN ĐÃ ĐƯỢC BẢO MẬT ---
# ==========================================

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    to_encode.update({"exp": expire})
    
    # Sử dụng SECRET_KEY và ALGORITHM lấy từ file .env
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    
    # Sử dụng SECRET_KEY và ALGORITHM lấy từ file .env
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt