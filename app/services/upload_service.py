import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

def upload_image_to_cloudinary(file):
    try:
       # Upload file lên Cloudinary
        result = cloudinary.uploader.upload(file, folder="travel_inventory")
        return result.get("secure_url") # Trả về link https
    except Exception as e:
        print(f"Lỗi Cloudinary: {e}")
        return None