from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.models.schemas import TextAnalysisRequest, AnalysisResponse
from app.chains.analysis_chain import get_analysis_chain
from app.services.gemini_service import generate_text_with_image
from datetime import datetime
import json

router = APIRouter()

@router.post("/analyze-text", response_model=AnalysisResponse)
async def analyze_text(request: TextAnalysisRequest):
    try:
        chain = get_analysis_chain(request.language)
        response = await chain.ainvoke({
            "text": request.text, 
            "context": request.context
        })
        
        # Set additional fields
        response.disclaimer = "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers."
        response.language = request.language
        response.timestamp = datetime.utcnow()
        
        return response
    except Exception as e:
        print(f"Error in analyze_text: {str(e)}")  # For debugging
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...), 
    language: str = Form("en"),
    context: str = Form("")
):
    try:
        contents = await file.read()
        
        # Create a detailed prompt for structured response
        if language == "fr":
            prompt = f"""Analysez cette image médicale et fournissez une réponse structurée au format JSON avec ces champs:
- summary: résumé bref
- key_findings: liste des observations principales
- recommendations: liste des recommandations
- next_steps: liste des prochaines étapes

Contexte: {context}

Répondez uniquement en JSON valide."""
        else:
            prompt = f"""Analyze this medical image and provide a structured JSON response with these fields:
- summary: brief summary
- key_findings: list of main observations
- recommendations: list of recommendations
- next_steps: list of next steps

Context: {context}

Respond only with valid JSON."""
        
        response_text = generate_text_with_image(prompt, contents)
        
        # Try to parse JSON response
        try:
            # Remove markdown code blocks if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            response_data = json.loads(response_text.strip())
            
            return AnalysisResponse(
                summary=response_data.get('summary', ''),
                key_findings=response_data.get('key_findings', []),
                recommendations=response_data.get('recommendations', []),
                next_steps=response_data.get('next_steps', []),
                disclaimer="This analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers.",
                language=language,
                timestamp=datetime.utcnow()
            )
        except json.JSONDecodeError:
            # Fallback: create basic structure from text
            return AnalysisResponse(
                summary=response_text[:500],
                key_findings=["Analysis completed - see summary for details"],
                recommendations=["Consult with healthcare provider for interpretation"],
                next_steps=["Review with medical professional"],
                disclaimer="This analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers.",
                language=language,
                timestamp=datetime.utcnow()
            )
    except Exception as e:
        print(f"Error in analyze_image: {str(e)}")  # For debugging
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-image-text")
async def analyze_image_text(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        prompt = "Extract all text from this image. Return only the extracted text without any additional commentary."
        response_text = generate_text_with_image(prompt, contents)
        return {"text": response_text}
    except Exception as e:
        print(f"Error in analyze_image_text: {str(e)}")  # For debugging
        raise HTTPException(status_code=500, detail=str(e))
