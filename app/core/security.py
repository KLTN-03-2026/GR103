import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.core.config import settings

def get_password_hash(password: str) -> str:

    pwd_bytes = password.encode('utf-8')

    salt = bcrypt.gensalt()

    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

# Check Password

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# 3. Create Access Token

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# 4. Create Refresh Token

def create_refresh_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    return jwt.encode({"exp": expire, **data}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)