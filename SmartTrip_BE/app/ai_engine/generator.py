import json
import os
import google.generativeai as genai
from dotenv import load_dotenv
from app.schemas.ai_schema import PromptInput, ItineraryResponse, TravelIntentResponse 

# Nạp tất cả các biến từ file .env vào hệ thống
load_dotenv()

# Lấy API key từ biến môi trường
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("Lỗi: Không tìm thấy GEMINI_API_KEY trong file .env")

genai.configure(api_key=api_key)

# ==========================================
# HÀM 1: AI LỄ TÂN (NHẬN DIỆN Ý ĐỊNH)
# ==========================================
async def analyze_user_intent(prompt_data: PromptInput) -> TravelIntentResponse:
    user_text = prompt_data.user_prompt

    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.1 # Nhiệt độ thấp để bóc tách chính xác
        }
    )

    system_instruction = """
    Bạn là một trợ lý AI phân tích ngôn ngữ tự nhiên cho ứng dụng du lịch.
    Nhiệm vụ của bạn là đọc câu yêu cầu của khách và bóc tách các thông tin (thực thể) sau:
    1. departure_location: Nơi khách xuất phát (nếu có).
    2. destination: Nơi khách muốn đến.
    3. num_people: Số lượng người đi.
    4. budget: Tổng ngân sách (chuyển thành con số VND).
    5. duration_days: Số ngày đi.
    
    Quy tắc quan trọng:
    - Nếu thông tin nào không có trong câu nói, hãy để giá trị là null.
    - Trong mảng "missing_info", hãy liệt kê TÊN TIẾNG VIỆT của các thông tin quan trọng còn thiếu (ví dụ: ["Điểm xuất phát", "Ngân sách", "Số ngày đi"]).
    - "is_ready" = true NẾU đã có ít nhất 'destination' (điểm đến) và 'duration_days' (số ngày). Ngược lại là false.

    TRẢ VỀ ĐÚNG CẤU TRÚC JSON ĐÃ ĐƯỢC YÊU CẦU.
    """

    full_prompt = f"{system_instruction}\n\nCâu nói của khách: {user_text}"

    try:
        response = model.generate_content(full_prompt)
        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        result_dict = json.loads(raw_text)
        return TravelIntentResponse(**result_dict)

    except json.JSONDecodeError:
        print("JSON Lễ Tân lỗi:", response.text)
        raise Exception("AI Lễ Tân trả JSON không hợp lệ")
    except Exception as e:
        print(f"Lỗi khi bóc tách ý định: {e}")
        raise e

