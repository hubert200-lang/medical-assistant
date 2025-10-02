
from fastapi import APIRouter, HTTPException
from app.models.schemas import ResearchRequest, ResearchResponse
from app.services.tavily_service import research
from datetime import datetime

router = APIRouter()

@router.post("/research", response_model=ResearchResponse)
async def research_endpoint(request: ResearchRequest):
    try:
        results = research(query=request.query, max_results=request.max_results)
        return ResearchResponse(
            response=results,
            language=request.language,
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
