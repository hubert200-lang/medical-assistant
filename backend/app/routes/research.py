from fastapi import APIRouter, HTTPException
from app.models.schemas import ResearchRequest, ResearchResponse, ResearchResult
from app.services.tavily_service import research
from app.services.gemini_service import generate_text
from datetime import datetime

router = APIRouter()

@router.post("/research", response_model=ResearchResponse)
async def research_endpoint(request: ResearchRequest):
    try:
        # Get research results
        results = research(query=request.query, max_results=request.max_results)
        
        # Convert results to ResearchResult objects
        research_results = []
        for result in results:
            research_results.append(ResearchResult(
                title=result.get('title', ''),
                url=result.get('url', ''),
                content=result.get('content', ''),
                score=result.get('score', 0.0)
            ))
        
        # Generate summary using Gemini
        summary_prompt = f"Summarize these research results in 2-3 sentences:\n\n"
        for r in research_results[:3]:  # Use top 3 results
            summary_prompt += f"- {r.title}: {r.content[:200]}...\n"
        
        summary = generate_text(summary_prompt)
        
        return ResearchResponse(
            query=request.query,
            results=research_results,
            summary=summary,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))