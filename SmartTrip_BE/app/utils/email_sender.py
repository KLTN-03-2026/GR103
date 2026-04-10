import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

# Cấu hình "Xe chở thư" lấy từ file .env
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 465)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_order_confirmation_email(email_to: str, customer_name: str, order_id: str, destination: str, total_price: float):
    """
    Hàm soạn và gửi thư xác nhận đơn hàng
    """
    # Soạn cái khung HTML cho đẹp trai
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2e6c80;">Xin chào {customer_name},</h2>
        <p>Cảm ơn bạn đã tin tưởng và đặt tour du lịch tại <strong>SmartTrip</strong>!</p>
        <p>Chúng tôi xin xác nhận đơn hàng của bạn đã được tạo thành công với các thông tin sau:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #2e6c80; margin: 20px 0;">
            <p> <strong>Mã đơn hàng:</strong> <span style="color: #e74c3c; font-weight: bold;">{order_id}</span></p>
            <p> <strong>Điểm đến:</strong> {destination}</p>
            <p> <strong>Tổng thanh toán:</strong> {total_price:,.0f} VNĐ</p>
        </div>
        <p>Hệ thống đang chờ bạn thanh toán để chốt lịch trình. Nếu có bất kỳ thắc mắc nào, hãy phản hồi lại email này nhé.</p>
        <br>
        <p>Trân trọng,</p>
        <p><strong>Đội ngũ SmartTrip AI</strong></p>
    </div>
    """

    # Đóng gói bức thư
    message = MessageSchema(
        subject=f"✈️ SmartTrip - Xác nhận đặt tour thành công ({order_id})",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html
    )

    # Đưa cho bưu tá đi gửi
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print(f" Đã gửi email thành công tới {email_to}")
    except Exception as e:
        print(f"Lỗi khi gửi email: {e}")