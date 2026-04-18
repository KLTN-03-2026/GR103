from fastapi import APIRouter, HTTPException
from app.schemas.ai_schema import PromptInput, ItineraryResponse, TravelIntentResponse
from app.ai_engine import generator
from app.schemas.ai_schema import SwapRequest, Activity

router = APIRouter()

# ==========================================
# API 1: AI ĐIỀU HÀNH (SINH LỊCH TRÌNH CHI TIẾT)
# ==========================================
@router.post("/generate", response_model=ItineraryResponse)
async def create_ai_itinerary(prompt_in: PromptInput):
    """
    API Nhận Prompt của khách và trả về JSON Lịch trình chi tiết
    """
    try:
        # Gọi thẳng vào Lõi AI để xử lý
        # Dùng 'await' vì việc gọi API OpenAI/Gemini thường mất vài giây
        result = await generator.generate_tour_itinerary(prompt_data=prompt_in)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi AI sinh lịch trình: {str(e)}")


# ==========================================
# API 2: AI LỄ TÂN (NHẬN DIỆN Ý ĐỊNH & THÔNG TIN)
# ==========================================
@router.post("/analyze-intent", response_model=TravelIntentResponse)
async def extract_intent(prompt_in: PromptInput):
    """
    API bóc tách thông tin (Điểm đến, ngân sách, số người...) từ câu nói tự nhiên của khách.
    """
    try:
        result = await generator.analyze_user_intent(prompt_data=prompt_in)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi AI Lễ Tân bóc tách dữ liệu: {str(e)}")
    
# ==========================================
# API 3: AI ĐỔI TRẢ (THAY THẾ 1 ĐỊA ĐIỂM)
# ==========================================
@router.post("/swap-activity", response_model=Activity)
async def change_activity(swap_in: SwapRequest):
    """
    API dùng để đổi một địa điểm cụ thể trong lịch trình nếu khách không ưng ý.
    """
    try:
        result = await generator.swap_itinerary_activity(swap_data=swap_in)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi đổi địa điểm: {str(e)}")