from fastapi import APIRouter, Depends
from app.core.database import get_database
from app.api.deps import get_current_admin_user # Chỉ Admin mới vào được đây
from app.crud.crud_admin import get_all_tour_history, get_admin_stats

router = APIRouter()

@router.get("/admin/history/all")
async def read_all_history(
    db = Depends(get_database),
    current_admin = Depends(get_current_admin_user)
):
    return await get_all_tour_history(db)

@router.get("/admin/stats")
async def read_stats(
    db = Depends(get_database),
    current_admin = Depends(get_current_admin_user)
):
    return await get_admin_stats(db)