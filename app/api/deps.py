from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.core.config import settings
from app.crud import crud_user


# =====================[ CẤU HÌNH JWT ]=====================
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

# Lấy token từ header: Authorization: Bearer <token>
security = HTTPBearer()


# =====================[ XÁC THỰC USER ]=====================
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Xác thực người dùng bằng JWT.

    Luồng xử lý:
    - Lấy token từ header
    - Giải mã JWT
    - Lấy user_id từ payload
    - Query database để lấy user
    """

    exception_401 = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 1. Lấy token
        token = credentials.credentials

        # 2. Decode JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if not user_id:
            raise exception_401

    except JWTError:
        raise exception_401

    # 3. Lấy user từ database
    user = await crud_user.get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy người dùng",
        )
    if "_id" in user:
        user["id"] = str(user.pop("_id"))

    return user


# =====================[ QUYỀN ADMIN ]=====================
async def get_current_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Chỉ cho phép Admin truy cập
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền Admin",
        )
    return current_user


# =====================[ QUYỀN STAFF ]=====================
async def get_current_staff(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Cho phép Admin và Staff
    """
    if current_user.get("role") not in {"admin", "staff"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Staff hoặc Admin mới được phép",
        )
    return current_user


# =====================[ USER ACTIVE ]=====================
async def get_current_active_user(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Kiểm tra tài khoản có bị khóa không
    """
    if current_user.get("status") == "disabled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản đã bị khóa",
        )
    return current_user