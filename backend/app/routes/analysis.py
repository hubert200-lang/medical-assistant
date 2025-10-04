
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.models.schemas import TextAnalysisRequest, AnalysisResponse
from app.chains.analysis_chain import get_analysis_chain
from app.services.gemini_service import generate_text_with_image
from datetime import datetime

router = APIRouter()

@router.post("/analyze-text", response_model=AnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    try:
        chain = get_analysis_chain(request.language)
        response = await chain.ainvoke({"text": request.text, "context": request.context})
        response.disclaimer = "This analysis is for informational purposes only..."
        response.language = request.language
        response.timestamp = datetime.utcnow().isoformat()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image(file: UploadFile = File(...), language: str = Form("en")):
    try:
        contents = await file.read()
        prompt = f"Analyze the following medical image. Language: {language}"
        response_text = generate_text_with_image(prompt, contents)
        # Assuming the response_text is a JSON string that can be parsed into AnalysisResponse
        # In a real app, you might need more robust parsing.
        response = AnalysisResponse.parse_raw(response_text)
        response.disclaimer = "This analysis is for informational purposes only..."
        response.language = language
        response.timestamp = datetime.utcnow().isoformat()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-image-text")
async def analyze_image_text(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        prompt = "Extract the text from this image."
        response_text = generate_text_with_image(prompt, contents)
        return {"text": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
