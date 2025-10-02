
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.models.schemas import TextAnalysisRequest, AnalysisResponse
from app.chains.analysis_chain import get_analysis_chain
from app.services.gemini_service import generate_text_with_image, generate_text
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

@router.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...), language: str = Form("en"), extract_text_only: bool = Form(False)):
    try:
        contents = await file.read()
        if extract_text_only:
            prompt = "Extract the text from this image."
            response_text = generate_text_with_image(prompt, contents)
            return {"text": response_text}
        else:
            prompt = f"Analyze the following medical image. Language: {language}"
            response_text = generate_text_with_image(prompt, contents)
            # This is a simplified response. In a real app, you'd parse this into the AnalysisResponse model.
            return {"response": response_text, "language": language, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        prompt = "Extract the text from this image."
        response_text = generate_text_with_image(prompt, contents)
        return {"text": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
