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
                <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản tại hệ thống SmartTrip.</p>
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


# --- THÊM HÀM MỚI DÀNH CHO XÁC MINH ĐĂNG KÝ TÀI KHOẢN ---

async def send_verification_email(receiver_email: str, token: str):
    """Hàm gửi link xác minh tài khoản khi user vừa đăng ký"""
    
    # URL của trang React xử lý xác minh (Nhớ đổi port nếu React của bạn chạy port khác 3000)
    react_verify_url = f"http://localhost:3000/verify-email?token={token}"
    
    try:
        msg = MIMEMultipart()
        msg['Subject'] = "Xác minh tài khoản SmartTrip"
        msg['From'] = f"SmartTrip Support <{MAIL_USERNAME}>"
        msg['To'] = receiver_email
        
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2e6c80; text-align: center;">Chào mừng đến với SmartTrip!</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác minh địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{react_verify_url}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                        Xác Minh Email Của Tôi
                    </a>
                </div>
                <p style="color: #555; font-size: 14px;"><i>Lưu ý: Link này sẽ hết hạn sau 24 giờ. Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</i></p>
                <br>
                <p>Trân trọng,<br>Đội ngũ SmartTrip</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Kết nối tới Server Gmail (Dùng SSL cho an toàn)
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.send_message(msg)
            
        print(f"Đã gửi email xác minh thành công tới {receiver_email}")
        return True
    except Exception as e:
        print(f"Lỗi khi gửi email xác minh: {e}")
        return False