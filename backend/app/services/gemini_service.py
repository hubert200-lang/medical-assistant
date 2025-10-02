
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)

def get_gemini_model():
    return genai.GenerativeModel(settings.GEMINI_MODEL)

def generate_text(prompt: str) -> str:
    model = get_gemini_model()
    response = model.generate_content(prompt)
    return response.text

def generate_text_with_image(prompt: str, image: bytes) -> str:
    model = get_gemini_model()
    response = model.generate_content([prompt, image])
    return response.text
