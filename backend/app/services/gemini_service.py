
import google.generativeai as genai
from app.config import settings
import io
from PIL import Image

genai.configure(api_key=settings.GOOGLE_API_KEY)

def get_gemini_model():
    return genai.GenerativeModel(settings.GEMINI_MODEL)

def generate_text(prompt: str) -> str:
    model = get_gemini_model()
    response = model.generate_content(prompt)
    return response.text

def generate_text_with_image(prompt: str, image_bytes: bytes) -> str:
    model = get_gemini_model()
    img = Image.open(io.BytesIO(image_bytes))
    response = model.generate_content([prompt, img])
    return response.text
