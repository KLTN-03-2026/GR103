import smtplib
import random
import string
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Lấy thông tin từ két sắt .env
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")

def generate_otp(length=6):
    """Tạo ngẫu nhiên một chuỗi OTP gồm 6 chữ số"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(receiver_email: str, otp_code: str, usage: str = "register"):
    """
    Hàm gửi mã OTP dùng chung. 
    usage: 'register' (Đăng ký) hoặc 'reset' (Khôi phục mật khẩu)
    """
    # Tự động chọn tiêu đề và nội dung dựa trên mục đích sử dụng
    if usage == "reset":
        subject = "Mã xác thực khôi phục mật khẩu (AI-Travel)"
        message_text = "Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản tại hệ thống AI-Travel."
    else:
        subject = "Mã xác thực đăng ký tài khoản (AI-Travel)"
        message_text = "Cảm ơn bạn đã lựa chọn AI-Travel! Dưới đây là mã xác thực để hoàn tất đăng ký."

    try:
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = f"AI-Travel Support <{MAIL_USERNAME}>"
        msg['To'] = receiver_email
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #175e7a; text-align: center;">AI-Travel Authentication</h2>
                <p>Xin chào,</p>
                <p>{message_text}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #d9534f; letter-spacing: 5px; background: #f4f4f4; padding: 10px 20px; border-radius: 8px; border: 1px dashed #d9534f;">
                        {otp_code}
                    </span>
                </div>
                <p>Mã này sẽ hết hạn trong vòng <strong>5 phút</strong>.</p>
                <p style="color: #777; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email để bảo vệ tài khoản.</p>
                <hr style="border: none; border-top: 1px solid #eee;">
                <p style="text-align: center; font-size: 12px; color: #aaa;">Đội ngũ AI-Travel - Hỗ trợ hành trình thông minh của bạn</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Dùng cổng 587 (TLS) để ổn định hơn cổng 465 (SSL)
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls() # Kích hoạt bảo mật TLS
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
            
        return True
    except Exception as e:
        print(f"❌ Lỗi khi gửi email: {e}")
        return False