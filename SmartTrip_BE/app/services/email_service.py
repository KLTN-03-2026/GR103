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

def send_otp_email(receiver_email: str, otp_code: str):
    """Hàm kết nối tới Gmail và gửi mã OTP"""
    try:
        msg = MIMEMultipart()
        msg['Subject'] = "Mã xác thực khôi phục mật khẩu (AI-Travel)"
        msg['From'] = f"AI-Travel Support <{MAIL_USERNAME}>"
        msg['To'] = receiver_email
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #175e7a;">Xin chào!</h2>
                <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản tại hệ thống AI-Travel.</p>
                <p>Mã xác thực (OTP) của bạn là: <strong style="font-size: 24px; color: #d9534f; background: #f9f9f9; padding: 5px 10px; border-radius: 5px;">{otp_code}</strong></p>
                <p>Mã này sẽ hết hạn trong vòng <strong>5 phút</strong>.</p>
                <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này để bảo vệ tài khoản.</p>
                <br>
                <p>Trân trọng,<br>Đội ngũ AI-Travel</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Kết nối tới Server Gmail (Dùng SSL cho an toàn)
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
            
        return True
    except Exception as e:
        print(f"Lỗi khi gửi email: {e}")
        return False