# ==========================================
# HÀM 2: AI ĐIỀU HÀNH (SINH LỊCH TRÌNH CÓ TRÍ NHỚ)
# ==========================================
async def generate_tour_itinerary(prompt_data: PromptInput) -> ItineraryResponse:
    user_text = prompt_data.user_prompt

    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.7
        }
    )

    system_instruction = """
    Bạn là một chuyên gia thiết kế tour du lịch tại Việt Nam.
    Hãy đọc yêu cầu của khách (và lịch sử trò chuyện nếu có) để tự động lên một lịch trình hợp lý, thực tế nhất.

    CÁC QUY TẮC QUAN TRỌNG:
    1. Trí nhớ: Khách có thể đổi ý định dựa trên lịch trình cũ. Hãy đọc kỹ 'LỊCH SỬ TRÒ CHUYỆN' để biết những thông tin nền (số người, ngân sách, số ngày) nếu câu lệnh mới của khách không nhắc lại.
    2. Xử lý điểm xuất phát: Nếu khách KHÔNG nói rõ đi từ đâu, hãy tự động giả định khách xuất phát từ TP.HCM (hoặc Hà Nội) và GHI RÕ điều này vào phần 'ai_message' để khách biết.
    3. Chi phí di chuyển: Vé máy bay/xe khách khứ hồi phải được tính toán sát thực tế và ghi chú rõ trong phần 'description' của hoạt động di chuyển.
    4. Ngân sách: Phân bổ tiền hợp lý cho các ngày. Không gom hết tiền vào ngày đầu tiên.

    BẮT BUỘC trả về dữ liệu dưới dạng JSON chuẩn xác theo đúng cấu trúc sau:
    {
        "total_budget_estimated": (tổng số tiền ước tính, ghi số nguyên),
        "num_people": (số lượng người),
        "daily_plans": [
            {
                "day": 1,
                "date_title": "Ngày 1: Tiêu đề ngắn gọn...",
                "activities": [
                    {
                        "time": "08:00 - 10:00",
                        "location_name": "Tên địa điểm cụ thể (VD: Bến xe / Sân bay)",
                        "description": "Mô tả chi tiết. GHI RÕ chi phí này là vé xe hay vé máy bay đi từ đâu.",
                        "estimated_cost": (số nguyên tiền VND),
                        "type": "transport" hoặc "hotel" hoặc "restaurant" hoặc "attraction"
                    }
                ]
            }
        ],
        "ai_message": "Lời chào, tóm tắt chi phí và NÊU RÕ giả định điểm xuất phát nếu khách chưa cung cấp..."
    }
    """

    # Xử lý Lịch sử trò chuyện (Trí nhớ)
    history_text = ""
    if prompt_data.chat_history and len(prompt_data.chat_history) > 0:
        history_text = "--- LỊCH SỬ TRÒ CHUYỆN TRƯỚC ĐÓ ---\n"
        for msg in prompt_data.chat_history:
            role_name = "Khách hàng" if msg.role == "user" else "AI"
            history_text += f"{role_name}: {msg.text}\n"
        history_text += "-----------------------------------\n\n"
        history_text += "Dựa vào ngữ cảnh trên, hãy đáp ứng yêu cầu MỚI NHẤT này:\n"

    # Ghép tất cả lại
    full_prompt = f"{system_instruction}\n\n{history_text}Yêu cầu mới: {user_text}"

    try:
        response = model.generate_content(full_prompt)

        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        result_dict = json.loads(raw_text)

        return ItineraryResponse(**result_dict)

    except json.JSONDecodeError:
        print("JSON Lịch trình lỗi:", response.text)
        raise Exception("AI Lịch trình trả JSON không hợp lệ")

    except Exception as e:
        print(f"Lỗi khi gọi AI: {e}")
        raise e
    
from app.schemas.ai_schema import SwapRequest, Activity

# ==========================================
# HÀM 3: AI THAY ĐỔI ĐỊA ĐIỂM TRONG LỊCH TRÌNH (SWAP)
# ==========================================
async def swap_itinerary_activity(swap_data: SwapRequest) -> Activity:
    model = genai.GenerativeModel(
        "gemini-2.5-flash",
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.8 # Cho nhiệt độ hơi cao một chút để nó sáng tạo ra chỗ mới mẻ
        }
    )

    system_instruction = """
    Bạn là một hướng dẫn viên du lịch địa phương.
    Khách hàng đang có lịch trình nhưng họ muốn thay đổi một địa điểm.
    Nhiệm vụ của bạn là gợi ý MỘT (1) địa điểm khác thay thế, phải nằm trong cùng thành phố, cùng thể loại (nhà hàng, khách sạn, hoặc điểm tham quan), và phải đáp ứng lý do đổi của khách (nếu có).
    
    BẮT BUỘC trả về dữ liệu dưới dạng JSON chuẩn xác theo cấu trúc Activity sau:
    {
        "time": "Giữ nguyên thời gian trống hoặc đề xuất thời lượng hợp lý (VD: 14:00 - 16:00)",
        "location_name": "Tên địa điểm mới",
        "description": "Mô tả sự hấp dẫn và LÝ DO tại sao chỗ này lại phù hợp để thay thế chỗ cũ",
        "estimated_cost": (số nguyên tiền VND),
        "type": "phải giữ nguyên type cũ (hotel, restaurant, attraction)"
    }
    """

    prompt = f"""
    Thành phố: {swap_data.city}
    Địa điểm cũ khách không muốn đi: {swap_data.current_location}
    Loại địa điểm: {swap_data.activity_type}
    Lý do muốn đổi: {swap_data.reason if swap_data.reason else 'Chỉ là muốn đổi chỗ khác'}
    
    Hãy tìm 1 chỗ thay thế tuyệt vời nhất!
    """

    try:
        response = model.generate_content(f"{system_instruction}\n\n{prompt}")
        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

        result_dict = json.loads(raw_text)
        return Activity(**result_dict)

    except Exception as e:
        print(f"Lỗi khi AI tìm chỗ thay thế: {e}")
        raise e