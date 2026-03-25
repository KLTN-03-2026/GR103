from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings
from app.crud import crud_user
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

# Báo cho FastAPI biết đường dẫn để lấy Token là gì (phục vụ cho giao diện Swagger UI)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Hàm này tự động chạy khi có người gọi API. Nó sẽ bóc cái Token ra xem hợp lệ không.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin (Token không hợp lệ hoặc đã hết hạn)",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Giải mã Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub") # "sub" chứa ID của user lúc mình tạo token ở hàm login
        
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    # 2. Tìm User trong Database MongoDB bằng ID
    user = await crud_user.get_user_by_id(user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Người dùng không còn tồn tại trong hệ thống"
        )
        
    return user

# ==========================================
# (BONUS) PHÂN QUYỀN CHO ADMIN VÀ NHÂN VIÊN
# ==========================================
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """Dùng để khóa các API chỉ dành riêng cho Admin"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập vào chức năng này!"
        )
    return current_user

async def get_current_staff(current_user: dict = Depends(get_current_user)):
    """Dùng để khóa các API cho Nhân viên (Staff) và Admin"""
    if current_user.get("role") not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ Nhân viên hoặc Quản trị viên mới có quyền thao tác!"
        )
    return current_user

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """
    Hàm này kiểm tra xem tài khoản có đang hoạt động (Active) không.
    Nếu user bị khóa (status != 'active'), sẽ không cho gọi API.
    """
    if current_user.get("status") == "disabled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Tài khoản của bạn đã bị khóa!"
        )
    return current_user